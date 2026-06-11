import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth/jwt';
import { normaliseError } from '@/lib/utils/errors';
import { logger } from '@/lib/utils/logger';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('query')?.trim();
    const categoryId = searchParams.get('categoryId')?.trim();
    const locationId = searchParams.get('locationId')?.trim();
    const limitParam = searchParams.get('limit');
    const skipParam = searchParams.get('skip');
    const limit = limitParam ? Math.min(Math.max(Number(limitParam), 1), 100) : 100;
    const skip = skipParam ? Math.max(Number(skipParam), 0) : 0;

    // Default to only approved products for general use
    const approvedOnly = searchParams.get('approvedOnly') !== 'false';

    const products = await prisma.product.findMany({
      where: {
        ...(approvedOnly ? { approved: true } : {}),
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
      skip,
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

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const token = req.cookies.get('weytin_session_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload || !payload.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { id: payload.id },
      select: { id: true, role: true, email: true, businessName: true },
    });

    if (!profile || (profile.role !== 'admin' && profile.role !== 'vendor')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 2. Parse request body
    const body = await req.json();
    const { name, categoryId, unit } = body;

    if (!name || !categoryId) {
      return NextResponse.json({ error: 'Name and category are required' }, { status: 400 });
    }

    // Generate unique slug
    let slug = name.toLowerCase().trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    // Admin-created products are approved automatically. Vendor suggestions are unapproved.
    const approved = profile.role === 'admin';
    const suggestedBy = profile.role === 'vendor' 
      ? (profile.businessName || profile.email || 'Vendor')
      : null;

    const newProduct = await prisma.product.create({
      data: {
        name: name.trim(),
        slug,
        categoryId,
        unit: unit?.trim() || 'Unit',
        approved,
        suggestedBy,
      },
      include: {
        category: {
          select: { name: true },
        },
      },
    });

    logger.info(`[API] Product created. Approved: ${approved}`, { 
      productId: newProduct.id, 
      name: newProduct.name,
      role: profile.role 
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: unknown) {
    const normalised = normaliseError(error);
    logger.error('[API] Product POST failed', { error: normalised.message });
    return NextResponse.json(
      { error: normalised.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
