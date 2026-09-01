'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { SargentHeader } from '@/components/sargent/SargentHeader';
import { FIELD_GROUPS, emptyFieldValues, toNum } from '@/lib/measurementFields';
import {
  createMeasurement,
  insertProfile,
  replaceMilestones,
  uploadPhoto,
} from '@/lib/supabase/repo';
import { generateMilestones } from '@/lib/calculations';
import type { MeasurementInput, Sex } from '@/lib/types/models';

const STEPS = ['Perfil', 'Foto', 'Valores', 'Meta'];

export const Onboarding = () => {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // step 1: profile
  const [age, setAge] = useState('');
  const [sex, setSex] = useState<Sex | ''>('');
  const [height, setHeight] = useState('');

  // step 2: photo (optional)
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // step 3: values
  const [values, setValues] = useState<Record<string, string>>(emptyFieldValues());

  // step 4: goal
  const [goal, setGoal] = useState('80');

  const weight = Number(values.weight);

  const milestonePreview = useMemo(() => {
    if (!weight || !Number(goal)) return [];
    return generateMilestones(weight, Number(goal));
  }, [weight, goal]);

  const next = () => {
    setError(null);
    if (step === 0) {
      if (!age || Number(age) <= 0) return setError('Ingresá tu edad.');
      if (!sex) return setError('Elegí tu sexo.');
      if (!height || Number(height) <= 0) return setError('Ingresá tu altura.');
    }
    if (step === 2) {
      if (!weight || weight <= 0) return setError('El peso de la primera medición es obligatorio.');
    }
    if (step === 3) {
      const g = Number(goal);
      if (!g || g <= 0) return setError('Ingresá el peso objetivo.');
      if (weight && g >= weight) return setError('El objetivo debe ser menor a tu peso actual.');
    }
    if (step < STEPS.length - 1) setStep((s) => s + 1);
  };

  const back = () => {
    setError(null);
    if (step > 0) setStep((s) => s - 1);
  };

  const onPhotoChange = (f: File | null) => {
    setPhoto(f);
    if (f) setPhotoPreview(URL.createObjectURL(f));
    else setPhotoPreview(null);
  };

  const finish = async () => {
    setSaving(true);
    setError(null);
    try {
      const measurement: MeasurementInput = {
        measured_at: new Date().toISOString(),
        photo_url: photo ? await uploadPhoto(photo) : null,
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

      const profile = await insertProfile({
        age: Number(age),
        sex: sex as Sex,
        height_cm: Number(height),
        goal_weight: Number(goal),
      });

      await createMeasurement(measurement);

      const defs = generateMilestones(weight, Number(goal));
      await replaceMilestones(
        defs.map((d) => ({
          label: d.label,
          target_weight: d.target_weight,
          position: d.position,
          achieved: weight <= d.target_weight,
          achieved_at: weight <= d.target_weight ? measurement.measured_at : null,
        }))
      );

      router.push('/');
    } catch (e) {
      setError((e as Error).message ?? 'No se pudo crear la cuenta.');
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-apple-bg pb-24">
      <SargentHeader />
      <div className="px-6 max-w-xl mx-auto space-y-5">
        {/* Stepper */}
        <div className="flex items-center justify-center gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                  i <= step ? 'bg-apple-accent text-white' : 'bg-white text-apple-secondary'
                }`}
              >
                {i + 1}
              </div>
              <span
                className={`text-[10px] font-semibold uppercase tracking-wide ${
                  i === step ? 'text-apple-text' : 'text-apple-secondary'
                }`}
              >
                {label}
              </span>
              {i < STEPS.length - 1 && <div className="w-4 h-px bg-apple-secondary/30" />}
            </div>
          ))}
        </div>

        {step === 0 && (
          <GlassCard className="p-5 space-y-4">
            <h2 className="text-lg font-bold text-apple-text">Tu perfil</h2>
            <p className="text-sm text-apple-secondary">
              Usamos estos datos para calcular tus rangos saludables en todos los
              parámetros.
            </p>
            <label className="block">
              <span className="text-xs font-semibold text-apple-secondary">Edad</span>
              <input
                type="number"
                inputMode="numeric"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="35"
                className="mt-1 w-full rounded-xl border border-apple-secondary/20 px-3 py-2 text-sm"
              />
            </label>
            <div>
              <span className="text-xs font-semibold text-apple-secondary">Sexo</span>
              <div className="grid grid-cols-2 gap-3 mt-1">
                {(['male', 'female'] as Sex[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSex(s)}
                    className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                      sex === s
                        ? 'border-apple-accent bg-apple-accent/10 text-apple-accent'
                        : 'border-apple-secondary/20 text-apple-secondary'
                    }`}
                  >
                    {s === 'male' ? 'Masculino' : 'Femenino'}
                  </button>
                ))}
              </div>
            </div>
            <label className="block">
              <span className="text-xs font-semibold text-apple-secondary">Altura (cm)</span>
              <input
                type="number"
                inputMode="decimal"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="175"
                className="mt-1 w-full rounded-xl border border-apple-secondary/20 px-3 py-2 text-sm"
              />
            </label>
          </GlassCard>
        )}

        {step === 1 && (
          <GlassCard className="p-5 space-y-4">
            <h2 className="text-lg font-bold text-apple-text">Punto de partida 📸</h2>
            <p className="text-sm text-apple-secondary">
              Subí la foto de tu primer reporte de la balanza. Va a quedar como
              comprobante de tu inicio.
            </p>
            {photoPreview ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoPreview}
                  alt="Vista previa"
                  className="w-full h-44 object-cover rounded-apple"
                />
                <button
                  onClick={() => onPhotoChange(null)}
                  className="absolute top-2 right-2 bg-black/60 text-white text-xs px-3 py-1 rounded-full"
                >
                  Quitar
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-apple-secondary/30 rounded-apple py-10 text-center cursor-pointer">
                <span className="text-3xl mb-2">📷</span>
                <span className="text-sm font-semibold text-apple-accent">
                  Elegir foto / PDF
                </span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => onPhotoChange(e.target.files?.[0] ?? null)}
                  className="hidden"
                />
              </label>
            )}
            <p className="text-xs text-apple-secondary">
              Si no tenés la foto ahora, podés seguir y cargar los valores a mano.
            </p>
          </GlassCard>
        )}

        {step === 2 && (
          <GlassCard className="p-5 space-y-4">
            <h2 className="text-lg font-bold text-apple-text">Confirmá los valores</h2>
            <p className="text-sm text-apple-secondary">
              Cargá los números de tu primera medición. El peso es obligatorio; el resto
              podés completarlo o dejar vacío.
            </p>
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
                        onChange={(e) =>
                          setValues((prev) => ({ ...prev, [f.key]: e.target.value }))
                        }
                        placeholder="0"
                        className="mt-1 w-full rounded-xl border border-apple-secondary/20 px-3 py-2 text-sm"
                      />
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex flex-wrap gap-3">
              <label className="flex-1 min-w-[180px]">
                <span className="text-xs font-semibold text-apple-secondary">
                  Fecha (por defecto hoy)
                </span>
                <input
                  type="date"
                  disabled
                  value={new Date().toISOString().slice(0, 10)}
                  className="mt-1 w-full rounded-xl border border-apple-secondary/20 px-3 py-2 text-sm text-apple-secondary"
                />
              </label>
            </div>
          </GlassCard>
        )}

        {step === 3 && (
          <GlassCard className="p-5 space-y-4">
            <h2 className="text-lg font-bold text-apple-text">Tu objetivo 🎯</h2>
            <p className="text-sm text-apple-secondary">
              El objetivo principal es el <b>peso</b>. Los demás parámetros se comparan
              contra rangos saludables automáticos.
            </p>
            <label className="block">
              <span className="text-xs font-semibold text-apple-secondary">
                Peso objetivo (kg)
              </span>
              <input
                type="number"
                step="0.1"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="80"
                className="mt-1 w-full rounded-xl border border-apple-secondary/20 px-3 py-2 text-sm"
              />
            </label>
            {milestonePreview.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wide text-apple-secondary mb-2">
                  Hitos que se van a crear
                </h3>
                <div className="flex flex-wrap gap-2">
                  {milestonePreview.map((m) => (
                    <span
                      key={m.position}
                      className="px-3 py-1 rounded-full bg-apple-accent/10 text-apple-accent text-xs font-bold"
                    >
                      {m.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </GlassCard>
        )}

        {error && (
          <div className="rounded-apple bg-apple-danger/10 border border-apple-danger/30 p-3 text-sm text-apple-danger font-medium">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          {step > 0 && (
            <Button variant="ghost" onClick={back} className="flex-1">
              Atrás
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button onClick={next} className="flex-1">
              Continuar
            </Button>
          ) : (
            <Button onClick={finish} disabled={saving} className="flex-1">
              {saving ? 'Creando cuenta…' : '¡Comenzar!'}
            </Button>
          )}
        </div>
      </div>
    </main>
  );
};
