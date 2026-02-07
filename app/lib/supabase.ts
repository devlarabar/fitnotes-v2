import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 
  'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  'placeholder-key';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || 
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn(
    '⚠️ Supabase credentials not found. Please add ' +
    'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY ' +
    'to your .env.local file'
  );
}

// Client-side Supabase client for use in Client Components
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// Legacy export for backwards compatibility
// TODO: Refactor to use createClient() function instead
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
