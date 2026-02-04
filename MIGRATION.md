# Migration from Vite to Next.js

## What Changed

### Project Structure
- Converted from Vite to Next.js 15 with App Router
- Moved `app/App.tsx` to `app/page.tsx` (client component)
- Created `app/layout.tsx` for root layout
- Created `app/globals.css` combining Tailwind and theme styles

### Configuration Files Added
- `package.json` - Dependencies and scripts
- `next.config.ts` - Next.js configuration
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.ts` - Tailwind CSS v4 configuration
- `postcss.config.mjs` - PostCSS with Tailwind plugin
- `.eslintrc.json` - ESLint configuration
- `.gitignore` - Git ignore rules

### Dependencies Installed
- Next.js 15.1.4
- React 19
- Tailwind CSS v4 with @tailwindcss/postcss
- Motion (framer-motion alternative)
- Sonner (toast notifications)
- Radix UI components
- Lucide React (icons)
- React Hook Form
- Next Themes
- And various other UI libraries

### Component Updates
- Added `'use client'` directive to `app/page.tsx` (main page)
- Added `'use client'` directive to `app/components/Providers.tsx`
- Updated `app/components/ui/index.tsx`:
  - Added `SectionHeader` component with action prop support
  - Exported `cn` utility for convenience
- Fixed `app/components/ui/calendar.tsx` for react-day-picker v9 API
- Fixed `app/components/ExerciseSelector.tsx` to escape quotes in JSX

### CSS Updates
- Migrated from Tailwind v3 to v4 syntax
- Changed `@tailwind` directives to `@import "tailwindcss"`
- Converted `@apply` directives to direct CSS in base layer
- Kept all custom CSS variables and theme definitions

### Files Removed
- `app/App.tsx` (replaced by `app/page.tsx`)
- Old Vite config files (none existed in original structure)

## Running the App

```bash
# Development
npm run dev

# Production build
npm run build
npm start

# Linting
npm run lint
```

## Known Warnings
- ImageWithFallback component uses `<img>` instead of Next.js `<Image />` - can be optimized later
- These are just warnings and don't affect functionality

## Next Steps
- Consider migrating to Next.js `<Image />` component for better performance
- Add environment variables if needed
- Set up any API routes in `app/api/` if backend functionality is needed
- Consider adding middleware for authentication or other cross-cutting concerns
