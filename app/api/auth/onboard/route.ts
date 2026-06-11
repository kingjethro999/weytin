import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';
import { normaliseError } from '@/lib/utils/errors';

export async function POST(req: NextRequest) {
  try {
    const { userId, locationId } = await req.json();

    if (!userId || !locationId) {
      return NextResponse.json({ error: 'User ID and Location ID are required' }, { status: 400 });
    }

    // Update profile
    const updated = await prisma.profile.update({
      where: { id: userId },
      data: { locationId },
    });

    logger.info('[Auth] User onboarded with location during signup', { userId, locationId });

    return NextResponse.json({ success: true, user: { id: updated.id, locationId: updated.locationId } });
  } catch (error: unknown) {
    const normalised = normaliseError(error);
    logger.error('[Auth] Onboarding failed', { error: normalised.message });
    return NextResponse.json(
      { error: normalised.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
