'use client';

import React, { useState, useEffect } from 'react';
import { ProductWithCategory } from '@/types/product.types';
import { SupplyMetric, SupplyStatus } from '@/types/supply.types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  MapPin, 
  Info, 
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ProductDetailProps {
  product: ProductWithCategory;
  metric: SupplyMetric | null;
  fairnessScore: number;
}

export function ProductDetail({ product, metric, fairnessScore }: ProductDetailProps) {
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isInsightLoading, setIsInsightLoading] = useState(false);

  useEffect(() => {
    const activeMetric = metric;
    if (!product || !activeMetric) return;

    async function fetchAIInsight() {
      if (!activeMetric) return;
      setIsInsightLoading(true);
      try {
        const response = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [
              { 
                role: 'system', 
                content: 'You are a market analyst for the Weytin platform. Provide a brief (2 sentence) insight on product pricing and supply.' 
              },
              { 
                role: 'user', 
                content: `Product: ${product.name}, Avg Price: ₦${activeMetric.avg_price}, Supply Status: ${activeMetric.status}` 
              }
            ]
          }),
        });
        const data = await response.json();
        setAiInsight(data.content || 'Market insight currently unavailable.');
      } catch {
        setAiInsight('Market analysis unavailable.');
      } finally {
        setIsInsightLoading(false);
      }
    }

    fetchAIInsight();
  }, [metric, product]);

  const supplyStatus: SupplyStatus = metric?.status || 'medium';
  
  const statusColors: Record<SupplyStatus, string> = {
    high: 'text-supply bg-supply/10 border-supply/20',
    medium: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    low: 'text-unavailable bg-unavailable/10 border-unavailable/20',
    unavailable: 'text-muted-foreground bg-muted/10 border-border/20'
  };

  const fairnessLevel =
    fairnessScore <= 35 ? 'Fair' :
    fairnessScore <= 70 ? 'Caution' :
    'High';

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="relative p-8 rounded-xl border border-border/60 bg-card overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Activity className="size-48" />
        </div>
        
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-data uppercase tracking-widest bg-primary/5">
              {product.category?.name || 'Category'}
            </Badge>
            <Badge variant="outline" className={cn("text-[10px] font-data uppercase tracking-widest", statusColors[supplyStatus])}>
              {supplyStatus} Supply
            </Badge>
          </div>
          
          <div>
            <h1 className="text-4xl font-bold tracking-tight">{product.name}</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl leading-relaxed">
              {product.description || `Real-time market tracking for ${product.name} in various Nigerian regions.`}
            </p>
          </div>

          <div className="flex flex-wrap gap-6 pt-4 border-t border-border/30">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-muted flex items-center justify-center">
                <TrendingUp className="size-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-[10px] font-data text-muted-foreground uppercase tracking-tighter">Avg National Price</p>
                <p className="text-sm font-bold font-data">
                  {metric?.avg_price ? `₦${metric.avg_price.toLocaleString()}` : '---'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-muted flex items-center justify-center">
                <Activity className="size-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-[10px] font-data text-muted-foreground uppercase tracking-tighter">Reliability</p>
                <p className="text-sm font-bold font-data">{metric?.entry_count ? `${Math.min(99, metric.entry_count * 5)}%` : '---'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-muted flex items-center justify-center">
                <MapPin className="size-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-[10px] font-data text-muted-foreground uppercase tracking-tighter">Data Points</p>
                <p className="text-sm font-bold font-data">{metric?.entry_count || 0} reports</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Market Data Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-card border-border/70">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Activity className="size-5 text-primary" /> Market Dynamics
            </CardTitle>
          </CardHeader>
          <CardContent className="border-t border-border/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6">
              <div className="rounded-md border border-border/60 bg-muted/40 p-4">
                <p className="text-[10px] font-data uppercase tracking-wider text-muted-foreground">Supply Status</p>
                <p className="mt-2 text-lg font-semibold capitalize">{supplyStatus}</p>
              </div>
              <div className="rounded-md border border-border/60 bg-muted/40 p-4">
                <p className="text-[10px] font-data uppercase tracking-wider text-muted-foreground">Average Price</p>
                <p className="mt-2 text-lg font-semibold">
                  {metric?.avg_price ? `₦${metric.avg_price.toLocaleString()}` : 'No data'}
                </p>
              </div>
              <div className="rounded-md border border-border/60 bg-muted/40 p-4">
                <p className="text-[10px] font-data uppercase tracking-wider text-muted-foreground">Report Volume</p>
                <p className="mt-2 text-lg font-semibold">{metric?.entry_count || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/70">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Price Fairness</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 border-t border-border/50 pt-6">
            <div className="rounded-md border border-border/60 bg-muted/40 p-4 space-y-2">
              <p className="text-[10px] font-data uppercase tracking-wider text-muted-foreground">
                Fairness Index
              </p>
              <p className="text-2xl font-bold font-data">{fairnessScore}/100</p>
              <p className="text-xs text-muted-foreground">{fairnessLevel}</p>
            </div>
            
            <div className="flex justify-between text-[10px] font-data text-muted-foreground uppercase">
              <span>Fair</span>
              <span>Warning</span>
              <span>High</span>
            </div>

            <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 min-h-[120px]">
              <div className="flex items-center gap-2 mb-2">
                <Info className="size-4 text-primary" />
                <h4 className="text-sm font-bold">AI Insight</h4>
              </div>
              {isInsightLoading ? (
                <div className="space-y-2">
                  <div className="h-2 w-full bg-muted animate-pulse rounded" />
                  <div className="h-2 w-3/4 bg-muted animate-pulse rounded" />
                </div>
              ) : (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {aiInsight || 'Market insight currently unavailable.'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
