import { NextRequest, NextResponse } from 'next/server';
import { callGemini } from '@/lib/gemini';

const SYSTEM = `Sos el Sargento Coach de "HFausto Tracker". Eres exigente, motivador y directo (típico sargento de gimnasio), pero también útil y concreto. Respondés en español, breve y accionable (2-5 frases), a veces con una frase motivadora. Analizás los datos que te paso y respondés la pregunta del usuario con consejos reales según SU información.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const question = (body?.question as string) || '';
    const context = (body?.context as string) || '';

    if (!question.trim()) {
      return NextResponse.json({ ok: false, error: 'Pregunta vacía' }, { status: 400 });
    }

    const prompt = `${SYSTEM}

DATOS DEL USUARIO:
${context}

PREGUNTA DEL USUARIO:
${question}

Respondé de forma clara y directa.`;

    const raw = await callGemini({ prompt });
    return NextResponse.json({ ok: true, answer: raw });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message ?? 'Error del coach.' },
      { status: 500 }
    );
  }
}
