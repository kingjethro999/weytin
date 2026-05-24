import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { prisma } from '@/lib/prisma';

export default async function AdminVendorsPage() {
  const vendors = await prisma.profile.findMany({
    where: { role: 'vendor' },
    orderBy: { createdAt: 'desc' },
    include: {
      location: { select: { name: true, state: true } },
    },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Vendor Management</h1>
      <Card className="bg-card border-border/70">
        <CardHeader>
          <CardTitle>Vendor Directory ({vendors.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {vendors.length === 0 ? (
            <p className="text-sm text-muted-foreground">No vendor accounts found in the database.</p>
          ) : (
            vendors.map((vendor) => (
              <div key={vendor.id} className="rounded-md border border-border/60 bg-muted/40 px-3 py-2">
                <p className="text-sm font-medium">{vendor.email ?? 'No email'}</p>
                <p className="text-xs text-muted-foreground">
                  {vendor.location?.name ?? 'No location'}, {vendor.location?.state ?? 'N/A'} •
                  {' '}Status: {vendor.verificationStatus} • Created {vendor.createdAt.toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
