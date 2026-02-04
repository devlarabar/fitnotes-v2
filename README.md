# FitNotes

A modern workout tracking app built with Next.js, Tailwind CSS, and Supabase.

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

Follow the instructions in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) to:
- Create your Supabase project
- Set up the database schema
- Seed initial data
- Configure environment variables

### 3. Configure Environment Variables

Copy the example env file and add your Supabase credentials:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` with your Supabase URL and anon key.

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the app.

## Tech Stack

- **Next.js 15** - React framework with App Router
- **Supabase** - Backend database and real-time subscriptions
- **Tailwind CSS v4** - Utility-first CSS framework
- **TypeScript** - Type safety
- **Motion** - Animation library
- **Sonner** - Toast notifications
- **Radix UI** - Headless UI components
- **Lucide React** - Icon library

## Project Structure

```
fitnotes/
├── app/
│   ├── components/     # React components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── styles/             # Legacy styles (can be removed)
└── public/             # Static assets
```

## Features

- ✅ Workout logging with Supabase persistence
- ✅ Exercise library from Supabase
- ✅ History view with grouped workouts
- ✅ Progress tracking
- ✅ Settings management
- ✅ Current workout cached in localStorage
- ✅ Real-time data sync with Supabase
- 🚧 User authentication (coming soon)
- 🚧 Personal records tracking (coming soon)
- 🚧 Advanced analytics (coming soon)
