import { getSupabaseClient } from './client';
import type {
  CustomAchievement,
  Habit,
  HabitLog,
  MeasurementInput,
  MeasurementRecord,
  Milestone,
  Profile,
  ProgressPhoto,
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

/** Wipes every row across all tables (used by "Reiniciar la app"). */
export async function resetAllData(): Promise<void> {
  const supabase = getSupabaseClient();
  const tables = [
    'habit_logs',
    'habits',
    'progress_photos',
    'custom_achievements',
    'measurements',
    'milestones',
    'profiles',
  ];
  for (const t of tables) {
    const { error } = await supabase.from(t).delete().gte('created_at', '1970-01-01');
    if (error && error.code !== 'PGRST116') throw error;
  }
}

// ---- Habits ---------------------------------------------------------------
const HABITS = 'habits';
const HABIT_LOGS = 'habit_logs';
const PROGRESS_PHOTOS = 'progress_photos';
const CUSTOM_ACHIEVEMENTS = 'custom_achievements';

export async function getHabits(): Promise<Habit[]> {
  try {
    const { data, error } = await getSupabaseClient()
      .from(HABITS)
      .select('*')
      .order('position', { ascending: true });
    if (error) throw error;
    return (data as Habit[]) ?? [];
  } catch {
    return [];
  }
}

export async function createHabit(habit: Pick<Habit, 'name' | 'icon' | 'color'>): Promise<Habit> {
  const { data, error } = await getSupabaseClient()
    .from(HABITS)
    .insert(habit)
    .select()
    .single();
  if (error) throw error;
  return data as Habit;
}

export async function updateHabit(id: string, patch: Partial<Habit>): Promise<void> {
  const { error } = await getSupabaseClient().from(HABITS).update(patch).eq('id', id);
  if (error) throw error;
}

export async function deleteHabit(id: string): Promise<void> {
  const { error } = await getSupabaseClient().from(HABITS).delete().eq('id', id);
  if (error) throw error;
}

export async function getHabitLogs(): Promise<HabitLog[]> {
  try {
    const { data, error } = await getSupabaseClient().from(HABIT_LOGS).select('*');
    if (error) throw error;
    return (data as HabitLog[]) ?? [];
  } catch {
    return [];
  }
}

export async function setHabitLog(habitId: string, logDate: string, done: boolean): Promise<void> {
  const { error } = await getSupabaseClient()
    .from(HABIT_LOGS)
    .upsert({ habit_id: habitId, log_date: logDate, done }, { onConflict: 'habit_id,log_date' });
  if (error) throw error;
}

export async function deleteHabitLog(id: string): Promise<void> {
  const { error } = await getSupabaseClient().from(HABIT_LOGS).delete().eq('id', id);
  if (error) throw error;
}

// ---- Progress photos ------------------------------------------------------
const PROGRESS_PHOTO_BUCKET = 'progress-photos';

export async function getProgressPhotos(): Promise<ProgressPhoto[]> {
  try {
    const { data, error } = await getSupabaseClient()
      .from(PROGRESS_PHOTOS)
      .select('*')
      .order('taken_at', { ascending: false });
    if (error) throw error;
    return (data as ProgressPhoto[]) ?? [];
  } catch {
    return [];
  }
}

export async function uploadProgressPhoto(file: File, caption?: string): Promise<ProgressPhoto> {
  const supabase = getSupabaseClient();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `progress/${Date.now()}_${safeName}`;
  const { error: up } = await supabase.storage
    .from(PROGRESS_PHOTO_BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type });
  if (up) throw up;
  const { data } = supabase.storage.from(PROGRESS_PHOTO_BUCKET).getPublicUrl(path);
  const photo_url = data.publicUrl;
  const { data: rec, error } = await supabase
    .from(PROGRESS_PHOTOS)
    .insert({ photo_url, caption: caption ?? null, taken_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return rec as ProgressPhoto;
}

export async function deleteProgressPhoto(id: string): Promise<void> {
  const { error } = await getSupabaseClient().from(PROGRESS_PHOTOS).delete().eq('id', id);
  if (error) throw error;
}

// ---- Custom achievements --------------------------------------------------
export async function getCustomAchievements(): Promise<CustomAchievement[]> {
  try {
    const { data, error } = await getSupabaseClient()
      .from(CUSTOM_ACHIEVEMENTS)
      .select('*')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data as CustomAchievement[]) ?? [];
  } catch {
    return [];
  }
}

export async function createCustomAchievement(
  a: Pick<CustomAchievement, 'name' | 'icon' | 'description'>
): Promise<CustomAchievement> {
  const { data, error } = await getSupabaseClient()
    .from(CUSTOM_ACHIEVEMENTS)
    .insert({ name: a.name, icon: a.icon ?? '🏆', description: a.description ?? null })
    .select()
    .single();
  if (error) throw error;
  return data as CustomAchievement;
}

export async function toggleCustomAchievement(id: string, achieved: boolean): Promise<void> {
  const { error } = await getSupabaseClient()
    .from(CUSTOM_ACHIEVEMENTS)
    .update({ achieved, achieved_at: achieved ? new Date().toISOString() : null })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteCustomAchievement(id: string): Promise<void> {
  const { error } = await getSupabaseClient().from(CUSTOM_ACHIEVEMENTS).delete().eq('id', id);
  if (error) throw error;
}
