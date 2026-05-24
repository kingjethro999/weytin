'use client';

import * as React from 'react';
import { Toaster } from 'sonner';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Simple theme provider for now, defaults to dark
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {children}
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--card)',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
          },
        }}
      />
    </div>
  );
}
