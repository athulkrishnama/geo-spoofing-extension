import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Trash2 } from 'lucide-react';
import type { SavedLocation } from '../../types';

interface LocationCardProps {
  location: SavedLocation;
  isSelected: boolean;
  onSelect: (location: SavedLocation) => void;
  onDelete: (id: string) => void;
}

export const LocationCard: React.FC<LocationCardProps> = ({
  location,
  isSelected,
  onSelect,
  onDelete,
}) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(location.id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, height: 0 }}
      transition={{ duration: 0.2 }}
      onClick={() => onSelect(location)}
      className={`group relative flex items-center gap-2 px-2.5 py-2 rounded-xl cursor-pointer transition-all duration-200 mb-1 ${
        isSelected
          ? 'bg-green-50 border border-green-200'
          : 'bg-transparent border border-transparent hover:bg-slate-50 hover:border-slate-200'
      }`}
    >
      {/* Icon */}
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-200 ${
          isSelected ? 'bg-green-100' : 'bg-slate-100 group-hover:bg-slate-200'
        }`}
      >
        <MapPin
          size={13}
          className={isSelected ? 'text-green-600' : 'text-slate-500'}
        />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className={`text-[12px] font-semibold truncate leading-tight ${
          isSelected ? 'text-green-800' : 'text-slate-700'
        }`}>
          {location.name}
        </div>
        <div className="text-[10px] text-slate-400 truncate mt-0.5 leading-tight">
          {location.address}
        </div>
      </div>

      {/* Delete button */}
      <button
        onClick={handleDelete}
        className="shrink-0 w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-150 hover:bg-red-50 text-slate-400 hover:text-red-500"
        aria-label="Delete location"
      >
        <Trash2 size={11} />
      </button>
    </motion.div>
  );
};
