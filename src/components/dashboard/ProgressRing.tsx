'use client';

import React from 'react';

const RADIUS = 52;
const CIRC = 2 * Math.PI * RADIUS;

export const ProgressRing = ({
  value,
  size = 160,
  label = 'Progreso',
}: {
  value: number; // 0..100
  size?: number;
  label?: string;
}) => {
  const clamped = Math.min(100, Math.max(0, value));
  const dash = (clamped / 100) * CIRC;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox="0 0 120 120" className="-rotate-90">
        <circle
          cx="60"
          cy="60"
          r={RADIUS}
          fill="none"
          stroke="rgba(0,0,0,0.06)"
          strokeWidth="10"
        />
        <circle
          cx="60"
          cy="60"
          r={RADIUS}
          fill="none"
          stroke="url(#ring-grad)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${CIRC}`}
        />
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#007AFF" />
            <stop offset="1" stopColor="#34C759" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <div className="text-3xl font-bold text-apple-text">
          {clamped.toFixed(0)}%
        </div>
        <div className="text-[10px] uppercase tracking-wide text-apple-secondary">
          {label}
        </div>
      </div>
    </div>
  );
};
