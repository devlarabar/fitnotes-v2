import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { DayComment } from '@/app/lib/schema';

export function useDayComment(date: string) {
  const [comment, setComment] = useState<DayComment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComment();
  }, [date]);

  const fetchComment = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('date', date)
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
