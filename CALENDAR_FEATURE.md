# Calendar Feature

A monthly calendar view to track your workout history.

## Features

### Calendar View
- **Monthly navigation** - Navigate between months with arrow buttons
- **Today button** - Quickly jump back to current month
- **Workout indicators** - Days with workouts are highlighted in violet
- **Today indicator** - Current day has a violet ring
- **Responsive grid** - 7-day week layout with proper month overflow

### Workout Details
- **Click any date** - View all workouts for that day
- **Exercise list** - Shows exercise name, category, and stats
- **Stats display** - Weight/reps, distance/time based on exercise type
- **Smooth animations** - Transitions when selecting dates

## Styling

The calendar follows the app's design system:
- **Violet highlights** for workout days
- **Dark theme** with slate backgrounds
- **Rounded corners** and smooth transitions
- **Dumbbell icons** on workout days
- **Consistent card styling** with the rest of the app

## Navigation

The "History" tab has been renamed to "Calendar" with a calendar icon.

## Data Source

- Fetches all workouts from Supabase
- Groups by date for calendar display
- Shows workout details when date is selected
- Automatically updates when new workouts are completed

## Usage

1. Click "Calendar" in the navigation
2. Browse months using arrow buttons
3. Days with workouts show a violet background and dumbbell icon
4. Click any workout day to see details
5. Click again to collapse details

## Technical Details

- Uses `useWorkoutHistory` hook to fetch data from Supabase
- Dynamically loaded with `next/dynamic` to avoid SSR issues
- Builds calendar grid with proper month overflow
- Handles date formatting and timezone correctly
