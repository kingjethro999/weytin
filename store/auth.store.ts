'use client';

import { create } from 'zustand';

export type UserRole = 'user' | 'vendor' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  business_name?: string;
  verification_status?: 'pending' | 'verified' | 'rejected';
  location_id?: string;
}

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  setUser: (user: UserProfile | null) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true, // Start as loading until auth state is determined
  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null, isLoading: false }),
}));
