'use client';

import React, { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import {
  createCustomAchievement,
  deleteCustomAchievement,
  getCustomAchievements,
  toggleCustomAchievement,
} from '@/lib/supabase/repo';
import type { CustomAchievement } from '@/lib/types/models';

export const CustomAchievements = () => {
  const [items, setItems] = useState<CustomAchievement[]>([]);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🏆');
  const [desc, setDesc] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setItems(await getCustomAchievements());
      } catch {
        /* ignore */
      }
    })();
  }, []);

  const add = async () => {
    if (!name.trim()) return;
    try {
      const a = await createCustomAchievement({ name: name.trim(), icon, description: desc.trim() || null });
      setItems((prev) => [...prev, a]);
      setName('');
      setDesc('');
      setIcon('🏆');
      setAdding(false);
    } catch {
      /* ignore */
    }
  };

  const toggle = async (id: string, achieved: boolean) => {
    await toggleCustomAchievement(id, !achieved);
    setItems((prev) => prev.map((a) => (a.id === id ? { ...a, achieved: !achieved, achieved_at: !achieved ? new Date().toISOString() : null } : a)));
  };

  const remove = async (id: string) => {
    await deleteCustomAchievement(id);
    setItems((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-apple-text">🏅 Mis metas</h3>
        <button onClick={() => setAdding((v) => !v)} className="text-xs font-bold text-apple-accent">
          {adding ? 'Cancelar' : '+ Crear meta'}
        </button>
      </div>

      {adding && (
        <div className="mb-3 space-y-2 rounded-apple p-3" style={{ background: 'var(--hf-input)' }}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Qué querés lograr (ej. correr 10k)" className="hf-input w-full rounded-xl px-3 py-2 text-sm" />
          <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Detalle (opcional)" className="hf-input w-full rounded-xl px-3 py-2 text-sm" />
          <div className="flex flex-wrap gap-1">
            {['🏆', '🏅', '💪', '🏃', '🎖️', '🌟'].map((i) => (
              <button key={i} onClick={() => setIcon(i)} className={`h-9 w-9 rounded-full text-lg ${icon === i ? 'bg-apple-accent/20' : ''}`}>
                {i}
              </button>
            ))}
          </div>
          <button onClick={add} className="rounded-full bg-apple-accent px-4 py-2 text-white text-xs font-bold">
            Guardar meta
          </button>
        </div>
      )}

      {items.length === 0 && !adding && (
        <p className="text-sm text-apple-secondary">
          Creá tus propias metas (ej. 'salir a correr 10k') y celebrá cuando las cumplas.
        </p>
      )}

      <div className="space-y-2">
        {items.map((a) => (
          <div
            key={a.id}
            className={`flex items-center gap-3 p-3 rounded-apple ${
              a.achieved ? 'opacity-90' : ''
            }`}
            style={{ background: 'var(--hf-input)' }}
          >
            <button
              onClick={() => toggle(a.id, a.achieved)}
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base ${
                a.achieved ? 'bg-apple-success text-white' : 'bg-white/20'
              }`}
            >
              {a.achieved ? '✓' : ''}
            </button>
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-bold ${a.achieved ? 'text-apple-success line-through' : 'text-apple-text'}`}>
                {a.icon} {a.name}
              </div>
              {a.description && <div className="text-xs text-apple-secondary">{a.description}</div>}
            </div>
            <button onClick={() => remove(a.id)} className="text-apple-danger text-xs font-semibold">
              ✕
            </button>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};
