/**
 * Demand tracking logic for Weytin Platform.
 */

import { DemandEventType } from '@/types/demand.types';
import { logger } from '@/lib/utils/logger';

export function trackDemand(productId: string, locationId: string, eventType: DemandEventType = 'search') {
  // Fire-and-forget: we don't await this in the UI critical path
  fetch('/api/demand', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      product_id: productId,
      location_id: locationId,
      event_type: eventType,
    }),
  })
    .then(async (response) => {
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'Failed to track demand');
      }
      logger.debug('[Demand] Event tracked', { eventType, productId });
    })
    .catch((error) => {
      logger.error('[Demand] Failed to track event', { error: error.message, productId, locationId });
    });
}
