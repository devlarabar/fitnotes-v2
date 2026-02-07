import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { DayComment } from '@/app/lib/schema';
import { useUser } from '@/app/contexts/user-context';

export function useDayComment(date: string) {
  const { user } = useUser();
  const [comment, setComment] = useState<DayComment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchComment();
    }
  }, [date, user?.id]);

  const fetchComment = async () => {
    try {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('date', date)
        .eq('user_id', user.id)
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
