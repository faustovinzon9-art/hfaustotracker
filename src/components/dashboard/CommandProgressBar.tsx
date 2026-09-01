import React from 'react';

interface CommandProgressBarProps {
  currentValue: number;
  targetValue: number;
  startValue: number;
  label: string;
  unit: string;
}

export const CommandProgressBar: React.FC<CommandProgressBarProps> = ({
  currentValue,
  targetValue,
  startValue,
  label,
  unit,
}) => {
  // Calculate progress percentage
  const totalDiff = Math.abs(startValue - targetValue);
  const currentDiff = Math.abs(startValue - currentValue);
  const progress = Math.min(Math.max((currentDiff / totalDiff) * 100, 0), 100);

  const remaining = Math.abs(currentValue - targetValue).toFixed(1);

  return (
    <div className="w-full space-y-3">
      <div className="flex justify-between items-end">
        <div>
          <span className="text-apple-secondary text-xs font-semibold uppercase tracking-wide">{label}</span>
          <div className="text-3xl font-bold text-apple-text">{currentValue} {unit}</div>
        </div>
        <div className="text-right">
          <span className="text-apple-secondary text-xs font-semibold uppercase tracking-wide">Remaining</span>
          <div className="text-xl font-bold text-apple-sargent">-{remaining} {unit}</div>
        </div>
      </div>

      <div className="relative h-4 w-full bg-gray-200 rounded-full overflow-hidden shadow-inner">
        <div
          className="absolute top-0 left-0 h-full transition-all duration-1000 ease-out bg-gradient-to-r from-apple-accent via-apple-success to-green-400"
          style={{ width: `${progress}%` }}
        />
        {/* Glossy overlay for Apple look */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-white/40" />
      </div>

      <div className="flex justify-between text-[10px] font-bold text-apple-secondary uppercase">
        <span>Start: {startValue} {unit}</span>
        <span className="text-apple-accent">{progress.toFixed(1)}% Complete</span>
        <span>Goal: {targetValue} {unit}</span>
      </div>
    </div>
  );
};
