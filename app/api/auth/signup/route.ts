import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth/password';
import { logger } from '@/lib/utils/logger';

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, role, organization, password } = await req.json();

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: 'Required fields are missing' }, { status: 400 });
    }

    // Check if email already exists
    const existing = await prisma.profile.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    const passwordHash = hashPassword(password);

    // Create profile
    const profile = await prisma.profile.create({
      data: {
        email: email.toLowerCase(),
        role: role === 'admin' ? 'user' : (role || 'user'), // Prevent admin signup directly
        businessName: organization || null,
        passwordHash,
        verificationStatus: role === 'user' ? 'verified' : 'pending',
      },
    });

    logger.info('[Auth] User registered successfully', { id: profile.id, role: profile.role });

    return NextResponse.json({
      success: true,
      user: {
        id: profile.id,
        email: profile.email,
        role: profile.role,
        business_name: profile.businessName,
        verification_status: profile.verificationStatus,
      },
    });
  } catch (error: any) {
    logger.error('[Auth] Signup error', { error: error.message });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
