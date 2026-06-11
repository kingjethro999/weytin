/**
 * Price calculation logic for Weytin Platform.
 * Follows CLAUDE.md rules for trimming outliers.
 */

export function calculateAveragePrice(prices: number[]): number {
  if (prices.length === 0) return 0;
  if (prices.length < 3) return prices.reduce((a, b) => a + b, 0) / prices.length;

  // Trim top/bottom 10% as per CLAUDE.md
  const sorted = [...prices].sort((a, b) => a - b);
  const trimCount = Math.floor(sorted.length * 0.1);
  const trimmed = sorted.slice(trimCount, sorted.length - trimCount);

  return trimmed.reduce((a, b) => a + b, 0) / trimmed.length;
}

export function calculateMedianPrice(prices: number[]): number {
  if (prices.length === 0) return 0;
  
  const sorted = [...prices].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  
  return sorted[mid];
}

export function calculateFairnessScore(price: number, avg: number): number {
  if (avg === 0) return 100;
  
  const diff = Math.abs(price - avg);
  const percentageDiff = (diff / avg) * 100;
  
  // Score from 0 to 100
  return Math.max(0, Math.min(100, Math.round(100 - percentageDiff)));
}

/**
 * Filter a raw set of prices to obtain the validated price pool.
 * Enforces min/max bounds and filters outliers/spikes against the median.
 */
export function getValidatedPricePool(
  prices: number[],
  minPrice?: number,
  maxPrice?: number
): { validPrices: number[]; discardedCount: number } {
  if (prices.length === 0) {
    return { validPrices: [], discardedCount: 0 };
  }

  let discardedCount = 0;
  
  // 1. Min/Max Range Check
  let filtered = prices;
  if (minPrice !== undefined || maxPrice !== undefined) {
    filtered = prices.filter((p) => {
      const inMin = minPrice === undefined || p >= minPrice;
      const inMax = maxPrice === undefined || p <= maxPrice;
      if (inMin && inMax) return true;
      discardedCount++;
      return false;
    });
  }

  if (filtered.length === 0) {
    return { validPrices: [], discardedCount: prices.length };
  }

  // 2. Outlier/Spike Detection (using median as baseline)
  const baseline = calculateMedianPrice(filtered);
  const finalPool = filtered.filter((p) => {
    // Flag/discard if it deviates by more than 70% from median baseline
    const deviation = Math.abs(p - baseline) / baseline;
    const isValid = deviation <= 0.7; // 70% tolerance
    if (isValid) return true;
    discardedCount++;
    return false;
  });

  return {
    validPrices: finalPool.length > 0 ? finalPool : filtered,
    discardedCount,
  };
}

