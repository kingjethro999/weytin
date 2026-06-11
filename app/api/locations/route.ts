import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normaliseError } from '@/lib/utils/errors';
import { logger } from '@/lib/utils/logger';

export async function GET(req: NextRequest) {
  try {
    const limitParam = req.nextUrl.searchParams.get('limit');
    const stateParam = req.nextUrl.searchParams.get('state');
    const queryParam = req.nextUrl.searchParams.get('q');

    const limit = limitParam ? Math.min(Math.max(Number(limitParam), 1), 1000) : 20;

    const where: any = {};
    if (stateParam) {
      where.state = { equals: stateParam, mode: 'insensitive' };
    }
    if (queryParam) {
      where.name = { contains: queryParam, mode: 'insensitive' };
    }

    const locations = await prisma.location.findMany({
      where,
      orderBy: [
        { state: 'asc' },
        { name: 'asc' }
      ],
      take: limit,
      select: { id: true, name: true, state: true, lga: true },
    });

    return NextResponse.json(locations);
  } catch (error: unknown) {
    const normalised = normaliseError(error);
    logger.error('[API] Locations GET failed', { error: normalised.message });
    return NextResponse.json(
      { error: normalised.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
