import type { MeasurementFields, Milestone } from './types/models';

type Input = {
  current: MeasurementFields | null;
  previous: MeasurementFields | null;
  progressPercent: number | null; // combined 0..100
  justReachedMilestone?: Milestone | null;
  goalWeight: number;
};

/**
 * Returns the Sargento's reaction to the latest measurement. Spanish only.
 * The Sargento is intentionally aggressive but never mean beyond the joke.
 */
export function generateSargentMessage(input: Input): string {
  const { current, previous, progressPercent, justReachedMilestone, goalWeight } =
    input;

  if (justReachedMilestone) {
    return `¡OBJETIVO ${justReachedMilestone.label} ALCANZADO! 🎖️ ¡Lo lograste, soldado! Pero ESTO ES UNA GUERRA, no una victoria: hay más trincheras que conquistar. ¡Sigamos!`;
  }

  if (!current) {
    return '¡¿QUÉ ESTÁS ESPERANDO?! Subí tu primer reporte para que el Sargento empiece a sacarte la grasa. ¡MARCHA!';
  }

  const visceralHigh = current.visceral_fat_rating >= 10;
  const weightUp = previous != null && current.weight > previous.weight;
  const weightDown = previous != null && current.weight < previous.weight;

  if (visceralHigh) {
    return '¡TU GRASA VISCERAL ESTÁ EN ZONA DE ALERTA! Eso no se negocia: corazón primero. DEJÁ LA COMIDA CHATARRA Y ¡A MOVERTE YA!';
  }
  if (weightUp) {
    return `¡EL PESO SUBIÓ! De ${previous?.weight ?? '?'} a ${current.weight} kg. ¿¿Comiendo pizza mientras dormís?? ¡Vuelve al déficit calórico ANTES de que esto se convierta en un desastre!`;
  }
  if (weightDown && progressPercent != null && progressPercent > 60) {
    return `¡El peso bajó a ${current.weight} kg y ya vas por ${progressPercent.toFixed(0)}% del objetivo! ¡Estás en llamas, soldado! NO BAJES LA GUARDIA.`;
  }
  if (weightDown) {
    return `De "${previous?.weight}" a ${current.weight} kg. Bien, bien... pero el peso es SOLO UNO de mis parámetros. La grasa y el músculo cuentan igual. ¡A seguir!`;
  }
  return `Has logrado mantenerte en ${current.weight} kg. El camino es largo y el entrenamiento es duro. Recuerda que apuntamos a ${goalWeight} kg — ¡NO TE RELAJES!`;
}
