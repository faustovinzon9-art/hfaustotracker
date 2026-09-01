'use client';

import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { computeOverallProgress } from '@/lib/calculations';
import type { MeasurementRecord, Profile } from '@/lib/types/models';

export const ExportShare = ({
  profile,
  measurements,
}: {
  profile: Profile;
  measurements: MeasurementRecord[];
}) => {
  const exportCSV = () => {
    const rows = [
      [
        'fecha',
        'peso_kg',
        'grasa_%',
        'musculo_%',
        'visceral',
        'agua_%',
        'imc',
        'masa_muscular_kg',
        'proteina_%',
      ],
      ...[...measurements]
        .sort((a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime())
        .map((m) => [
          m.measured_at.slice(0, 10),
          m.weight,
          m.body_fat_percentage,
          m.muscle_percentage,
          m.visceral_fat_rating,
          m.body_water_percentage,
          m.bmi,
          m.muscle_mass,
          m.protein_percentage,
        ]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hfaustotracker_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareImage = async () => {
    const latest = measurements[measurements.length - 1];
    const overall = computeOverallProgress(profile, measurements);
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 900;
    const ctx = canvas.getContext('2d')!;
    // background
    const grad = ctx.createLinearGradient(0, 0, 0, 900);
    grad.addColorStop(0, '#D32F2F');
    grad.addColorStop(1, '#7A0E0E');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 600, 900);

    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';

    ctx.font = 'bold 40px -apple-system, sans-serif';
    ctx.fillText('HFausto Tracker', 300, 90);
    ctx.font = '20px -apple-system, sans-serif';
    ctx.fillText('Command Center Health', 300, 130);

    ctx.font = 'bold 130px -apple-system, sans-serif';
    ctx.fillText(`${latest ? latest.weight : '—'}`, 300, 300);
    ctx.font = '24px -apple-system, sans-serif';
    ctx.fillText('kg actuales', 300, 345);

    ctx.font = 'bold 34px -apple-system, sans-serif';
    ctx.fillText(`${overall ? overall.overall.toFixed(0) : 0}%`, 300, 430);
    ctx.font = '20px -apple-system, sans-serif';
    ctx.fillText('de tu objetivo', 300, 465);

    if (latest) {
      ctx.font = '24px -apple-system, sans-serif';
      ctx.fillText(
        `Meta: ${profile.goal_weight} kg · Visceral: ${latest.visceral_fat_rating} · Grasa: ${latest.body_fat_percentage}%`,
        300,
        540
      );
    }

    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    roundRect(ctx, 120, 600, 360, 120, 24);
    ctx.fillStyle = '#fff';
    ctx.font = '20px -apple-system, sans-serif';
    ctx.fillText('¡Sigue marchando, soldado!', 300, 660);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], 'progreso.png', { type: 'image/png' });
      const nav = navigator as any;
      if (nav.canShare && nav.canShare({ files: [file] })) {
        try {
          await nav.share({ files: [file], title: 'Mi progreso' });
          return;
        } catch {
          /* fallthrough to download */
        }
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'progreso.png';
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  return (
    <GlassCard className="p-0 overflow-hidden">
      <div className="grid grid-cols-2 divide-x" style={{ borderColor: 'var(--hf-border)' }}>
        <button onClick={exportCSV} className="flex flex-col items-center gap-1 px-4 py-4 active:opacity-80">
          <span className="text-2xl">📤</span>
          <span className="text-xs font-bold text-apple-text">Exportar datos</span>
          <span className="text-[10px] text-apple-secondary">CSV / respaldo</span>
        </button>
        <button onClick={shareImage} className="flex flex-col items-center gap-1 px-4 py-4 active:opacity-80">
          <span className="text-2xl">🖼️</span>
          <span className="text-xs font-bold text-apple-text">Compartir progreso</span>
          <span className="text-[10px] text-apple-secondary">imagen por WhatsApp</span>
        </button>
      </div>
    </GlassCard>
  );
};

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
