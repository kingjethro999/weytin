'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bell, User, Search, Menu } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';

export function Topbar() {
  const user = useAuthStore((state) => state.user);
  const setMobileNavOpen = useUIStore((state) => state.setMobileNavOpen);

  return (
    <header className="h-16 border-b border-border/70 bg-background/95 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden text-muted-foreground"
          onClick={() => setMobileNavOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu className="size-5" aria-hidden="true" />
        </Button>
        <div className="relative w-full hidden md:block">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" aria-hidden="true" />
          <Input 
            placeholder="Search products or locations..." 
            className="pl-9 bg-card border-border/70 h-9"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-muted" aria-label="Notifications">
            <Bell className="size-4" aria-hidden="true" />
          </Button>
          <div className="h-4 w-px bg-border mx-2" />
          <Button variant="ghost" className="gap-2 px-2.5 hover:bg-muted" aria-label="User menu">
            <div className="size-6 rounded-full bg-secondary/80 flex items-center justify-center">
              <User className="size-3" aria-hidden="true" />
            </div>
            <span className="text-xs font-medium hidden sm:inline-block capitalize">
              {user?.email.split('@')[0]}
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
}
