import type { XiaomiS400Metrics } from './xiaomi';

export type Sex = 'male' | 'female';

export interface Profile {
  id: string;
  age: number;
  sex: Sex;
  height_cm: number;
  goal_weight: number; // kg
  created_at: string;
  updated_at: string;
}

/** Full row shape of the `measurements` table (snake_case columns). */
export interface MeasurementRecord extends XiaomiS400Metrics {
  id: string;
  photo_url: string | null;
  measured_at: string; // ISO date
  created_at: string;
}

/** The numeric fields the user edits when loading a measurement. */
export type MeasurementFields = Omit<
  MeasurementRecord,
  'id' | 'photo_url' | 'measured_at' | 'created_at'
>;

export interface Milestone {
  id: string;
  label: string;
  target_weight: number;
  position: number;
  achieved: boolean;
  achieved_at: string | null;
}

/** A fresh (not-yet-saved) measurement payload sent to Supabase. */
export interface MeasurementInput {
  measured_at: string;
  photo_url: string | null;
  weight: number;
  bmi: number;
  body_fat_percentage: number;
  muscle_mass: number;
  muscle_percentage: number;
  body_water_percentage: number;
  protein_percentage: number;
  bone_mineral_percentage: number;
  skeletal_muscle_mass: number;
  visceral_fat_rating: number;
  basal_metabolic_rate: number;
  waist_to_hip_ratio: number;
  body_age: number;
  fat_free_body_weight: number;
}
