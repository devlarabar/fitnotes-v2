import { supabase } from './supabase';
import type { Settings } from './schema';

export async function getSettings(): Promise<Settings | null> {
  const { data, error } = await supabase
    .from('settings')
    .select('signups_enabled')
    .single();
  
  if (error) {
    console.error('Error fetching settings:', error);
    return null;
  }
  
  return data;
}

export async function signUp(email: string, password: string) {
  // Check if signups are enabled
  const settings = await getSettings();
  if (settings && !settings.signups_enabled) {
    return { 
      data: { user: null, session: null }, 
      error: { message: 'Signups are currently disabled', name: 'SignupsDisabled', status: 403 } as any
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  return { data, error };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  console.log('Sign in result:', { 
    hasSession: !!data.session, 
    hasUser: !!data.user,
    error 
  });

  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
