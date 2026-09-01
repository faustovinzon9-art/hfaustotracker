'use client';

import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { CORE_METRICS, formatEtaDate } from '@/lib/calculations';
import type { EtaResult } from '@/lib/calculations';

export const EtaCard = ({
  eta,
  goalWeight,
  hasHistory,
}: {
  eta: EtaResult | null;
  goalWeight: number;
  hasHistory: boolean;
}) => {
  if (!hasHistory) {
    return (
      <GlassCard className="p-5">
        <div className="text-apple-secondary text-xs font-semibold uppercase">
          📅 Fecha estimada
        </div>
        <p className="text-sm text-apple-text mt-1">
          Subí al menos <b>2 reportes</b> para que el Sargento estime cuándo llegarías a{' '}
          {goalWeight} kg.
        </p>
      </GlassCard>
    );
  }

  if (!eta) {
    return (
      <GlassCard className="p-5">
        <div className="text-apple-secondary text-xs font-semibold uppercase">
          📅 Fecha estimada
        </div>
        <p className="text-sm text-apple-text mt-1">
          Necesito que el peso esté <b>bajando</b> para proyectar la fecha. Todavía no hay
          tendencia clara.
        </p>
      </GlassCard>
    );
  }

  const lim = CORE_METRICS.find((c) => c.key === eta.limitingMetricKey);

  return (
    <GlassCard className="p-5">
      <div className="text-apple-secondary text-xs font-semibold uppercase">
        📅 Fecha estimada
      </div>
      <div className="text-3xl font-bold text-apple-text mt-1">
        {formatEtaDate(eta.etaDate)}
      </div>
      <div className="text-xs text-apple-secondary mt-1">
        Ritmo <b>{eta.trendKgPerWeek.toFixed(2)} kg/semana</b> · faltan{' '}
        <b>{eta.remainingKg.toFixed(1)} kg</b> ·{' '}
        {eta.daysRemaining > 30
          ? `≈ ${Math.round(eta.daysRemaining / 30)} meses`
          : `≈ ${eta.daysRemaining} días`}
      </div>
      {lim && eta.limitingProgress != null && (
        <div className="text-xs text-apple-warning mt-2 font-semibold">
          ⚠️ Tu parámetro más lento hoy: <b>{lim.label}</b> ({eta.limitingProgress}%).
        </div>
      )}
    </GlassCard>
  );
};
