'use client';

import React from 'react';
import { ThemeProvider } from './ThemeProvider';
import { AuthProvider } from './AuthProvider';
import NextTopLoader from 'nextjs-toploader';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <NextTopLoader
        color="hsl(var(--primary))"
        height={3}
        showSpinner={false}
        shadow={false}
        crawl={true}
        speed={200}
        easing="ease"
      />
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}
