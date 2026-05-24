import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth/password';
import { signJWT } from '@/lib/auth/jwt';
import { logger } from '@/lib/utils/logger';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const profile = await prisma.profile.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!profile || !profile.passwordHash) {
      logger.warn('[Auth] Login failed: User not found or no password hash', { email });
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const isPasswordValid = verifyPassword(password, profile.passwordHash);
    if (!isPasswordValid) {
      logger.warn('[Auth] Login failed: Invalid password', { email });
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Generate JWT
    const token = await signJWT({
      id: profile.id,
      email: profile.email,
      role: profile.role,
    });

    logger.info('[Auth] Login successful', { id: profile.id, role: profile.role });

    const response = NextResponse.json({
      success: true,
      user: {
        id: profile.id,
        email: profile.email,
        role: profile.role,
        business_name: profile.businessName,
        verification_status: profile.verificationStatus,
        location_id: profile.locationId,
      },
    });

    // Set secure HTTP-only cookies
    response.cookies.set('weytin_session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // For middleware quick-check (non-httpOnly for compatibility or matching the middleware rule)
    response.cookies.set('weytin_session', '1', {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    logger.error('[Auth] Login error', { error: error.message });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
