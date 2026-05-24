/**
 * Price validation logic for Weytin Platform.
 */

import { PriceRule } from '@/types/price.types';

export function isPriceInBounds(price: number, rule: PriceRule): boolean {
  return price >= rule.min_price && price <= rule.max_price;
}

export function detectAnomaly(price: number, avg: number, threshold: number = 0.5): boolean {
  if (avg === 0) return false;
  
  const upperLimit = avg * (1 + threshold);
  const lowerLimit = avg * (1 - threshold);
  
  return price > upperLimit || price < lowerLimit;
}
