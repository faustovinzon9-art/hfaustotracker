import React from 'react';
import { SargentHeader } from '@/components/sargent/SargentHeader';
import { GlassCard } from '@/components/ui/GlassCard';
import { CommandProgressBar } from '@/components/dashboard/CommandProgressBar';
import { PDFUpload } from '@/components/dashboard/PDFUpload';

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-apple-bg pb-20">
      <SargentHeader />

      <div className="px-6 space-y-6">
        {/* Main Goal Section */}
        <GlassCard className="relative overflow-hidden">
          <CommandProgressBar
            label="Weight Loss Mission"
            startValue={100.2}
            currentValue={85.5}
            targetValue={75.0}
            unit="kg"
          />
        </GlassCard>

        {/* Upload Section */}
        <PDFUpload />

        {/* Grid for Other Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <GlassCard>
            <p className="text-apple-secondary text-xs font-semibold uppercase mb-1">Body Fat</p>
            <div className="text-2xl font-bold text-apple-text">24.5%</div>
            <div className="text-apple-success text-xs font-bold mt-1">↓ 1.2% this week</div>
          </GlassCard>
          <GlassCard>
            <p className="text-apple-secondary text-xs font-semibold uppercase mb-1">Muscle Mass</p>
            <div className="text-2xl font-bold text-apple-text">68.2 kg</div>
            <div className="text-apple-accent text-xs font-bold mt-1">↑ 0.5 kg this week</div>
          </GlassCard>
        </div>

        {/* Visceral Fat Warning - Sargent Mode implementation */}
        <GlassCard className="bg-apple-danger/10 border-apple-danger/30">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-apple-danger rounded-full text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732 3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-apple-danger font-bold uppercase text-sm">Visceral Fat Alert</h3>
              <p className="text-apple-text text-sm mt-1">
                Your rating is **HIGH**. This is an immediate threat to your heart. Stop eating junk and HIT THE TREADMILL NOW!
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </main>
  );
}
