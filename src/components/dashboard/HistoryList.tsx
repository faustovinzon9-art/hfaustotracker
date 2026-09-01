'use client';

import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import type { MeasurementRecord } from '@/lib/types/models';

export const HistoryList = ({
  measurements,
  onEdit,
  onDelete,
}: {
  measurements: MeasurementRecord[];
  onEdit: (m: MeasurementRecord) => void;
  onDelete: (id: string) => void;
}) => {
  const sorted = [...measurements].sort(
    (a, b) =>
      new Date(b.measured_at).getTime() - new Date(a.measured_at).getTime()
  );

  return (
    <div className="space-y-2">
      {sorted.map((m) => (
        <GlassCard key={m.id} className="p-3 flex items-center justify-between">
          <div className="flex gap-3 items-center min-w-0">
            {m.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={m.photo_url}
                alt="Reporte"
                className="w-10 h-10 rounded-apple object-cover shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-apple bg-apple-bg flex items-center justify-center text-apple-secondary shrink-0">
                —
              </div>
            )}
            <div className="min-w-0">
              <div className="font-bold text-apple-text">
                {m.weight} kg · {m.body_fat_percentage}% grasa
              </div>
              <div className="text-[10px] text-apple-secondary">
                {new Date(m.measured_at).toLocaleDateString('es-AR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </div>
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            <button
              onClick={() => onEdit(m)}
              className="text-apple-accent text-xs font-bold px-2 py-1"
            >
              Editar
            </button>
            <button
              onClick={() => onDelete(m.id)}
              className="text-apple-danger text-xs font-bold px-2 py-1"
            >
              Borrar
            </button>
          </div>
        </GlassCard>
      ))}
    </div>
  );
};
