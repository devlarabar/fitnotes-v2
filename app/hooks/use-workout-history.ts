'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { Workout, DayComment } from '@/app/lib/schema';

export function useWorkoutHistory() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [dayComments, setDayComments] = useState<Map<string, DayComment>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);

      // Check if Supabase is configured
      if (typeof window !== 'undefined') {
        const hasUrl = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co';
        const hasKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'placeholder-key';
        
        if (!hasUrl || !hasKey) {
          console.warn('⚠️ Supabase not configured.');
          setLoading(false);
          return;
        }
      }

      // Fetch workouts and comments in parallel
      const [workoutsResult, commentsResult] = await Promise.all([
        supabase
          .from('workouts')
          .select(`
            id,
            date,
            exercise,
            category,
            weight,
            weight_unit,
            reps,
            distance,
            distance_unit,
            time,
            comment,
            is_pr,
            exercises(name),
            categories(name),
            weight_units(name),
            distance_units(name)
          `)
          .order('date', { ascending: false })
          .order('id', { ascending: false }),
        supabase
          .from('comments')
          .select('*')
      ]);

      const { data, error } = workoutsResult;

      if (error) {
        console.error('Error fetching workouts:', error);
        setWorkouts([]);
      } else {
        const workouts = (data || []).map((item: any) => ({
          id: item.id,
          date: item.date,
          exercise: item.exercise,
          category: item.category,
          weight: item.weight,
          weight_unit: item.weight_unit,
          reps: item.reps,
          distance: item.distance,
          distance_unit: item.distance_unit,
          time: item.time,
          comment: item.comment,
          is_pr: item.is_pr,
          exercises: item.exercises ? { name: item.exercises.name } : undefined,
          categories: item.categories ? { name: item.categories.name } : undefined,
          weight_units: item.weight_units ? { name: item.weight_units.name } : undefined,
          distance_units: item.distance_units ? { name: item.distance_units.name } : undefined
        }));

        
        setWorkouts(workouts);
      }

      // Process comments
      if (commentsResult.data && !commentsResult.error) {
        const commentsMap = new Map<string, DayComment>();
        commentsResult.data.forEach((comment: any) => {
          commentsMap.set(comment.date, {
            id: comment.id,
            date: comment.date,
            comment: comment.comment
          });
        });
        setDayComments(commentsMap);
      }
    } catch (err) {
      console.error('Error fetching workouts:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCommentForDate = (date: string): DayComment | null => {
    return dayComments.get(date) || null;
  };

  // Get unique dates that have workouts
  const getWorkoutDates = (): Set<string> => {
    return new Set(workouts.map(w => w.date));
  };

  // Get workouts for a specific date
  const getWorkoutsForDate = (date: string): Workout[] => {
    return workouts.filter(w => w.date === date);
  };

  return {
    workouts,
    loading,
    getWorkoutDates,
    getWorkoutsForDate,
    getCommentForDate,
    refetch: fetchWorkouts
  };
}
