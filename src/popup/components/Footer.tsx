import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation } from 'lucide-react';

interface FooterProps {
  isActive: boolean;
  address: string;
  lat: number | null;
  lng: number | null;
}

export const Footer: React.FC<FooterProps> = ({ isActive, address, lat, lng }) => {
  return (
    <div className="flex items-center gap-2 px-4 py-2 border-t border-slate-100 bg-slate-50/50">
      <div
        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-300 ${
          isActive ? 'bg-green-100' : 'bg-slate-100'
        }`}
      >
        <AnimatePresence mode="wait">
          {isActive ? (
            <motion.div
              key="active"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <Navigation size={12} className="text-green-600" />
            </motion.div>
          ) : (
            <motion.div
              key="inactive"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MapPin size={12} className="text-slate-400" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider leading-tight">
          {isActive ? 'Spoofed Location' : 'Selected Location'}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={isActive ? 'active-loc' : 'inactive-loc'}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className={`text-[12px] font-medium truncate leading-tight ${
              isActive ? 'text-green-700' : 'text-slate-600'
            }`}
          >
            {lat !== null ? address || `${lat?.toFixed(4)}, ${lng?.toFixed(4)}` : 'No location selected'}
          </motion.div>
        </AnimatePresence>
      </div>

      {isActive && lat !== null && (
        <div className="shrink-0">
          <div
            className="px-1.5 py-0.5 rounded-md text-[9px] font-bold"
            style={{ background: '#dcfce7', color: '#15803d' }}
          >
            LIVE
          </div>
        </div>
      )}
    </div>
  );
};
