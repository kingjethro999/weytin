'use client';

import { useEffect, useRef } from 'react';
import { logger } from '@/lib/utils/logger';

interface DemandLoggerProps {
  productId: string;
  locationId: string | null;
}

/**
 * Fire-and-forget demand event logger.
 * Placed on the product detail page to record a 'view' demand event.
 * Silent — never blocks rendering or throws visible errors.
 */
export function DemandLogger({ productId, locationId }: DemandLoggerProps) {
  const firedRef = useRef(false);

  useEffect(() => {
    // locationId is required by DemandEvent schema — skip if not available
    if (firedRef.current || !locationId) return;
    firedRef.current = true;

    // Fire-and-forget: do not await, never block the UI
    fetch('/api/demand', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: productId,
        location_id: locationId,
        event_type: 'view',
      }),
    }).catch((err) =>
      logger.debug('[DemandLogger] Event log failed (non-critical)', { productId, error: err?.message })
    );
  }, [productId, locationId]);

  // Renders nothing — pure side effect
  return null;
}
