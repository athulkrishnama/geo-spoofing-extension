import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { Plus, BookmarkX } from 'lucide-react';
import { LocationCard } from './LocationCard';
import type { SavedLocation } from '../../types';

interface SavedLocationsListProps {
  locations: SavedLocation[];
  selectedId: string | null;
  onSelect: (location: SavedLocation) => void;
  onDelete: (id: string) => void;
  onSaveCurrent: () => void;
}

export const SavedLocationsList: React.FC<SavedLocationsListProps> = ({
  locations,
  selectedId,
  onSelect,
  onDelete,
  onSaveCurrent,
}) => {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-2.5 pt-2 pb-1.5">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Saved Locations
        </span>
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto px-2 min-h-0">
        {locations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-6 text-center px-2">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center mb-2">
              <BookmarkX size={18} className="text-slate-300" />
            </div>
            <p className="text-[11px] font-medium text-slate-400 leading-tight">No saved locations</p>
            <p className="text-[10px] text-slate-300 mt-0.5 leading-tight">
              Save your first location below
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {locations.map((loc) => (
              <LocationCard
                key={loc.id}
                location={loc}
                isSelected={selectedId === loc.id}
                onSelect={onSelect}
                onDelete={onDelete}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Save button */}
      <div className="p-2 border-t border-slate-100 mt-auto">
        <button
          onClick={onSaveCurrent}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12px] font-medium text-green-600 hover:bg-green-50 transition-colors duration-200 border border-dashed border-green-200 hover:border-green-300"
        >
          <Plus size={13} />
          Save Current Location
        </button>
      </div>
    </div>
  );
};
