import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-6 py-20">
        <div className="space-y-4">
          <p className="text-[10px] font-data uppercase tracking-[0.2em] text-muted-foreground">
            Weytin Platform
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">
            Supply and demand visibility for Nigerian markets.
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Monitor product availability, demand activity, and price signals in one operations dashboard.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <Button asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/signup">Create account</Link>
            </Button>
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <Card className="bg-card border-border/70">
            <CardHeader>
              <CardTitle className="text-base">Search intelligence</CardTitle>
              <CardDescription>Location-based product insights</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Query products by location and category with real-time pricing snapshots.
            </CardContent>
          </Card>
          <Card className="bg-card border-border/70">
            <CardHeader>
              <CardTitle className="text-base">Vendor reporting</CardTitle>
              <CardDescription>Supply submissions at source</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Vendors submit quantity and price updates directly into the monitoring pipeline.
            </CardContent>
          </Card>
          <Card className="bg-card border-border/70">
            <CardHeader>
              <CardTitle className="text-base">Admin controls</CardTitle>
              <CardDescription>Flags and policy enforcement</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Resolve anomalies, review price boundaries, and keep market data trustworthy.
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
