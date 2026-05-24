import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

interface ListingRow {
  id: string;
  price: number;
  quantity: number;
  submitted_at: string;
  products: { name: string; unit: string | null } | null;
  locations: { name: string; state: string } | null;
}

function formatRelativeDate(dateString: string) {
  const date = new Date(dateString);
  const now = Date.now();
  const diffMs = Math.max(now - date.getTime(), 0);
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
}

export default async function VendorListingsPage() {
  const entries = await prisma.supplyEntry.findMany({
    orderBy: { submittedAt: 'desc' },
    take: 30,
    include: {
      product: { select: { name: true, unit: true } },
      location: { select: { name: true, state: true } },
    },
  });
  const listings: ListingRow[] = entries.map((entry) => ({
    id: entry.id,
    price: Number(entry.price),
    quantity: entry.quantity,
    submitted_at: entry.submittedAt.toISOString(),
    products: entry.product ? { name: entry.product.name, unit: entry.product.unit } : null,
    locations: entry.location ? { name: entry.location.name, state: entry.location.state } : null,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">My Listings</h1>
          <p className="text-sm text-muted-foreground">Manage your product availability and pricing submissions.</p>
        </div>
        <Link href="/vendor/submit">
          <Button className="gap-2">
            <Plus className="size-4" />
            New Listing
          </Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {listings.map((listing) => (
          <Card key={listing.id} className="bg-card/50">
            <CardContent className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded border border-border/50 bg-background flex items-center justify-center font-mono text-xs shrink-0">
                  #{listing.id.slice(0, 6)}
                </div>
                <div>
                  <h3 className="font-semibold">
                    {listing.products?.name || 'Unknown product'}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {listing.locations?.name || 'Unknown location'}
                      {listing.locations?.state ? `, ${listing.locations.state}` : ''}
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      Updated {formatRelativeDate(listing.submitted_at)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between lg:justify-end gap-4 sm:gap-8 border-t lg:border-t-0 border-border/50 pt-4 lg:pt-0 min-w-[280px]">
                <div className="text-left lg:text-right">
                  <p className="data-label">Stock</p>
                  <p className="text-sm font-medium mt-1">
                    {listing.quantity.toLocaleString()} {listing.products?.unit || 'units'}
                  </p>
                </div>
                <div className="text-left lg:text-right">
                  <p className="data-label">Price</p>
                  <p className="text-sm font-bold font-data mt-1">₦{Number(listing.price).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {listings.length === 0 && (
        <div className="h-[300px] border border-dashed border-border rounded-lg flex flex-col items-center justify-center text-center p-6">
          <div className="size-12 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
            <Plus className="size-6 text-muted-foreground" />
          </div>
          <h3 className="font-semibold">No active listings</h3>
          <p className="text-sm text-muted-foreground max-w-[250px] mt-1">
            You haven&apos;t submitted any supply data yet. Start by adding a new product.
          </p>
          <Link href="/vendor/submit" className="mt-4">
            <Button variant="outline">Add First Listing</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
