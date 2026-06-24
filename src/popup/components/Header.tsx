import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin } from 'lucide-react';

interface HeaderProps {
  isActive: boolean;
  onToggle?: () => void; // Keeping prop for backwards compatibility but unused
}

export const Header: React.FC<HeaderProps> = ({ isActive }) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
      {/* Logo + Title */}
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
            boxShadow: '0 2px 8px rgba(22,163,74,0.3)',
          }}
        >
          <MapPin size={15} className="text-white" />
        </div>
        <div>
          <h1 className="text-[14px] font-semibold text-slate-800 leading-tight">GeoRoute</h1>
          <AnimatePresence mode="wait">
            <motion.p
              key={isActive ? 'active' : 'inactive'}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className={`text-[11px] font-medium leading-tight ${
                isActive ? 'text-green-600' : 'text-slate-400'
              }`}
            >
              {isActive ? '● Spoofing Active' : '○ Spoofing Disabled'}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
