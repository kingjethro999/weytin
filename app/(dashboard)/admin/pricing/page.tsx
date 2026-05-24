import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { prisma } from '@/lib/prisma';

export default async function AdminPricingPage() {
  const rules = await prisma.priceRule.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      product: { select: { name: true, unit: true } },
      location: { select: { name: true, state: true } },
      updater: { select: { email: true } },
    },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Pricing Rules & Limits</h1>
      <Card className="bg-card border-border/70">
        <CardHeader>
          <CardTitle>Live Price Bounds</CardTitle>
          <CardDescription>Rules currently stored in the database.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {rules.length === 0 ? (
            <p className="text-sm text-muted-foreground">No price rules configured yet.</p>
          ) : (
            rules.map((rule) => (
              <div key={rule.id} className="rounded-md border border-border/60 bg-muted/40 px-3 py-2">
                <p className="text-sm font-medium">
                  {rule.product.name} ({rule.product.unit ?? 'unit'}) • {rule.location.name}, {rule.location.state}
                </p>
                <p className="text-xs text-muted-foreground">
                  Min ₦{Number(rule.minPrice).toLocaleString()} • Max ₦{Number(rule.maxPrice).toLocaleString()} •
                  {' '}Updated by {rule.updater.email ?? 'Unknown'} on {rule.updatedAt.toLocaleString()}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
