'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { Habit, HabitLog, MeasurementRecord, Profile } from '@/lib/types/models';

function fmt(v: number, d = 1) {
  return v.toLocaleString('es-AR', { maximumFractionDigits: d });
}

export const Wrapped = ({
  profile,
  measurements,
  habits,
  habitLogs,
}: {
  profile: Profile;
  measurements: MeasurementRecord[];
  habits: Habit[];
  habitLogs: HabitLog[];
}) => {
  const [open, setOpen] = useState(false);

  const stats = useMemo(() => {
    const sorted = [...measurements].sort(
      (a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime()
    );
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    if (!first || !last) return null;
    const weightChange = last.weight - first.weight;
    const fatChange = last.body_fat_percentage - first.body_fat_percentage;
    const visceralChange = last.visceral_fat_rating - first.visceral_fat_rating;
    const lowest = Math.min(...sorted.map((m) => m.weight));
    return {
      count: sorted.length,
      weightChange,
      fatChange,
      visceralChange,
      lowest,
      duration: Math.max(1, Math.round((new Date(last.measured_at).getTime() - new Date(first.measured_at).getTime()) / 86400000)),
    };
  }, [measurements]);

  // habit totals (last 30 days)
  const habitTotals = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const map = new Map<string, number>();
    for (const log of habitLogs) {
      if (log.done && new Date(log.log_date) >= cutoff) {
        map.set(log.habit_id, (map.get(log.habit_id) || 0) + 1);
      }
    }
    return habits
      .map((h) => ({ name: h.name, icon: h.icon, days: map.get(h.id) || 0 }))
      .filter((h) => h.days > 0)
      .sort((a, b) => b.days - a.days)
      .slice(0, 3);
  }, [habits, habitLogs]);

  if (!stats || stats.count === 0) return null;

  const phrase = stats.weightChange < -2
    ? `¡SOLDADO! Bajaste ${fmt(Math.abs(stats.weightChange))} kg. Esto no es casualidad, es disciplina.`
    : stats.weightChange < 0
    ? `Vas bajando (${fmt(Math.abs(stats.weightChange))} kg). El camino es largo pero estás en él.`
    : `El peso subió ${fmt(stats.weightChange)} kg... ¡¿me estás cargando?! Volvé al plan YA.`;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-apple p-0 overflow-hidden text-left active:opacity-90"
        style={{ background: 'linear-gradient(135deg,#D32F2F,#7A0E0E)' }}
      >
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <h3 className="font-bold text-white">✨ Tu Wrapped</h3>
            <p className="text-xs text-white/70">El resumen anual/mensual de tu año.</p>
          </div>
          <span className="text-2xl text-white">→</span>
        </div>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] overflow-y-auto"
          style={{ background: 'linear-gradient(160deg,#1a0000 0%,#000000 60%)' }}
          onClick={() => setOpen(false)}
        >
          <button onClick={() => setOpen(false)} className="fixed top-4 right-4 z-10 rounded-full bg-white/10 px-4 py-2 text-white text-sm font-bold">
            Cerrar ✕
          </button>

          <div className="mx-auto max-w-md px-6 py-16 text-center text-white">
            <p className="text-sm uppercase tracking-[0.3em] text-white/60">HFausto Tracker</p>
            <h2 className="mt-2 text-4xl font-black">Tu Wrapped</h2>
            <p className="mt-1 text-white/60">Del año que pasó.</p>

            <div className="my-12">
              <p className="text-7xl font-black">{fmt(stats.count)}</p>
              <p className="mt-1 text-white/60">mediciones registradas</p>
            </div>

            <div className="space-y-4">
              <StatBig label="Cambio de peso" value={`${stats.weightChange > 0 ? '+' : ''}${fmt(stats.weightChange)} kg`} color="#34C759" />
              <StatBig label="Grasa corporal" value={`${stats.fatChange > 0 ? '+' : ''}${fmt(stats.fatChange)}%`} color="#FF9500" />
              <StatBig label="Grasa visceral" value={`${stats.visceralChange > 0 ? '+' : ''}${fmt(stats.visceralChange)}`} color="#FF3B30" />
              <StatBig label="Peso más bajo" value={`${fmt(stats.lowest)} kg`} color="#007AFF" />
              <StatBig label="Días" value={`${stats.duration} días`} color="#AF52DE" />
            </div>

            {habitTotals.length > 0 && (
              <div className="my-10">
                <p className="text-sm uppercase tracking-widest text-white/60 mb-3">Tus hábitos (últimos 30 días)</p>
                <div className="space-y-2">
                  {habitTotals.map((h) => (
                    <div key={h.name} className="flex items-center justify-between rounded-full bg-white/10 px-4 py-2">
                      <span>{h.icon} {h.name}</span>
                      <span className="font-bold">{h.days} días</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-3xl bg-white/5 p-6 my-8">
              <p className="text-lg font-bold italic">“{phrase}”</p>
              <p className="mt-3 text-white/50">— El Sargento</p>
            </div>

            <p className="text-4xl">💪</p>
            <p className="mt-1 text-sm text-white/60">Nos vemos en el próximo Wrapped, soldado.</p>
          </div>
        </div>
      )}
    </>
  );
};

function StatBig({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-2xl bg-white/5 p-4">
      <p className="text-xs uppercase tracking-widest text-white/60">{label}</p>
      <p className="text-3xl font-black" style={{ color }}>{value}</p>
    </div>
  );
}
