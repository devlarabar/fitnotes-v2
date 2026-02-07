# Changelog

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
