import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { prisma } from '@/lib/prisma';

export default async function AdminFlagsPage() {
  const flags = await prisma.priceFlag.findMany({
    where: { resolved: false },
    orderBy: { createdAt: 'desc' },
    include: {
      supplyEntry: {
        include: {
          product: { select: { name: true, unit: true } },
          location: { select: { name: true, state: true } },
          vendor: { select: { email: true } },
        },
      },
    },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Price Flags & Anomalies</h1>
      <Card className="bg-card border-border/70">
        <CardHeader>
          <CardTitle>Unresolved Flags</CardTitle>
          <CardDescription>Live anomalies currently marked unresolved in the database.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {flags.length === 0 ? (
            <p className="text-sm text-muted-foreground">No unresolved flags found.</p>
          ) : (
            flags.map((flag) => (
              <div key={flag.id} className="flex items-start justify-between gap-3 rounded border border-border/50 bg-secondary/10 p-4">
                <div className="flex gap-4">
                  <div className="mt-0.5 size-10 rounded-full bg-unavailable/10 flex items-center justify-center">
                    <AlertTriangle className="size-5 text-unavailable" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">
                      {flag.supplyEntry.location.name} / {flag.supplyEntry.product.name} ({flag.supplyEntry.product.unit ?? 'unit'})
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      Reported Price: ₦{Number(flag.supplyEntry.price).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Source: {flag.supplyEntry.vendor.email ?? 'Unknown vendor'} • {flag.createdAt.toLocaleString()}
                    </p>
                    <p className="text-[10px] font-data uppercase tracking-wider text-unavailable">{flag.reason}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
