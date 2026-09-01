'use client';

import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';

export const SargentBanner = ({ message }: { message: string }) => {
  return (
    <GlassCard className="bg-apple-sargent/10 border-apple-sargent/25 border-l-4 border-l-apple-sargent">
      <div className="flex items-start gap-3">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-apple-sargent text-white animate-pulse shrink-0 mt-0.5">
          ⚡ SARGENTO
        </span>
        <p className="text-apple-sargent font-bold italic leading-relaxed">
          {message}
        </p>
      </div>
    </GlassCard>
  );
};
