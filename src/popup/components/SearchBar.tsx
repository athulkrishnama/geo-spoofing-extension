import React, { useState, useRef, useEffect } from 'react';
import { Search, Loader2, X } from 'lucide-react';
import { useGeocoding } from '../../hooks/useGeocoding';
import type { NominatimResult } from '../../types';

interface SearchBarProps {
  onSelect: (lat: number, lng: number, address: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSelect }) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const { results, isSearching, search, clearResults } = useGeocoding();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    search(query);
  }, [query, search]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
        clearResults();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [clearResults]);

  const handleSelect = (result: NominatimResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const address = result.display_name.split(',').slice(0, 3).join(',').trim();
    onSelect(lat, lng, address);
    setQuery(address);
    clearResults();
    setIsFocused(false);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    setQuery('');
    clearResults();
    inputRef.current?.focus();
  };

  const showDropdown = isFocused && (results.length > 0 || (isSearching && query.length > 1));

  return (
    <div ref={containerRef} className="relative px-3 py-2" style={{ zIndex: 1000 }}>
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-200 bg-slate-50 ${
          isFocused
            ? 'border-green-400 ring-2 ring-green-100 bg-white'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        {isSearching ? (
          <Loader2 size={15} className="text-green-500 shrink-0 animate-spin" />
        ) : (
          <Search size={15} className="text-slate-400 shrink-0" />
        )}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Search city, address or coordinates..."
          className="flex-1 bg-transparent outline-none text-[13px] text-slate-700 placeholder-slate-400"
        />
        {query && (
          <button onClick={handleClear} className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={13} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          className="absolute left-3 right-3 top-full mt-1 bg-white border border-slate-200 rounded-xl overflow-hidden"
          style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
        >
          {results.length === 0 && isSearching ? (
            <div className="py-3 px-4 text-[12px] text-slate-400 text-center">Searching...</div>
          ) : (
            results.map((result, i) => (
              <button
                key={result.place_id || i}
                onClick={() => handleSelect(result)}
                className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
              >
                <div className="text-[12px] font-medium text-slate-700 truncate">
                  {result.display_name.split(',')[0]}
                </div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">
                  {result.display_name.split(',').slice(1, 3).join(',')}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};
