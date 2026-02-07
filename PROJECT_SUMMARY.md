# FitNotes - Project Summary

## Overview
A modern workout tracking app built with Next.js 15, Supabase, and Tailwind CSS v4. Tracks exercises with different measurement types (weight/reps, distance/time, time-only).

## Tech Stack
- **Next.js 15** - App Router
- **Supabase** - PostgreSQL database backend
- **Tailwind CSS v4** - Styling with custom color classes
- **TypeScript** - Type safety
- **Motion** - Animations
- **Sonner** - Toast notifications
- **Radix UI** - Headless components

## Database Schema (Supabase)

All types defined in `app/lib/schema.ts`

### Tables
- `categories` - Exercise categories (Chest, Back, Legs, etc.)
- `exercises` - Exercise library with name, category, measurement_type
- `measurement_types` - Types: "reps", "distance", "time"
- `weight_units` - kg, lbs
- `distance_units` - km, miles, meters
- `workouts` - Individual sets with date, exercise, weight, reps, distance, time, etc.

### Key Points
- No `is_pr` column in workouts table
- Exercises have a `measurement_type` foreign key
- Workouts are individual sets, not grouped sessions
- Date format: YYYY-MM-DD

## App Structure

```
app/
├── components/
│   ├── workout/
│   │   ├── WorkoutPage.tsx          # Main workout view with day navigation
│   │   ├── DayNavigation.tsx        # Prev/Next day buttons
│   │   ├── DayWorkouts.tsx          # Shows workouts for a day
│   │   ├── ExerciseTracker.tsx      # Full-screen exercise tracking
│   │   └── ExerciseHistory.tsx      # Paginated history (20 per page)
│   ├── Calendar.tsx                 # Monthly calendar view
│   ├── WorkoutDayView.tsx           # Reusable day workout display with inline editing
│   ├── CategorySelector.tsx         # Category selection modal
│   ├── ExerciseSelectorWithSupabase.tsx  # Exercise selection for category
│   ├── SetInputs.tsx                # Reusable input component (DRY)
│   ├── Navigation.tsx               # Sidebar + MobileNav
│   ├── SettingsPage.tsx             # Settings view
│   └── ui/                          # UI components
├── hooks/
│   ├── useWorkout.ts                # Fetches exercises, categories, units, saves sets
│   └── useWorkoutHistory.ts         # Fetches workout history from Supabase
├── lib/
│   ├── schema.ts                    # Supabase types (source of truth)
│   ├── supabase.ts                  # Supabase client
│   └── utils.ts                     # cn() utility
├── page.tsx                         # Routes to workout/calendar/settings
├── layout.tsx                       # Root layout with Providers
└── globals.css                      # Tailwind + custom colors
```

## Key Features

### 1. Workout Tracking
- **Day-based view** with prev/next navigation
- **Category → Exercise** selection flow
- **Immediate save** to Supabase (no localStorage, no "Complete Session")
- Click exercise from list → Opens ExerciseTracker page
- Fill inputs → Click "Save Set" → Saves to Supabase instantly
- Back button returns to day view

### 2. Dynamic Inputs by Measurement Type
- **`distance`** → Distance + unit selector + Time
- **`time`** → Time only
- **`reps`** or default → Weight + unit selector + Reps

Logic in `SetInputs.tsx` - reused everywhere (DRY)

### 3. Exercise History
- ExerciseTracker has tabs: "Track Set" and "History"
- History shows past 20 sets per page with pagination
- Shows date, weight/reps, distance/time for each set

### 4. Calendar View
- Monthly calendar grid
- Days with workouts highlighted in violet with dumbbell icon
- Click day → Shows all workouts grouped by exercise
- Inline editing: click any set → Edit inputs → Save/Cancel
- Delete sets with trash icon (on hover)

### 5. Inline Editing
- Click any set in calendar or day view → Switches to edit mode
- Shows appropriate inputs based on measurement type
- Save (✓) or Cancel (✗) buttons
- Updates Supabase immediately
- Delete button on hover

### 6. Empty States
- Pretty dashed border card with "Browse Exercises" button
- Shows when no workouts for the day
- "+" button always available when workouts exist

## Data Flow

### Adding a Workout
1. Click "Browse Exercises" or "+" button
2. Select category
3. Select exercise → Opens ExerciseTracker
4. Fill in set values
5. Click "Save Set" → Saves to Supabase immediately
6. Form resets with last values for next set
7. Click back arrow when done

### Editing a Workout
1. Navigate to any day (calendar or day view)
2. Click any set → Switches to edit mode
3. Modify values
4. Click ✓ to save or ✗ to cancel
5. Updates Supabase immediately

### No localStorage
- Everything saves directly to Supabase
- No concept of "active session" or "complete session"
- Workouts appear immediately after saving

## Custom Tailwind Colors

Defined in `app/globals.css` using `@theme`:

```css
--color-bg-primary: #020617       (slate-950)
--color-bg-secondary: #0f172a     (slate-900)
--color-bg-tertiary: #1e293b      (slate-800)
--color-border-primary: #1e293b   (slate-800)
--color-border-secondary: #0f172a (slate-900)
--color-text-primary: #f8fafc     (slate-50)
--color-text-secondary: #cbd5e1   (slate-300)
--color-text-muted: #94a3b8       (slate-400)
--color-text-dim: #64748b         (slate-500)
--color-text-subtle: #475569      (slate-600)
--color-text-faint: #334155       (slate-700)
--color-accent-primary: #8b5cf6   (violet-500)
--color-accent-secondary: #a78bfa (violet-400)
--color-accent-pink: #ec4899      (pink-500)
--color-success: #10b981          (emerald-500)
--color-danger: #ef4444           (red-500)
```

Use as: `bg-bg-primary`, `text-text-muted`, `border-border-primary`, etc.

## Code Quality Principles

- **Small files** - Components under 150 lines
- **Tightly scoped** - Each component does one thing
- **DRY** - SetInputs reused everywhere
- **No duplication** - Shared logic extracted

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
```

## Important Notes

- **No `is_pr` column** in database - removed from all queries
- **Measurement types** are lowercase strings: "reps", "distance", "time"
- **Date format** is YYYY-MM-DD for Supabase
- **Sets save immediately** - no localStorage or session concept
- **Empty exercise groups filtered** - Only show exercises with sets > 0
- **"Browse Exercises" button** shows on all days (empty state or "+" button)

## Common Patterns

### Fetching Data
```typescript
const { exercises, categories, weightUnits, distanceUnits } = useWorkout();
const { workouts, refetch } = useWorkoutHistory();
```

### Saving a Set
```typescript
await saveSetToSupabase(exerciseId, categoryId, setData, date);
refetchHistory(); // Refresh the view
```

### Grouping Workouts
```typescript
const grouped = workouts.filter(w => w.date === date)
  .reduce((map, workout) => {
    // Group by exercise.id
  }, new Map());
```

## Future Enhancements
- User authentication
- Progress analytics
- Personal records tracking
- Real-time subscriptions
- Custom exercise creation
