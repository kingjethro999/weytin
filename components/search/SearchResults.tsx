'use client';

import React from 'react';
import { useSearchStore } from '@/store/search.store';
import { useInfiniteProducts } from '@/hooks/useInfiniteProducts';
import { ProductCard } from '@/components/product/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { FilterX, Loader2, PackageSearch } from 'lucide-react';

function CardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-[200px] w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[180px]" />
      </div>
    </div>
  );
}

export function SearchResults() {
  const { query, categoryId, locationId } = useSearchStore();
  const {
    products,
    isLoading,
    isFetchingMore,
    error,
    hasMore,
    sentinelRef,
  } = useInfiniteProducts(
    query,
    categoryId || undefined,
    locationId || undefined,
  );

  if (error) {
    return <ErrorState error={error} title="Failed to load products" />;
  }

  if (isLoading) {
    return (
      <div className="mt-8 space-y-4">
        <Skeleton className="h-9 w-full rounded-md" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center mt-8">
        <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <FilterX className="size-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold tracking-tight">No products found</h3>
        <p className="text-muted-foreground mt-2 max-w-[400px] text-sm">
          We couldn&apos;t find any products matching your search criteria. Try adjusting your filters or search query.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      {/* Results header */}
      <div className="flex items-center justify-between mb-4 rounded-md border border-border/70 bg-card px-3 py-2">
        <h2 className="text-xs font-data text-muted-foreground uppercase tracking-widest">
          {products.length} product{products.length !== 1 ? 's' : ''} loaded
        </h2>
        {hasMore && (
          <span className="text-[10px] text-muted-foreground/60 font-mono">scroll to load more</span>
        )}
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-4 mt-4" aria-hidden="true" />

      {/* Loading more indicator */}
      {isFetchingMore && (
        <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          <span className="text-xs font-medium">Loading more products…</span>
        </div>
      )}

      {/* End of results */}
      {!hasMore && products.length > 0 && (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground/50">
          <PackageSearch className="size-5" />
          <span className="text-xs font-mono uppercase tracking-widest">All results loaded</span>
        </div>
      )}
    </div>
  );
}
