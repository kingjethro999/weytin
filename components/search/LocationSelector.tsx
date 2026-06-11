'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { useSearchStore } from '@/store/search.store';
import { cn } from '@/lib/utils/cn';
import { LocationPicker } from '@/components/location/LocationPicker';

interface LocationOption {
  id: string;
  name: string;
  state: string;
}

export function LocationSelector() {
  const { locationId, setLocation } = useSearchStore();
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [isOpen, setIsOpen] = useState(true); // collapsible state

  useEffect(() => {
    async function fetchLocations() {
      const response = await fetch('/api/locations?limit=5');
      if (!response.ok) return;
      const data = (await response.json()) as LocationOption[];
      setLocations(data);
    }
    fetchLocations();
  }, []);

  // Determine if the selected location is in the quick list
  const isSelectedInQuickList =
    locationId === null || locations.some((loc) => loc.id === locationId);

  return (
    <div className="flex flex-col gap-2">
      {/* Collapsible header */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center justify-between text-xs font-data text-muted-foreground uppercase tracking-widest mb-1 w-full hover:text-foreground transition-colors"
        aria-expanded={isOpen}
        aria-controls="location-filter-body"
      >
        <span className="flex items-center gap-2">
          <MapPin className="size-3" aria-hidden="true" />
          <span>Location Filter</span>
          {locationId && (
            <span className="size-1.5 rounded-full bg-primary inline-block" title="Filter active" />
          )}
        </span>
        <span className="flex items-center gap-1.5 text-muted-foreground/60">
          <SlidersHorizontal className="size-3" aria-hidden="true" />
          <ChevronDown
            className={cn(
              'size-3 shrink-0 transition-transform duration-200',
              isOpen && 'rotate-180',
            )}
            aria-hidden="true"
          />
        </span>
      </button>

      {/* Collapsible body */}
      {isOpen && (
        <div
          id="location-filter-body"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 animate-in fade-in-0 slide-in-from-top-1 duration-150"
        >
          <button
            onClick={() => setLocation(null)}
            className={cn(
              'px-3 py-2 text-xs font-medium rounded-md border transition-all text-left',
              locationId === null
                ? 'bg-primary/10 border-primary text-primary'
                : 'bg-card border-border/60 text-muted-foreground hover:border-border hover:text-foreground',
            )}
          >
            All Locations
          </button>

          {locations.map((loc) => (
            <button
              key={loc.id}
              onClick={() => setLocation(loc.id)}
              className={cn(
                'px-3 py-2 text-xs font-medium rounded-md border transition-all text-left',
                locationId === loc.id
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-card border-border/60 text-muted-foreground hover:border-border hover:text-foreground',
              )}
            >
              <div className="font-semibold">{loc.name}</div>
              <div className="text-[10px] opacity-70">{loc.state}</div>
            </button>
          ))}

          {/* Custom Location Picker */}
          <div className="mt-1 space-y-1 col-span-full">
            <div className="text-[10px] text-muted-foreground/75 px-1 font-medium">
              Custom Region / LGA
            </div>
            <LocationPicker
              value={locationId || ''}
              onChange={(val) => setLocation(val || null)}
              placeholder={
                !isSelectedInQuickList ? 'Custom Location Selected' : 'Select State & LGA…'
              }
              className="text-xs [&>button]:h-8"
            />
          </div>
        </div>
      )}
    </div>
  );
}
