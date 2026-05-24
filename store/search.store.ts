'use client';

import { create } from 'zustand';
import { ProductWithCategory } from '@/types/product.types';

interface SearchState {
  query: string;
  locationId: string | null;
  categoryId: string | null;
  results: ProductWithCategory[];
  isSearching: boolean;
  
  setQuery: (query: string) => void;
  setLocation: (id: string | null) => void;
  setCategory: (id: string | null) => void;
  setResults: (results: ProductWithCategory[]) => void;
  setIsSearching: (isSearching: boolean) => void;
  reset: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  locationId: null,
  categoryId: null,
  results: [],
  isSearching: false,

  setQuery: (query) => set({ query }),
  setLocation: (id) => set({ locationId: id }),
  setCategory: (id) => set({ categoryId: id }),
  setResults: (results) => set({ results }),
  setIsSearching: (isSearching) => set({ isSearching }),
  reset: () => set({ query: '', locationId: null, categoryId: null, results: [] }),
}));
