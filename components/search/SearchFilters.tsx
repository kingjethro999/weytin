'use client';

import React, { useState } from 'react';
import { Filter, ChevronDown } from 'lucide-react';
import { useSearchStore } from '@/store/search.store';
import { Category } from '@/types/product.types';
import { cn } from '@/lib/utils/cn';
import { useEffect } from 'react';

export function SearchFilters() {
  const { categoryId, setCategory } = useSearchStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(true); // collapsible state

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
      {/* Collapsible header */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center justify-between text-xs font-data text-muted-foreground uppercase tracking-widest mb-1 w-full hover:text-foreground transition-colors group"
        aria-expanded={isOpen}
        aria-controls="category-filter-list"
      >
        <span className="flex items-center gap-2">
          <Filter className="size-3" aria-hidden="true" />
          <span>Categories</span>
          {categoryId && (
            <span className="size-1.5 rounded-full bg-primary inline-block" title="Filter active" />
          )}
        </span>
        <ChevronDown
          className={cn(
            'size-3 shrink-0 text-muted-foreground/60 transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>

      {/* Collapsible body */}
      {isOpen && (
        <div
          id="category-filter-list"
          className="flex flex-wrap gap-2 animate-in fade-in-0 slide-in-from-top-1 duration-150"
        >
          <button
            onClick={() => setCategory(null)}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-full border transition-all',
              categoryId === null
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card border-border/60 text-muted-foreground hover:border-border hover:text-foreground',
            )}
          >
            All
          </button>
          {isLoading
            ? [...Array(4)].map((_, i) => (
                <div key={i} className="h-7 w-20 bg-muted animate-pulse rounded-full" />
              ))
            : categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium rounded-full border transition-all',
                    categoryId === cat.id
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card border-border/60 text-muted-foreground hover:border-border hover:text-foreground',
                  )}
                >
                  {cat.name}
                </button>
              ))}
        </div>
      )}
    </div>
  );
}
