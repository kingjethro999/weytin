'use client';

import { useState, useEffect } from 'react';
import { PriceRule, PriceStats, PriceFlag } from '@/types/price.types';
import { logger } from '@/lib/utils/logger';
import { normaliseError, AppError } from '@/lib/utils/errors';

export function usePrices(productId?: string, locationId?: string) {
  const [rule, setRule] = useState<PriceRule | null>(null);
  const [stats, setStats] = useState<PriceStats | null>(null);
  const [flags, setFlags] = useState<PriceFlag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);

  useEffect(() => {
    async function fetchPriceData() {
      if (!productId && !locationId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/prices?productId=${productId}&locationId=${locationId}`);
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error || 'Failed to load price data');
        }

        const data = await response.json();
        setRule(data.rule);
        setStats(data.stats);
        setFlags(data.flags || []);
      } catch (err) {
        const normalised = normaliseError(err);
        setError(normalised);
        logger.error('[Hooks] usePrices failed', { error: normalised });
      } finally {
        setIsLoading(false);
      }
    }

    fetchPriceData();
  }, [productId, locationId]);

  return { rule, stats, flags, isLoading, error };
}
