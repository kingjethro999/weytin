import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normaliseError } from '@/lib/utils/errors';
import { logger } from '@/lib/utils/logger';

export async function GET() {
  try {
    const rules = await prisma.priceRule.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        product: { select: { name: true, unit: true } },
        location: { select: { name: true, state: true } },
        updater: { select: { email: true } },
      },
      take: 200,
    });

    return NextResponse.json(
      rules.map((r) => ({
        id: r.id,
        product_id: r.productId,
        location_id: r.locationId,
        min_price: Number(r.minPrice),
        max_price: Number(r.maxPrice),
        updated_at: r.updatedAt,
        product: { name: r.product.name, unit: r.product.unit },
        location: { name: r.location.name, state: r.location.state },
        updater: { email: r.updater?.email ?? null },
      }))
    );
  } catch (error: unknown) {
    const normalised = normaliseError(error);
    logger.error('[API] PriceRules GET failed', { error: normalised.message });
    return NextResponse.json({ error: normalised.message }, { status: 500 });
  }
}
