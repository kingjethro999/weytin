'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

import { useRouter } from 'next/navigation';
import { useAuthStore, UserRole } from '@/store/auth.store';

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Authentication failed');
      }

      const data = await response.json();
      setUser(data.user);

      toast.success('Successfully logged in');
      router.push('/dashboard');
      router.refresh();
    } catch (error: any) {
      toast.error('Authentication failed', {
        description: error.message || 'Unable to sign you in',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold tracking-tight">Login</CardTitle>
          </div>
          <CardDescription className="text-muted-foreground">
            Access the Weytin Market Monitor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                name="email"
                type="email" 
                placeholder="yourname@email.com" 
                required 
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link 
                  href="/forgot-password" 
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input 
                  id="password" 
                  name="password"
                  type={showPassword ? 'text' : 'password'} 
                  required 
                  className="bg-background/50 pr-10"
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
            <Button type="submit" className="w-full mt-2" disabled={isLoading}>
              {isLoading ? 'Authenticating...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 border-t border-border/50 pt-6">
          <div className="text-center text-sm text-muted-foreground">
            New organization?{' '}
            <Link 
              href="/signup" 
              className="font-medium text-foreground hover:underline underline-offset-4"
            >
              Request Access
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="p-3 border border-border/50 rounded-md bg-background/30">
              <p className="text-xs font-semibold text-muted-foreground mb-1">System Status</p>
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-supply animate-pulse" />
                <span className="text-[10px] font-mono">ONLINE</span>
              </div>
            </div>
            <div className="p-3 border border-border/50 rounded-md bg-background/30">
              <p className="text-xs font-semibold text-muted-foreground mb-1">Active Locations</p>
              <p className="text-xs font-mono font-medium">-- / --</p>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
