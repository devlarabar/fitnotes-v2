-- Allow dev users to insert exercises

-- Create policy to allow dev users to insert exercises
create policy "Dev users can insert exercises"
  on public.exercises for insert
  to authenticated
  with check (public.is_dev());

-- Create policy to allow dev users to update exercises
create policy "Dev users can update exercises"
  on public.exercises for update
  to authenticated
  using (public.is_dev())
  with check (public.is_dev());
