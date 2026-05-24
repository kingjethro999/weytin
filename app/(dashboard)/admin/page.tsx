import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { VendorApprovalRow } from '@/components/admin/VendorApprovalRow';
import { 
  ShieldCheck, 
  Users, 
  Store, 
  Flag, 
  ArrowUpRight,
  Settings2,
  FileSearch,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { prisma } from '@/lib/prisma';

interface PendingVendor {
  id: string;
  email: string;
  business_name: string | null;
  verification_status?: string;
  created_at: string;
  location_id: string | null;
}

interface FlagEntry {
  price?: number | null;
  products?: { name?: string | null } | null;
  locations?: { name?: string | null } | null;
}

interface RecentFlag {
  id: string;
  reason: string;
  supply_entries?: FlagEntry | null;
}

export default async function AdminDashboardPage() {
  const [
    totalUsers,
    verifiedVendors,
    activeFlags,
    pendingVendors,
    recentFlags,
  ] = await Promise.all([
    prisma.profile.count(),
    prisma.profile.count({ where: { role: 'vendor', verificationStatus: 'verified' } }),
    prisma.priceFlag.count({ where: { resolved: false } }),
    prisma.profile.findMany({
      where: { role: 'vendor', verificationStatus: 'pending' },
      take: 3,
      select: {
        id: true,
        email: true,
        businessName: true,
        verificationStatus: true,
        createdAt: true,
        locationId: true,
      },
    }),
    prisma.priceFlag.findMany({
      where: { resolved: false },
      take: 3,
      include: {
        supplyEntry: {
          include: {
            product: { select: { name: true } },
            location: { select: { name: true } },
          },
        },
      },
    }),
  ]);
  const pendingVendorRows: PendingVendor[] = pendingVendors.map((vendor) => ({
    id: vendor.id,
    email: vendor.email || '',
    business_name: vendor.businessName,
    verification_status: vendor.verificationStatus,
    created_at: vendor.createdAt.toISOString(),
    location_id: vendor.locationId,
  }));
  const recentFlagRows: RecentFlag[] = recentFlags.map((flag) => ({
    id: flag.id,
    reason: flag.reason,
    supply_entries: {
      price: Number(flag.supplyEntry.price),
      products: { name: flag.supplyEntry.product.name },
      locations: { name: flag.supplyEntry.location.name },
    },
  }));

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="size-5 text-primary" />
            <span className="text-[10px] font-mono text-primary uppercase tracking-widest font-bold">Admin Console</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Control</h1>
          <p className="text-muted-foreground mt-1">
            Manage users, vendors, and global market rules.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Settings2 className="size-3.5" /> System Logs
          </Button>
          <Button size="sm" className="gap-2">
            <FileSearch className="size-3.5" /> Global Search
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Total Users" 
          value={totalUsers || 0}
          status="info"
          icon={Users}
        />
        <MetricCard 
          title="Verified Vendors" 
          value={verifiedVendors || 0}
          status="success"
          icon={Store}
        />
        <MetricCard 
          title="Active Flags" 
          value={activeFlags || 0} 
          status="error"
          icon={Flag}
        />
        <MetricCard 
          title="System Health" 
          value="99.9%" 
          status="success"
          icon={Activity}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Vendor Approvals */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">Pending Vendor Access</CardTitle>
              <p className="text-xs text-muted-foreground">Review and approve new vendor requests</p>
            </div>
            <Badge variant="outline" className="font-mono text-[10px] uppercase">
              {pendingVendorRows.length || 0} PENDING
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4 border-t border-border/50 pt-6">
            {pendingVendorRows.length > 0 ? (
              pendingVendorRows.map((vendor) => (
                <VendorApprovalRow key={vendor.id} vendor={vendor} />
              ))
            ) : (
              <div className="py-8 text-center text-muted-foreground text-xs font-mono uppercase tracking-widest">
                No pending requests
              </div>
            )}
            <Button variant="ghost" className="w-full text-xs text-muted-foreground" size="sm">
              View All Requests <ArrowUpRight className="size-3 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Global Price Rules / Flags */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">Critical Price Flags</CardTitle>
              <p className="text-xs text-muted-foreground">Automated anomalies requiring resolution</p>
            </div>
            <Badge variant="destructive" className="font-mono text-[10px] uppercase">
              {activeFlags || 0} ACTIVE
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4 border-t border-border/50 pt-6">
            {recentFlagRows.length > 0 ? (
              recentFlagRows.map((flag) => (
                <div key={flag.id} className="p-3 rounded-lg border border-border/50 bg-card/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-2 rounded-full bg-unavailable animate-pulse" />
                    <div>
                      <p className="text-xs font-bold">{flag.supply_entries?.products?.name || 'Unknown Product'}</p>
                      <p className="text-[10px] text-muted-foreground font-mono uppercase">
                        {flag.supply_entries?.locations?.name || 'Unknown'} • ₦{flag.supply_entries?.price?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-unavailable uppercase tracking-tighter">{flag.reason}</p>
                    <Button variant="link" className="h-auto p-0 text-[10px] font-mono text-primary uppercase">Resolve</Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-muted-foreground text-xs font-mono uppercase tracking-widest">
                No active flags
              </div>
            )}
            <Button variant="ghost" className="w-full text-xs text-muted-foreground" size="sm">
              Open Flag Console <ArrowUpRight className="size-3 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
