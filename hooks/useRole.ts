'use client';

import { useAuthStore } from '@/store/auth.store';

export function useRole() {
  const user = useAuthStore((state) => state.user);
  const role = user?.role || 'user';

  const isAdmin = role === 'admin';
  const isVendor = role === 'vendor' || role === 'admin';
  const isUser = role === 'user' || role === 'vendor' || role === 'admin';

  return {
    role,
    isAdmin,
    isVendor,
    isUser,
    isAuthenticated: !!user,
  };
}
