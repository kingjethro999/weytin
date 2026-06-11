import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth/jwt';
import { logger } from '@/lib/utils/logger';
import { normaliseError } from '@/lib/utils/errors';
import { getGroqMarketContext } from '@/lib/price/groqMarketData';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('weytin_session_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload || !payload.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate role (Vendor or Admin)
    const profile = await prisma.profile.findUnique({
      where: { id: payload.id },
      select: { role: true },
    });

    if (!profile || (profile.role !== 'vendor' && profile.role !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const productId = body.product_id;
    const locationId = body.location_id;
    const price = parseFloat(body.price);
    const quantity = Number(body.quantity);

    if (!productId || !locationId || isNaN(price) || isNaN(quantity)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Fetch product & location details
    const product = await prisma.product.findUnique({ where: { id: productId } });
    const location = await prisma.location.findUnique({ where: { id: locationId } });

    if (!product || !location) {
      return NextResponse.json({ error: 'Product or location not found' }, { status: 404 });
    }

    // Retrieve Validation Ranges (PriceRule or Groq Baseline)
    const rule = await prisma.priceRule.findUnique({
      where: {
        productId_locationId: { productId, locationId },
      },
    });

    let minPrice = rule ? Number(rule.minPrice) : undefined;
    let maxPrice = rule ? Number(rule.maxPrice) : undefined;
    let isAiBaseline = false;

    if (minPrice === undefined || maxPrice === undefined) {
      const aiBaseline = await getGroqMarketContext(
        product.name,
        product.unit || 'unit',
        `${location.name}, ${location.state}`
      );
      if (minPrice === undefined) minPrice = aiBaseline.minPrice;
      if (maxPrice === undefined) maxPrice = aiBaseline.maxPrice;
      isAiBaseline = true;
    }

    // Enforce Validation (Min/Max checks)
    // 1. Extreme Price Filtering (Auto-Reject completely unrealistic values)
    const rejectMin = minPrice * 0.15; // 85% reduction
    const rejectMax = maxPrice * 6.0;  // 500% increase
    if (price < rejectMin || price > rejectMax) {
      logger.warn('[Price Validation] Submitted price rejected as unrealistic', {
        productId,
        locationId,
        price,
        range: `[${rejectMin} - ${rejectMax}]`,
      });
      return NextResponse.json(
        { error: `Submitted price (₦${price}) is extremely unrealistic. Please verify your data entry.` },
        { status: 400 }
      );
    }

    // Insert supply entry
    const data = await prisma.supplyEntry.create({
      data: {
        productId,
        locationId,
        price,
        quantity,
        vendorId: payload.id,
      },
    });

    logger.info('[API] Supply entry created', { entryId: data.id, vendorId: payload.id });

    // 2. Spike Detection (Auto-Flag if outside normal range but not extremely unrealistic)
    if (price < minPrice || price > maxPrice) {
      await prisma.priceFlag.create({
        data: {
          supplyEntryId: data.id,
          reportedBy: payload.id,
          reason: `Auto-flagged: Price (₦${price.toLocaleString()}) falls outside acceptable ${
            isAiBaseline ? 'AI-estimated baseline' : 'admin-defined rule'
          } range of ₦${minPrice.toLocaleString()} - ₦${maxPrice.toLocaleString()}.`,
          resolved: false,
        },
      });
      logger.info('[Price Validation] Outlier price auto-flagged', {
        entryId: data.id,
        price,
        range: `[${minPrice} - ${maxPrice}]`,
      });
    }
    
    return NextResponse.json({
      id: data.id,
      product_id: data.productId,
      location_id: data.locationId,
      price: Number(data.price),
      quantity: data.quantity,
      submitted_at: data.submittedAt,
    });
  } catch (error: unknown) {
    const normalised = normaliseError(error);
    logger.error('[API] Supply POST failed', { error: normalised.message });
    return NextResponse.json(
      { error: normalised.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const productId = searchParams.get('productId');
    const locationId = searchParams.get('locationId');

    const entries = await prisma.supplyEntry.findMany({
      where: {
        ...(productId ? { productId } : {}),
        ...(locationId ? { locationId } : {}),
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });

    // Map to the shape expected by frontend (snake_case)
    const mapped = entries.map((entry) => ({
      id: entry.id,
      product_id: entry.productId,
      location_id: entry.locationId,
      price: Number(entry.price),
      quantity: entry.quantity,
      submitted_at: entry.submittedAt,
    }));

    return NextResponse.json(mapped);
  } catch (error: unknown) {
    const normalised = normaliseError(error);
    logger.error('[API] Supply GET failed', { error: normalised.message });
    return NextResponse.json(
      { error: normalised.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
