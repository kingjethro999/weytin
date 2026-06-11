import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FlaggedItemRow } from '@/components/admin/FlaggedItemRow';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth/jwt';
import { redirect } from 'next/navigation';

export default async function AdminFlagsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('weytin_session_token')?.value;
  if (!token) redirect('/login');

  const payload = await verifyJWT(token);
  if (!payload?.id) redirect('/login');

  const profile = await prisma.profile.findUnique({
    where: { id: payload.id },
    select: { role: true },
  });
  if (!profile || profile.role !== 'admin') redirect('/dashboard');

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

  const mappedFlags = flags.map((f) => ({
    id: f.id,
    reason: f.reason,
    created_at: f.createdAt,
    supply_entry: {
      price: Number(f.supplyEntry.price),
      product: { name: f.supplyEntry.product.name, unit: f.supplyEntry.product.unit },
      location: { name: f.supplyEntry.location.name, state: f.supplyEntry.location.state },
      vendor: { email: f.supplyEntry.vendor?.email ?? null },
    },
  }));

  return (
    <div className="space-y-6 max-w-5xl">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-[10px] font-data uppercase tracking-[0.2em] text-muted-foreground">Admin</p>
          <h1 className="text-3xl font-semibold tracking-tight mt-1">Price Flags</h1>
          <p className="text-muted-foreground mt-1">
            Automated anomaly detection. Resolve flags after investigating the reported price entry.
          </p>
        </div>
        <Badge
          variant={flags.length > 0 ? 'destructive' : 'outline'}
          className="font-mono text-[10px] uppercase"
        >
          {flags.length} unresolved
        </Badge>
      </header>

      <Card className="bg-card border-border/70">
        <CardHeader>
          <CardTitle>Unresolved Price Anomalies</CardTitle>
          <CardDescription>
            Prices that were auto-flagged for falling outside acceptable ranges or being identified as spikes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mappedFlags.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground">No unresolved flags. The market data is clean.</p>
            </div>
          ) : (
            mappedFlags.map((flag) => (
              <FlaggedItemRow key={flag.id} flag={flag} />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
