-- Fix time column: change from interval to text to match production
-- and add CHECK constraint for H:MM:SS format

ALTER TABLE public.workouts
  ALTER COLUMN time TYPE text
  USING CASE
    WHEN time IS NULL THEN NULL
    ELSE EXTRACT(HOUR FROM time)::int || ':' ||
         LPAD(EXTRACT(MINUTE FROM time)::int::text, 2, '0') || ':' ||
         LPAD(EXTRACT(SECOND FROM time)::int::text, 2, '0')
  END;

ALTER TABLE public.workouts
  ADD CONSTRAINT workouts_time_check
  CHECK ((time IS NULL) OR (time ~ '^[0-9]+:[0-5][0-9]:[0-5][0-9]$'));
