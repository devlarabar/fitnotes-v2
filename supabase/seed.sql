-- Seed data for FitNotes

-- Insert categories
insert into public.categories (name) values
  ('Abs'),
  ('Arms'),
  ('Back'),
  ('Cardio'),
  ('Chest'),
  ('Legs'),
  ('Shoulders');

-- Insert weight units
insert into public.weight_units (name) values
  ('kg'),
  ('lbs');

-- Insert distance units
insert into public.distance_units (name) values
  ('km'),
  ('mi'),
  ('m');

-- Insert measurement types
insert into public.measurement_types (name) values
  ('reps'),
  ('distance'),
  ('time');

-- Insert some common exercises (global, no user_id)
insert into public.exercises (name, category, measurement_type) values
  -- Chest
  ('Bench Press', 5, 1),
  ('Incline Bench Press', 5, 1),
  ('Dumbbell Fly', 5, 1),
  ('Push-ups', 5, 1),
  
  -- Back
  ('Deadlift', 3, 1),
  ('Pull-ups', 3, 1),
  ('Barbell Row', 3, 1),
  ('Lat Pulldown', 3, 1),
  
  -- Legs
  ('Squat', 6, 1),
  ('Leg Press', 6, 1),
  ('Lunges', 6, 1),
  ('Leg Curl', 6, 1),
  ('Calf Raise', 6, 1),
  
  -- Shoulders
  ('Overhead Press', 7, 1),
  ('Lateral Raise', 7, 1),
  ('Front Raise', 7, 1),
  
  -- Arms
  ('Bicep Curl', 2, 1),
  ('Hammer Curl', 2, 1),
  ('Tricep Extension', 2, 1),
  ('Tricep Dips', 2, 1),
  
  -- Abs
  ('Crunches', 1, 1),
  ('Plank', 1, 3),
  ('Russian Twist', 1, 1),
  
  -- Cardio
  ('Running', 4, 2),
  ('Cycling', 4, 2),
  ('Rowing', 4, 2);
