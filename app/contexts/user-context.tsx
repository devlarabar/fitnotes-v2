'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabase';

interface User {
  id: number;
  auth_user_id: string;
  first_name: string | null;
  last_name: string | null;
  role: 'dev' | 'user' | 'demo' | 'trainer';
}

interface TraineeUser {
  id: number;
  first_name: string | null;
  last_name: string | null;
}

interface UserContextType {
  user: User | null;
  // For trainers: their assigned trainee; null otherwise
  trainee: TraineeUser | null;
  // For trainees: whether they have a trainer assigned
  hasTrainer: boolean;
  // The user_id to use for all data queries:
  // trainee.id when user is a trainer, user.id otherwise
  effectiveUserId: number | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [trainee, setTrainee] = useState<TraineeUser | null>(null);
  const [hasTrainer, setHasTrainer] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        setUser(null);
        setTrainee(null);
        setHasTrainer(false);
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authUser.id)
        .single();

      if (error) {
        console.error('Error fetching user from users table:', error);
        console.warn('⚠️ Users table may not exist yet. Run migrations first.');
        setUser(null);
        return;
      }

      setUser(data);

      if (data.role === 'trainer') {
        // Fetch this trainer's assigned trainee
        const { data: relData } = await supabase
          .from('trainer_relationships')
          .select('trainee_id')
          .eq('trainer_id', data.id)
          .maybeSingle();

        if (relData?.trainee_id) {
          const { data: traineeData } = await supabase
            .from('users')
            .select('id, first_name, last_name')
            .eq('id', relData.trainee_id)
            .single();

          setTrainee(traineeData ?? null);
        } else {
          setTrainee(null);
        }
        setHasTrainer(false);
      } else {
        setTrainee(null);
        // Check if this user has been assigned a trainer
        const { data: relData } = await supabase
          .from('trainer_relationships')
          .select('id')
          .eq('trainee_id', data.id)
          .maybeSingle();

        setHasTrainer(!!relData);
      }
    } catch (err) {
      console.error('Error in fetchUser:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        fetchUser();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setTrainee(null);
        setHasTrainer(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const refreshUser = async () => {
    await fetchUser();
  };

  const effectiveUserId: number | null =
    user?.role === 'trainer' ? (trainee?.id ?? null) : (user?.id ?? null);

  return (
    <UserContext.Provider
      value={{ user, trainee, hasTrainer, effectiveUserId, loading, refreshUser }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
