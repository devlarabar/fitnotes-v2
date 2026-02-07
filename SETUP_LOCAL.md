# Local Development Setup

## Quick Start

1. **Make sure Docker Desktop is running**

2. **Start Supabase:**
   ```bash
   supabase start
   ```
   
   Wait for all services to start. This may take a few minutes the first time.

3. **Copy the credentials:**
   After Supabase starts, you'll see output like this:
   ```
   Started supabase local development setup.

         API URL: http://127.0.0.1:54321
          DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
      Studio URL: http://127.0.0.1:54323
    Inbucket URL: http://127.0.0.1:54324
         anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. **Update your `.env.local` file:**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` and paste the `anon key` from step 3:
   ```
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<paste-anon-key-here>
   ```

5. **Start the Next.js dev server:**
   ```bash
   npm run dev
   ```

6. **Open the app:**
   - App: http://localhost:3000
   - Supabase Studio: http://127.0.0.1:54323
   - Email inbox (for testing): http://127.0.0.1:54324

## What's Included

The local setup includes:
- PostgreSQL database with all tables and RLS policies
- Authentication service (email/password)
- Supabase Studio (database GUI)
- Inbucket (email testing - no emails actually sent)
- Seed data with common exercises and categories

## Useful Commands

```bash
# Start Supabase
supabase start

# Stop Supabase
supabase stop

# Reset database (drops all data, re-runs migrations + seed)
supabase db reset

# View logs
supabase logs

# Check status
supabase status
```

## Database Access

You can connect to the local database using any PostgreSQL client:
- **Host:** 127.0.0.1
- **Port:** 54322
- **Database:** postgres
- **User:** postgres
- **Password:** postgres

Or use Supabase Studio at http://127.0.0.1:54323

## Troubleshooting

**"Port already in use" error:**
- Check if you have another Supabase instance running: `supabase stop`
- Or change the ports in `supabase/config.toml`

**Docker errors:**
- Make sure Docker Desktop is running
- Try restarting Docker

**Database changes not showing up:**
- Run `supabase db reset` to reset the database

**Need to start fresh:**
```bash
supabase stop --no-backup
supabase start
```
