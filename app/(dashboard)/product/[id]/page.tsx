import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ProductDetail } from '@/components/product/ProductDetail';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import type { SupplyStatus } from '@/types/supply.types';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  // Fetch product with category
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!product) {
    notFound();
  }

  // Fetch supply metrics
  const supplyData = await prisma.supplyEntry.findMany({
    where: { productId: id },
    select: { price: true, quantity: true },
  });

  const avgPrice = supplyData && supplyData.length > 0
    ? supplyData.reduce((acc, curr) => acc + Number(curr.price), 0) / supplyData.length
    : 0;

  const avgQuantity = supplyData && supplyData.length > 0
    ? supplyData.reduce((acc, curr) => acc + Number(curr.quantity || 0), 0) / supplyData.length
    : 0;

  const priceRule = await prisma.priceRule.findFirst({
    where: { productId: id },
    select: { minPrice: true, maxPrice: true },
  });

  const status: SupplyStatus =
    avgQuantity >= 100 ? 'high' :
    avgQuantity <= 20 ? 'low' :
    (supplyData?.length || 0) === 0 ? 'unavailable' :
    'medium';

  let fairnessScore = 50;
  if (priceRule && avgPrice > 0) {
    const min = Number(priceRule.minPrice);
    const max = Number(priceRule.maxPrice);
    if (avgPrice < min) fairnessScore = 20;
    else if (avgPrice > max) fairnessScore = 90;
    else fairnessScore = 55;
  }

  const metric = {
    product_id: id,
    location_id: 'national',
    status,
    avg_price: avgPrice,
    entry_count: supplyData?.length || 0,
  };
  const detailProduct = {
    ...product,
    unit: product.unit ?? 'unit',
    category_id: product.categoryId,
    created_at: product.createdAt.toISOString(),
    description: undefined,
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header>
        <Link 
          href="/search" 
          className="inline-flex items-center text-xs font-mono text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ChevronLeft className="size-3 mr-1 group-hover:-translate-x-0.5 transition-transform" />
          BACK TO MARKET
        </Link>
      </header>

      <main>
        <ProductDetail product={detailProduct} metric={metric} fairnessScore={fairnessScore} />
      </main>

      <footer className="pt-12 text-center">
        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
          Weytin Data Engine • Node ID: {id.substring(0, 8)}
        </p>
      </footer>
    </div>
  );
}
