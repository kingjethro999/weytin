'use client';

import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { useSearchStore } from '@/store/search.store';
import { cn } from '@/lib/utils/cn';

interface LocationOption {
  id: string;
  name: string;
  state: string;
}

export function LocationSelector() {
  const { locationId, setLocation } = useSearchStore();
  const [locations, setLocations] = useState<LocationOption[]>([]);

  useEffect(() => {
    async function fetchLocations() {
      const response = await fetch('/api/locations?limit=6');
      if (!response.ok) return;
      const data = (await response.json()) as LocationOption[];
      setLocations(data);
    }
    fetchLocations();
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-xs font-data text-muted-foreground uppercase tracking-widest mb-1">
        <MapPin className="size-3" />
        <span>Location Filter</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
        <button
          onClick={() => setLocation(null)}
          className={cn(
            "px-3 py-2 text-xs font-medium rounded-md border transition-all text-left",
            locationId === null
              ? "bg-primary/10 border-primary text-primary"
              : "bg-card border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
          )}
        >
          All Locations
        </button>
        {locations.map((loc) => (
          <button
            key={loc.id}
            onClick={() => setLocation(loc.id)}
            className={cn(
              "px-3 py-2 text-xs font-medium rounded-md border transition-all text-left",
              locationId === loc.id
                ? "bg-primary/10 border-primary text-primary"
                : "bg-card border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
            )}
          >
            <div className="font-semibold">{loc.name}</div>
            <div className="text-[10px] opacity-70">{loc.state}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
