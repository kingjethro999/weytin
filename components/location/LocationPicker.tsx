'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Search, ChevronRight, ArrowLeft, Check, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils/cn';

interface DbLocation {
  id: string;
  name: string;
  state: string;
  lga?: string | null;
}

interface LocationPickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  className?: string;
}

export function LocationPicker({
  value,
  onChange,
  placeholder = 'Select location...',
  disabled,
  required,
  name,
  id,
  className,
}: LocationPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [locations, setLocations] = useState<DbLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Picker modal wizard steps
  const [step, setStep] = useState<1 | 2>(1); // 1 = State selection, 2 = LGA selection
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [stateSearch, setStateSearch] = useState('');
  const [lgaSearch, setLgaSearch] = useState('');

  // Fetch all database locations for ultra-fast, zero-latency local querying and UX
  useEffect(() => {
    if (!isOpen || locations.length > 0) return;
    setIsLoading(true);
    setError(null);

    fetch('/api/locations?limit=1000')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load locations');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setLocations(data);
        } else {
          throw new Error('Invalid locations format');
        }
      })
      .catch((err) => {
        console.error('Error fetching locations:', err);
        setError('Could not load locations. Please try again.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isOpen, locations.length]);

  // Find currently selected location details
  const selectedLocation = locations.find((loc) => loc.id === value);

  // Group unique states from DB locations to avoid display discrepancies
  const uniqueStates = React.useMemo(() => {
    const statesSet = new Set(locations.map((loc) => loc.state));
    return Array.from(statesSet).sort();
  }, [locations]);

  // Filter states based on search input
  const filteredStates = uniqueStates.filter((st) =>
    st.toLowerCase().includes(stateSearch.toLowerCase())
  );

  // Filter LGAs of the selected state
  const availableLgas = React.useMemo(() => {
    if (!selectedState) return [];
    return locations
      .filter((loc) => loc.state.toLowerCase() === selectedState.toLowerCase())
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [locations, selectedState]);

  // Filter LGAs based on search input
  const filteredLgas = availableLgas.filter((lga) =>
    lga.name.toLowerCase().includes(lgaSearch.toLowerCase())
  );

  const handleStateSelect = (state: string) => {
    setSelectedState(state);
    setStep(2);
    setLgaSearch('');
  };

  const handleLgaSelect = (lga: DbLocation) => {
    onChange(lga.id);
    setIsOpen(false);
    // Reset wizard
    setStep(1);
    setSelectedState(null);
    setStateSearch('');
    setLgaSearch('');
  };

  const handleBack = () => {
    setStep(1);
    setSelectedState(null);
    setLgaSearch('');
  };

  return (
    <div className={cn('relative w-full', className)}>
      {name && <input type="hidden" name={name} value={value || ''} required={required} />}
      
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => setIsOpen(true)}
        className={cn(
          'flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm',
          'text-left transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          'disabled:cursor-not-allowed disabled:opacity-50',
          !selectedLocation && 'text-muted-foreground'
        )}
      >
        <span className="flex items-center gap-2 truncate">
          <MapPin className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate">
            {selectedLocation
              ? `${selectedLocation.name}, ${selectedLocation.state}`
              : placeholder}
          </span>
        </span>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          // Don't fully reset selection but reset wizard state
          setStep(1);
          setSelectedState(null);
          setStateSearch('');
          setLgaSearch('');
        }}
        title={step === 1 ? 'Select State' : `Select LGA / Region`}
        description={
          step === 1
            ? 'Choose a state in Nigeria to view its regions'
            : `Choose a local government area in ${selectedState}`
        }
        className="max-w-md"
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="size-8 animate-spin text-primary mb-4" />
            <p className="text-sm font-medium">Loading Nigerian locations database...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-destructive space-y-4">
            <p className="text-sm font-medium">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setLocations([]);
                // Trigger refetch by toggling open
                setIsOpen(false);
                setTimeout(() => setIsOpen(true), 50);
              }}
            >
              Try Again
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Step 1: Select State */}
            {step === 1 && (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search 36 states & FCT..."
                    value={stateSearch}
                    onChange={(e) => setStateSearch(e.target.value)}
                    className="pl-9"
                    autoFocus
                  />
                </div>

                <div className="max-h-64 overflow-y-auto pr-1 space-y-1 custom-scrollbar">
                  {filteredStates.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No states found matching &quot;{stateSearch}&quot;
                    </p>
                  ) : (
                    filteredStates.map((st) => {
                      const isSelectedState = selectedLocation?.state.toLowerCase() === st.toLowerCase();
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => handleStateSelect(st)}
                          className={cn(
                            'w-full flex items-center justify-between px-3 py-2 rounded-md text-sm text-left transition-colors',
                            'hover:bg-accent hover:text-accent-foreground',
                            isSelectedState && 'bg-primary/10 text-primary font-medium'
                          )}
                        >
                          <span>{st} State</span>
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            {locations.filter((loc) => loc.state === st).length} LGAs
                            <ChevronRight className="size-3.5" />
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Select LGA */}
            {step === 2 && selectedState && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleBack}
                    className="h-8 px-2 text-xs gap-1 -ml-2 text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="size-3.5" /> Back to States
                  </Button>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder={`Search LGAs in ${selectedState}...`}
                    value={lgaSearch}
                    onChange={(e) => setLgaSearch(e.target.value)}
                    className="pl-9"
                    autoFocus
                  />
                </div>

                <div className="max-h-64 overflow-y-auto pr-1 space-y-1 custom-scrollbar">
                  {filteredLgas.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No LGAs found matching &quot;{lgaSearch}&quot; in {selectedState}
                    </p>
                  ) : (
                    filteredLgas.map((lga) => {
                      const isSelected = value === lga.id;
                      return (
                        <button
                          key={lga.id}
                          type="button"
                          onClick={() => handleLgaSelect(lga)}
                          className={cn(
                            'w-full flex items-center justify-between px-3 py-2 rounded-md text-sm text-left transition-colors',
                            'hover:bg-accent hover:text-accent-foreground',
                            isSelected && 'bg-primary/10 text-primary font-medium'
                          )}
                        >
                          <span>{lga.name}</span>
                          {isSelected && <Check className="size-4 text-primary" />}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
