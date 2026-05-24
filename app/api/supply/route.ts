import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth/jwt';
import { logger } from '@/lib/utils/logger';
import { normaliseError } from '@/lib/utils/errors';

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

    // Insert supply entry
    const data = await prisma.supplyEntry.create({
      data: {
        productId: body.product_id,
        locationId: body.location_id,
        price: body.price,
        quantity: body.quantity,
        vendorId: payload.id,
      },
    });

    logger.info('[API] Supply entry created', { entryId: data.id, vendorId: payload.id });
    
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
