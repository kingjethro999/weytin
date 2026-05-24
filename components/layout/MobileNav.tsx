'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore, UserRole } from '@/store/auth.store';
import { 
  LayoutDashboard, 
  Search, 
  Package, 
  Store, 
  ShieldAlert, 
  BarChart3,
  Users,
  Flag,
  Settings
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard, roles: ['user', 'vendor', 'admin'] },
  { name: 'Search', href: '/search', icon: Search, roles: ['user', 'vendor', 'admin'] },
  { name: 'My Listings', href: '/vendor/listings', icon: Package, roles: ['vendor', 'admin'] },
  { name: 'Submit Supply', href: '/vendor/submit', icon: Store, roles: ['vendor', 'admin'] },
  { name: 'Admin Dashboard', href: '/admin', icon: BarChart3, roles: ['admin'] },
  { name: 'Manage Vendors', href: '/admin/vendors', icon: ShieldAlert, roles: ['admin'] },
  { name: 'Manage Users', href: '/admin/users', icon: Users, roles: ['admin'] },
  { name: 'Flags & Reports', href: '/admin/flags', icon: Flag, roles: ['admin'] },
];

export function MobileNav({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const userRole = user?.role || 'user';

  const filteredNavItems = navItems.filter((item) => 
    item.roles.includes(userRole)
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-card border-r border-border p-6 shadow-xl animate-in slide-in-from-left duration-300">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold font-mono">W</span>
            </div>
            <span className="font-bold tracking-tight text-xl">WEYTIN</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="size-5" />
          </Button>
        </div>

        <nav className="space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium transition-colors',
                  isActive 
                    ? 'bg-secondary text-foreground' 
                    : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                )}
              >
                <item.icon className="size-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-6 right-6 pt-6 border-t border-border/50">
          <div className="mb-6">
            <div className="flex items-center gap-2 px-3 py-2 rounded bg-muted/50 border border-border/50">
              <div className="size-2 rounded-full bg-supply" />
              <span className="text-xs font-mono uppercase text-muted-foreground">
                Role: {userRole}
              </span>
            </div>
          </div>
          <Link
            href="/settings"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors"
          >
            <Settings className="size-4" />
            Settings
          </Link>
        </div>
      </div>
    </div>
  );
}
