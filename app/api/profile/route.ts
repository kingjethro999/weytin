import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth/jwt';
import { normaliseError } from '@/lib/utils/errors';
import { logger } from '@/lib/utils/logger';

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

    const body = await req.json();
    const { businessName, locationId } = body;

    const updated = await prisma.profile.update({
      where: { id: payload.id },
      data: {
        ...(businessName !== undefined ? { businessName: businessName || null } : {}),
        ...(locationId !== undefined ? { locationId: locationId || null } : {}),
      },
      select: {
        id: true,
        email: true,
        role: true,
        businessName: true,
        locationId: true,
        verificationStatus: true,
        location: {
          select: { id: true, name: true, state: true, lga: true },
        },
      },
    });

    logger.info('[Profile] Profile updated', { userId: payload.id });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    const normalised = normaliseError(error);
    logger.error('[Profile] Update failed', { error: normalised.message });
    return NextResponse.json(
      { error: normalised.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
