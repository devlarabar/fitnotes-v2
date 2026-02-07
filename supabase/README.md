# Supabase Local Development

This directory contains the Supabase configuration for local development.

## Prerequisites

- Docker Desktop installed and running
- Supabase CLI installed (`brew install supabase/tap/supabase`)

## Getting Started

1. **Start Supabase locally:**
   ```bash
   supabase start
   ```

   This will start all Supabase services in Docker containers. The first time you run this, it will download the necessary Docker images.

2. **Copy the output credentials:**
   After starting, you'll see output like:
   ```
   API URL: http://127.0.0.1:54321
   DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
   Studio URL: http://127.0.0.1:54323
   Inbucket URL: http://127.0.0.1:54324
   anon key: eyJhbGc...
   service_role key: eyJhbGc...
   ```

3. **Update your `.env.local` file:**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Then update with the credentials from step 2:
   ```
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key-from-supabase-start>
   ```

4. **Start your Next.js app:**
   ```bash
   npm run dev
   ```

## Useful Commands

- **Start Supabase:** `supabase start`
- **Stop Supabase:** `supabase stop`
- **Reset database:** `supabase db reset` (drops all data and re-runs migrations + seed)
- **View logs:** `supabase logs`
- **Access Studio:** Open http://127.0.0.1:54323 in your browser
- **View emails:** Open http://127.0.0.1:54324 to see emails sent during development

## Database Migrations

Migrations are stored in `supabase/migrations/` and are automatically applied when you run `supabase start` or `supabase db reset`.

To create a new migration:
```bash
supabase migration new <migration_name>
```

## Seed Data

The `seed.sql` file contains initial data that's loaded into the database. It includes:
- Categories (Abs, Arms, Back, Cardio, Chest, Legs, Shoulders)
- Weight units (kg, lbs)
- Distance units (km, mi, m, yd)
- Measurement types (Weight & Reps, Distance & Time, Time Only)
- Common exercises

To re-seed the database:
```bash
supabase db reset
```

## Accessing the Database

You can connect to the local database using any PostgreSQL client:
- **Host:** 127.0.0.1
- **Port:** 54322
- **Database:** postgres
- **User:** postgres
- **Password:** postgres

## Troubleshooting

**Port conflicts:**
If you get port conflict errors, you can change the ports in `config.toml`.

**Docker not running:**
Make sure Docker Desktop is running before executing `supabase start`.

**Reset everything:**
```bash
supabase stop --no-backup
supabase start
```
