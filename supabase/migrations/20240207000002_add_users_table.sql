-- Create users table
create table public.users (
  id bigint primary key generated always as identity,
  auth_user_id uuid references auth.users(id) on delete cascade unique not null,
  first_name text,
  last_name text,
  role text not null default 'user' check (role in ('dev', 'user', 'demo')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add user_id column to workouts table
alter table public.workouts add column user_id bigint references public.users(id) on delete cascade;

-- Add user_id column to comments table
alter table public.comments add column user_id bigint references public.users(id) on delete cascade;

-- Enable RLS on users table
alter table public.users enable row level security;

-- RLS Policies for users
create policy "Users can view their own profile"
  on public.users for select
  to authenticated
  using (auth.uid() = auth_user_id);

create policy "Users can update their own profile"
  on public.users for update
  to authenticated
  using (auth.uid() = auth_user_id);

-- Create indexes
create index users_auth_user_id_idx on public.users(auth_user_id);
create index workouts_user_id_idx on public.workouts(user_id);
create index comments_user_id_idx on public.comments(user_id);

-- Drop old policies for workouts
drop policy if exists "Authenticated users can select workouts" on public.workouts;
drop policy if exists "Authenticated users can insert workouts" on public.workouts;
drop policy if exists "Authenticated users can update workouts" on public.workouts;
drop policy if exists "Authenticated users can delete workouts" on public.workouts;

-- Drop old policies for comments
drop policy if exists "Authenticated users can select comments" on public.comments;
drop policy if exists "Authenticated users can insert comments" on public.comments;
drop policy if exists "Authenticated users can update comments" on public.comments;
drop policy if exists "Authenticated users can delete comments" on public.comments;

-- Helper function to check if user is dev
create or replace function public.is_dev()
returns boolean as $$
  select exists (
    select 1 from public.users
    where auth_user_id = auth.uid()
    and role = 'dev'
  );
$$ language sql security definer;

-- Helper function to check if user owns the record
create or replace function public.is_owner(record_user_id bigint)
returns boolean as $$
  select exists (
    select 1 from public.users
    where auth_user_id = auth.uid()
    and id = record_user_id
  );
$$ language sql security definer;

-- New RLS Policies for workouts
create policy "Any authenticated user can select workouts"
  on public.workouts for select
  to authenticated
  using (true);

create policy "Users can insert their own workouts, devs can insert any"
  on public.workouts for insert
  to authenticated
  with check (
    is_dev() or is_owner(user_id)
  );

create policy "Users can update their own workouts, devs can update any"
  on public.workouts for update
  to authenticated
  using (
    is_dev() or is_owner(user_id)
  );

create policy "Users can delete their own workouts, devs can delete any"
  on public.workouts for delete
  to authenticated
  using (
    is_dev() or is_owner(user_id)
  );

-- New RLS Policies for comments
create policy "Any authenticated user can select comments"
  on public.comments for select
  to authenticated
  using (true);

create policy "Users can insert their own comments, devs can insert any"
  on public.comments for insert
  to authenticated
  with check (
    is_dev() or is_owner(user_id)
  );

create policy "Users can update their own comments, devs can update any"
  on public.comments for update
  to authenticated
  using (
    is_dev() or is_owner(user_id)
  );

create policy "Users can delete their own comments, devs can delete any"
  on public.comments for delete
  to authenticated
  using (
    is_dev() or is_owner(user_id)
  );

-- Function to automatically create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (auth_user_id, role)
  values (new.id, 'user');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create user profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
