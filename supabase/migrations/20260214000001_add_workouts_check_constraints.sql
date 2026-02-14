-- Add CHECK constraints for non-negative values on workouts table
-- These constraints already exist in production; migration is meant to sync
-- local with prod.
--
alter table public.workouts
  add constraint workouts_weight_check
  check (weight is null or weight >= 0);
--
alter table public.workouts
  add constraint workouts_reps_check
  check (reps is null or reps >= 0);
--
alter table public.workouts
  add constraint workouts_distance_check
  check (distance is null or distance >= 0);