# Dev Page Feature

**Date**: February 8, 2024

## Summary
Added a dev-only page that allows users with the `dev` role to add new 
exercises to the database.

## Changes Made

### 1. Navigation Updates
- **File**: `app/lib/tabs.ts`
  - Added `'dev'` to the tabs array
  
- **File**: `app/components/navigation.tsx`
  - Added `Code` icon import from lucide-react
  - Added `useUser` hook to check user role
  - Split nav items into `BASE_NAV_ITEMS` and `DEV_NAV_ITEM`
  - Conditionally show Dev tab only for users with `role === 'dev'`
  - Applied to both `Sidebar` and `MobileNav` components

### 2. Layout Updates
- **File**: `app/(main)/layout.tsx`
  - Added `/dev` route handling in `getActiveTab()`
  - Added `dev: '/dev'` to routes mapping in `setActiveTab()`

### 3. Context Updates
- **File**: `app/contexts/workout-data-context.tsx`
  - Added `MeasurementType` import
  - Added `measurementTypes` to context interface and state
  - Fetches measurement types from database alongside other reference data
  - Exposes measurement types through context provider

### 4. New Form Components
- **File**: `app/components/ui/form-input.tsx`
  - Reusable form input with consistent styling
  - Label, input field with proper focus states
  
- **File**: `app/components/ui/form-select.tsx`
  - Reusable form select with consistent styling
  - Label, dropdown with options array support

### 5. New Dev Page
- **File**: `app/(main)/dev/page.tsx`
  - Form to add new exercises with three fields:
    - Exercise name (text input via FormInput)
    - Category (dropdown via FormSelect)
    - Measurement type (dropdown via FormSelect)
  - Client-side validation for required fields
  - Optimistic UI with loading states
  - Toast notifications for success/error
  - Automatically refetches workout data after successful insert
  - Redirects non-dev users to `/workout` page

### 6. Middleware Updates
- **File**: `middleware.ts`
  - Added check for `/dev` route
  - Queries user role from database when accessing `/dev`
  - Redirects non-dev users to `/workout` page
  - Handles errors gracefully with redirect

### 7. Database Migration
- **File**: `supabase/migrations/20240208000000_add_dev_exercise_policy.sql`
  - Created `is_dev_user()` function to check if authenticated user has dev role
  - Added RLS policy: "Dev users can insert exercises"
  - Added RLS policy: "Dev users can update exercises"
  - Added RLS policy: "Dev users can delete exercises"

## How It Works

1. **Navigation**: Dev tab only appears for users with `role === 'dev'`
2. **Access Control**: Middleware checks user role before allowing access to `/dev`
3. **Form Submission**: 
   - Validates required fields
   - Inserts exercise into database
   - Refetches all workout data to update context
   - Shows success/error toast
4. **Security**: RLS policies ensure only dev users can modify exercises table

## Database Schema Reference

**exercises table**:
- `id` (bigint, auto-generated)
- `name` (text, required)
- `category` (bigint, foreign key to categories)
- `measurement_type` (bigint, foreign key to measurement_types)
- `created_at` (timestamp, auto-generated)

## Testing Notes

To test this feature:
1. Ensure user has `role = 'dev'` in the users table
2. Dev tab should appear in navigation
3. Navigate to `/dev` page
4. Fill out form and submit
5. New exercise should appear in workout tracking dropdowns

Non-dev users:
- Should not see Dev tab in navigation
- If they manually navigate to `/dev`, should be redirected to `/workout`
