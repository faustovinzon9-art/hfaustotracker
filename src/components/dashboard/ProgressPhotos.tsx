'use client';

import React, { useEffect, useRef, useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { deleteProgressPhoto, getProgressPhotos, uploadProgressPhoto } from '@/lib/supabase/repo';
import type { ProgressPhoto } from '@/lib/types/models';

export const ProgressPhotos = () => {
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      try {
        setPhotos(await getProgressPhotos());
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onFile = async (f: File | null) => {
    if (!f) return;
    setUploading(true);
    setError(null);
    try {
      const p = await uploadProgressPhoto(f);
      setPhotos((prev) => [p, ...prev]);
    } catch (e) {
      setError((e as Error).message ?? 'No se pudo subir la foto.');
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteProgressPhoto(id);
      setPhotos((prev) => prev.filter((p) => p.id !== id));
    } catch {
      /* ignore */
    }
  };

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-apple-text">📸 Fotos de progreso</h3>
        <button
          onClick={() => fileInput.current?.click()}
          disabled={uploading}
          className="rounded-full bg-apple-accent text-white text-xs font-bold px-3 py-2 active:scale-95 disabled:opacity-50"
        >
          {uploading ? 'Subiendo…' : '+ Añadir foto'}
        </button>
      </div>
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
      />

      {error && <p className="mb-2 text-xs text-apple-danger font-medium">{error}</p>}

      {loading ? (
        <p className="text-sm text-apple-secondary">Cargando…</p>
      ) : photos.length === 0 ? (
        <p className="text-sm text-apple-secondary">
          Todavía no hay fotos. Sacate una foto corporal de vez en cuando para ver tu progreso.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((p) => (
            <div key={p.id} className="relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.photo_url}
                alt={p.caption || 'Progreso'}
                className="aspect-[3/4] w-full rounded-xl object-cover"
              />
              <button
                onClick={() => remove(p.id)}
                className="absolute top-1 right-1 rounded-full bg-black/60 px-1.5 text-white text-xs"
              >
                ×
              </button>
              <div className="mt-1 text-[10px] text-apple-secondary text-center">
                {new Date(p.taken_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
};
