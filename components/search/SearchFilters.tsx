'use client';

import React, { useState, useEffect } from 'react';
import { Filter } from 'lucide-react';
import { useSearchStore } from '@/store/search.store';
import { Category } from '@/types/product.types';
import { cn } from '@/lib/utils/cn';

export function SearchFilters() {
  const { categoryId, setCategory } = useSearchStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = (await response.json()) as Category[];
        setCategories(data);
      }
      setIsLoading(false);
    }
    fetchCategories();
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-xs font-data text-muted-foreground uppercase tracking-widest mb-1">
        <Filter className="size-3" />
        <span>Categories</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategory(null)}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-full border transition-all",
            categoryId === null
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
          )}
        >
          All Categories
        </button>
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-7 w-20 bg-muted animate-pulse rounded-full" />
          ))
        ) : (
          categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-full border transition-all",
                categoryId === cat.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
              )}
            >
              {cat.name}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
