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
