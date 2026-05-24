'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { normaliseError } from '@/lib/utils/errors';

export default function SignupPage() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          role,
          organization,
          password,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Registration failed');
      }

      toast.success('Account created', {
        description: 'You can now log in and continue to your dashboard.',
      });
      router.push('/login');
    } catch (error: unknown) {
      const normalised = normaliseError(error);
      toast.error('Signup failed', {
        description: normalised.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-lg border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Request Platform Access</CardTitle>
          <CardDescription className="text-muted-foreground">
            Join the Weytin network as a vendor or operations observer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="data-label">First Name</Label>
                <Input id="firstName" name="firstName" placeholder="John" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="data-label">Last Name</Label>
                <Input id="lastName" name="lastName" placeholder="Doe" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="data-label">Organization Email</Label>
              <Input id="email" name="email" type="email" placeholder="john@company.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="data-label">Password</Label>
              <Input id="password" name="password" type="password" placeholder="Create a secure password" minLength={8} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className="data-label">Requested Role</Label>
              <Select
                id="role"
                name="role"
                defaultValue="vendor"
                placeholder="Select a role"
                options={[
                  { value: 'vendor', label: 'Vendor (Submit Supply Data)' },
                  { value: 'user', label: 'Observer (Market Insights)' },
                ]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="organization" className="data-label">Organization / Business Name</Label>
              <Input id="organization" name="organization" placeholder="e.g. Lagos Supply Co." required />
            </div>
            <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-border/50 pt-6">
          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link 
              href="/login" 
              className="font-medium text-foreground hover:underline underline-offset-4"
            >
              Log in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
