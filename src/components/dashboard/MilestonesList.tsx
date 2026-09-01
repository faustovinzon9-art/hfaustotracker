'use client';

import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import type { Milestone } from '@/lib/types/models';

export const MilestonesList = ({ milestones }: { milestones: Milestone[] }) => {
  return (
    <div className="space-y-2">
      {milestones.map((m, i) => (
        <GlassCard
          key={m.id}
          className={`p-3 flex items-center gap-3 ${
            m.achieved ? 'bg-apple-success/10 border-apple-success/30' : ''
          }`}
        >
          <div
            className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 ${
              m.achieved
                ? 'bg-apple-success text-white'
                : 'bg-apple-bg text-apple-secondary'
            }`}
          >
            {m.achieved ? '✓' : i + 1}
          </div>
          <div className="flex-1">
            <div
              className={`font-bold ${
                m.achieved ? 'text-apple-success line-through' : 'text-apple-text'
              }`}
            >
              {m.label}
            </div>
            <div className="text-[10px] text-apple-secondary">
              {m.achieved
                ? `Logrado el ${new Date(m.achieved_at!).toLocaleDateString('es-AR', {
                    day: '2-digit',
                    month: 'short',
                  })}`
                : 'Pendiente'}
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
};
