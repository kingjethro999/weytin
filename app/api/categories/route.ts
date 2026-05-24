import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normaliseError } from '@/lib/utils/errors';
import { logger } from '@/lib/utils/logger';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true },
    });

    return NextResponse.json(categories);
  } catch (error: unknown) {
    const normalised = normaliseError(error);
    logger.error('[API] Categories GET failed', { error: normalised.message });
    return NextResponse.json(
      { error: normalised.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
