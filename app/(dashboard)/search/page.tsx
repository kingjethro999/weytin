import React from 'react';
import { SearchBar } from '@/components/search/SearchBar';
import { SearchResults } from '@/components/search/SearchResults';
import { LocationSelector } from '@/components/search/LocationSelector';
import { SearchFilters } from '@/components/search/SearchFilters';

export default function SearchPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="space-y-4">
        <div>
          <p className="text-[10px] font-data uppercase tracking-[0.2em] text-muted-foreground">Search & Insights</p>
          <h1 className="text-3xl font-semibold tracking-tight mt-1">Market Intelligence</h1>
          <p className="text-muted-foreground mt-1">
            Real-time supply and demand monitoring across Nigerian markets.
          </p>
        </div>
        
        <div className="pt-2">
          <SearchBar />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1 space-y-6">
          <div className="sticky top-20 space-y-4 rounded-lg border border-border/70 bg-card p-4">
            <LocationSelector />
            <div className="h-px bg-border/60" />
            <SearchFilters />
          </div>
        </aside>

        <main className="lg:col-span-3">
          <SearchResults />
        </main>
      </div>
    </div>
  );
}
