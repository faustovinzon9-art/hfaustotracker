'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { Habit, MeasurementRecord, Profile } from '@/lib/types/models';

type Msg = { role: 'user' | 'coach'; text: string };

function buildContext(profile: Profile, measurements: MeasurementRecord[], habits: Habit[]) {
  const latest = measurements[measurements.length - 1];
  const first = measurements[0];
  const lines: string[] = [];
  lines.push(
    `Perfil: ${profile.sex === 'male' ? 'hombre' : 'mujer'}, ${profile.age} años, ${profile.height_cm} cm, meta de peso ${profile.goal_weight} kg.`
  );
  lines.push(`Mediciones registradas: ${measurements.length}.`);
  if (first && latest) {
    lines.push(
      `Inicio: ${first.weight} kg (${new Date(first.measured_at).toLocaleDateString('es-AR')}).`
    );
    lines.push(
      `Última: ${latest.weight} kg, grasa ${latest.body_fat_percentage}%, visceral ${latest.visceral_fat_rating}, músculo ${latest.muscle_percentage}%, agua ${latest.body_water_percentage}%.`
    );
  }
  if (habits.length) {
    lines.push(`Hábitos: ${habits.map((h) => h.icon + ' ' + h.name).join(', ')}.`);
  }
  return lines.join('\n');
}

export const CoachChat = ({
  profile,
  measurements,
  habits,
}: {
  profile: Profile;
  measurements: MeasurementRecord[];
  habits: Habit[];
}) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: 'coach',
      text: '¡Soldado! Soy tu Sargento Coach. Preguntame lo que quieras sobre tu progreso: dieta, entrenamiento, el estancamiento, qué comer… arrancá. 🫡',
    },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open]);

  const send = async () => {
    const q = input.trim();
    if (!q || busy) return;
    setMessages((prev) => [...prev, { role: 'user', text: q }]);
    setInput('');
    setBusy(true);
    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          context: buildContext(profile, measurements, habits),
        }),
      });
      const json = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: 'coach', text: json.ok ? json.answer : `⚠️ ${json.error || 'No pude responder.'}` },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'coach', text: '⚠️ No pude conectarme con el coach.' },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Coach"
        className="fixed bottom-24 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-apple-success text-white text-xl shadow-lg active:scale-95"
      >
        🧠
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex h-[75vh] w-full sm:max-w-md flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl shadow-xl"
            style={{ background: 'var(--hf-surface)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: '1px solid var(--hf-border)' }}
            >
              <h3 className="font-bold text-apple-text">🧠 Sargento Coach</h3>
              <button onClick={() => setOpen(false)} className="text-apple-secondary text-2xl">
                ×
              </button>
            </div>
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                    m.role === 'user'
                      ? 'ml-auto bg-apple-accent text-white'
                      : 'mr-auto'
                  }`}
                  style={m.role === 'coach' ? { background: 'var(--hf-card)', color: 'var(--hf-text)', border: '1px solid var(--hf-border)' } : undefined}
                >
                  {m.text}
                </div>
              ))}
              {busy && <div className="text-xs text-apple-secondary">El Sargento está pensando…</div>}
            </div>
            <div className="flex items-center gap-2 px-3 py-3" style={{ borderTop: '1px solid var(--hf-border)' }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') send();
                }}
                placeholder="Preguntale al coach…"
                className="hf-input flex-1 rounded-full px-4 py-2 text-sm"
              />
              <button
                onClick={send}
                disabled={busy}
                className="rounded-full bg-apple-success px-4 py-2 text-white text-sm font-bold active:scale-95 disabled:opacity-50"
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
