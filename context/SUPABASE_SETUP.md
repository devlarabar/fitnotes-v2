# Supabase Setup Guide

This app now uses Supabase as the backend database for storing workouts, exercises, and related data.

## Database Schema

The app expects the following tables in your Supabase database:

### Tables

1. **categories**
   - `id` (int, primary key)
   - `name` (text)

2. **weight_units**
   - `id` (int, primary key)
   - `name` (text) - e.g., "kg", "lbs"

3. **distance_units**
   - `id` (int, primary key)
   - `name` (text) - e.g., "km", "miles", "meters"

4. **measurement_types**
   - `id` (int, primary key)
   - `name` (text) - e.g., "Weight & Reps", "Distance & Time", "Time"

5. **exercises**
   - `id` (int, primary key)
   - `name` (text)
   - `category` (int, foreign key → categories.id)
   - `measurement_type` (int, foreign key → measurement_types.id, optional)

6. **workouts**
   - `id` (int, primary key, auto-increment)
   - `date` (date) - Format: YYYY-MM-DD
   - `exercise` (int, foreign key → exercises.id)
   - `category` (int, foreign key → categories.id)
   - `weight` (numeric, optional)
   - `weight_unit` (int, foreign key → weight_units.id, optional)
   - `reps` (int, optional)
   - `distance` (numeric, optional)
   - `distance_unit` (int, foreign key → distance_units.id, optional)
   - `time` (text, optional) - Format: HH:MM:SS
   - `comment` (text, optional)
   - `is_pr` (boolean, optional, default: false)

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the database to be provisioned

### 2. Create the Tables

Run the following SQL in your Supabase SQL Editor:

```sql
-- Create categories table
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- Create weight units table
CREATE TABLE weight_units (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- Create distance units table
CREATE TABLE distance_units (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- Create measurement types table
CREATE TABLE measurement_types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- Create exercises table
CREATE TABLE exercises (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category INTEGER REFERENCES categories(id),
  measurement_type INTEGER REFERENCES measurement_types(id)
);

-- Create workouts table
CREATE TABLE workouts (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  exercise INTEGER NOT NULL REFERENCES exercises(id),
  category INTEGER NOT NULL REFERENCES categories(id),
  weight NUMERIC,
  weight_unit INTEGER REFERENCES weight_units(id),
  reps INTEGER,
  distance NUMERIC,
  distance_unit INTEGER REFERENCES distance_units(id),
  time TEXT,
  comment TEXT,
  is_pr BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_workouts_date ON workouts(date DESC);
CREATE INDEX idx_workouts_exercise ON workouts(exercise);
CREATE INDEX idx_exercises_category ON exercises(category);
```

### 3. Seed Initial Data

```sql
-- Insert categories
INSERT INTO categories (name) VALUES
  ('Chest'),
  ('Back'),
  ('Legs'),
  ('Shoulders'),
  ('Arms'),
  ('Core'),
  ('Cardio');

-- Insert weight units
INSERT INTO weight_units (name) VALUES
  ('kg'),
  ('lbs');

-- Insert distance units
INSERT INTO distance_units (name) VALUES
  ('km'),
  ('miles'),
  ('meters');

-- Insert measurement types
INSERT INTO measurement_types (name) VALUES
  ('Weight & Reps'),
  ('Distance & Time'),
  ('Time Only'),
  ('Bodyweight');

-- Insert sample exercises
INSERT INTO exercises (name, category, measurement_type) VALUES
  ('Bench Press (Barbell)', 1, 1),
  ('Squat (High Bar)', 3, 1),
  ('Deadlift (Conventional)', 2, 1),
  ('Overhead Press (Barbell)', 4, 1),
  ('Pull Up', 2, 4),
  ('Bicep Curl (Dumbbell)', 5, 1),
  ('Tricep Extension (Cable)', 5, 1),
  ('Leg Press', 3, 1),
  ('Lat Pulldown (Cable)', 2, 1),
  ('Incline Bench Press (Dumbbell)', 1, 1),
  ('Running', 7, 2),
  ('Cycling', 7, 2),
  ('Plank', 6, 3);
```

### 4. Set Up Row Level Security (RLS)

For now, you can enable public access (for development):

```sql
-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE distance_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurement_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (development only)
CREATE POLICY "Allow public read access" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON weight_units FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON distance_units FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON measurement_types FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON exercises FOR SELECT USING (true);
CREATE POLICY "Allow public read/write access" ON workouts FOR ALL USING (true);
```

**Note:** For production, you should implement proper authentication and user-specific policies.

### 5. Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Get your Supabase credentials:
   - Go to your Supabase project settings
   - Navigate to API settings
   - Copy the Project URL and anon/public key

3. Update `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

### 6. Run the App

```bash
npm run dev
```

The app will now fetch exercises from Supabase and save workouts to the database!

## Features

- ✅ Exercises loaded from Supabase
- ✅ Workouts saved to Supabase
- ✅ History fetched from Supabase
- ✅ Current workout cached in localStorage
- ✅ Automatic grouping of sets by exercise and date

## Future Enhancements

- [ ] User authentication
- [ ] User-specific workouts
- [ ] Custom exercise creation
- [ ] PR (Personal Record) tracking
- [ ] Progress analytics from Supabase data
- [ ] Real-time updates with Supabase subscriptions
