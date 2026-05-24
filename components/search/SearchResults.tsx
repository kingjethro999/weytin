'use client';

import React from 'react';
import { useSearchStore } from '@/store/search.store';
import { useProducts } from '@/hooks/useProducts';
import { ProductCard } from '@/components/product/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { FilterX } from 'lucide-react';

export function SearchResults() {
  const { query, categoryId, locationId } = useSearchStore();
  const { products, isLoading, error } = useProducts(query, categoryId || undefined, locationId || undefined);

  if (error) {
    return <ErrorState error={error} title="Failed to load products" />;
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-[200px] w-full rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <FilterX className="size-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold tracking-tight">No products found</h3>
        <p className="text-muted-foreground mt-2 max-w-[400px]">
          We couldn&apos;t find any products matching your search criteria. Try adjusting your filters or search query.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4 rounded-md border border-border/70 bg-card px-3 py-2">
        <h2 className="text-xs font-data text-muted-foreground uppercase tracking-widest">
          Showing {products.length} results
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product}
          />
        ))}
      </div>
    </div>
  );
}
