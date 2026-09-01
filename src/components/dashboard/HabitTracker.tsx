'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import {
  createHabit,
  deleteHabit,
  getHabitLogs,
  setHabitLog,
} from '@/lib/supabase/repo';
import type { Habit, HabitLog } from '@/lib/types/models';

const HABIT_COLORS = ['#007AFF', '#34C759', '#FF9500', '#FF3B30', '#AF52DE', '#5856D6'];
const HABIT_ICONS = ['✅', '🍽️', '💪', '🏃', '😴', '💧', '🧘', '📵', '🥗', '🚭'];

function dayStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function lastNDays(n: number): { date: string; label: string }[] {
  const out: { date: string; label: string }[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const today = new Date();
    const isToday = d.toDateString() === today.toDateString();
    out.push({
      date: dayStr(d),
      label: isToday ? 'HOY' : d.toLocaleDateString('es-AR', { weekday: 'narrow' }),
    });
  }
  return out;
}

function streak(habitId: string, logs: HabitLog[]): number {
  const logMap = new Map(logs.filter((l) => l.habit_id === habitId).map((l) => [l.log_date, l.done]));
  let count = 0;
  const now = new Date();
  for (let i = 0; i < 400; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    if (logMap.get(dayStr(d))) count++;
    else if (i === 0) continue; // allow today not yet done
    else break;
  }
  return count;
}

export const HabitTracker = ({
  habits,
  onHabitsChange,
}: {
  habits: Habit[];
  onHabitsChange: (h: Habit[]) => void;
}) => {
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('✅');
  const [color, setColor] = useState(HABIT_COLORS[0]);
  const [adding, setAdding] = useState(false);

  const days = useMemo(() => lastNDays(7), []);

  const loadLogs = useCallback(async () => {
    try {
      setLogs(await getHabitLogs());
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const toggle = async (habitId: string, date: string, cur: boolean) => {
    const next = !cur;
    setLogs((prev) => {
      const others = prev.filter((l) => !(l.habit_id === habitId && l.log_date === date));
      return [...others, { id: 'tmp', habit_id: habitId, log_date: date, done: next, note: null, created_at: '' }];
    });
    try {
      await setHabitLog(habitId, date, next);
    } catch {
      /* ignore */
    }
  };

  const addHabit = async () => {
    if (!name.trim()) return;
    try {
      const h = await createHabit({ name: name.trim(), icon, color });
      onHabitsChange([...habits, h]);
      setName('');
      setIcon('✅');
      setColor(HABIT_COLORS[0]);
      setAdding(false);
    } catch {
      /* ignore */
    }
  };

  const removeHabit = async (id: string) => {
    try {
      await deleteHabit(id);
      onHabitsChange(habits.filter((h) => h.id !== id));
      setLogs((prev) => prev.filter((l) => l.habit_id !== id));
    } catch {
      /* ignore */
    }
  };

  const isDone = (habitId: string, date: string): boolean =>
    !!logs.find((l) => l.habit_id === habitId && l.log_date === date && l.done);

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-apple-text">🎯 Hábitos</h3>
        <button
          onClick={() => setAdding((v) => !v)}
          className="text-xs font-bold text-apple-accent"
        >
          {adding ? 'Cancelar' : '+ Añadir hábito'}
        </button>
      </div>

      {adding && (
        <div className="mb-4 space-y-2 rounded-apple p-3" style={{ background: 'var(--hf-input)' }}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre del hábito (ej. Ayuno intermitente)"
            className="hf-input w-full rounded-xl px-3 py-2 text-sm"
          />
          <div className="flex flex-wrap gap-1">
            {HABIT_ICONS.map((i) => (
              <button
                key={i}
                onClick={() => setIcon(i)}
                className={`h-8 w-8 rounded-full text-base ${icon === i ? 'bg-apple-accent/20' : ''}`}
              >
                {i}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1">
            {HABIT_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className="h-6 w-6 rounded-full"
                style={{ background: c, outline: color === c ? `2px solid ${c}` : 'none' }}
              />
            ))}
          </div>
          <button
            onClick={addHabit}
            className="rounded-full bg-apple-accent px-4 py-2 text-white text-xs font-bold"
          >
            Guardar hábito
          </button>
        </div>
      )}

      {habits.length === 0 && !adding && (
        <p className="text-sm text-apple-secondary">
          Todavía no tenés hábitos. Añadí el primero (ej. ayuno, comer sano) para arrancar.
        </p>
      )}

      <div className="space-y-3">
        {habits.map((h) => {
          const s = streak(h.id, logs);
          return (
            <div key={h.id}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-base">{h.icon}</span>
                  <span className="text-sm font-semibold text-apple-text">{h.name}</span>
                  {s > 0 && (
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: h.color }}>
                      🔥 {s}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => removeHabit(h.id)}
                  className="text-[11px] text-apple-danger font-semibold"
                >
                  ✕
                </button>
              </div>
              <div className="flex items-center gap-1">
                {days.map((d) => {
                  const done = isDone(h.id, d.date);
                  const today = d.label === 'HOY';
                  return (
                    <button
                      key={d.date}
                      onClick={() => toggle(h.id, d.date, done)}
                      className="flex h-9 flex-1 items-center justify-center rounded-full text-[10px] font-bold transition active:scale-90"
                      style={{
                        background: done ? h.color : 'var(--hf-input)',
                        color: done ? '#fff' : 'var(--hf-secondary)',
                        border: today && !done ? `2px solid ${h.color}` : 'none',
                      }}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
};
