'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { createMeasurement, updateMeasurement, uploadPhoto } from '@/lib/supabase/repo';
import { FIELD_GROUPS, emptyFieldValues, toNum } from '@/lib/measurementFields';
import type { MeasurementInput, MeasurementRecord } from '@/lib/types/models';

type AIResponse = { data: Record<string, number>; missing: string[] };

export const MeasurementForm = ({
  open,
  onClose,
  editing,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  editing: MeasurementRecord | null;
  onSaved: () => Promise<void>;
}) => {
  const [values, setValues] = useState<Record<string, string>>(emptyFieldValues());
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [attachment, setAttachment] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState('image/png');
  const [analyzing, setAnalyzing] = useState(false);
  const [aiNote, setAiNote] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const reset = () => {
    setValues(emptyFieldValues());
    setDate(new Date().toISOString().slice(0, 10));
    setAttachment(null);
    setPreview(null);
    setMimeType('image/png');
    setAiNote(null);
    setError(null);
  };

  useEffect(() => {
    if (!open) return;
    if (editing) {
      const rec: Record<string, string> = {};
      FIELD_GROUPS.forEach((g) =>
        g.fields.forEach((f) => {
          const v = (editing as unknown as Record<string, unknown>)[f.key];
          rec[f.key] = v == null ? '' : String(v);
        })
      );
      setValues(rec);
      setDate(editing.measured_at.slice(0, 10));
    } else {
      reset();
    }
  }, [open, editing]);

  const set = (k: string, v: string) => setValues((prev) => ({ ...prev, [k]: v }));

  const acceptAttachment = (file: File | null) => {
    if (!file) return;
    setAttachment(file);
    setMimeType(file.type || 'image/png');
    setPreview(URL.createObjectURL(file));
    setAiNote(null);
  };

  // Global paste handler (Cmd/Ctrl+V) to grab an image from the clipboard.
  useEffect(() => {
    if (!open) return;
    const handler = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            acceptAttachment(file);
            e.preventDefault();
            return;
          }
        }
      }
    };
    document.addEventListener('paste', handler);
    return () => document.removeEventListener('paste', handler);
  }, [open]);

  const tryReadClipboard = async () => {
    try {
      const items = await (navigator.clipboard as any).read();
      for (const item of items) {
        const t = (item as any).types?.find((x: string) => x.startsWith('image/'));
        if (t) {
          const blob = await (item as any).getType(t);
          acceptAttachment(new File([blob], 'clipboard.png', { type: t }));
          return;
        }
      }
      setAiNote('No hay ninguna imagen en el portapapeles.');
    } catch {
      setAiNote('No pude leer el portapapeles. Usá Ctrl/Cmd+V o "Subir PDF / foto".');
    }
  };

  const analyzeWithAI = async () => {
    if (!attachment) {
      setAiNote('Antes pegá o subí el reporte para analizarlo con IA.');
      return;
    }
    setAnalyzing(true);
    setAiNote(null);
    setError(null);
    try {
      const dataUrl = await readAsDataUrl(attachment);
      const res = await fetch('/api/analyze-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: dataUrl, mimeType }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      const data = (json as AIResponse).data;
      const next: Record<string, string> = { ...values };
      for (const [k, v] of Object.entries(data)) {
        if (typeof v === 'number' && v > 0 && k in next) next[k] = String(v);
      }
      setValues(next);
      const missing = (json as AIResponse).missing;
      setAiNote(
        missing && missing.length
          ? `Leído ✔. Campos no detectados (completalos a mano): ${missing.join(', ')}`
          : 'Leído ✔. Revisá los valores antes de guardar.'
      );
    } catch (e) {
      setAiNote((e as Error).message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    const weight = Number(values.weight);
    if (!values.weight || Number.isNaN(weight)) {
      setError('El peso es obligatorio.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      let photo_url: string | null = editing?.photo_url ?? null;
      if (attachment) photo_url = await uploadPhoto(attachment);

      const input: MeasurementInput = {
        measured_at: new Date(date + 'T12:00:00').toISOString(),
        photo_url,
        weight,
        bmi: toNum(values.bmi),
        body_fat_percentage: toNum(values.body_fat_percentage),
        muscle_mass: toNum(values.muscle_mass),
        muscle_percentage: toNum(values.muscle_percentage),
        body_water_percentage: toNum(values.body_water_percentage),
        protein_percentage: toNum(values.protein_percentage),
        bone_mineral_percentage: toNum(values.bone_mineral_percentage),
        skeletal_muscle_mass: toNum(values.skeletal_muscle_mass),
        visceral_fat_rating: toNum(values.visceral_fat_rating),
        basal_metabolic_rate: toNum(values.basal_metabolic_rate),
        waist_to_hip_ratio: toNum(values.waist_to_hip_ratio),
        body_age: toNum(values.body_age),
        fat_free_body_weight: toNum(values.fat_free_body_weight),
      };

      if (editing) {
        await updateMeasurement(editing.id, input);
      } else {
        await createMeasurement(input);
      }
      await onSaved();
    } catch (e) {
      setError((e as Error).message ?? 'No se pudo guardar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Editar medición' : 'Nueva medición'}>
      <div className="space-y-4">
        <div className="rounded-apple p-3 border" style={{ borderColor: 'var(--hf-border)' }}>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={tryReadClipboard}
              className="inline-flex items-center gap-1 rounded-full bg-apple-accent text-white text-xs font-bold px-3 py-2 active:scale-95"
            >
              📋 Pegar imagen
            </button>
            <button
              onClick={() => fileInput.current?.click()}
              className="inline-flex items-center gap-1 rounded-full border text-xs font-bold px-3 py-2 active:scale-95"
              style={{ borderColor: 'var(--hf-border)', color: '#007AFF' }}
            >
              ⬆️ Subir PDF / foto
            </button>
            <span className="text-[11px] text-apple-secondary">o pegá con Ctrl/Cmd+V</span>
          </div>
          <input
            ref={fileInput}
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={(e) => acceptAttachment(e.target.files?.[0] ?? null)}
          />

          {preview && (
            <div className="mt-3 flex items-start gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Comprobante" className="h-20 w-20 rounded-xl object-cover" />
              <div className="flex-1">
                <button
                  onClick={analyzeWithAI}
                  disabled={analyzing}
                  className="inline-flex items-center gap-1 rounded-full bg-apple-text text-white text-xs font-bold px-3 py-2 active:scale-95 disabled:opacity-50"
                >
                  {analyzing ? 'Analizando…' : '🤖 Analizar con IA'}
                </button>
                <button
                  onClick={() => {
                    setAttachment(null);
                    setPreview(null);
                    setAiNote(null);
                  }}
                  className="ml-2 text-xs text-apple-danger font-semibold"
                >
                  Quitar
                </button>
                {aiNote && <p className="mt-1 text-xs text-apple-secondary">{aiNote}</p>}
              </div>
            </div>
          )}
          {!preview && aiNote && <p className="mt-2 text-xs text-apple-secondary">{aiNote}</p>}
        </div>

        <div className="flex flex-wrap gap-3">
          <label className="flex-1 min-w-[180px]">
            <span className="text-xs font-semibold text-apple-secondary">Fecha de medición</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="hf-input mt-1 w-full rounded-xl px-3 py-2 text-sm"
            />
          </label>
        </div>

        {FIELD_GROUPS.map((group) => (
          <div key={group.title}>
            <h3 className="text-xs font-bold uppercase tracking-wide text-apple-secondary mb-2">
              {group.title}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {group.fields.map((f) => (
                <label key={String(f.key)}>
                  <span className="text-xs font-medium text-apple-secondary">
                    {f.label} {f.unit && `(${f.unit})`}
                  </span>
                  <input
                    type="number"
                    step="any"
                    inputMode="decimal"
                    value={values[f.key]}
                    onChange={(e) => set(String(f.key), e.target.value)}
                    placeholder="0"
                    className="hf-input mt-1 w-full rounded-xl px-3 py-2 text-sm"
                  />
                </label>
              ))}
            </div>
          </div>
        ))}

        {error && <p className="text-sm text-apple-danger font-medium">{error}</p>}

        <div className="flex gap-3">
          <Button variant="ghost" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={saving} className="flex-1">
            {saving ? 'Guardando…' : editing ? 'Guardar' : 'Agregar'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(new Error('No se pudo leer el archivo.'));
    r.readAsDataURL(file);
  });
}
