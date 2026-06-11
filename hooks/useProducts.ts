'use client';

import { useState, useEffect } from 'react';
import { ProductWithCategory } from '@/types/product.types';
import { logger } from '@/lib/utils/logger';
import { normaliseError, AppError } from '@/lib/utils/errors';

export function useProducts(query?: string, categoryId?: string, locationId?: string) {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (query) params.set('query', query);
        if (categoryId) params.set('categoryId', categoryId);
        if (locationId) params.set('locationId', locationId);
        params.set('limit', '50');

        const response = await fetch(`/api/products?${params.toString()}`);
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error || 'Failed to load products');
        }

        const data = (await response.json()) as ProductWithCategory[];
        setProducts(data || []);

        // Fire-and-forget demand search events when filtering by location + query
        // Per CLAUDE.md: never await demand logging in the critical path
        if (locationId && data && data.length > 0 && query) {
          data.slice(0, 5).forEach((product) => {
            fetch('/api/demand', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                product_id: product.id,
                location_id: locationId,
                event_type: 'search',
              }),
            }).catch((err) =>
              logger.debug('[useProducts] Demand log failed (non-critical)', { error: err?.message })
            );
          });
        }
      } catch (err) {
        const normalised = normaliseError(err);
        setError(normalised);
        logger.error('[Hooks] useProducts failed', { error: normalised });
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, [query, categoryId, locationId]);

  return { products, isLoading, error };
}
