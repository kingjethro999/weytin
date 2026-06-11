import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth/jwt';
import { logger } from '@/lib/utils/logger';
import { normaliseError } from '@/lib/utils/errors';
import { DemandType } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { product_id, location_id, event_type } = body;

    if (!product_id || !location_id || !event_type) {
      return NextResponse.json(
        { error: 'product_id, location_id and event_type are required' },
        { status: 400 }
      );
    }

    // Check if user is authenticated to link demand events
    let userId: string | null = null;
    const token = req.cookies.get('weytin_session_token')?.value;
    if (token) {
      const payload = await verifyJWT(token);
      if (payload && payload.id) {
        userId = payload.id;
      }
    }

    const data = await prisma.demandEvent.create({
      data: {
        productId: product_id,
        locationId: location_id,
        eventType: event_type as DemandType,
        userId,
      },
    });

    logger.debug('[API] Demand event logged', { eventType: body.event_type });
    
    return NextResponse.json({
      id: data.id,
      product_id: data.productId,
      location_id: data.locationId,
      event_type: data.eventType,
      user_id: data.userId,
      created_at: data.createdAt,
    });
  } catch (error: unknown) {
    const normalised = normaliseError(error);
    logger.error('[API] Demand POST failed', { error: normalised.message });
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

    if (!productId || !locationId) {
      return NextResponse.json({ error: 'Missing productId or locationId' }, { status: 400 });
    }

    const count = await prisma.demandEvent.count({
      where: { productId, locationId },
    });

    return NextResponse.json({
      product_id: productId,
      location_id: locationId,
      score: count > 20 ? 0.9 : 0.4,
      trend: count > 10 ? 'up' : 'stable',
    });
  } catch (error: unknown) {
    const normalised = normaliseError(error);
    logger.error('[API] Demand GET failed', { error: normalised.message });
    return NextResponse.json(
      { error: normalised.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
