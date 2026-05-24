'use client';

import { useState, useEffect } from 'react';
import { SupplyEntry, SupplyMetric } from '@/types/supply.types';
import { logger } from '@/lib/utils/logger';
import { normaliseError, AppError } from '@/lib/utils/errors';

export function useSupply(productId?: string, locationId?: string) {
  const [entries, setEntries] = useState<SupplyEntry[]>([]);
  const [metric, setMetric] = useState<SupplyMetric | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);

  useEffect(() => {
    async function fetchSupplyData() {
      if (!productId && !locationId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        const params = new URLSearchParams();
        if (productId) params.set('productId', productId);
        if (locationId) params.set('locationId', locationId);

        const response = await fetch(`/api/supply?${params.toString()}`);
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error || 'Failed to load supply entries');
        }

        const data = await response.json();
        setEntries(data || []);
        
        // Mocking metric calculation for now
        if (data && data.length > 0) {
          setMetric({
            product_id: productId || '',
            location_id: locationId || '',
            status: data.length > 10 ? 'high' : 'medium',
            avg_price: data.reduce((acc: number, curr: any) => acc + Number(curr.price), 0) / data.length,
            entry_count: data.length,
          });
        }
      } catch (err) {
        const normalised = normaliseError(err);
        setError(normalised);
        logger.error('[Hooks] useSupply failed', { error: normalised });
      } finally {
        setIsLoading(false);
      }
    }

    fetchSupplyData();
  }, [productId, locationId]);

  return { entries, metric, isLoading, error };
}
