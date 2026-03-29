import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { DayComment } from '@/app/lib/schema';
import { useUser } from '@/app/contexts/user-context';

export function useDayComment(date: string) {
  const { effectiveUserId } = useUser();
  const [comment, setComment] = useState<DayComment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (effectiveUserId) {
      fetchComment();
    }
  }, [date, effectiveUserId]);

  const fetchComment = async () => {
    try {
      if (!effectiveUserId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('date', date)
        .eq('user_id', effectiveUserId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      setComment(data);
    } catch (err) {
      console.error('Error fetching day comment:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    comment,
    loading,
    refetch: fetchComment
  };
}
