import type { MeasurementInput } from './types/models';

export interface FieldDef {
  key: keyof MeasurementInput;
  label: string;
  unit: string;
}

export const FIELD_GROUPS: { title: string; fields: FieldDef[] }[] = [
  {
    title: 'Composición corporal',
    fields: [
      { key: 'weight', label: 'Peso', unit: 'kg' },
      { key: 'body_fat_percentage', label: 'Grasa corporal', unit: '%' },
      { key: 'muscle_percentage', label: 'Masa muscular', unit: '%' },
      { key: 'visceral_fat_rating', label: 'Grasa visceral', unit: '' },
      { key: 'body_water_percentage', label: 'Agua corporal', unit: '%' },
      { key: 'bone_mineral_percentage', label: 'Mineral óseo', unit: '%' },
    ],
  },
  {
    title: 'Detalle (opcional)',
    fields: [
      { key: 'bmi', label: 'IMC', unit: '' },
      { key: 'muscle_mass', label: 'Masa muscular (kg)', unit: 'kg' },
      { key: 'skeletal_muscle_mass', label: 'Músculo esquelético', unit: 'kg' },
      { key: 'protein_percentage', label: 'Proteína', unit: '%' },
      { key: 'basal_metabolic_rate', label: 'Metabolismo basal', unit: 'kcal' },
      { key: 'waist_to_hip_ratio', label: 'Cintura-cadera', unit: '' },
      { key: 'body_age', label: 'Edad corporal', unit: 'años' },
      { key: 'fat_free_body_weight', label: 'Peso libre de grasa', unit: 'kg' },
    ],
  },
];

export function emptyFieldValues(): Record<string, string> {
  const rec: Record<string, string> = {};
  FIELD_GROUPS.forEach((g) => g.fields.forEach((f) => (rec[f.key] = '')));
  return rec;
}

export function toNum(v: string): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
