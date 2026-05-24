'use client';

import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useSearchStore } from '@/store/search.store';
import { useDebounce } from '@/hooks/useDebounce';

export function SearchBar() {
  const { query, setQuery } = useSearchStore();
  const [localQuery, setLocalQuery] = useState(query);
  const [trending, setTrending] = useState<string[]>([]);
  const debouncedQuery = useDebounce(localQuery, 300);

  useEffect(() => {
    async function fetchTrending() {
      const response = await fetch('/api/products?limit=5');
      if (!response.ok) return;
      const data = (await response.json()) as Array<{ name: string }>;
      setTrending(data.map((p) => p.name));
    }
    fetchTrending();
  }, []);

  useEffect(() => {
    setQuery(debouncedQuery);
  }, [debouncedQuery, setQuery]);

  const handleClear = () => {
    setLocalQuery('');
    setQuery('');
  };

  return (
    <div className="relative w-full max-w-3xl">
      <div className="relative group">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
          <SearchIcon className="size-4" />
        </div>
        <Input
          type="text"
          placeholder="Search products, categories, or locations..."
          className="pl-10 pr-10 h-11 bg-card border-border/70 focus:bg-background transition-all rounded-md"
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
        />
        {localQuery && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
      
      {trending.length > 0 && (
        <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          <span className="text-[10px] font-data text-muted-foreground uppercase tracking-wider">Trending:</span>
          {trending.map((tag) => (
            <button
              key={tag}
              onClick={() => setLocalQuery(tag)}
              className="px-2.5 py-1 text-[10px] rounded-full border border-border/60 bg-muted/60 hover:bg-secondary hover:text-secondary-foreground transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
