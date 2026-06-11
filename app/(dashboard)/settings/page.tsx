import { cookies } from 'next/headers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/error-state';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth/jwt';
import { EditProfileClient } from '@/components/settings/EditProfileClient';

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('weytin_session_token')?.value;

  if (!token) {
    return (
      <ErrorState
        title="Session missing"
        error="No authenticated session found. Please sign in again."
      />
    );
  }

  const payload = await verifyJWT(token);
  if (!payload || !payload.id) {
    return (
      <ErrorState
        title="Session invalid"
        error="Your session is invalid or expired. Please sign in again."
      />
    );
  }

  const profile = await prisma.profile.findUnique({
    where: { id: payload.id },
    include: {
      location: true,
    },
  });

  if (!profile) {
    return (
      <ErrorState
        title="Account not found"
        error="No account record exists for this session. Create or sync the profile first."
      />
    );
  }

  const [supplyCount, demandCount, openFlagsCount, recentSubmissions] = await Promise.all([
    prisma.supplyEntry.count({ where: { vendorId: profile.id } }),
    prisma.demandEvent.count({ where: { userId: profile.id } }),
    prisma.priceFlag.count({ where: { reportedBy: profile.id, resolved: false } }),
    prisma.supplyEntry.findMany({
      where: { vendorId: profile.id },
      orderBy: { submittedAt: 'desc' },
      take: 5,
      include: {
        product: { select: { name: true, unit: true } },
        location: { select: { name: true, state: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-6 max-w-5xl">
      <header>
        <p className="text-[10px] font-data uppercase tracking-[0.2em] text-muted-foreground">Account</p>
        <h1 className="text-3xl font-semibold tracking-tight mt-1">Settings</h1>
        <p className="text-muted-foreground mt-1">Live account and activity data from the database.</p>
      </header>

      {/* Editable Profile Card */}
      <EditProfileClient
        initialBusinessName={profile.businessName}
        initialLocationId={profile.locationId}
        initialLocation={profile.location
          ? {
              id: profile.location.id,
              name: profile.location.name,
              state: profile.location.state,
              lga: profile.location.lga ?? null,
            }
          : null
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-card border-border/70">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Core account attributes</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>Email: <span className="text-foreground">{profile.email ?? 'N/A'}</span></p>
            <p>Role: <span className="text-foreground capitalize">{profile.role}</span></p>
            <p>Verification: <span className="text-foreground capitalize">{profile.verificationStatus}</span></p>
            <p>Account ID: <span className="text-foreground font-data">{profile.id}</span></p>
            <p>Created: <span className="text-foreground">{profile.createdAt.toLocaleString()}</span></p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/70">
          <CardHeader>
            <CardTitle>Location</CardTitle>
            <CardDescription>Linked operating location</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>Name: <span className="text-foreground">{profile.location?.name ?? 'Not linked'}</span></p>
            <p>State: <span className="text-foreground">{profile.location?.state ?? 'Not linked'}</span></p>
            <p>LGA: <span className="text-foreground">{profile.location?.lga ?? 'Not linked'}</span></p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card border-border/70">
          <CardHeader>
            <CardTitle className="text-base">Supply Reports</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-data font-semibold">{supplyCount}</CardContent>
        </Card>
        <Card className="bg-card border-border/70">
          <CardHeader>
            <CardTitle className="text-base">Demand Events</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-data font-semibold">{demandCount}</CardContent>
        </Card>
        <Card className="bg-card border-border/70">
          <CardHeader>
            <CardTitle className="text-base">Open Price Flags</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-data font-semibold">{openFlagsCount}</CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border/70">
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
          <CardDescription>Latest supply updates from this account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentSubmissions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No supply submissions found for this account yet.</p>
          ) : (
            recentSubmissions.map((entry) => (
              <div key={entry.id} className="rounded-md border border-border/60 bg-muted/40 px-3 py-2">
                <p className="text-sm font-medium">{entry.product.name}</p>
                <p className="text-xs text-muted-foreground">
                  {entry.location.name}, {entry.location.state} • Qty {entry.quantity} {entry.product.unit ?? 'units'} •
                  {' '}₦{Number(entry.price).toLocaleString()} • {entry.submittedAt.toLocaleString()}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
