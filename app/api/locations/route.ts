import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normaliseError } from '@/lib/utils/errors';
import { logger } from '@/lib/utils/logger';

export async function GET(req: NextRequest) {
  try {
    const limitParam = req.nextUrl.searchParams.get('limit');
    const limit = limitParam ? Math.min(Math.max(Number(limitParam), 1), 50) : 20;

    const locations = await prisma.location.findMany({
      orderBy: { name: 'asc' },
      take: limit,
      select: { id: true, name: true, state: true },
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
