import { NextRequest, NextResponse } from 'next/server';
import { callGemini, extractJson } from '@/lib/gemini';

const PROMPT = `Sos el Sargento Coach de "HFausto Tracker". Generás un RESUMEN SEMANAL motivador y útil en español, breve (máximo 6-8 líneas), basándote EXCLUSIVAMENTE en los datos que te paso.

Devolvé SOLO un JSON con este formato:
{
  "titulo": "Resumen de la semana (fecha)",
  "resumen": "2-3 frases sobre cómo fue la semana (peso, hábitos, adherencia).",
  "logros": ["1-2 cosas que salieron bien"],
  "problemas": ["si hay algo a mejorar, una nota"],
  "plan": "1-2 líneas con el plan concreto para la próxima semana (romper estancamiento, mejorar hábitos)."
}

DATOS:
{context}`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const context = (body?.context as string) || '';
    const raw = await callGemini({ prompt: PROMPT.replace('{context}', context) });
    const parsed = extractJson<any>(raw);
    if (!parsed) {
      return NextResponse.json({ ok: true, answer: raw });
    }
    return NextResponse.json({ ok: true, report: parsed });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message ?? 'Error generando el resumen.' },
      { status: 500 }
    );
  }
}
