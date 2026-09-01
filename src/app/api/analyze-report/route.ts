import { NextRequest, NextResponse } from 'next/server';
import { callGemini, extractJson } from '@/lib/gemini';
import type { MeasurementInput } from '@/lib/types/models';

const PROMPT = `Lee el reporte de la balanza Xiaomi Mi Body Composition Scale S400 en la imagen/PDF y devolveme SOLO un JSON con estos campos (usa 0/imagen sin el dato los deja como numero, si no aparece dejalos en 0 y anotá cuales faltan):

{
  "weight": 0.0,
  "bmi": 0.0,
  "body_fat_percentage": 0.0,
  "muscle_mass": 0.0,
  "muscle_percentage": 0.0,
  "body_water_percentage": 0.0,
  "protein_percentage": 0.0,
  "bone_mineral_percentage": 0.0,
  "skeletal_muscle_mass": 0.0,
  "visceral_fat_rating": 0,
  "basal_metabolic_rate": 0,
  "waist_to_hip_ratio": 0.0,
  "body_age": 0,
  "fat_free_body_weight": 0.0,
  "missing": ["lista de campos que no se ven"]
}

Unidades: peso kg, grasa/músculo/agua/proteína/hueso en %, visceral rating en número, metabolismo en kcal, edad corporal en años. No inventes números: si algo no se ve, dejalo en 0 y agrega el nombre a "missing".`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const imageBase64 = body?.imageBase64 as string;
    const mimeType = (body?.mimeType as string) || 'image/png';

    if (!imageBase64) {
      return NextResponse.json(
        { success: false, error: 'No image provided' },
        { status: 400 }
      );
    }

    const raw = await callGemini({
      prompt: PROMPT,
      imageBase64,
      mimeType,
    });

    const parsed = extractJson<MeasurementInput & { missing?: string[] }>(raw);
    if (!parsed || typeof parsed !== 'object' || parsed.weight === undefined) {
      return NextResponse.json(
        { success: false, error: 'No se pudo interpretar el reporte. Cargá los valores a mano.' },
        { status: 422 }
      );
    }

    const { missing, ...metrics } = parsed;
    return NextResponse.json({ success: true, data: metrics, missing: missing ?? [] });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: (e as Error).message ?? 'Error al analizar.' },
      { status: 500 }
    );
  }
}
