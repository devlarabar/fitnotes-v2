'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { Workout } from '@/app/lib/schema';

export function useWorkoutHistory() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
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

      const { data, error } = await supabase
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
          exercises(name),
          categories(name),
          weight_units(name),
          distance_units(name)
        `)
        .order('date', { ascending: false })
        .order('id', { ascending: false });

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
          exercises: item.exercises ? { name: item.exercises.name } : undefined,
          categories: item.categories ? { name: item.categories.name } : undefined,
          weight_units: item.weight_units ? { name: item.weight_units.name } : undefined,
          distance_units: item.distance_units ? { name: item.distance_units.name } : undefined
        }));
        
        setWorkouts(workouts);
      }
    } catch (err) {
      console.error('Error fetching workouts:', err);
    } finally {
      setLoading(false);
    }
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
    refetch: fetchWorkouts
  };
}
