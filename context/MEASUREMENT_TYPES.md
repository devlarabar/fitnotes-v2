# Dynamic Measurement Types

The app now renders different input fields based on the exercise's measurement type from Supabase.

## How It Works

When you add an exercise to your workout, the `WorkoutLogger` component checks the exercise's `measurement_type` field and renders the appropriate inputs.

## Supported Measurement Types

The app detects the measurement type from the `measurement_types` table and renders appropriate inputs.

### 1. `reps` - Reps Only (Bodyweight)
**Example:** Pull-ups, Push-ups, Dips, Sit-ups

**Inputs:**
- Reps only

### 2. `distance` - Distance & Time
**Example:** Running, Cycling, Walking, Rowing

**Inputs:**
- Distance (with unit selector: km/miles/meters)
- Time (format: MM:SS)

### 3. `time` - Time Only
**Example:** Plank, Wall Sit, Swimming

**Inputs:**
- Time (format: MM:SS)

### 4. Default (no type or unknown) - Weight & Reps
**Example:** Bench Press, Squat, Deadlift, Curls

**Inputs:**
- Weight (with unit selector: kg/lbs)
- Reps

## Database Setup

Make sure your `measurement_types` table has these values:

```sql
INSERT INTO measurement_types (name) VALUES
  ('reps'),      -- Bodyweight exercises (reps only)
  ('distance'),  -- Cardio with distance and time
  ('time');      -- Time-based exercises only
```

Then assign the appropriate measurement type to each exercise:

```sql
-- Bodyweight exercises (reps only)
UPDATE exercises 
SET measurement_type = (SELECT id FROM measurement_types WHERE name = 'reps')
WHERE name IN ('Pull Up', 'Push Up', 'Sit Ups', 'Dips');

-- Distance-based cardio
UPDATE exercises 
SET measurement_type = (SELECT id FROM measurement_types WHERE name = 'distance')
WHERE name LIKE '%Running%' OR name LIKE '%Walking%' OR name LIKE '%Cycling%';

-- Time-based exercises
UPDATE exercises 
SET measurement_type = (SELECT id FROM measurement_types WHERE name = 'time')
WHERE name LIKE '%Plank%' OR name LIKE '%Wall Sit%' OR name LIKE '%Swimming%';

-- Weight & Reps exercises (leave measurement_type as NULL or don't set it)
-- These will use the default weight + reps inputs
```

## Unit Selection

- **Weight Units:** Fetched from `weight_units` table (kg, lbs)
- **Distance Units:** Fetched from `distance_units` table (km, miles, meters)
- Users can toggle between units for each set

## Data Storage

All measurements are stored in the `workouts` table with the appropriate fields:
- `weight` + `weight_unit` for weight exercises
- `distance` + `distance_unit` for distance exercises
- `time` for timed exercises
- `reps` for rep-based exercises

The app automatically saves the correct fields based on the measurement type.
