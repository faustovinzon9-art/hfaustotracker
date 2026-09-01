import { NextRequest, NextResponse } from 'next/server';
import type { XiaomiS400Metrics } from '@/lib/types/xiaomi';

// This is the system prompt used for the Vision-LLM
const VISION_PROMPT = `
You are an expert medical data extractor. Your task is to extract precise health metrics from a Xiaomi Mi Body Composition Scale S400 report.

EXTRACT EXACTLY THESE 14 FIELDS:
1. Weight (kg)
2. BMI
3. Body Fat %
4. Muscle Mass (kg)
5. Muscle %
6. Body Water %
7. Protein %
8. Bone Mineral %
9. Skeletal Muscle Mass (kg)
10. Visceral Fat Rating (CRITICAL)
11. Basal Metabolic Rate (Kcal)
12. Waist-to-hip ratio
13. Body Age
14. Fat-free body weight

OUTPUT FORMAT:
Return ONLY a valid JSON object. Do not include markdown formatting, no preamble, no explanation.
Example:
{
  "weight": 85.5,
  "bmi": 26.4,
  "bodyFatPercentage": 22.1,
  "muscleMass": 65.2,
  "musclePercentage": 76.2,
  "bodyWaterPercentage": 55.4,
  "proteinPercentage": 16.8,
  "boneMineralPercentage": 3.2,
  "skeletalMuscleMass": 52.1,
  "visceralFatRating": 9,
  "basalMetabolicRate": 1850,
  "waistToHipRatio": 0.92,
  "bodyAge": 32,
  "fatFreeBodyWeight": 63.4,
  "timestamp": "2026-08-31T10:00:00Z"
}
`;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    // 1. Convert PDF/Image to Base64 (Implementation depends on the library used, e.g., 'pdf-img-convert')
    const bytes = await file.arrayBuffer();
    const base64File = Buffer.from(bytes).toString('base64');

    // 2. Call Vision-LLM API (Example using Claude API)
    // const response = await callVisionLLM(base64File, VISION_PROMPT);

    // Mocking the LLM response for the architectural demo
    const mockData: XiaomiS400Metrics = {
      weight: 86.2, // Slightly increased
      bmi: 26.6,
      body_fat_percentage: 23.1,
      muscle_mass: 67.8,
      muscle_percentage: 75.9,
      body_water_percentage: 54.8,
      protein_percentage: 16.5,
      bone_mineral_percentage: 3.1,
      skeletal_muscle_mass: 51.5,
      visceral_fat_rating: 11, // Increased - TRIGGER SARGENT
      basal_metabolic_rate: 1820,
      waist_to_hip_ratio: 0.94,
      body_age: 35,
      fat_free_body_weight: 63.1,
      timestamp: new Date().toISOString(),
    };

    // 3. Sargent Logic: Compare with previous data
    const sargentMessage = evaluateSargentReaction(mockData);

    return NextResponse.json({
      success: true,
      data: mockData,
      sargentReaction: sargentMessage,
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

function evaluateSargentReaction(current: XiaomiS400Metrics): string {
  // In real implementation, we'd fetch the previous record from PostgreSQL
  const previousVisceralFat = 9;

  if (current.visceral_fat_rating > previousVisceralFat) {
    return "¡¿QUÉ ES ESTO?! ¡TU GRASA VISCERAL HA SUBIDO! ¡ESTÁS MATANDO TU CORAZÓN, PEDAZO de VAGO! ¡A CORRER 10K AHORA MISMO O NO VOLVERÁS A VER UN CARBOHIDRATO EN UN MES!";
  }

  if (current.weight > 86) {
    return "¡EL PESO HA SUBIDO! ¡¿ACASO ESTÁS COMIENDO PIZZA MIENTRAS DUERMES?! ¡VUELVE AL DÉFICIT CALÓRICO YA!";
  }

  return "Has logrado mantenerte, pero no te emociones. El camino es largo y el entrenamiento es duro. ¡Sigue moviéndote!";
}
