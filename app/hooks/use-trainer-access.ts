'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { useUser } from '@/app/contexts/user-context';

/**
 * Manages per-day trainer write access for a given date.
 *
 * - Queries trainer_day_access for the effective user (trainee).
 * - `toggle()` is only callable by the trainee (non-trainer users).
 * - The trainer uses `hasAccess` read-only to determine canWrite.
 */
export function useTrainerAccess(date: string) {
  const { user, effectiveUserId } = useUser();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (effectiveUserId) {
      fetchAccess();
    } else {
      setHasAccess(false);
      setLoading(false);
    }
  }, [date, effectiveUserId]);

  const fetchAccess = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('trainer_day_access')
        .select('id')
        .eq('trainee_id', effectiveUserId)
        .eq('date', date)
        .maybeSingle();

      if (error) throw error;
      setHasAccess(!!data);
    } catch (err) {
      console.error('Error fetching trainer access:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggle = async () => {
    if (!user?.id || !effectiveUserId || user.role === 'trainer') return;

    setToggling(true);
    try {
      if (hasAccess) {
        const { error } = await supabase
          .from('trainer_day_access')
          .delete()
          .eq('trainee_id', effectiveUserId)
          .eq('date', date);

        if (error) throw error;
        setHasAccess(false);
      } else {
        const { error } = await supabase
          .from('trainer_day_access')
          .insert({ trainee_id: effectiveUserId, date });

        if (error) throw error;
        setHasAccess(true);
      }
    } catch (err) {
      console.error('Error toggling trainer access:', err);
      throw err;
    } finally {
      setToggling(false);
    }
  };

  return { hasAccess, loading, toggling, toggle };
}
