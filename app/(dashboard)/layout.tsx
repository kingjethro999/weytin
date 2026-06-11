'use client';

import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { MobileNav } from '@/components/layout/MobileNav';
import { useUIStore } from '@/store/ui.store';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isMobileNavOpen, setMobileNavOpen } = useUIStore();

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar />
      <MobileNav 
        isOpen={isMobileNavOpen} 
        onClose={() => setMobileNavOpen(false)} 
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1440px] p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
