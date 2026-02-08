# FitNotes - Agent Context

> Comprehensive guide for AI agents working on this project

## Project Overview

**FitNotes** is a modern workout tracking web application that allows users to
log exercises, track progress over time, and analyze their fitness journey.
Built with a focus on simplicity, performance, and user experience.

Inspired by the original [FitNotes Android app](https://www.fitnotesapp.com/),
this web version was originally built because the developer switched to iOS and
wanted a platform-agnostic solution.

### Purpose
- Track workouts with flexible measurement types (weight/reps, distance/time, time-only)
- View workout history with calendar and list views
- Analyze progress with charts and statistics
- Support multiple users with authentication and data isolation

---

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety and better DX
- **Tailwind CSS v4** - Utility-first styling with custom design system
- **Motion** - Smooth animations
- **Radix UI** - Accessible headless components
- **Lucide React** - Icon library
- **Recharts** - Data visualization for progress charts
- **Sonner** - Toast notifications

### Backend
- **Supabase** - PostgreSQL database with real-time capabilities
- **Supabase Auth** - User authentication with SSR support
- **Row Level Security (RLS)** - Data isolation per user

### Build & Deploy
- **Vercel** - Hosting and deployment
- **ESLint** - Code linting
- **PostCSS** - CSS processing

---

## Architecture

### High-Level Structure

```
fitnotes/
├── app/
│   ├── (main)/              # Authenticated routes (route group)
│   │   ├── workout/         # Main workout tracking
│   │   ├── history/         # Calendar view
│   │   ├── progress/        # Progress charts & analytics
│   │   └── settings/        # User settings
│   ├── (auth)/              # Authentication routes
│   │   └── auth/            # Sign in/sign up page
│   ├── components/          # React components
│   │   ├── workout/         # Workout-specific components
│   │   ├── ui/              # Reusable UI components
│   │   └── figma/           # Design system components
│   ├── contexts/            # React Context providers
│   │   ├── workout-data-context.tsx  # Global workout data cache
│   │   ├── user-context.tsx          # User authentication state
│   │   └── theme-context.tsx         # Light/dark mode
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities and types
│   │   ├── schema.ts        # TypeScript types (source of truth)
│   │   ├── supabase.ts      # Supabase client
│   │   └── utils.ts         # Helper functions
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Root redirect
│   └── globals.css          # Global styles & theme
├── context/                 # Documentation for agents
├── middleware.ts            # Auth middleware
└── supabase/                # Database migrations & seed data
```

### Key Architectural Decisions

**1. App Router with Route Groups**
- Uses Next.js 15 App Router for file-based routing
- `(main)` route group for authenticated pages
- `(auth)` route group for public auth pages
- Middleware handles authentication redirects

**2. Global State Management**
- **WorkoutDataContext**: Caches all workout data globally to eliminate
  redundant DB queries
- **UserContext**: Manages authentication state and user profile
- **ThemeContext**: Handles light/dark mode persistence
- No external state management library (Redux, Zustand, etc.)

**3. Optimistic Updates**
- UI updates immediately when user performs actions
- Database operations happen in background
- Automatic rollback on failure with toast notifications
- Provides instant feedback while maintaining data consistency

**4. Data Flow**
```
User Action → Optimistic UI Update → Supabase Query → Success/Rollback
                                                    ↓
                                            Context Refetch
                                                    ↓
                                            UI Re-render
```

**5. Component Organization**
- Small, focused components (prefer <150 lines)
- One component per file
- Reusable UI components in `components/ui/`
- Feature-specific components in `components/workout/`
- Shared logic extracted to custom hooks

---

## Database Schema

See `app/lib/schema.ts` for TypeScript types representing the database schema.

### Important Notes
- **Workouts are sets, not sessions** - Each row is one set
- **Date format is YYYY-MM-DD** - Always use this format
- **Measurement types are lowercase** - "reps", "distance", "time"
- **RLS policies enforce user isolation** - Users can only modify their own data

---

## Code Standards

### General Principles
- **Keep it simple** - Avoid unnecessary complexity
- **DRY (Don't Repeat Yourself)** - Extract shared logic
- **Single Responsibility** - Each function/component does one thing
- **Explicit over implicit** - Clear, readable code over clever tricks

### TypeScript
- **Always use type hints** - No implicit `any`
- **Import types from `schema.ts`** - Single source of truth
- **Use interfaces for objects** - Clear contracts
- **Prefer type inference** - Don't over-annotate

### React Components
- **Functional components only** - No class components
- **Use hooks** - useState, useEffect, useMemo, useCallback
- **Keep components small** - Prefer <150 lines
- **One component per file** - No multiple exports
- **Props drilling limit** - Max 6 props, max 2 levels deep
- **Use context for deep state** - Avoid prop drilling

### File Organization
- **Descriptive names** - `exercise-tracker.tsx`, not `tracker.tsx`
- **Kebab-case for files** - `workout-page.tsx`
- **PascalCase for components** - `WorkoutPage`
- **camelCase for functions** - `fetchWorkouts`
- **Group related files** - Keep feature files together

### Styling
- **Tailwind utility classes** - No custom CSS unless necessary
- **Use design system colors** - `bg-bg-primary`, `text-text-muted`
- **Responsive by default** - Mobile-first approach
- **Consistent spacing** - Use Tailwind spacing scale
- **Use existing components** - Prefer reusing over creating new
- **Do not repeat styles** - Extract to reusable components

### Performance
- **Memoize expensive calculations** - Use `useMemo`
- **Avoid unnecessary re-renders** - Use `useCallback` for callbacks
- **Lazy load when appropriate** - Dynamic imports for heavy components
- **Optimize images** - Use Next.js Image component

### Error Handling
- **Try/catch for async operations** - Always handle errors
- **User-friendly error messages** - Toast notifications with context
- **Log errors to console** - For debugging
- **Graceful degradation** - App should work even if features fail

### Code Quality
- **Line length** - Prefer <80 characters, max 100
   - Example of what **not to do**:
    ```tsx
    <div className="bg-bg-primary text-text-muted p-4 flex flex-wrap justify-center items-center border"><p>Hello</p></div>
    ```
  - Do instead:
    ```tsx
    <div className={`
    bg-bg-primary text-text-muted p-4 flex flex-wrap justify-center 
    items-center border
    `}>
      <p>Hello</p>
    </div>
    ```
- **Function length** - Prefer <30 lines
- **File length** - Prefer <250 lines
- **No magic numbers** - Use named constants
- **Comment complex logic** - Explain "why", not "what"

---

## Design System

### Color Palette

See `theme.css` for full color definitions for light and dark mode.

### Usage
```tsx
// Background colors
<div className="bg-bg-primary">
<div className="bg-bg-secondary">
<div className="bg-bg-tertiary">

// Text colors
<p className="text-text-primary">
<p className="text-text-muted">
<p className="text-text-dim">

// Accent colors
<button className="bg-accent-primary">
<span className="text-accent-secondary">
```

---

## Common Patterns

### Fetching Data

**Using Context**
```tsx
import { useWorkoutData } from '@/app/contexts/workout-data-context';

function MyComponent() {
  const { workouts, exercises, loading, refetch } = useWorkoutData();
  
  if (loading) return <LoadingSpinner />;
  
  return <div>{/* Use data */}</div>;
}
```

**Direct Supabase Query**
```tsx
import { supabase } from '@/app/lib/supabase';

const { data, error } = await supabase
  .from('workouts')
  .select('id,user_id,date')
  .eq('user_id', user.id)
  .order('date', { ascending: false });
```

### Saving Data

**With Optimistic Update**
```tsx
const handleSave = async () => {
  // Update UI immediately
  addWorkout(newWorkout);
  
  try {
    // Save to database
    const { data, error } = await supabase
      .from('workouts')
      .insert(newWorkout);
    
    if (error) throw error;
    
    toast.success('Workout saved');
  } catch (err) {
    // Rollback on failure
    deleteWorkout(newWorkout.id);
    toast.error('Failed to save');
  }
};
```

### Date Formatting

**Always use YYYY-MM-DD**
```tsx
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
```

### Grouping Workouts

**By Exercise**
```tsx
const groupedWorkouts = workouts.reduce((acc, workout) => {
  const exerciseId = workout.exercise;
  if (!acc.has(exerciseId)) {
    acc.set(exerciseId, []);
  }
  acc.get(exerciseId)!.push(workout);
  return acc;
}, new Map<number, Workout[]>());
```

---

## Testing

### Current State
- No automated tests yet
- Manual testing in development
- Build validation via `npm run build`
- Linting via `npm run lint`

### Future Testing Strategy
- Unit tests for utility functions

---

## Development Workflow

### Setup
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with Supabase credentials

# Run development server
npm run dev
```

### Common Commands
```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Before Committing
1. Run `npm run lint` - Must pass
2. Run `npm run build` - Must succeed
3. Test affected features manually
4. Update documentation if needed

---

## Key Features

### 1. Workout Tracking
- Select category → Select exercise → Track sets
- Dynamic inputs based on measurement type:
  - **Reps**: Weight + unit + reps
  - **Distance**: Distance + unit + time
  - **Time**: Time only
- Immediate save to database
- No concept of "sessions" - each set is independent

### 2. Exercise Tracker
- Three tabs: Track Set, History, Progress
- Pre-fills last used values for convenience
- Edit/delete sets inline
- Shows today's sets in real-time

### 3. History View
- Calendar grid with workout indicators
- Click day to see all workouts
- Inline editing and deletion
- Day-level comments

### 4. Progress Tracking
- Two tabs: Progress, Analytics
- **Progress**: Charts for individual exercises
- **Analytics**: 90-day statistics
  - Workout days vs rest days
  - Total sets and exercises
  - Current and longest streaks
  - Most active day of week

### 5. Multi-User Support
- Supabase authentication
- User profiles with roles (dev, user, demo)
- RLS policies for data isolation
- Settings to enable/disable signups

### 6. Theme System
- Light and dark modes
- Persistent preference in localStorage
- Smooth transitions between themes

---

## Common Pitfalls

### ❌ Don't Do This
```tsx
// Using wrong date format
const date = '2/8/2024'; // Wrong

// Prop drilling too deep
<Component1 data={data}>
  <Component2 data={data}>
    <Component3 data={data}> // Too deep!

// Hardcoded colors
<div className="bg-slate-900"> // Use design system

// Multiple components in one file
export function Component1() {}
export function Component2() {}
```

### ✅ Do This Instead
```tsx
// Correct date format
const date = '2024-02-08'; // YYYY-MM-DD

// Use context for deep state
const { data } = useWorkoutData();

// Use design system colors
<div className="bg-bg-secondary">

// One component per file
// component1.tsx
export function Component1() {}

// component2.tsx
export function Component2() {}
```

---

## Documentation

### Where to Find Info
- **Feature summaries and context files**: `/context`
- **Changelog**: `CHANGELOG.md`
- **This file**: `AGENTS.md`

### When to Update Docs
- After adding new features
- After architectural changes
- After fixing major bugs
- When patterns change

---

## Getting Help

### Resources
- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **Tailwind Docs**: https://tailwindcss.com/docs
- **React Docs**: https://react.dev

### Debugging Tips
1. Check browser console for errors
2. Check Supabase logs for database errors
3. Verify environment variables are set
4. Check middleware logs for auth issues
5. Use React DevTools to inspect state

---

## Contact

For questions or issues, refer to the project documentation or check the changelog for recent changes.

---

**Last Updated**: February 8, 2024  
**Version**: 2.0.0
