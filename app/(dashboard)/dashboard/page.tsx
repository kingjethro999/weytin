import React from 'react';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  Users, 
  AlertTriangle,
  ArrowUpRight,
  MapPin
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

interface RecentSupplyEntry {
  id: string;
  price: number;
  quantity: number;
  submitted_at: string;
  products: { name: string } | null;
  locations: { name: string } | null;
}

interface ActiveLocation {
  id: string;
  name: string;
  state: string;
}

export default async function DashboardPage() {
  const [supplyCount, priceData, vendorCount, flagCount, highDemandLocations, recentEntries] = await Promise.all([
    prisma.supplyEntry.count(),
    prisma.supplyEntry.findMany({ select: { price: true } }),
    prisma.profile.count({ where: { role: 'vendor' } }),
    prisma.priceFlag.count({ where: { resolved: false } }),
    prisma.location.findMany({ select: { id: true, name: true, state: true }, take: 4 }),
    prisma.supplyEntry.findMany({
      orderBy: { submittedAt: 'desc' },
      take: 6,
      select: {
        id: true,
        price: true,
        quantity: true,
        submittedAt: true,
        product: { select: { name: true } },
        location: { select: { name: true } },
      },
    }),
  ]);

  const avgPrice = priceData.length > 0
    ? priceData.reduce((acc, curr) => acc + Number(curr.price), 0) / priceData.length
    : 0;
  const recentSupplyEntries: RecentSupplyEntry[] = recentEntries.map((entry) => ({
    id: entry.id,
    price: Number(entry.price),
    quantity: entry.quantity,
    submitted_at: entry.submittedAt.toISOString(),
    products: entry.product ? { name: entry.product.name } : null,
    locations: entry.location ? { name: entry.location.name } : null,
  }));

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:justify-between md:items-end">
        <div>
          <p className="text-[10px] font-data uppercase tracking-[0.2em] text-muted-foreground">Operations Dashboard</p>
          <h1 className="text-3xl font-semibold tracking-tight mt-1">System Overview</h1>
          <p className="text-muted-foreground mt-1">
            Aggregated market data and supply chain health indicators.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-supply/10 text-supply border-supply/30 gap-1.5 py-1 px-3">
            <div className="size-1.5 rounded-full bg-supply" />
            LIVE DATA
          </Badge>
          <Button variant="outline" size="sm" className="font-data text-[10px] uppercase tracking-wider">
            Export Report
          </Button>
        </div>
      </header>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Total Supply Items" 
          value={supplyCount || 0} 
          trendLabel="Across all active nodes"
          status="info"
          icon={Package}
        />
        <MetricCard 
          title="Avg Price Index" 
          value={`₦${Math.round(avgPrice).toLocaleString()}`} 
          trendLabel="Current market average"
          status="warning"
          icon={TrendingUp}
        />
        <MetricCard 
          title="Active Vendors" 
          value={vendorCount || 0} 
          trendLabel="Verified agents"
          status="success"
          icon={Users}
        />
        <MetricCard 
          title="Price Flags" 
          value={flagCount || 0} 
          trendLabel="Requires attention"
          status="error"
          icon={AlertTriangle}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <Card className="lg:col-span-2 bg-card border-border/70 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Supply vs Demand Trends</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">National average monitoring</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="text-[10px] uppercase bg-supply/15 text-supply">Supply</Badge>
              <Badge variant="outline" className="text-[10px] uppercase border-demand/40 text-demand">Demand</Badge>
            </div>
          </CardHeader>
          <CardContent className="border-t border-border/50">
            <div className="py-4 space-y-2">
              {recentSupplyEntries.length === 0 ? (
                <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <BarChart3 className="size-10 opacity-50" />
                    <p className="font-data text-xs uppercase tracking-widest">No supply reports yet</p>
                  </div>
                </div>
              ) : (
                recentSupplyEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between rounded-md border border-border/60 bg-muted/40 px-3 py-2">
                    <div>
                      <p className="text-sm font-medium">{entry.products?.name || 'Unknown product'}</p>
                      <p className="text-xs text-muted-foreground">
                        {entry.locations?.name || 'Unknown location'} • Qty {entry.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-data font-semibold">₦{Number(entry.price).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(entry.submitted_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sidebar/Recent Activity Area */}
        <div className="space-y-6">
          <Card className="bg-card border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-data uppercase tracking-widest text-muted-foreground">
                Active Locations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(highDemandLocations as ActiveLocation[]).map((loc) => (
                <div key={loc.id} className="flex items-center justify-between p-3 rounded-md bg-muted/50 border border-border/60">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded bg-primary/10 flex items-center justify-center">
                      <MapPin className="size-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">{loc.name}</p>
                      <p className="text-[10px] text-muted-foreground">{loc.state}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-data font-semibold">NODE</p>
                    <div className="flex items-center text-[10px] text-supply">
                      <ArrowUpRight className="size-2.5 mr-0.5" />
                      ACTIVE
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="ghost" className="w-full text-xs text-muted-foreground hover:text-foreground hover:bg-muted" asChild>
                <Link href="/search">View full market <ArrowUpRight className="ml-2 size-3" /></Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
