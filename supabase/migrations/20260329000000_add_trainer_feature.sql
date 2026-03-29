-- Add 'trainer' to the users role constraint
alter table public.users drop constraint if exists users_role_check;
alter table public.users
  add constraint users_role_check
  check (role in ('dev', 'user', 'demo', 'trainer'));

-- trainer_relationships: 1:1 enforced — each user can only be
-- trainer or trainee in one relationship at a time
create table public.trainer_relationships (
  id bigint primary key generated always as identity,
  trainer_id bigint references public.users(id) on delete cascade not null,
  trainee_id bigint references public.users(id) on delete cascade not null,
  created_at timestamp with time zone default now() not null,
  constraint trainer_relationships_trainer_unique unique (trainer_id),
  constraint trainer_relationships_trainee_unique unique (trainee_id)
);

-- trainer_day_access: trainee grants per-day write access to their trainer
create table public.trainer_day_access (
  id bigint primary key generated always as identity,
  trainee_id bigint references public.users(id) on delete cascade not null,
  date date not null,
  created_at timestamp with time zone default now() not null,
  constraint trainer_day_access_unique unique (trainee_id, date)
);

alter table public.trainer_relationships enable row level security;
alter table public.trainer_day_access enable row level security;

-- Devs can view all users (needed for dev page management)
drop policy if exists "Users can view their own profile" on public.users;
create policy "Users can view own profile, devs can view all"
  on public.users for select
  to authenticated
  using (auth.uid() = auth_user_id or is_dev());

-- Devs can update any user (for role assignment)
create policy "Devs can update any user"
  on public.users for update
  to authenticated
  using (is_dev())
  with check (is_dev());

-- trainer_relationships: parties can read their own relationship
create policy "Participants can view their trainer relationship"
  on public.trainer_relationships for select
  to authenticated
  using (
    exists (
      select 1 from public.users
      where auth_user_id = auth.uid()
      and (id = trainer_id or id = trainee_id)
    )
  );

create policy "Devs can insert trainer relationships"
  on public.trainer_relationships for insert
  to authenticated
  with check (is_dev());

create policy "Devs can delete trainer relationships"
  on public.trainer_relationships for delete
  to authenticated
  using (is_dev());

-- trainer_day_access: trainee manages; both parties can read
create policy "Trainee and trainer can view day access"
  on public.trainer_day_access for select
  to authenticated
  using (
    exists (
      select 1 from public.users u
      where u.auth_user_id = auth.uid()
      and (
        u.id = trainee_id
        or exists (
          select 1 from public.trainer_relationships tr
          where tr.trainer_id = u.id
          and tr.trainee_id = trainer_day_access.trainee_id
        )
      )
    )
  );

create policy "Trainee can insert day access"
  on public.trainer_day_access for insert
  to authenticated
  with check (
    exists (
      select 1 from public.users
      where auth_user_id = auth.uid() and id = trainee_id
    )
  );

create policy "Trainee can delete day access"
  on public.trainer_day_access for delete
  to authenticated
  using (
    exists (
      select 1 from public.users
      where auth_user_id = auth.uid() and id = trainee_id
    )
  );

-- Helper: current user is a trainer assigned to record_user_id
create or replace function public.is_trainer_for_user(record_user_id bigint)
returns boolean as $$
  select exists (
    select 1 from public.users u
    join public.trainer_relationships tr on tr.trainer_id = u.id
    where u.auth_user_id = auth.uid()
    and tr.trainee_id = record_user_id
  );
$$ language sql security definer stable;

-- Helper: current user is a trainer with day-level write access
create or replace function public.is_trainer_for_user_on_date(
  record_user_id bigint,
  record_date date
) returns boolean as $$
  select exists (
    select 1 from public.users u
    join public.trainer_relationships tr on tr.trainer_id = u.id
    join public.trainer_day_access tda
      on tda.trainee_id = tr.trainee_id
      and tda.date = record_date
    where u.auth_user_id = auth.uid()
    and tr.trainee_id = record_user_id
  );
$$ language sql security definer stable;

-- Dev page helper: list all users with their auth email (dev-only)
create or replace function public.list_all_users_for_dev()
returns table (
  id bigint,
  auth_user_id uuid,
  first_name text,
  last_name text,
  role text,
  email text
) as $$
  select u.id, u.auth_user_id, u.first_name, u.last_name, u.role, au.email
  from public.users u
  join auth.users au on au.id = u.auth_user_id
  where exists (
    select 1 from public.users requester
    where requester.auth_user_id = auth.uid()
    and requester.role = 'dev'
  )
  order by u.id;
$$ language sql security definer stable;

-- Update workouts SELECT: restrict to owner, assigned trainer, or dev
drop policy if exists "Any authenticated user can select workouts" on public.workouts;
create policy "Users, trainers, and devs can select workouts"
  on public.workouts for select
  to authenticated
  using (
    is_dev() or is_owner(user_id) or is_trainer_for_user(user_id)
  );

-- Update workouts INSERT
drop policy if exists "Users can insert their own workouts, devs can insert any"
  on public.workouts;
create policy "Users, authorized trainers, and devs can insert workouts"
  on public.workouts for insert
  to authenticated
  with check (
    is_dev() or is_owner(user_id) or is_trainer_for_user_on_date(user_id, date)
  );

-- Update workouts UPDATE
drop policy if exists "Users can update their own workouts, devs can update any"
  on public.workouts;
create policy "Users, authorized trainers, and devs can update workouts"
  on public.workouts for update
  to authenticated
  using (
    is_dev() or is_owner(user_id) or is_trainer_for_user_on_date(user_id, date)
  )
  with check (
    is_dev() or is_owner(user_id) or is_trainer_for_user_on_date(user_id, date)
  );

-- Update workouts DELETE
drop policy if exists "Users can delete their own workouts, devs can delete any"
  on public.workouts;
create policy "Users, authorized trainers, and devs can delete workouts"
  on public.workouts for delete
  to authenticated
  using (
    is_dev() or is_owner(user_id) or is_trainer_for_user_on_date(user_id, date)
  );

-- Update comments SELECT
drop policy if exists "Any authenticated user can select comments" on public.comments;
create policy "Users, trainers, and devs can select comments"
  on public.comments for select
  to authenticated
  using (
    is_dev() or is_owner(user_id) or is_trainer_for_user(user_id)
  );

-- Update comments INSERT
drop policy if exists "Users can insert their own comments, devs can insert any"
  on public.comments;
create policy "Users, authorized trainers, and devs can insert comments"
  on public.comments for insert
  to authenticated
  with check (
    is_dev() or is_owner(user_id) or is_trainer_for_user_on_date(user_id, date)
  );

-- Update comments UPDATE
drop policy if exists "Users can update their own comments, devs can update any"
  on public.comments;
create policy "Users, authorized trainers, and devs can update comments"
  on public.comments for update
  to authenticated
  using (
    is_dev() or is_owner(user_id) or is_trainer_for_user_on_date(user_id, date)
  )
  with check (
    is_dev() or is_owner(user_id) or is_trainer_for_user_on_date(user_id, date)
  );

-- Update comments DELETE
drop policy if exists "Users can delete their own comments, devs can delete any"
  on public.comments;
create policy "Users, authorized trainers, and devs can delete comments"
  on public.comments for delete
  to authenticated
  using (
    is_dev() or is_owner(user_id) or is_trainer_for_user_on_date(user_id, date)
  );
