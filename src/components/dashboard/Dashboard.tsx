'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SargentHeader } from '@/components/sargent/SargentHeader';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ProgressRing } from './ProgressRing';
import { SargentBanner } from './SargentBanner';
import { MetricCard } from './MetricCard';
import { MilestonesList } from './MilestonesList';
import { EtaCard } from './EtaCard';
import { WeightChart } from './WeightChart';
import { HistoryList } from './HistoryList';
import { MeasurementForm } from './MeasurementForm';
import { CoachChat } from './CoachChat';
import { HabitTracker } from './HabitTracker';
import { WeeklyReportCard } from './WeeklyReportCard';
import { ProgressPhotos } from './ProgressPhotos';
import { ExportShare } from './ExportShare';
import { CustomAchievements } from './CustomAchievements';
import { Wrapped } from './Wrapped';
import {
  computeEta,
  computeOverallProgress,
  generateMilestones,
  getLatestMeasurement,
  getStartMeasurement,
} from '@/lib/calculations';
import { generateSargentMessage } from '@/lib/sargent';
import {
  deleteMeasurement,
  getHabitLogs,
  getHabits,
  getMeasurements,
  getMilestones,
  getProfile,
  replaceMilestones,
  resetAllData,
  updateProfile,
} from '@/lib/supabase/repo';
import type { Habit, HabitLog, MeasurementRecord, Milestone, Profile } from '@/lib/types/models';

export const Dashboard = () => {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [measurements, setMeasurements] = useState<MeasurementRecord[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<MeasurementRecord | null>(null);
  const [goalOpen, setGoalOpen] = useState(false);
  const [goalInput, setGoalInput] = useState('80');
  const [resetOpen, setResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const load = useCallback(async () => {
    try {
      const p = await getProfile();
      if (!p) {
        router.replace('/onboarding');
        return;
      }
      const [ms, mis, hs, hls] = await Promise.all([
        getMeasurements(),
        getMilestones(),
        getHabits(),
        getHabitLogs(),
      ]);
      setProfile(p);
      setMeasurements(ms);
      setMilestones(mis);
      setHabits(hs);
      setHabitLogs(hls);
    } catch (e) {
      setError((e as Error).message ?? 'Error al cargar los datos.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const start = useMemo(() => getStartMeasurement(measurements), [measurements]);
  const latest = useMemo(() => getLatestMeasurement(measurements), [measurements]);
  const previous = useMemo(
    () => (measurements.length >= 2 ? measurements[measurements.length - 2] : null),
    [measurements]
  );

  const overall = useMemo(
    () => (profile ? computeOverallProgress(profile, measurements) : null),
    [profile, measurements]
  );
  const eta = useMemo(
    () => (profile ? computeEta(profile, measurements) : null),
    [profile, measurements]
  );

  const achievedMilestones = useMemo(() => {
    if (!latest) return milestones;
    return milestones.map((m) => ({
      ...m,
      achieved: latest.weight <= m.target_weight,
      achieved_at: latest.weight <= m.target_weight ? latest.measured_at : null,
    }));
  }, [milestones, latest]);

  const justReachedMilestone = useMemo(() => {
    if (!latest) return null;
    const newly = achievedMilestones.find(
      (m) =>
        m.achieved &&
        (!previous || previous.weight > m.target_weight)
    );
    return newly ?? null;
  }, [achievedMilestones, latest, previous]);

  const sargentMessage = useMemo(
    () =>
      generateSargentMessage({
        current: latest,
        previous,
        progressPercent: overall?.overall ?? null,
        justReachedMilestone,
        goalWeight: profile?.goal_weight ?? 80,
      }),
    [latest, previous, overall, justReachedMilestone, profile]
  );

  const chartData = useMemo(
    () =>
      [...measurements]
        .sort((a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime())
        .map((m) => ({
          label: new Date(m.measured_at).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: 'short',
          }),
          weight: m.weight,
        })),
    [measurements]
  );

  const handleSaved = useCallback(async () => {
    const [ms, mis] = await Promise.all([getMeasurements(), getMilestones()]);
    setMeasurements(ms);
    setMilestones(mis);
    setFormOpen(false);
    setEditing(null);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteMeasurement(id);
      setMeasurements((prev) => prev.filter((m) => m.id !== id));
    } catch (e) {
      setError((e as Error).message ?? 'No se pudo borrar.');
    }
  }, []);

  const handleSaveGoal = useCallback(async () => {
    if (!profile || !start) return;
    const newGoal = Number(goalInput);
    if (!Number.isFinite(newGoal) || newGoal <= 0) return;
    try {
      await updateProfile(profile.id, { goal_weight: newGoal });
      const defs = generateMilestones(start.weight, newGoal);
      await replaceMilestones(
        defs.map((d) => ({
          label: d.label,
          target_weight: d.target_weight,
          position: d.position,
          achieved: latest ? latest.weight <= d.target_weight : false,
          achieved_at:
            latest && latest.weight <= d.target_weight ? latest.measured_at : null,
        }))
      );
      const mis = await getMilestones();
      setMilestones(mis);
      setProfile({ ...profile, goal_weight: newGoal });
      setGoalOpen(false);
    } catch (e) {
      setError((e as Error).message ?? 'No se pudo actualizar la meta.');
    }
  }, [profile, start, goalInput, latest]);

  const handleReset = useCallback(async () => {
    setResetting(true);
    try {
      await resetAllData();
      router.replace('/onboarding');
    } catch (e) {
      setError((e as Error).message ?? 'No se pudo reiniciar.');
      setResetting(false);
    }
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center text-apple-secondary">
        Cargando…
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center text-apple-secondary">
        Preparando…
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-apple-bg pb-24">
      <SargentHeader />
      <div className="px-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-wide text-apple-secondary">
            🎯 Objetivo: {profile.goal_weight} kg
          </div>
          <button
            onClick={() => setResetOpen(true)}
            className="text-xs font-semibold text-apple-danger"
          >
            Reiniciar datos
          </button>
        </div>

        {error && (
          <div className="rounded-apple bg-apple-danger/10 border border-apple-danger/30 p-3 text-sm text-apple-danger font-medium">
            {error}
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <GlassCard className="flex items-center justify-center p-6">
            <ProgressRing value={overall?.overall ?? 0} label="Progreso total" />
          </GlassCard>
          <EtaCard
            eta={eta}
            goalWeight={profile.goal_weight}
            hasHistory={measurements.length > 0}
          />
        </div>

        <SargentBanner message={sargentMessage} />

        <WeeklyReportCard profile={profile} measurements={measurements} habits={habits} />

        <ExportShare profile={profile} measurements={measurements} />

        {overall && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {overall.metrics.map((m) => (
              <MetricCard key={m.key} metric={m} />
            ))}
          </div>
        )}

        <GlassCard>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-apple-text">Hitos hacia tu objetivo</h3>
            <button
              onClick={() => {
                setGoalInput(String(profile.goal_weight));
                setGoalOpen(true);
              }}
              className="text-xs font-semibold text-apple-accent"
            >
              Editar meta
            </button>
          </div>
          <MilestonesList milestones={achievedMilestones} />
        </GlassCard>

        <GlassCard>
          <h3 className="font-bold text-apple-text mb-2">Evolución del peso</h3>
          <WeightChart data={chartData} goalWeight={profile.goal_weight} />
        </GlassCard>

        <HabitTracker habits={habits} onHabitsChange={setHabits} />

        <CustomAchievements />

        <ProgressPhotos />

        <Wrapped profile={profile} measurements={measurements} habits={habits} habitLogs={habitLogs} />

        <div className="flex items-center justify-between">
          <h3 className="font-bold text-apple-text">Historial de mediciones</h3>
          <button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className="inline-flex items-center gap-1 rounded-full bg-apple-accent text-white text-xs font-bold px-3 py-2 active:scale-95"
          >
            + Agregar
          </button>
        </div>
        <HistoryList
          measurements={measurements}
          onEdit={(m) => {
            setEditing(m);
            setFormOpen(true);
          }}
          onDelete={handleDelete}
        />
      </div>

      {/* Floating add button */}
      <button
        onClick={() => {
          setEditing(null);
          setFormOpen(true);
        }}
        aria-label="Agregar medición"
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-apple-accent text-white text-3xl font-bold shadow-lg active:scale-95"
      >
        +
      </button>

      <CoachChat profile={profile} measurements={measurements} habits={habits} />

      <MeasurementForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        editing={editing}
        onSaved={handleSaved}
      />

      <Modal open={goalOpen} onClose={() => setGoalOpen(false)} title="Editar objetivo de peso">
        <div className="space-y-3">
          <label>
            <span className="text-xs font-semibold text-apple-secondary">
              Peso objetivo (kg)
            </span>
            <input
              type="number"
              step="0.1"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              className="mt-1 w-full rounded-xl border border-apple-secondary/20 px-3 py-2 text-sm"
            />
          </label>
          <p className="text-xs text-apple-secondary">
            Se regenerarán los hitos por tramos de peso automáticamente.
          </p>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setGoalOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSaveGoal} className="flex-1">
              Guardar
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={resetOpen} onClose={() => setResetOpen(false)} title="¿Reiniciar la app?">
        <div className="space-y-3">
          <p className="text-sm text-apple-text">
            Esto borra <b>todos</b> los datos (perfil, mediciones e hitos) y te devuelve al
            onboarding para empezar de cero. No se puede deshacer.
          </p>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setResetOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleReset} disabled={resetting} className="flex-1">
              {resetting ? 'Borrando…' : 'Sí, borrar todo'}
            </Button>
          </div>
        </div>
      </Modal>
    </main>
  );
};
