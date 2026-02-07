# Changelog

## 2024-02-07 - App Router Migration & Performance Optimization

### 🚀 Next.js App Router Migration
- Migrated from client-side state routing to Next.js App Router
- Created `(main)` route group for authenticated pages
- Split workout flow into separate routes:
  - `/workout` - Main workout tracking page
  - `/workout/category` - Category selection
  - `/workout/exercise` - Exercise selection with category filter
  - `/history` - Calendar view
  - `/progress` - Progress charts
  - `/settings` - Settings page
- Removed fixed overlay modals in favor of proper page navigation
- Updated middleware to redirect to `/workout` instead of `/`
- Added Suspense boundaries for useSearchParams
- Eliminated jarring flash when navigating between pages

### ⚡ Performance Optimization
- Created `WorkoutDataContext` to cache all workout data globally
- Eliminated redundant database queries across page navigation
- Data fetched once at app level and shared across all pages
- Removed loading spinners when navigating between pages
- Implemented optimistic updates with automatic rollback:
  - Add workout: instantly shows in UI, rolls back on failure
  - Update workout/comment: instantly updates, reverts on failure
  - Delete workout/comment: instantly removes, restores on failure
- UI feels instant while maintaining data consistency with database

### 🎨 UI/UX Improvements
- Updated category and exercise selectors to be regular page content
- Restored original empty state design with dashed border card
- Fixed empty state button variant to use secondary style
- Improved page transition smoothness

## 2024-02-07 - Multi-user Support & Theme System

### 🎨 Theme System
- Added light/dark mode toggle with theme persistence
- Created `ThemeContext` for global theme management
- Updated all color classes to use CSS variables for theme switching
- Added theme toggle button to sidebar
- Configured Tailwind v4 with proper light/dark mode color palettes
- Updated toast notifications to respect theme
- Dark mode remains the default

### 👥 Multi-User Support
- Created `users` table with role-based access control (dev, user, demo)
- Added `user_id` foreign key to `workouts` and `comments` tables
- Implemented automatic user profile creation on signup via database trigger
- Created `UserContext` to cache user data and avoid redundant database queries
- Updated all workout and comment queries to filter by user_id
- Implemented RLS policies:
  - Users can only insert/update/delete their own workouts and comments
  - Users can view all workouts and comments (read-only for others)
  - Dev role can perform any operation on any data
- Fixed unique constraint on comments table to be per-user per-day

### 🔐 Authentication & Security
- Migrated to Supabase SSR client (`@supabase/ssr`) for proper cookie-based auth
- Fixed middleware redirects for sign in/out flows
- Updated signup flow to check `signups_enabled` setting
- Added server-side validation to prevent signups when disabled
- Fixed RLS policies to properly enforce user isolation

### 🗄️ Database & Local Development
- Set up Supabase local development environment
- Created initial database schema migration with all tables
- Added seed data for categories, units, measurement types, and common exercises
- Created comprehensive documentation for local setup
- Configured email confirmations and auth settings

### 🐛 Bug Fixes
- Fixed case-sensitivity issues in component imports for Vercel deployment
- Fixed ESLint errors (unescaped apostrophes in JSX)
- Removed unused `use-sidebar.ts` hook
- Fixed scrollbar overflow in comment container
- Fixed button text colors for better contrast in light mode

### 📦 Build & Deploy
- Fixed production build errors
- Resolved module resolution issues for case-sensitive filesystems
- Updated import paths to match actual file casing

### 🎯 Developer Experience
- Added `SETUP_LOCAL.md` for quick start guide
- Created Supabase setup documentation
- Improved error handling and logging throughout the app
