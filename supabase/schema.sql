-- HFausto Tracker — Supabase schema
-- Run in the Supabase SQL Editor (or `supabase db push`) once.

-- Extensions -----------------------------------------------------------------
create extension if not exists pgcrypto;

-- Tables ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  age integer not null,
  sex text not null check (sex in ('male', 'female')),
  height_cm numeric not null,
  goal_weight numeric not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.measurements (
  id uuid primary key default gen_random_uuid(),
  measured_at timestamptz not null default now(),
  photo_url text,
  weight numeric not null,
  bmi numeric,
  body_fat_percentage numeric,
  muscle_mass numeric,
  muscle_percentage numeric,
  body_water_percentage numeric,
  protein_percentage numeric,
  bone_mineral_percentage numeric,
  skeletal_muscle_mass numeric,
  visceral_fat_rating numeric,
  basal_metabolic_rate numeric,
  waist_to_hip_ratio numeric,
  body_age numeric,
  fat_free_body_weight numeric,
  created_at timestamptz not null default now()
);

create table if not exists public.milestones (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  target_weight numeric not null,
  position integer not null,
  achieved boolean not null default false,
  achieved_at timestamptz
);

-- Row Level Security ---------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.measurements enable row level security;
alter table public.milestones enable row level security;

-- Single-user, no-login app: allow the anon role full access.
create policy "anon all on profiles" on public.profiles
  for all to anon using (true) with check (true);
create policy "anon all on measurements" on public.measurements
  for all to anon using (true) with check (true);
create policy "anon all on milestones" on public.milestones
  for all to anon using (true) with check (true);

-- Storage --------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('measurement-photos', 'measurement-photos', true)
on conflict (id) do nothing;

create policy "anon read measurement-photos" on storage.objects
  for select to anon using (bucket_id = 'measurement-photos');
create policy "anon insert measurement-photos" on storage.objects
  for insert to anon with check (bucket_id = 'measurement-photos');

-- New features: habits, photos, achievements ---------------------------------
create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text not null default '✅',
  color text not null default '#007AFF',
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits(id) on delete cascade,
  log_date date not null,
  done boolean not null default false,
  note text,
  created_at timestamptz not null default now(),
  unique (habit_id, log_date)
);

create table if not exists public.progress_photos (
  id uuid primary key default gen_random_uuid(),
  photo_url text not null,
  taken_at timestamptz not null default now(),
  caption text,
  created_at timestamptz not null default now()
);

create table if not exists public.custom_achievements (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text not null default '🏆',
  description text,
  achieved boolean not null default false,
  achieved_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;
alter table public.progress_photos enable row level security;
alter table public.custom_achievements enable row level security;

create policy "anon all on habits" on public.habits
  for all to anon using (true) with check (true);
create policy "anon all on habit_logs" on public.habit_logs
  for all to anon using (true) with check (true);
create policy "anon all on progress_photos" on public.progress_photos
  for all to anon using (true) with check (true);
create policy "anon all on custom_achievements" on public.custom_achievements
  for all to anon using (true) with check (true);

insert into storage.buckets (id, name, public)
values ('progress-photos', 'progress-photos', true)
on conflict (id) do nothing;
create policy "anon read progress-photos" on storage.objects
  for select to anon using (bucket_id = 'progress-photos');
create policy "anon insert progress-photos" on storage.objects
  for insert to anon with check (bucket_id = 'progress-photos');
