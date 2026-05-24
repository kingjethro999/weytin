import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normaliseError } from '@/lib/utils/errors';
import { logger } from '@/lib/utils/logger';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('query')?.trim();
    const categoryId = searchParams.get('categoryId')?.trim();
    const locationId = searchParams.get('locationId')?.trim();
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? Math.min(Math.max(Number(limitParam), 1), 50) : 20;

    const products = await prisma.product.findMany({
      where: {
        ...(query ? { name: { contains: query, mode: 'insensitive' } } : {}),
        ...(categoryId ? { categoryId } : {}),
        ...(locationId ? { supplyEntries: { some: { locationId } } } : {}),
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: { name: 'asc' },
      take: limit,
    });

    return NextResponse.json(products);
  } catch (error: unknown) {
    const normalised = normaliseError(error);
    logger.error('[API] Products GET failed', { error: normalised.message });
    return NextResponse.json(
      { error: normalised.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
