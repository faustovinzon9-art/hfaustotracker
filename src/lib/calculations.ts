import type { MeasurementFields, Profile, Sex } from './types/models';

/** A measurement ready for progress math: the metric fields + its date. */
export type ProgressMeasurement = MeasurementFields & { measured_at: string };

/** Approximate adult healthy composition targets used as the goal for every
 *  parameter the user does not set manually. Tweak freely. */
function healthyTargets(sex: Sex) {
  return sex === 'male'
    ? { bodyFat: 15, visceralFat: 9, muscle: 45, water: 60, bone: 4 }
    : { bodyFat: 24, visceralFat: 9, muscle: 42, water: 58, bone: 4 };
}

export type CoreMetricKey =
  | 'weight'
  | 'bodyFat'
  | 'visceralFat'
  | 'muscle'
  | 'water'
  | 'bone';

interface MetricConfig {
  key: CoreMetricKey;
  label: string;
  shortLabel: string;
  unit: string;
  field: keyof MeasurementFields;
  direction: 'down' | 'up'; // 'down' => lower is better
  weight: number; // share in the combined progress (sums to 1)
  decimals: number;
  getTarget: (profile: Profile) => number;
}

export const CORE_METRICS: MetricConfig[] = [
  {
    key: 'weight',
    label: 'Peso',
    shortLabel: 'Peso',
    unit: 'kg',
    field: 'weight',
    direction: 'down',
    weight: 0.3,
    decimals: 1,
    getTarget: (p) => p.goal_weight,
  },
  {
    key: 'bodyFat',
    label: 'Grasa corporal',
    shortLabel: 'Grasa',
    unit: '%',
    field: 'body_fat_percentage',
    direction: 'down',
    weight: 0.2,
    decimals: 1,
    getTarget: (p) => healthyTargets(p.sex).bodyFat,
  },
  {
    key: 'muscle',
    label: 'Masa muscular',
    shortLabel: 'Músculo',
    unit: '%',
    field: 'muscle_percentage',
    direction: 'up',
    weight: 0.15,
    decimals: 1,
    getTarget: (p) => healthyTargets(p.sex).muscle,
  },
  {
    key: 'visceralFat',
    label: 'Grasa visceral',
    shortLabel: 'Visceral',
    unit: '',
    field: 'visceral_fat_rating',
    direction: 'down',
    weight: 0.15,
    decimals: 0,
    getTarget: () => healthyTargets('male').visceralFat,
  },
  {
    key: 'water',
    label: 'Agua corporal',
    shortLabel: 'Agua',
    unit: '%',
    field: 'body_water_percentage',
    direction: 'up',
    weight: 0.12,
    decimals: 1,
    getTarget: (p) => healthyTargets(p.sex).water,
  },
  {
    key: 'bone',
    label: 'Mineral óseo',
    shortLabel: 'Hueso',
    unit: '%',
    field: 'bone_mineral_percentage',
    direction: 'up',
    weight: 0.08,
    decimals: 1,
    getTarget: (p) => healthyTargets(p.sex).bone,
  },
];

const TOTAL_WEIGHT = CORE_METRICS.reduce((s, m) => s + m.weight, 0);

function clamp(v: number, lo = 0, hi = 1) {
  return Math.min(Math.max(v, lo), hi);
}

/** 0..1 progress for one metric relative to its own start value. */
function metricProgress(
  config: MetricConfig,
  startValue: number,
  currentValue: number,
  targetValue: number
): number {
  if (!Number.isFinite(startValue) || !Number.isFinite(currentValue)) {
    return 0;
  }
  if (startValue === targetValue) return 1;
  if (config.direction === 'down') {
    if (currentValue <= targetValue) return 1;
    if (startValue <= targetValue) return 1;
    return clamp((startValue - currentValue) / (startValue - targetValue));
  }
  // up
  if (currentValue >= targetValue) return 1;
  if (startValue >= targetValue) return 1;
  return clamp((currentValue - startValue) / (targetValue - startValue));
}

export interface MetricProgress {
  key: CoreMetricKey;
  label: string;
  shortLabel: string;
  unit: string;
  decimals: number;
  current: number | null;
  start: number | null;
  target: number;
  progress: number; // 0..1
  min: number; // for the gauge scale
  max: number;
}

export interface OverallProgress {
  overall: number; // 0..100
  metrics: MetricProgress[];
}

/** Everything is measured from the very first measurement (the starting point). */
export const getStartMeasurement = <T extends { measured_at: string }>(
  measurements: T[]
): T | null => {
  if (measurements.length === 0) return null;
  return [...measurements].sort(
    (a, b) =>
      new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime()
  )[0];
};

export const getLatestMeasurement = <T extends { measured_at: string }>(
  measurements: T[]
): T | null => {
  if (measurements.length === 0) return null;
  return [...measurements].sort(
    (a, b) =>
      new Date(b.measured_at).getTime() - new Date(a.measured_at).getTime()
  )[0];
};

export function computeOverallProgress(
  profile: Profile,
  measurements: ProgressMeasurement[]
): OverallProgress | null {
  const start = measurements.length ? measurements[0] : null;
  const current = getLatestMeasurement(measurements);
  if (!start || !current) return null;

  const metrics: MetricProgress[] = CORE_METRICS.map((cfg) => {
    const target = cfg.getTarget(profile);
    const startValue = Number(start[cfg.field]);
    const currentValue = Number(current[cfg.field]);
    const progress = metricProgress(cfg, startValue, currentValue, target);

    let min = target;
    let max = startValue;
    if (cfg.direction === 'up') {
      min = startValue;
      max = Math.max(target, startValue);
    } else {
      min = Math.min(target, startValue);
      max = Math.max(target, startValue);
    }
    if (min === max) {
      min = target - 1;
      max = target + 1;
    }

    return {
      key: cfg.key,
      label: cfg.label,
      shortLabel: cfg.shortLabel,
      unit: cfg.unit,
      decimals: cfg.decimals,
      current: Number.isFinite(currentValue) ? currentValue : null,
      start: Number.isFinite(startValue) ? startValue : null,
      target,
      progress,
      min,
      max,
    };
  });

  const overall =
    metrics.reduce((acc, m) => acc + m.progress * CORE_METRICS.find((c) => c.key === m.key)!.weight, 0) /
    TOTAL_WEIGHT;

  return { overall: Math.round(overall * 1000) / 10, metrics };
}

function linearSlope(points: { t: number; v: number }[]): number {
  const n = points.length;
  if (n < 2) return NaN;
  let sumT = 0;
  let sumV = 0;
  let sumTT = 0;
  let sumTV = 0;
  for (const p of points) {
    sumT += p.t;
    sumV += p.v;
    sumTT += p.t * p.t;
    sumTV += p.t * p.v;
  }
  const denom = n * sumTT - sumT * sumT;
  if (Math.abs(denom) < 1e-9) return NaN;
  return (n * sumTV - sumT * sumV) / denom;
}

export interface EtaResult {
  etaDate: string; // ISO
  daysRemaining: number;
  trendKgPerWeek: number; // signed
  remainingKg: number;
  limitingMetricKey: CoreMetricKey | null;
  limitingProgress: number | null;
}

/**
 * Projects the date the user reaches the goal weight by extrapolating the
 * weight trend of the last up-to-7 measurements. Because it also reports the
 * slowest-progressing *other* metric, it effectively uses many metrics to
 * signal what is holding progress back. Returns null until there are at least
 * two measurements or weight is no longer trending down.
 */
export function computeEta(
  profile: Profile,
  measurements: ProgressMeasurement[]
): EtaResult | null {
  const sorted = [...measurements].sort(
    (a, b) =>
      new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime()
  );
  if (sorted.length < 2) return null;

  const weightSeries = sorted
    .slice(-7)
    .map((m) => ({ t: new Date(m.measured_at).getTime(), v: Number(m.weight) }));

  const slope = linearSlope(weightSeries); // kg per ms
  const trendKgPerWeek = slope * 7 * 24 * 3600 * 1000;

  if (!Number.isFinite(slope) || Math.abs(slope) < 1e-9 || slope >= 0) {
    return null; // not losing weight (or flat) → cannot project reliably
  }

  const currentWeight = weightSeries[weightSeries.length - 1].v;
  const remainingKg = currentWeight - profile.goal_weight;
  if (remainingKg <= 0) {
    return {
      etaDate: new Date().toISOString(),
      daysRemaining: 0,
      trendKgPerWeek,
      remainingKg: 0,
      limitingMetricKey: null,
      limitingProgress: null,
    };
  }

  const daysRemaining = Math.ceil(remainingKg / Math.abs(trendKgPerWeek) / 7);
  const etaDate = new Date(Date.now() + daysRemaining * 86400000).toISOString();

  // Slowest non-weight metric, as a hint of what is dragging behind.
  const progress = computeOverallProgress(profile, measurements);
  let limitingMetricKey: CoreMetricKey | null = null;
  let limitingProgress: number | null = null;
  if (progress) {
    const others = progress.metrics.filter((m) => m.key !== 'weight');
    let lowest: (typeof others)[number] | null = null;
    for (const m of others) {
      if (m.progress < 1 && (!lowest || m.progress < lowest.progress)) {
        lowest = m;
      }
    }
    if (lowest) {
      limitingMetricKey = lowest.key;
      limitingProgress = Math.round(lowest.progress * 100);
    }
  }

  return {
    etaDate,
    daysRemaining,
    trendKgPerWeek,
    remainingKg,
    limitingMetricKey,
    limitingProgress,
  };
}

export interface MilestoneDef {
  label: string;
  target_weight: number;
  position: number;
}

/** Returns weight milestones descending from start to goal, separated by `step`. */
export function generateMilestones(
  startWeight: number,
  goalWeight: number,
  step = 5
): MilestoneDef[] {
  const out: MilestoneDef[] = [];
  if (!Number.isFinite(startWeight) || !Number.isFinite(goalWeight)) return out;
  if (startWeight <= goalWeight) {
    out.push({ label: `${goalWeight} kg`, target_weight: goalWeight, position: 0 });
    return out;
  }
  let current = startWeight;
  let pos = 0;
  while (current - step >= goalWeight - 1e-9) {
    current = current - step;
    out.push({ label: `${current} kg`, target_weight: current, position: pos++ });
  }
  // ensure the final goal is present
  if (!out.some((m) => Math.abs(m.target_weight - goalWeight) < 1e-9)) {
    out.push({ label: `${goalWeight} kg`, target_weight: goalWeight, position: pos });
  }
  return out;
}

export function formatEtaDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatKg(value: number | null, decimals = 1): string {
  if (value == null || !Number.isFinite(value)) return '—';
  return `${value.toFixed(decimals)} kg`;
}
