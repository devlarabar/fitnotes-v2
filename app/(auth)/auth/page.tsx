'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthForm } from '@/app/components/auth/auth-form';
import { signIn, signUp, getSettings } from '@/app/lib/auth';
import { toast } from 'sonner';
import { Dumbbell } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [signupsEnabled, setSignupsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      const settings = await getSettings();
      if (settings) {
        setSignupsEnabled(settings.signups_enabled);
      }
      setLoading(false);
    }
    fetchSettings();
  }, []);

  const handleAuth = async (email: string, password: string) => {
    const { data, error } = mode === 'signin'
      ? await signIn(email, password)
      : await signUp(email, password);

    if (error) {
      toast.error(error.message);
      return;
    }

    if (mode === 'signup') {
      toast.success('Account created! Please check your email to verify.');
    } else {
      toast.success('Welcome back!');
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center 
      justify-center px-6"
    >
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="w-20 h-20 rounded-3xl bg-linear-to-br 
            from-violet-600 to-pink-600 flex items-center justify-center 
            mx-auto mb-4 shadow-xl shadow-violet-900/30"
          >
            <Dumbbell size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-black text-white mb-2">FitNotes</h1>
          <p className="text-text-muted">Track your fitness journey</p>
        </div>

        {loading ? (
          <div className="text-center text-text-muted">Loading...</div>
        ) : (
          <>
            <AuthForm
              mode={mode}
              onSubmit={handleAuth}
              onToggleMode={() => setMode(m => m === 'signin' ? 'signup' : 'signin')}
              signupsEnabled={signupsEnabled}
            />
            {!signupsEnabled && mode === 'signup' && (
              <div className="text-center mt-4 p-4 bg-bg-secondary border border-border-primary rounded-xl">
                <p className="text-text-muted text-sm">
                  Signups are currently disabled. Please contact the administrator.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
