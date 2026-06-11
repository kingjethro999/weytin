'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ProductWithCategory } from '@/types/product.types';
import { logger } from '@/lib/utils/logger';
import { normaliseError, AppError } from '@/lib/utils/errors';

const PAGE_SIZE = 20;

interface UseInfiniteProductsResult {
  products: ProductWithCategory[];
  isLoading: boolean;          // initial load
  isFetchingMore: boolean;     // subsequent page loads
  error: AppError | null;
  hasMore: boolean;
  sentinelRef: React.RefObject<HTMLDivElement | null>;
  reset: () => void;
}

/**
 * Infinite-scroll hook for products.
 * Fetches PAGE_SIZE items at a time.  When the sentinel element (bottom of
 * list) enters the viewport the next page is fetched and appended.
 *
 * Filters changes reset the page list entirely (memory-safe: old array GC'd).
 */
export function useInfiniteProducts(
  query?: string,
  categoryId?: string,
  locationId?: string,
): UseInfiniteProductsResult {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Build the fetch URL from current params
  const buildUrl = useCallback(
    (currentSkip: number) => {
      const params = new URLSearchParams();
      if (query) params.set('query', query);
      if (categoryId) params.set('categoryId', categoryId);
      if (locationId) params.set('locationId', locationId);
      params.set('limit', String(PAGE_SIZE));
      params.set('skip', String(currentSkip));
      return `/api/products?${params.toString()}`;
    },
    [query, categoryId, locationId],
  );

  // Fetch a single page and append to existing results
  const fetchPage = useCallback(
    async (currentSkip: number, isFirstPage: boolean) => {
      // Cancel any in-flight request for the same filter set
      if (abortRef.current) abortRef.current.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      if (isFirstPage) {
        setIsLoading(true);
        setError(null);
      } else {
        setIsFetchingMore(true);
      }

      try {
        const res = await fetch(buildUrl(currentSkip), { signal: ctrl.signal });
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(payload.error || 'Failed to load products');
        }
        const data = (await res.json()) as ProductWithCategory[];
        const page = data || [];

        setProducts((prev) => (isFirstPage ? page : [...prev, ...page]));
        setHasMore(page.length === PAGE_SIZE);

        logger.debug('[useInfiniteProducts] Page loaded', {
          skip: currentSkip,
          count: page.length,
          hasMore: page.length === PAGE_SIZE,
        });
      } catch (err: any) {
        if (err?.name === 'AbortError') return; // stale request cancelled – ignore
        const normalised = normaliseError(err);
        setError(normalised);
        logger.error('[useInfiniteProducts] Fetch failed', { error: normalised });
      } finally {
        if (!ctrl.signal.aborted) {
          setIsLoading(false);
          setIsFetchingMore(false);
        }
      }
    },
    [buildUrl],
  );

  // Reset and re-fetch when filters change
  useEffect(() => {
    setProducts([]);
    setSkip(0);
    setHasMore(true);
    setError(null);
    fetchPage(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, categoryId, locationId]);

  // Set up IntersectionObserver on the sentinel element
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !isFetchingMore && !isLoading) {
          const nextSkip = skip + PAGE_SIZE;
          setSkip(nextSkip);
          fetchPage(nextSkip, false);
        }
      },
      { threshold: 0.1, rootMargin: '100px' },
    );

    const el = sentinelRef.current;
    if (el) observerRef.current.observe(el);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [hasMore, isFetchingMore, isLoading, skip, fetchPage]);

  const reset = useCallback(() => {
    setProducts([]);
    setSkip(0);
    setHasMore(true);
    fetchPage(0, true);
  }, [fetchPage]);

  return { products, isLoading, isFetchingMore, error, hasMore, sentinelRef, reset };
}
