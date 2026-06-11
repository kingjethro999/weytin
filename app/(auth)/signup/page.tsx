'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { LocationPicker } from '@/components/location/LocationPicker';
import { toast } from 'sonner';
import { normaliseError } from '@/lib/utils/errors';
import { MapPin, ChevronRight, CheckCircle2, Eye, EyeOff } from 'lucide-react';

interface LocationOption {
  id: string;
  name: string;
  state: string;
}

export default function SignupPage() {
  const router = useRouter();

  // ── Step state ──────────────────────────────────────────────────────────────
  const [step, setStep] = useState<1 | 2>(1);
  const [createdUserId, setCreatedUserId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ── Step 2 state ─────────────────────────────────────────────────────────────
  const [locationId, setLocationId] = useState('');

  // ── Step 1: Account creation ──────────────────────────────────────────────────
  const handleStep1 = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = new FormData(e.currentTarget);
    const firstName = String(form.get('firstName') || '');
    const lastName = String(form.get('lastName') || '');
    const email = String(form.get('email') || '');
    const role = String(form.get('role') || 'user');
    const organization = String(form.get('organization') || '');
    const password = String(form.get('password') || '');

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, role, organization, password }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Registration failed');
      }

      const data = await response.json();
      setCreatedUserId(data.user?.id ?? null);
      toast.success('Account created', { description: 'Now select your operating location.' });
      setStep(2);
    } catch (error: unknown) {
      const normalised = normaliseError(error);
      toast.error('Signup failed', { description: normalised.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Step 2: Location selection ────────────────────────────────────────────────
  const handleStep2 = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!locationId) {
      toast.error('Please select a location to continue');
      return;
    }

    setIsSubmitting(true);
    try {
      // Update the profile with the chosen location via the profile API
      // We need to authenticate first — but the user isn't logged in yet.
      // We'll pass the userId and locationId to a dedicated onboarding endpoint.
      const res = await fetch('/api/auth/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: createdUserId, locationId }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to save location');
      }

      toast.success('Setup complete!', {
        description: 'Your account is ready. Please log in to continue.',
      });
      router.push('/login');
    } catch (error: unknown) {
      const normalised = normaliseError(error);
      toast.error('Setup failed', { description: normalised.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipLocation = () => {
    toast('Location skipped', { description: 'You can update your location anytime in Settings.' });
    router.push('/login');
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <div className="w-full max-w-lg space-y-4">

        {/* Step Progress */}
        <div className="flex items-center gap-2 justify-center">
          {/* Step 1 */}
          <div className="flex items-center gap-2">
            <div className={`size-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {step > 1 ? <CheckCircle2 className="size-4" aria-hidden="true" /> : '1'}
            </div>
            <span className={`text-xs uppercase tracking-wider ${step === 1 ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>Account</span>
          </div>
          <div className="h-px w-8 bg-border" />
          {/* Step 2 */}
          <div className="flex items-center gap-2">
            <div className={`size-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              2
            </div>
            <span className={`text-xs uppercase tracking-wider ${step === 2 ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>Location</span>
          </div>
        </div>

        {/* ── Step 1 Card ── */}
        {step === 1 && (
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold tracking-tight">Create your Account</CardTitle>
              <CardDescription className="text-muted-foreground">
                Join Weytin to report product stock or view market prices.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStep1} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" name="firstName" placeholder="John" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" name="lastName" placeholder="Doe" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" name="email" type="email" placeholder="john@email.com" required />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input 
                      id="password" 
                      name="password" 
                      type={showPassword ? 'text' : 'password'} 
                      placeholder="Create a secure password" 
                      minLength={8} 
                      required 
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Account Type</Label>
                  <Select
                    id="role"
                    name="role"
                    defaultValue="vendor"
                    placeholder="Select an account type"
                    options={[
                      { value: 'vendor', label: 'Seller / Vendor (Share product stock & prices)' },
                      { value: 'user', label: 'Buyer / Observer (View market prices)' },
                    ]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="organization">Business or Shop Name</Label>
                  <Input id="organization" name="organization" placeholder="e.g. Lagos Supply Co." required />
                </div>
                <Button type="submit" className="w-full mt-2 gap-2" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating account…' : (
                    <>Continue <ChevronRight className="size-4" aria-hidden="true" /></>
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center border-t border-border/50 pt-6">
              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-foreground hover:underline underline-offset-4">
                  Log in
                </Link>
              </div>
            </CardFooter>
          </Card>
        )}

        {/* ── Step 2 Card ── */}
        {step === 2 && (
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center mb-2">
                <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="size-6 text-primary" aria-hidden="true" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">Set Your Location</CardTitle>
              <CardDescription className="text-muted-foreground">
                Your location helps us show you products and prices near you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStep2} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="locationId">Operating Location</Label>
                  <LocationPicker
                    id="locationId"
                    value={locationId}
                    onChange={(val) => setLocationId(val)}
                    placeholder="Search/Select State and Local Government Area"
                  />
                </div>

                <Button type="submit" className="w-full gap-2" disabled={isSubmitting || !locationId}>
                  {isSubmitting ? 'Saving…' : 'Complete Setup'}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center border-t border-border/50 pt-6">
              <button
                type="button"
                onClick={handleSkipLocation}
                className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
              >
                Skip for now — I&apos;ll set this later in Settings
              </button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
