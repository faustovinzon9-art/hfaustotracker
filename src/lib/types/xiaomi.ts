/**
 * Shared domain types for the Xiaomi Mi Body Composition Scale S400 report.
 *
 * NOTE: This is the canonical copy of `packages/shared-types/xiaomi.ts`, vendored
 * inside the PWA so it is self-contained and deployable. The `@/` alias points to
 * `./src/`, so this is imported as `@/lib/types/xiaomi`.
 */

export interface XiaomiS400Metrics {
  weight: number;               // Peso (kg)
  bmi: number;                  // BMI
  bodyFatPercentage: number;    // Body Fat %
  muscleMass: number;           // Muscle Mass (kg)
  musclePercentage: number;     // Muscle %
  bodyWaterPercentage: number;  // Body Water %
  proteinPercentage: number;    // Protein %
  boneMineralPercentage: number;// Bone Mineral %
  skeletalMuscleMass: number;   // Skeletal Muscle Mass (kg)
  visceralFatRating: number;    // Visceral Fat Rating (CRITICAL)
  basalMetabolicRate: number;   // Basal Metabolic Rate (Kcal)
  waistToHipRatio: number;      // Waist-to-hip ratio
  bodyAge: number;              // Body Age
  fatFreeBodyWeight: number;    // Fat-free body weight
  timestamp: string;            // Date of measurement
}

export interface ParserResponse {
  success: boolean;
  data: XiaomiS400Metrics | null;
  error?: string;
  sargentReaction?: string;
}
