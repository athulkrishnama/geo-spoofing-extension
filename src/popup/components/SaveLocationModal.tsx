import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Bookmark } from 'lucide-react';

interface SaveLocationModalProps {
  isOpen: boolean;
  address: string;
  lat: number;
  lng: number;
  onSave: (name: string) => void;
  onCancel: () => void;
}

export const SaveLocationModal: React.FC<SaveLocationModalProps> = ({
  isOpen,
  address,
  lat,
  lng,
  onSave,
  onCancel,
}) => {
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName(address.split(',')[0] || '');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, address]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim());
      setName('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onCancel();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onCancel}
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px]"
            style={{ zIndex: 2000 }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="absolute inset-x-4 top-1/2 -translate-y-1/2 bg-white rounded-2xl p-5"
            style={{ zIndex: 2001, boxShadow: '0 24px 48px rgba(0,0,0,0.18)' }}
            onKeyDown={handleKeyDown}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center">
                  <Bookmark size={15} className="text-green-600" />
                </div>
                <h2 className="text-[14px] font-semibold text-slate-800">Save Location</h2>
              </div>
              <button
                onClick={onCancel}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* Location preview */}
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 mb-4">
              <MapPin size={13} className="text-green-500 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <div className="text-[11px] text-slate-500 truncate">{address}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 tabular-nums">
                  {lat.toFixed(6)}, {lng.toFixed(6)}
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Location Name
              </label>
              <input
                ref={inputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Home, Office, Coffee Shop..."
                required
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-[13px] text-slate-700 placeholder-slate-300 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all duration-200 bg-white"
              />

              {/* Buttons */}
              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 py-2.5 rounded-xl text-[13px] font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: name.trim()
                      ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
                      : '#94a3b8',
                    boxShadow: name.trim() ? '0 4px 12px rgba(22,163,74,0.3)' : 'none',
                  }}
                >
                  Save
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
