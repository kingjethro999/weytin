'use client';

import { useState } from 'react';
import { logger } from '@/lib/utils/logger';

interface Location {
  id: string;
  name: string;
  state: string;
  lga: string;
  lat?: number;
  lng?: number;
}

export function useLocation() {
  const [location, setLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // In a real app, we would reverse geocode this via API
        logger.info('[Location] Detected coordinates', { 
          lat: position.coords.latitude, 
          lng: position.coords.longitude 
        });
        
        // Mocking a Nigerian location for now
        setLocation({
          id: 'lag-isl',
          name: 'Lagos Island',
          state: 'Lagos',
          lga: 'Lagos Island',
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setIsLoading(false);
      },
      (err) => {
        setError(err.message);
        setIsLoading(false);
        logger.warn('[Location] Geolocation failed', { error: err.message });
      }
    );
  };

  return { location, setLocation, detectLocation, isLoading, error };
}
