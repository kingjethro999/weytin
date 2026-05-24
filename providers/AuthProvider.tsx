'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { logger } from '@/lib/utils/logger';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);

  useEffect(() => {
    logger.debug('[Auth] Fetching session profile on mount');

    async function checkSession() {
      setLoading(true);
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setUser(data.user);
            logger.info('[Auth] Profile loaded', { role: data.user.role });
          } else {
            setUser(null);
            logger.info('[Auth] No active session found');
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        logger.error('[Auth] Initial session check failed', { err });
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    void checkSession();
  }, [setLoading, setUser]);

  return <>{children}</>;
}
