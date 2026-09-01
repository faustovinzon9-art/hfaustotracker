'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { GlassCard } from '@/components/ui/GlassCard';
import { buildAIContext } from '@/lib/aiContext';
import type { Habit, MeasurementRecord, Profile } from '@/lib/types/models';

type Report = {
  titulo?: string;
  resumen?: string;
  logros?: string[];
  problemas?: string[];
  plan?: string;
};

export const WeeklyReportCard = ({
  profile,
  measurements,
  habits,
}: {
  profile: Profile;
  measurements: MeasurementRecord[];
  habits: Habit[];
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<Report | string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setOpen(true);
    setLoading(true);
    setError(null);
    setReport(null);
    try {
      const res = await fetch('/api/weekly-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: buildAIContext(profile, measurements, habits) }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      setReport(json.report ?? json.answer);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <GlassCard className="p-0 overflow-hidden">
        <button
          onClick={generate}
          className="flex w-full items-center justify-between px-5 py-4 text-left active:opacity-80"
        >
          <div>
            <h3 className="font-bold text-apple-text">📊 Resumen semanal</h3>
            <p className="text-xs text-apple-secondary">
              La IA resume tu semana y te da el plan de la próxima.
            </p>
          </div>
          <span className="text-2xl text-apple-accent">→</span>
        </button>
      </GlassCard>

      <Modal open={open} onClose={() => setOpen(false)} title="📊 Resumen semanal">
        {loading && <p className="text-sm text-apple-secondary">El Sargento está redactando tu resumen…</p>}
        {error && <p className="text-sm text-apple-danger font-medium">{error}</p>}
        {report && typeof report === 'object' && (
          <div className="space-y-3 text-sm">
            {report.titulo && <h3 className="font-bold text-apple-text text-base">{report.titulo}</h3>}
            {report.resumen && <p className="text-apple-text">{report.resumen}</p>}
            {report.logros?.length ? (
              <div>
                <div className="text-xs font-bold uppercase text-apple-success">✔ Logros</div>
                <ul className="mt-1 space-y-1">
                  {report.logros.map((l, i) => (
                    <li key={i} className="text-apple-text">• {l}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {report.problemas?.length ? (
              <div>
                <div className="text-xs font-bold uppercase text-apple-danger">⚠ Para mejorar</div>
                <ul className="mt-1 space-y-1">
                  {report.problemas.map((p, i) => (
                    <li key={i} className="text-apple-text">• {p}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {report.plan && (
              <div className="rounded-apple p-3" style={{ background: 'var(--hf-input)' }}>
                <div className="text-xs font-bold uppercase text-apple-accent">🎯 Plan de la semana</div>
                <p className="mt-1 text-apple-text">{report.plan}</p>
              </div>
            )}
          </div>
        )}
        {report && typeof report === 'string' && (
          <p className="whitespace-pre-wrap text-sm text-apple-text">{report}</p>
        )}
      </Modal>
    </>
  );
};
