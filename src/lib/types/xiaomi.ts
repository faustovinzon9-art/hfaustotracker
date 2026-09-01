/**
 * Domain types for the Xiaomi Mi Body Composition Scale S400 report.
 *
 * NOTE: field names are snake_case to match the Supabase `measurements` table
 * exactly, so the client can map rows 1:1 with no transform.
 */

export interface XiaomiS400Metrics {
  weight: number; // Peso (kg)
  bmi: number; // IMC
  body_fat_percentage: number; // % grasa corporal
  muscle_mass: number; // Masa muscular (kg)
  muscle_percentage: number; // % músculo
  body_water_percentage: number; // % agua corporal
  protein_percentage: number; // % proteína
  bone_mineral_percentage: number; // % mineral óseo
  skeletal_muscle_mass: number; // Masa muscular esquelética
  visceral_fat_rating: number; // Grasa visceral (CRITICAL)
  basal_metabolic_rate: number; // Metabolismo basal (kcal)
  waist_to_hip_ratio: number; // Relación cintura-cadera
  body_age: number; // Edad corporal
  fat_free_body_weight: number; // Peso libre de grasa
  timestamp: string; // Fecha de la medición
}

export interface ParserResponse {
  success: boolean;
  data: XiaomiS400Metrics | null;
  error?: string;
  sargentReaction?: string;
}
