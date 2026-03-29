-- Allow trainers to read their trainee's user profile.
-- Without this, user-context can't fetch the trainee when a trainer logs in.
create policy "Trainers can view their trainee profile"
  on public.users for select
  to authenticated
  using (is_trainer_for_user(id));
