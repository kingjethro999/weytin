import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  ArrowRight, 
  ShieldCheck, 
  TrendingUp, 
  Users, 
  MapPin, 
  Store, 
  Sparkles,
  Layers,
  ChevronRight,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  DollarSign
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { LandingStats } from '@/components/landing/LandingStats';

export default async function Home() {
  const [locationsCount, supplyCount, vendorCount, productCount] = await Promise.all([
    prisma.location.count(),
    prisma.supplyEntry.count(),
    prisma.profile.count({ where: { role: 'vendor' } }),
    prisma.product.count(),
  ]);
  return (
    <main className="min-h-screen bg-background text-foreground relative overflow-hidden selection:bg-primary/30">
      {/* Dynamic Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <div className="mx-auto max-w-6xl px-6 pt-24 pb-20 relative z-10">
        <div className="flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium tracking-wide animate-fade-in">
            <Sparkles className="size-3" aria-hidden="true" />
            <span>Smart Price & Supply Intelligence</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] bg-clip-text text-transparent bg-gradient-to-b from-foreground via-foreground/90 to-foreground/50">
            Supply and demand visibility for <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-emerald-400">Nigerian markets</span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Monitor real-time product availability, demand activity, and pricing updates across states and local government areas in a unified dashboard.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <Button size="lg" className="w-full sm:w-auto gap-2 text-sm px-8" asChild>
              <Link href="/login">
                Enter Dashboard <ChevronRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-sm px-8" asChild>
              <Link href="/signup">Create Account</Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <LandingStats 
          locationsCount={locationsCount}
          supplyCount={supplyCount}
          vendorCount={vendorCount}
          productCount={productCount}
        />

        {/* Audience / Split Value Section */}
        <div className="mt-24 grid gap-8 md:grid-cols-2">
          <Card className="bg-card/40 border-border/50 backdrop-blur-sm relative overflow-hidden group hover:border-primary/30 transition-all duration-300">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <Users className="size-24 text-primary" aria-hidden="true" />
            </div>
            <CardHeader className="pb-4">
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <Users className="size-5 text-primary" aria-hidden="true" />
              </div>
              <CardTitle className="text-xl">For Buyers & Observers</CardTitle>
              <CardDescription>Track local market shifts and find verified pricing.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3 leading-relaxed">
              <p>
                Get real-time insights into product availability in your state or LGA. Track average price histories, view smart forecasts, and avoid paying inflated prices by using our clean, verified price data.
              </p>
              <ul className="space-y-2 pt-2 text-xs">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-primary shrink-0" aria-hidden="true" />
                  <span>Interactive local map indicators & state filters</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-primary shrink-0" aria-hidden="true" />
                  <span>Fairness ratings indicating if price matches market norm</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card/40 border-border/50 backdrop-blur-sm relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <Store className="size-24 text-emerald-400" aria-hidden="true" />
            </div>
            <CardHeader className="pb-4">
              <div className="size-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-2">
                <Store className="size-5 text-emerald-400" aria-hidden="true" />
              </div>
              <CardTitle className="text-xl">For Sellers & Vendors</CardTitle>
              <CardDescription>Publish stock status and demonstrate competitive value.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3 leading-relaxed">
              <p>
                Showcase your inventory, list item prices directly at the source, and build trust with customers. Your listings are protected from outliers using our automated market checking tools.
              </p>
              <ul className="space-y-2 pt-2 text-xs">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
                  <span>Simple 2-step stock listing forms</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
                  <span>Custom product suggestions and unit mapping</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Features Showcase Section */}
        <div className="mt-28 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-bold tracking-tight">Key Features built for simplicity</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We design our components specifically to highlight intelligence while remaining easy to use for all age groups.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="p-6 rounded-xl border border-border/40 bg-card/20 hover:bg-card/40 transition-colors space-y-3">
              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <MapPin className="size-4.5" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-base">Location-Aware Search</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Filter and track commodities by specific markets, cities, or Local Government Areas to view hyper-local availability status.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border/40 bg-card/20 hover:bg-card/40 transition-colors space-y-3">
              <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="size-4.5" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-base">Verified Price Validation</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Automatic algorithms clean and filter extreme price outliers to maintain integrity and prevent fraudulent price spikes.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border/40 bg-card/20 hover:bg-card/40 transition-colors space-y-3">
              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <TrendingUp className="size-4.5" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-base">Estimate Pricing & Analytics</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Leverage historical pricing and intelligent averages to forecast market trends and plan purchases with confidence.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border/40 bg-card/20 hover:bg-card/40 transition-colors space-y-3">
              <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Layers className="size-4.5" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-base">Flexible Categories</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Browse through grains, oils, livestock, and other major food items. Suggest new entries if they are missing from the catalog.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border/40 bg-card/20 hover:bg-card/40 transition-colors space-y-3">
              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Lock className="size-4.5" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-base">Secure Accounts</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your credentials are encrypted using industry standard protocols. Features include simple password visibility toggling and validation.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border/40 bg-card/20 hover:bg-card/40 transition-colors space-y-3">
              <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <DollarSign className="size-4.5" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-base">Completely Free Access</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                No subscription fee or hidden charges. The monitor is public-spirited to empower vendor commerce and consumer protection.
              </p>
            </div>
          </div>
        </div>

        {/* How It Works Steps */}
        <div className="mt-28 space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h2 className="text-3xl font-bold tracking-tight">How it works in three steps</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Our market pipeline is simplified to minimize friction.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center space-y-3 relative z-10">
              <div className="size-12 rounded-full border border-primary/30 bg-primary/5 flex items-center justify-center text-primary font-bold text-lg">
                1
              </div>
              <h4 className="font-bold text-lg">Report Stock & Prices</h4>
              <p className="text-xs text-muted-foreground max-w-[280px] leading-relaxed">
                Registered sellers and monitors upload item stock quantities and prices currently active in the market.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center space-y-3 relative z-10">
              <div className="size-12 rounded-full border border-emerald-500/30 bg-emerald-500/5 flex items-center justify-center text-emerald-400 font-bold text-lg">
                2
              </div>
              <h4 className="font-bold text-lg">Validation Check</h4>
              <p className="text-xs text-muted-foreground max-w-[280px] leading-relaxed">
                The platform filters pricing data against standard local boundaries to ignore typing mistakes or fake price spikes.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center space-y-3 relative z-10">
              <div className="size-12 rounded-full border border-primary/30 bg-primary/5 flex items-center justify-center text-primary font-bold text-lg">
                3
              </div>
              <h4 className="font-bold text-lg">Browse & Monitor</h4>
              <p className="text-xs text-muted-foreground max-w-[280px] leading-relaxed">
                Cleaned averages and predictions are shown to the public to support smarter consumer buying and vendor planning.
              </p>
            </div>
          </div>
        </div>

        {/* Final CTA glassmorphic block */}
        <div className="mt-32 p-8 sm:p-12 rounded-3xl border border-border/60 bg-gradient-to-b from-card/30 to-card/60 backdrop-blur-md text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-[-50%] left-[-50%] w-[100vw] h-[100vw] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
          
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Ready to track your local market?
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Create an account in less than two minutes. Share updates or browse real-time price reports for food items near you.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button size="lg" className="w-full sm:w-auto gap-2 text-sm px-8" asChild>
              <Link href="/login">
                Sign In to Platform <ChevronRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-sm px-8" asChild>
              <Link href="/signup">Sign Up Now</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
