'use client';

import { useState, useEffect } from 'react';
import { DemandScore } from '@/types/demand.types';
import { logger } from '@/lib/utils/logger';
import { normaliseError, AppError } from '@/lib/utils/errors';

export function useDemand(productId?: string, locationId?: string) {
  const [score, setScore] = useState<DemandScore | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);

  useEffect(() => {
    async function fetchDemandData() {
      if (!productId && !locationId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/demand?productId=${productId}&locationId=${locationId}`);
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error || 'Failed to load demand data');
        }

        const data = await response.json();
        setScore(data);
      } catch (err) {
        const normalised = normaliseError(err);
        setError(normalised);
        logger.error('[Hooks] useDemand failed', { error: normalised });
      } finally {
        setIsLoading(false);
      }
    }

    fetchDemandData();
  }, [productId, locationId]);

  return { score, isLoading, error };
}
