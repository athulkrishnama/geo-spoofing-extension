import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Square, Loader2 } from 'lucide-react';

interface PrimaryButtonProps {
  isActive: boolean;
  isLoading?: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  isActive,
  isLoading = false,
  onClick,
  disabled = false,
}) => {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || isLoading}
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: disabled ? 1 : 1.01 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="relative flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[13px] font-semibold text-white transition-all duration-300 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        background: isActive
          ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
          : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
        boxShadow: isActive
          ? '0 6px 20px rgba(220,38,38,0.35)'
          : '0 6px 20px rgba(22,163,74,0.35)',
      }}
    >
      {/* Shine overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 60%)',
        }}
      />

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2"
          >
            <Loader2 size={16} className="animate-spin" />
            <span>Activating...</span>
          </motion.div>
        ) : isActive ? (
          <motion.div
            key="stop"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2"
          >
            <Square size={14} fill="white" />
            <span>Stop Spoofing</span>
          </motion.div>
        ) : (
          <motion.div
            key="start"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2"
          >
            <Play size={14} fill="white" />
            <span>Start Spoofing</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};
