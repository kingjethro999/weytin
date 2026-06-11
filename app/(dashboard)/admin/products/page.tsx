import React from 'react';
import { prisma } from '@/lib/prisma';
import { ProductManagerClient, ProductItem } from '@/components/admin/ProductManagerClient';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth/jwt';
import { redirect } from 'next/navigation';

export default async function AdminProductsPage() {
  // 1. Double check admin session role on server
  const cookieStore = await cookies();
  const token = cookieStore.get('weytin_session_token')?.value;
  if (!token) {
    redirect('/login');
  }

  const payload = await verifyJWT(token);
  if (!payload || !payload.id) {
    redirect('/login');
  }

  const profile = await prisma.profile.findUnique({
    where: { id: payload.id },
    select: { role: true },
  });

  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard');
  }

  // 2. Fetch all products (both approved and pending/suggested)
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // 3. Fetch categories for selection dropdown
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
    },
  });

  // Map to matching client interface
  const mappedProducts: ProductItem[] = products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    unit: product.unit,
    approved: product.approved,
    suggestedBy: product.suggestedBy,
    createdAt: product.createdAt.toISOString(),
    categoryId: product.categoryId,
    category: {
      id: product.category.id,
      name: product.category.name,
    },
  }));

  return (
    <ProductManagerClient 
      initialProducts={mappedProducts} 
      categories={categories} 
    />
  );
}
