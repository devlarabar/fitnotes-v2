-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create categories table
create table public.categories (
  id bigint primary key generated always as identity,
  name text not null unique
);

-- Create weight_units table
create table public.weight_units (
  id bigint primary key generated always as identity,
  name text not null unique
);

-- Create distance_units table
create table public.distance_units (
  id bigint primary key generated always as identity,
  name text not null unique
);

-- Create measurement_types table
create table public.measurement_types (
  id bigint primary key generated always as identity,
  name text not null unique
);

-- Create exercises table
create table public.exercises (
  id bigint primary key generated always as identity,
  name text not null,
  category bigint references public.categories(id),
  measurement_type bigint references public.measurement_types(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create workouts table
create table public.workouts (
  id bigint primary key generated always as identity,
  date date not null,
  exercise bigint references public.exercises(id) on delete cascade,
  category bigint references public.categories(id),
  weight numeric,
  weight_unit bigint references public.weight_units(id),
  reps integer,
  distance numeric,
  distance_unit bigint references public.distance_units(id),
  time interval,
  comment text,
  is_pr boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create comments table
create table public.comments (
  id bigint primary key generated always as identity,
  date date not null unique,
  comment text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create settings table
create table public.settings (
  id bigint primary key generated always as identity,
  signups_enabled boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert default settings row
insert into public.settings (signups_enabled) values (false);

-- Enable Row Level Security (deny everything by default)
alter table public.categories enable row level security;
alter table public.weight_units enable row level security;
alter table public.distance_units enable row level security;
alter table public.measurement_types enable row level security;
alter table public.exercises enable row level security;
alter table public.workouts enable row level security;
alter table public.comments enable row level security;
alter table public.settings enable row level security;

-- Workouts: authenticated users can do everything
create policy "Authenticated users can select workouts"
  on public.workouts for select
  to authenticated
  using (true);

create policy "Authenticated users can insert workouts"
  on public.workouts for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update workouts"
  on public.workouts for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can delete workouts"
  on public.workouts for delete
  to authenticated
  using (true);

-- Comments: authenticated users can do everything
create policy "Authenticated users can select comments"
  on public.comments for select
  to authenticated
  using (true);

create policy "Authenticated users can insert comments"
  on public.comments for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update comments"
  on public.comments for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can delete comments"
  on public.comments for delete
  to authenticated
  using (true);

-- Reference tables: authenticated users can read (needed for dropdowns)
create policy "Authenticated users can select categories"
  on public.categories for select
  to authenticated
  using (true);

create policy "Authenticated users can select weight units"
  on public.weight_units for select
  to authenticated
  using (true);

create policy "Authenticated users can select distance units"
  on public.distance_units for select
  to authenticated
  using (true);

create policy "Authenticated users can select measurement types"
  on public.measurement_types for select
  to authenticated
  using (true);

create policy "Authenticated users can select exercises"
  on public.exercises for select
  to authenticated
  using (true);

create policy "Everyone can select settings"
  on public.settings for select
  using (true);

-- Create indexes for better performance
create index workouts_date_idx on public.workouts(date);
create index workouts_exercise_idx on public.workouts(exercise);
create index comments_date_idx on public.comments(date);
