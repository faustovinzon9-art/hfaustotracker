import { getSupabaseClient } from './client';
import type {
  MeasurementInput,
  MeasurementRecord,
  Milestone,
  Profile,
} from '../types/models';

const PROFILES = 'profiles';
const MEASUREMENTS = 'measurements';
const MILESTONES = 'milestones';
const PHOTO_BUCKET = 'measurement-photos';

export async function getProfile(): Promise<Profile | null> {
  const { data, error } = await getSupabaseClient()
    .from(PROFILES)
    .select('*')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data as Profile) ?? null;
}

/** Insert a new profile (single-user app). */
export async function insertProfile(profile: Omit<Profile, 'id' | 'created_at' | 'updated_at'>): Promise<Profile> {
  const { data, error } = await getSupabaseClient()
    .from(PROFILES)
    .insert({ ...profile, updated_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data as Profile;
}

export async function updateProfile(id: string, patch: Partial<Profile>): Promise<void> {
  const { error } = await getSupabaseClient()
    .from(PROFILES)
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function getMeasurements(): Promise<MeasurementRecord[]> {
  const { data, error } = await getSupabaseClient()
    .from(MEASUREMENTS)
    .select('*')
    .order('measured_at', { ascending: true });
  if (error) throw error;
  return (data as MeasurementRecord[]) ?? [];
}

export async function createMeasurement(
  input: MeasurementInput
): Promise<MeasurementRecord> {
  const { data, error } = await getSupabaseClient()
    .from(MEASUREMENTS)
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as MeasurementRecord;
}

export async function updateMeasurement(
  id: string,
  patch: Partial<MeasurementInput>
): Promise<void> {
  const { error } = await getSupabaseClient()
    .from(MEASUREMENTS)
    .update(patch)
    .eq('id', id);
  if (error) throw error;
}

export async function deleteMeasurement(id: string): Promise<void> {
  const { error } = await getSupabaseClient().from(MEASUREMENTS).delete().eq('id', id);
  if (error) throw error;
}

export async function getMilestones(): Promise<Milestone[]> {
  const { data, error } = await getSupabaseClient()
    .from(MILESTONES)
    .select('*')
    .order('position', { ascending: true });
  if (error) throw error;
  return (data as Milestone[]) ?? [];
}

export type MilestoneInput = Pick<
  Milestone,
  'label' | 'target_weight' | 'position' | 'achieved' | 'achieved_at'
>;

export const replaceMilestones = async (milestones: MilestoneInput[]): Promise<void> => {
  const supabase = getSupabaseClient();
  // clear then write fresh (keeps order consistent)
  const { error: del } = await supabase.from(MILESTONES).delete().gte('position', 0);
  if (del) throw del;
  const { error } = await supabase.from(MILESTONES).insert(milestones);
  if (error) throw error;
};

export async function markMilestonesAchieved(achievedIds: string[]): Promise<void> {
  const supabase = getSupabaseClient();
  for (const id of achievedIds) {
    await supabase
      .from(MILESTONES)
      .update({ achieved: true, achieved_at: new Date().toISOString() })
      .eq('id', id);
  }
}

export async function uploadPhoto(file: File): Promise<string> {
  const supabase = getSupabaseClient();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `measurements/${Date.now()}_${safeName}`;
  const { error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw error;
  const { data } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export const PHOTO_BUCKET_NAME = PHOTO_BUCKET;

/** Wipes every row across the three tables (used by "Reiniciar la app"). */
export async function resetAllData(): Promise<void> {
  const supabase = getSupabaseClient();
  const { error: e1 } = await supabase.from(MEASUREMENTS).delete().gte('created_at', '1970-01-01');
  if (e1) throw e1;
  const { error: e2 } = await supabase.from(MILESTONES).delete().gte('position', 0);
  if (e2) throw e2;
  const { error: e3 } = await supabase.from(PROFILES).delete().gte('created_at', '1970-01-01');
  if (e3) throw e3;
}
