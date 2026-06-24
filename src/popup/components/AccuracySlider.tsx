import React from 'react';
import { Gauge } from 'lucide-react';

interface AccuracySliderProps {
  value: number; // meters
  onChange: (value: number) => void;
}

const formatAccuracy = (v: number) => {
  if (v < 100) return `${v}m`;
  return `${(v / 1000).toFixed(1)}km`;
};

const getAccuracyLabel = (v: number) => {
  if (v <= 30) return { label: 'GPS', color: '#16a34a' };
  if (v <= 100) return { label: 'Fine', color: '#2563eb' };
  if (v <= 300) return { label: 'Network', color: '#d97706' };
  return { label: 'Cell', color: '#dc2626' };
};

export const AccuracySlider: React.FC<AccuracySliderProps> = ({ value, onChange }) => {
  const { label, color } = getAccuracyLabel(value);
  // Map linear slider (0-100) to accuracy (10-1000m) log scale
  const sliderValue = Math.round(((Math.log(value) - Math.log(10)) / (Math.log(1000) - Math.log(10))) * 100);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pct = parseFloat(e.target.value) / 100;
    const accuracy = Math.round(Math.exp(Math.log(10) + pct * (Math.log(1000) - Math.log(10))));
    onChange(accuracy);
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 border-t border-slate-100 bg-slate-50/50">
      <Gauge size={13} className="text-slate-400 shrink-0" />
      <span className="text-[10px] font-medium text-slate-500 shrink-0">Accuracy</span>
      <div className="flex-1 relative">
        <input
          type="range"
          min={0}
          max={100}
          value={sliderValue}
          onChange={handleChange}
          className="w-full h-1 rounded-full cursor-pointer appearance-none"
          style={{
            background: `linear-gradient(to right, ${color} 0%, ${color} ${sliderValue}%, #e2e8f0 ${sliderValue}%, #e2e8f0 100%)`,
          }}
        />
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-[10px] font-semibold tabular-nums text-slate-700">{formatAccuracy(value)}</span>
        <span
          className="text-[9px] font-bold px-1 py-0.5 rounded-md"
          style={{ background: `${color}18`, color }}
        >
          {label}
        </span>
      </div>
    </div>
  );
};
