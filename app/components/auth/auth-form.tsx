import React, { useState } from 'react';
import { Button, Card, SpinnerInline } from '../ui';
import { Textarea } from '../ui/form/textarea';

interface Props {
  mode: 'signin' | 'signup';
  onSubmit: (email: string, password: string) => Promise<void>;
  onToggleMode: () => void;
  signupsEnabled?: boolean;
}

export function AuthForm({ mode, onSubmit, onToggleMode, signupsEnabled = true }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(email, password);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-8 max-w-md w-full">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-white mb-2">
          {mode === 'signin' ? 'Welcome Back' : 'Get Started'}
        </h1>
        <p className="text-text-muted text-sm">
          {mode === 'signin' 
            ? 'Sign in to track your workouts' 
            : 'Create an account to start tracking'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-text-dim 
            uppercase tracking-wider mb-2"
          >
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-bg-tertiary border border-border-primary 
              rounded-xl px-4 py-3 text-white focus:border-violet-500 
              outline-none transition-all"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-text-dim 
            uppercase tracking-wider mb-2"
          >
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full bg-bg-tertiary border border-border-primary 
              rounded-xl px-4 py-3 text-white focus:border-violet-500 
              outline-none transition-all"
            placeholder="••••••••"
          />
        </div>

        <Button
          type="submit"
          variant="accent"
          size="lg"
          disabled={loading || (mode === 'signup' && !signupsEnabled)}
          className="w-full"
        >
          {loading ? (
            <>
              <SpinnerInline />
              {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
            </>
          ) : (
            mode === 'signin' ? 'Sign In' : 'Sign Up'
          )}
        </Button>
      </form>

      {signupsEnabled && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={onToggleMode}
            className="text-sm text-text-muted hover:text-violet-400 
              transition-colors hover:cursor-pointer"
          >
            {mode === 'signin' 
              ? "Don't have an account? Sign up" 
              : 'Already have an account? Sign in'
            }
          </button>
        </div>
      )}
    </Card>
  );
}
