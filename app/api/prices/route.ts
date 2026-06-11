import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth/jwt';
import { logger } from '@/lib/utils/logger';
import { normaliseError } from '@/lib/utils/errors';
import { getValidatedPricePool, calculateAveragePrice, calculateMedianPrice } from '@/lib/price/calculate';
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

    // Validate role (Admin only)
    const profile = await prisma.profile.findUnique({
      where: { id: payload.id },
      select: { role: true },
    });

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();

    // Upsert price rule using Prisma
    const data = await prisma.priceRule.upsert({
      where: {
        productId_locationId: {
          productId: body.product_id,
          locationId: body.location_id,
        },
      },
      update: {
        minPrice: body.min_price,
        maxPrice: body.max_price,
        updatedBy: payload.id,
        updatedAt: new Date(),
      },
      create: {
        productId: body.product_id,
        locationId: body.location_id,
        minPrice: body.min_price,
        maxPrice: body.max_price,
        updatedBy: payload.id,
        updatedAt: new Date(),
      },
    });

    logger.info('[API] Price rule updated', { ruleId: data.id, productId: data.productId });
    
    return NextResponse.json({
      id: data.id,
      product_id: data.productId,
      location_id: data.locationId,
      min_price: Number(data.minPrice),
      max_price: Number(data.maxPrice),
      updated_by: data.updatedBy,
      updated_at: data.updatedAt,
    });
  } catch (error: unknown) {
    const normalised = normaliseError(error);
    logger.error('[API] Price POST failed', { error: normalised.message });
    return NextResponse.json(
      { error: normalised.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get('weytin_session_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload || !payload.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, resolved } = await req.json();

    const data = await prisma.priceFlag.update({
      where: { id },
      data: { resolved },
    });

    return NextResponse.json({
      id: data.id,
      supply_entry_id: data.supplyEntryId,
      reported_by: data.reportedBy,
      reason: data.reason,
      resolved: data.resolved,
      created_at: data.createdAt,
    });
  } catch (error: unknown) {
    const normalised = normaliseError(error);
    return NextResponse.json({ error: normalised.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const productId = searchParams.get('productId');
    const locationId = searchParams.get('locationId') || undefined;

    if (!productId) {
      return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
    }

    // Fetch product & location to pass to Groq if needed
    const product = await prisma.product.findUnique({ where: { id: productId } });
    const location = locationId ? await prisma.location.findUnique({ where: { id: locationId } }) : null;

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (locationId && !location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    // 1. Fetch rule
    const rule = locationId ? await prisma.priceRule.findUnique({
      where: {
        productId_locationId: { productId, locationId },
      },
    }) : null;

    let minPrice = rule ? Number(rule.minPrice) : undefined;
    let maxPrice = rule ? Number(rule.maxPrice) : undefined;

    // 2. Fetch supply entries for stats
    const entries = await prisma.supplyEntry.findMany({
      where: { 
        productId,
        ...(locationId ? { locationId } : {}),
      },
      select: { price: true },
    });

    // 3. Groq AI Fallback for baseline range & historical context if missing rule or entries
    let aiBaseline = null;
    if (!rule || entries.length === 0) {
      aiBaseline = await getGroqMarketContext(
        product.name,
        product.unit || 'unit',
        location ? `${location.name}, ${location.state}` : 'Nigeria'
      );

      // Use AI ranges as validation baseline if admin rules are not defined
      if (minPrice === undefined) minPrice = aiBaseline.minPrice;
      if (maxPrice === undefined) maxPrice = aiBaseline.maxPrice;
    }

    // 4. Price Validation Layer
    const rawPrices = entries.map((e) => Number(e.price));
    const { validPrices, discardedCount } = getValidatedPricePool(rawPrices, minPrice, maxPrice);

    let stats = null;
    if (validPrices.length > 0) {
      const avg = calculateAveragePrice(validPrices);
      const median = calculateMedianPrice(validPrices);

      stats = {
        avg,
        median,
        min: Math.min(...validPrices),
        max: Math.max(...validPrices),
        discarded_count: discardedCount,
        entry_count: rawPrices.length,
        is_ai_estimate: false,
      };
    } else if (aiBaseline) {
      // Fallback stats directly from AI if no valid entries are present
      stats = {
        avg: aiBaseline.averagePrice,
        median: aiBaseline.averagePrice,
        min: aiBaseline.minPrice,
        max: aiBaseline.maxPrice,
        discarded_count: discardedCount,
        entry_count: 0,
        is_ai_estimate: true,
      };
    }

    // 5. Fetch flags
    const flags = await prisma.priceFlag.findMany({
      where: {
        supplyEntry: {
          productId,
          ...(locationId ? { locationId } : {}),
        },
      },
      include: {
        supplyEntry: {
          select: {
            productId: true,
            locationId: true,
          },
        },
      },
    });

    const mappedFlags = flags.map((f) => ({
      id: f.id,
      supply_entry_id: f.supplyEntryId,
      reported_by: f.reportedBy,
      reason: f.reason,
      resolved: f.resolved,
      created_at: f.createdAt,
      supply_entry: {
        product_id: f.supplyEntry.productId,
        location_id: f.supplyEntry.locationId,
      },
    }));

    return NextResponse.json({
      rule: rule ? {
        id: rule.id,
        product_id: rule.productId,
        location_id: rule.locationId,
        min_price: Number(rule.minPrice),
        max_price: Number(rule.maxPrice),
        updated_by: rule.updatedBy,
        updated_at: rule.updatedAt,
      } : (aiBaseline ? {
        id: 'ai-estimated',
        product_id: productId,
        location_id: locationId || 'national',
        min_price: aiBaseline.minPrice,
        max_price: aiBaseline.maxPrice,
        updated_by: 'ai-system',
        updated_at: new Date(),
      } : null),
      stats,
      flags: mappedFlags,
      ai_baseline: aiBaseline ? {
        min_price: aiBaseline.minPrice,
        max_price: aiBaseline.maxPrice,
        average_price: aiBaseline.averagePrice,
        historical_trend: aiBaseline.historicalTrend,
        predicted_price: aiBaseline.predictedPrice,
        confidence: aiBaseline.confidence,
      } : null,
    });
  } catch (error: unknown) {
    const normalised = normaliseError(error);
    logger.error('[API] Prices GET failed', { error: normalised.message });
    return NextResponse.json(
      { error: normalised.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
