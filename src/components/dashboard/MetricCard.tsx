'use client';

import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import type { MetricProgress } from '@/lib/calculations';

export const MetricCard = ({ metric }: { metric: MetricProgress }) => {
  const pct = Math.round(metric.progress * 100);
  const current =
    metric.current != null
      ? `${metric.current.toFixed(metric.decimals)}${metric.unit}`
      : '—';
  const target = `${metric.target.toFixed(metric.decimals)}${metric.unit}`;
  const done = pct >= 100;

  return (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-apple-secondary text-[10px] font-semibold uppercase tracking-wide">
          {metric.label}
        </span>
        <span
          className={`text-[10px] font-bold ${
            done ? 'text-apple-success' : 'text-apple-accent'
          }`}
        >
          {done ? '✔ Meta' : `${pct}%`}
        </span>
      </div>
      <div className="text-2xl font-bold text-apple-text">{current}</div>
      <div className="text-[10px] text-apple-secondary mt-0.5">Meta: {target}</div>
      <div className="mt-3 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            done ? 'bg-apple-success' : 'bg-gradient-to-r from-apple-accent to-apple-success'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </GlassCard>
  );
};
