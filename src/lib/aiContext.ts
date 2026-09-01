import type { Habit, MeasurementRecord, Profile } from './types/models';

export function buildAIContext(
  profile: Profile,
  measurements: MeasurementRecord[],
  habits: Habit[]
): string {
  const latest = measurements[measurements.length - 1];
  const first = measurements[0];
  const lines: string[] = [];
  lines.push(
    `Perfil: ${profile.sex === 'male' ? 'hombre' : 'mujer'}, ${profile.age} años, ${
      profile.height_cm
    } cm, meta de peso ${profile.goal_weight} kg.`
  );
  lines.push(`Mediciones registradas: ${measurements.length}.`);
  if (first && latest) {
    lines.push(
      `Inicio: ${first.weight} kg (${new Date(first.measured_at).toLocaleDateString('es-AR')}).`
    );
    lines.push(
      `Última: ${latest.weight} kg, grasa ${latest.body_fat_percentage}%, visceral ${latest.visceral_fat_rating}, músculo ${latest.muscle_percentage}%, agua ${latest.body_water_percentage}%.`
    );
    const g = Math.round(latest.visceral_fat_rating) >= 10;
    lines.push(g ? 'Visceral en zona de alerta.' : 'Visceral en zona aceptable.');
  }
  if (habits.length) {
    lines.push(`Hábitos: ${habits.map((h) => h.icon + ' ' + h.name).join(', ')}.`);
  }
  return lines.join('\n');
}
