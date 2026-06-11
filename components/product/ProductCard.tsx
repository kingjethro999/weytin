'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProductWithCategory } from '@/types/product.types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { calculateAveragePrice } from '@/lib/price/calculate';

interface ProductCardProps {
  product: ProductWithCategory;
  price?: number;
  trend?: 'up' | 'down' | 'stable';
  supplyLevel?: 'high' | 'medium' | 'low';
}

export function ProductCard({ 
  product, 
  price: initialPrice, 
  trend: initialTrend,
  supplyLevel: initialSupplyLevel
}: ProductCardProps) {
  const [price, setPrice] = useState(initialPrice || 0);
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>(initialTrend || 'stable');
  const [supplyLevel, setSupplyLevel] = useState<'high' | 'medium' | 'low'>(initialSupplyLevel || 'medium');
  const [reportCount, setReportCount] = useState(0);
  const [isAiEstimated, setIsAiEstimated] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    if (initialPrice !== undefined) return;

    async function fetchMetrics() {
      try {
        const response = await fetch(`/api/prices?productId=${product.id}`);
        if (!response.ok) throw new Error('Failed to load price stats');
        const data = await response.json();

        if (data && data.stats) {
          setPrice(data.stats.avg);
          setReportCount(data.stats.entry_count);
          setIsAiEstimated(data.stats.is_ai_estimate);
          // If there are stats, use them to derive simple trend (we don't have time series here so default stable)
          setTrend('stable');
          
          // Supply level logic from entry count (proxy for quantity if we don't fetch supply array)
          // We don't have latest quantity here, so let's default to entry_count based for now
          if (data.stats.entry_count >= 10) setSupplyLevel('high');
          else if (data.stats.entry_count <= 2) setSupplyLevel('low');
          else setSupplyLevel('medium');
        }
      } catch (err) {
        console.error('Failed to load product price metrics:', err);
      }
    }

    fetchMetrics();
  }, [product.id, initialPrice]);

  const supplyColors = {
    high: 'text-supply bg-supply/10 border-supply/20',
    medium: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    low: 'text-unavailable bg-unavailable/10 border-unavailable/20'
  };

  const TrendIcon = {
    up: TrendingUp,
    down: TrendingDown,
    stable: Minus
  }[trend];

  const trendColor = {
    up: 'text-unavailable',
    down: 'text-supply',
    stable: 'text-muted-foreground'
  }[trend];

  return (
    <Link href={`/product/${product.id}`}>
      <Card className="group hover:border-primary/50 transition-all bg-card border-border/70 overflow-hidden shadow-sm">
        <CardContent className="p-5">
          <div className="flex justify-between items-start gap-4 mb-4">
            <div>
              <p className="text-[10px] font-data text-muted-foreground uppercase tracking-widest mb-1">
                {product.category.name}
              </p>
              <h3 className="text-lg font-bold tracking-tight group-hover:text-primary transition-colors">
                {product.name}
              </h3>
            </div>
            <Badge variant="outline" className={cn("font-mono text-[10px] shrink-0", supplyColors[supplyLevel])}>
              {supplyLevel.toUpperCase()} SUPPLY
            </Badge>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] font-data text-muted-foreground uppercase mb-1">
                {isAiEstimated ? 'Est. Avg Price' : `Avg Price / ${product.unit}`}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-data">
                  {price > 0 ? `₦${price.toLocaleString()}` : '---'}
                </span>
                {price > 0 && isAiEstimated ? (
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-primary/30 text-primary/80 ml-1">
                    AI EST
                  </Badge>
                ) : price > 0 ? (
                  <div className={cn("flex items-center text-[10px] font-medium", trendColor)}>
                    <TrendIcon className="size-3 mr-0.5" />
                    {trend === 'stable' ? '0%' : 'VAR'}
                  </div>
                ) : null}
              </div>
            </div>
            
            <div className="size-8 rounded-full bg-secondary/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowUpRight className="size-4" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="px-5 py-3 bg-muted/40 border-t border-border/60 flex justify-between items-center">
          <span className="text-[10px] font-data text-muted-foreground">
            {lastUpdated ? `Updated ${new Date(lastUpdated).toLocaleDateString()}` : 'No reports'}
          </span>
          <span className="text-[10px] font-data text-muted-foreground">{reportCount} reports</span>
        </CardFooter>
      </Card>
    </Link>
  );
}
