import { useState, useCallback, useRef } from 'react';
import { searchLocations } from '../services/nominatim';
import type { NominatimResult } from '../types';

export function useGeocoding() {
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback((query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const found = await searchLocations(query);
        setResults(found);
      } finally {
        setIsSearching(false);
      }
    }, 400);
  }, []);

  const clearResults = useCallback(() => setResults([]), []);

  return { results, isSearching, search, clearResults };
}
