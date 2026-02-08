# Analytics Feature

## Overview
Added an analytics tab to the progress page showing workout statistics for the last 90 days.

## Changes Made

### New Component: `analytics.tsx`
- Location: `app/components/workout/analytics.tsx`
- Displays 90-day workout statistics:
  - **Workout Days**: Number of days with workouts out of 90
  - **Active Rate**: Percentage of days worked out
  - **Total Sets**: Total number of sets completed
  - **Unique Exercises**: Number of different exercises performed
  - **Current Streak**: Consecutive days with workouts (must include today or yesterday)
  - **Longest Streak**: Longest consecutive workout streak in the period
  - **Most Active Day**: Day of the week with most workouts

### Updated Component: `progress-page.tsx`
- Added tab system matching the exercise tracker pattern
- Two tabs: "Progress" and "Analytics"
- Progress tab contains the existing exercise progress functionality
- Analytics tab displays the new analytics component
- Tabs use the same styling as exercise tracker for consistency

## Technical Details

### Data Source
- Uses `useWorkoutData()` context to access workout history
- Filters workouts to last 90 days based on current date
- All calculations done client-side using `useMemo` for performance

### Streak Calculation
- **Current Streak**: Only counts if last workout was today or yesterday
- **Longest Streak**: Finds longest consecutive day sequence in 90-day period
- Consecutive means workouts on adjacent calendar days

### UI Components
- Uses existing `Card` component for consistency
- Lucide icons for visual appeal
- Color-coded stat cards (blue, green, purple, orange, red, yellow)
- Responsive grid layout (1 column mobile, 2 columns desktop)
- Empty state when no workouts exist

## Future Enhancements
- Add charts/graphs for visual trends
- Weekly/monthly breakdown
- Exercise category breakdown
- Personal records tracking
- Goal setting and progress
