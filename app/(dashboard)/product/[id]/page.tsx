import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ProductDetail } from '@/components/product/ProductDetail';
import { DemandLogger } from '@/components/product/DemandLogger';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import type { SupplyStatus } from '@/types/supply.types';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth/jwt';
import { getValidatedPricePool, calculateMedianPrice } from '@/lib/price/calculate';
import { getGroqMarketContext } from '@/lib/price/groqMarketData';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  // Fetch user location if logged in
  const cookieStore = await cookies();
  const token = cookieStore.get('weytin_session_token')?.value;
  let userLocationId = null;
  let locationLabel = 'National';
  
  if (token) {
    try {
      const payload = await verifyJWT(token);
      if (payload && payload.id) {
        const profile = await prisma.profile.findUnique({
          where: { id: payload.id },
          select: { locationId: true, location: { select: { name: true, state: true } } },
        });
        if (profile?.locationId && profile.location) {
          userLocationId = profile.locationId;
          locationLabel = `${profile.location.name}, ${profile.location.state}`;
        }
      }
    } catch (e) {
      // Ignored
    }
  }

  // Fetch product with category
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!product || !product.approved) {
    notFound();
  }

  // Fetch supply metrics for current location (or national if none)
  const supplyData = await prisma.supplyEntry.findMany({
    where: { 
      productId: id,
      ...(userLocationId ? { locationId: userLocationId } : {})
    },
    select: { price: true, quantity: true },
  });

  const priceRule = await prisma.priceRule.findFirst({
    where: { 
      productId: id,
      ...(userLocationId ? { locationId: userLocationId } : {})
    },
    select: { minPrice: true, maxPrice: true },
  });

  let minPrice = priceRule ? Number(priceRule.minPrice) : undefined;
  let maxPrice = priceRule ? Number(priceRule.maxPrice) : undefined;

  let aiBaseline = null;
  if (!priceRule || supplyData.length === 0) {
    let locStr = 'Nigeria';
    if (userLocationId) {
      const loc = await prisma.location.findUnique({ where: { id: userLocationId } });
      if (loc) locStr = `${loc.name}, ${loc.state}`;
    }
    aiBaseline = await getGroqMarketContext(product.name, product.unit || 'unit', locStr);
    if (minPrice === undefined) minPrice = aiBaseline.minPrice;
    if (maxPrice === undefined) maxPrice = aiBaseline.maxPrice;
  }

  // Run validation
  const rawPrices = supplyData.map((e) => Number(e.price));
  const { validPrices, discardedCount } = getValidatedPricePool(rawPrices, minPrice, maxPrice);

  const medianPrice = validPrices.length > 0
    ? calculateMedianPrice(validPrices)
    : (aiBaseline ? aiBaseline.averagePrice : 0);

  const avgQuantity = supplyData && supplyData.length > 0
    ? supplyData.reduce((acc, curr) => acc + Number(curr.quantity || 0), 0) / supplyData.length
    : 0;

  const status: SupplyStatus =
    avgQuantity >= 100 ? 'high' :
    avgQuantity <= 20 ? 'low' :
    (supplyData?.length || 0) === 0 ? 'unavailable' :
    'medium';

  let fairnessScore = 50;
  if (minPrice !== undefined && maxPrice !== undefined && medianPrice > 0) {
    if (medianPrice < minPrice) fairnessScore = 20;
    else if (medianPrice > maxPrice) fairnessScore = 90;
    else fairnessScore = 55;
  }

  const metric = {
    product_id: id,
    location_id: userLocationId || 'national',
    status,
    avg_price: medianPrice,
    entry_count: supplyData?.length || 0,
  };

  const detailProduct = {
    ...product,
    unit: product.unit ?? 'unit',
    category_id: product.categoryId,
    created_at: product.createdAt.toISOString(),
    description: undefined,
  };

  const mappedAiBaseline = aiBaseline ? {
    min_price: aiBaseline.minPrice,
    max_price: aiBaseline.maxPrice,
    average_price: aiBaseline.averagePrice,
    historical_trend: aiBaseline.historicalTrend,
    predicted_price: aiBaseline.predictedPrice,
    confidence: aiBaseline.confidence,
  } : null;

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
        {/* Fire-and-forget demand view event — logs silently in background */}
        <DemandLogger productId={id} locationId={userLocationId} />
        <ProductDetail 
          product={detailProduct} 
          metric={metric} 
          fairnessScore={fairnessScore} 
          locationLabel={locationLabel}
          aiBaseline={mappedAiBaseline}
          discardedCount={discardedCount}
        />
      </main>

      <footer className="pt-12 text-center">
        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
          Weytin Data Engine • Node ID: {id.substring(0, 8)}
        </p>
      </footer>
    </div>
  );
}
