import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card } from './ui';
import { signOut } from '@/app/lib/auth';
import { toast } from 'sonner';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/app/hooks/use-auth';

export function SettingsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Failed to sign out');
      return;
    }
    toast.success('Signed out successfully');
    router.push('/auth');
  };

  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-bg-secondary rounded-4xl 
          flex items-center justify-center text-text-faint 
          border border-border-primary mx-auto mb-4"
        >
          <svg 
            width="40" 
            height="40" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5"
          >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 
              1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 
              2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 
              1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 
              2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 
              2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 
              2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 
              2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 
              0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 
              0 0-2-2z"
            />
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </div>
        <h2 className="text-2xl font-black text-text-primary">Settings</h2>
        <p className="text-text-muted mt-2">v2.0.0 (Next.js + Supabase)</p>
      </div>

      <Card className="p-6 space-y-4">
        <div>
          <p className="text-xs text-text-dim uppercase tracking-wider mb-1">
            Account
          </p>
          <p className="text-text-secondary">{user?.email}</p>
        </div>

        <Button 
          variant="danger" 
          onClick={handleSignOut}
          className="w-full"
        >
          <LogOut size={18} />
          Sign Out
        </Button>
      </Card>
    </div>
  );
}
