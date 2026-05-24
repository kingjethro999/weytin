import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth/jwt';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('weytin_session_token')?.value;
    if (!token) {
      return NextResponse.json({ user: null });
    }

    const payload = await verifyJWT(token);
    if (!payload || !payload.id) {
      return NextResponse.json({ user: null });
    }

    const profile = await prisma.profile.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        email: true,
        role: true,
        businessName: true,
        verificationStatus: true,
        locationId: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: profile.id,
        email: profile.email,
        role: profile.role,
        business_name: profile.businessName,
        verification_status: profile.verificationStatus,
        location_id: profile.locationId,
      },
    });
  } catch (error) {
    return NextResponse.json({ user: null });
  }
}
