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
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    if (initialPrice !== undefined) return;

    async function fetchMetrics() {
      try {
        const response = await fetch(`/api/supply?productId=${product.id}`);
        if (!response.ok) throw new Error('Failed to load supply entries');
        const data = await response.json();

        if (data && data.length > 0) {
          const prices = data.map((d: any) => Number(d.price));
          const avgPrice = calculateAveragePrice(prices);
          setPrice(avgPrice);
          setReportCount(data.length);
          setLastUpdated(data[0].submitted_at);

          // Simple trend logic: compare latest to average
          if (data.length > 1) {
            const latest = Number(data[0].price);
            if (latest > avgPrice * 1.05) setTrend('up');
            else if (latest < avgPrice * 0.95) setTrend('down');
            else setTrend('stable');
          }

          // Supply level logic from latest entry quantity value.
          const latestQuantity = Number(data[0].quantity) || 0;
          if (latestQuantity >= 100) setSupplyLevel('high');
          else if (latestQuantity <= 20) setSupplyLevel('low');
          else setSupplyLevel('medium');
        }
      } catch (err) {
        console.error('Failed to load product supply metrics:', err);
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
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[10px] font-data text-muted-foreground uppercase tracking-widest mb-1">
                {product.category.name}
              </p>
              <h3 className="text-lg font-bold tracking-tight group-hover:text-primary transition-colors">
                {product.name}
              </h3>
            </div>
            <Badge variant="outline" className={cn("font-mono text-[10px]", supplyColors[supplyLevel])}>
              {supplyLevel.toUpperCase()} SUPPLY
            </Badge>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] font-data text-muted-foreground uppercase mb-1">Avg Price / {product.unit}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-data">
                  {price > 0 ? `₦${price.toLocaleString()}` : '---'}
                </span>
                {price > 0 && (
                  <div className={cn("flex items-center text-[10px] font-medium", trendColor)}>
                    <TrendIcon className="size-3 mr-0.5" />
                    {trend === 'stable' ? '0%' : 'VAR'}
                  </div>
                )}
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
