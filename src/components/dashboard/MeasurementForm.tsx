'use client';

import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { createMeasurement, updateMeasurement, uploadPhoto } from '@/lib/supabase/repo';
import { FIELD_GROUPS, toNum } from '@/lib/measurementFields';
import type { MeasurementInput, MeasurementRecord } from '@/lib/types/models';

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
  const empty = () => {
    const rec: Record<string, string> = {};
    FIELD_GROUPS.forEach((g) =>
      g.fields.forEach((f) => (rec[f.key] = ''))
    );
    return rec;
  };

  const [values, setValues] = useState<Record<string, string>>(empty());
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setValues(empty());
      setDate(new Date().toISOString().slice(0, 10));
    }
    setFile(null);
    setError(null);
  }, [open, editing]);

  const set = (k: string, v: string) => setValues((prev) => ({ ...prev, [k]: v }));

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
      if (file) photo_url = await uploadPhoto(file);

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
        <div className="flex flex-wrap gap-3">
          <label className="flex-1 min-w-[180px]">
            <span className="text-xs font-semibold text-apple-secondary">Fecha de medición</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full rounded-xl border border-apple-secondary/20 px-3 py-2 text-sm"
            />
          </label>
          <label className="flex-1 min-w-[180px]">
            <span className="text-xs font-semibold text-apple-secondary">Foto del reporte (opcional)</span>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-1 w-full text-sm"
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
                    className="mt-1 w-full rounded-xl border border-apple-secondary/20 px-3 py-2 text-sm"
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
