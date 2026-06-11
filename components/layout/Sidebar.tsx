'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { 
  LayoutDashboard, 
  Search, 
  Package, 
  Store, 
  ShieldAlert, 
  Settings,
  BarChart3,
  Users,
  Flag,
  Boxes,
  LogOut
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuthStore, UserRole } from '@/store/auth.store';

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  // User links
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard, roles: ['user', 'vendor', 'admin'] },
  { name: 'Search', href: '/search', icon: Search, roles: ['user', 'vendor', 'admin'] },
  
  // Vendor links
  { name: 'My Listings', href: '/vendor/listings', icon: Package, roles: ['vendor', 'admin'] },
  { name: 'Submit Supply', href: '/vendor/submit', icon: Store, roles: ['vendor', 'admin'] },
  
  // Admin links
  { name: 'Admin Dashboard', href: '/admin', icon: BarChart3, roles: ['admin'] },
  { name: 'Manage Products', href: '/admin/products', icon: Boxes, roles: ['admin'] },
  { name: 'Manage Vendors', href: '/admin/vendors', icon: ShieldAlert, roles: ['admin'] },
  { name: 'Manage Users', href: '/admin/users', icon: Users, roles: ['admin'] },
  { name: 'Flags & Reports', href: '/admin/flags', icon: Flag, roles: ['admin'] },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const userRole = user?.role || 'user';

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        logout();
        router.push('/login');
        router.refresh();
      }
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const filteredNavItems = navItems.filter((item) => 
    item.roles.includes(userRole)
  );

  return (
    <aside className="hidden lg:flex flex-col w-72 h-screen sticky top-0 border-r border-border/70 bg-card">
      <div className="p-6 border-b border-border/60">
        <Link href="/" className="flex items-center gap-2">
          <div className="size-8 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold font-data">W</span>
          </div>
          <div>
            <span className="font-semibold tracking-tight text-base">WEYTIN</span>
            <p className="text-[10px] font-data uppercase tracking-wider text-muted-foreground">Market Monitor</p>
          </div>
        </Link>
      </div>
      
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors',
                isActive 
                  ? 'bg-secondary text-foreground font-medium' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="size-4 shrink-0" aria-hidden="true" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-border/60">
        <div className="mb-4 px-2">
          <div className="flex items-center justify-between px-3 py-2 rounded-md bg-muted/60">
            <span className="text-[10px] font-data uppercase tracking-wider text-muted-foreground">
              Account Type
            </span>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-data uppercase tracking-wider text-foreground">
              <span className="size-1.5 rounded-full bg-supply" />
              {userRole === 'admin' ? 'Admin' : userRole === 'vendor' ? 'Seller' : 'Buyer'}
            </span>
          </div>
        </div>
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Settings className="size-4" aria-hidden="true" />
          Settings
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors mt-1"
        >
          <LogOut className="size-4" aria-hidden="true" />
          Log Out
        </button>
      </div>
    </aside>
  );
}
