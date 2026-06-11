import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth/jwt';
import { normaliseError } from '@/lib/utils/errors';
import { logger } from '@/lib/utils/logger';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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
      select: { role: true },
    });

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 2. Parse request body
    const body = await req.json();
    const { name, categoryId, unit, approved } = body;

    // Build update object
    const updateData: any = {};
    if (name !== undefined) {
      updateData.name = name.trim();
      // Regenerate slug if name changes
      let slug = name.toLowerCase().trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const existing = await prisma.product.findFirst({
        where: { slug, id: { not: id } }
      });
      if (existing) {
        slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
      }
      updateData.slug = slug;
    }
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (unit !== undefined) updateData.unit = unit.trim();
    if (approved !== undefined) {
      updateData.approved = approved;
      // If approved, we can clear the suggestedBy field or leave it for auditing
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          select: { name: true }
        }
      }
    });

    logger.info(`[API] Product updated by admin`, { productId: id, updateData });

    return NextResponse.json(updatedProduct);
  } catch (error: unknown) {
    const normalised = normaliseError(error);
    logger.error('[API] Product PATCH failed', { error: normalised.message });
    return NextResponse.json(
      { error: normalised.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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
      select: { role: true },
    });

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if there are supply entries using this product before deleting
    // In our schema, on delete is Restrict on product relationship in supplyEntries, demandEvents, priceRules
    // So we should handle this gracefully or delete related entries if appropriate. Let's delete safely.
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            supplyEntries: true,
            demandEvents: true,
            priceRules: true,
          }
        }
      }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (
      product._count.supplyEntries > 0 ||
      product._count.demandEvents > 0 ||
      product._count.priceRules > 0
    ) {
      // Instead of hard deleting a product with history, we could mark it as unapproved or error out
      return NextResponse.json(
        { error: 'Cannot delete product as it is currently linked to supply entries or other data.' },
        { status: 400 }
      );
    }

    await prisma.product.delete({
      where: { id },
    });

    logger.info(`[API] Product deleted by admin`, { productId: id });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const normalised = normaliseError(error);
    logger.error('[API] Product DELETE failed', { error: normalised.message });
    return NextResponse.json(
      { error: normalised.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
