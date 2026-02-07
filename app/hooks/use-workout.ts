'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { Exercise, WeightUnit, DistanceUnit, WorkoutData, Category } from '@/app/lib/schema';
import { checkIsPR } from '@/app/lib/pr-checker';
import { useUser } from '@/app/contexts/user-context';
import { useWorkoutData } from '@/app/contexts/workout-data-context';

interface LocalSet {
  id: string;
  weight?: number;
  weight_unit?: number;
  reps?: number;
  distance?: number;
  distance_unit?: number;
  time?: string;
  timestamp: number;
}

interface LocalWorkoutExercise {
  id: string;
  exerciseId: number;
  sets: LocalSet[];
}

interface LocalWorkout {
  id: string;
  date: string;
  exercises: LocalWorkoutExercise[];
}

export function useWorkout() {
  const { user } = useUser();
  const { addWorkout: addWorkoutToCache, deleteWorkout: deleteWorkoutFromCache } = useWorkoutData();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [weightUnits, setWeightUnits] = useState<WeightUnit[]>([]);
  const [distanceUnits, setDistanceUnits] = useState<DistanceUnit[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch exercises, units from Supabase
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    try {
      // Check if Supabase is configured (client-side check)
      const hasUrl = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co';
      const hasKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'placeholder-key';
      
      if (!hasUrl || !hasKey) {
        console.warn('⚠️ Supabase not configured. Using empty data.');
        setLoading(false);
        return;
      }
      
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
        setCategories([]);
      } else {
        setCategories(categoriesData || []);
      }

      // Fetch exercises
      const { data: exercisesData, error: exercisesError } = await supabase
        .from('exercises')
        .select(`
          id,
          name,
          category,
          measurement_type,
          measurement_types(name),
          categories(name)
        `)
        .order('name');

      if (exercisesError) {
        console.error('Error fetching exercises:', exercisesError);
        setExercises([]);
      } else {
        const exercises = (exercisesData || []).map((item: any) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          measurement_type: item.measurement_types ? { name: item.measurement_types.name } : undefined,
          categories: item.categories ? { name: item.categories.name } : undefined
        }));

        setExercises(exercises);
      }

      // Fetch weight units
      const { data: weightUnitsData, error: weightUnitsError } = await supabase
        .from('weight_units')
        .select('*')
        .order('id');

      if (weightUnitsError) {
        console.error('Error fetching weight units:', weightUnitsError);
        setWeightUnits([]);
      } else {
        setWeightUnits(weightUnitsData || []);
      }

      // Fetch distance units
      const { data: distanceUnitsData, error: distanceUnitsError } = await supabase
        .from('distance_units')
        .select('*')
        .order('id');

      if (distanceUnitsError) {
        console.error('Error fetching distance units:', distanceUnitsError);
        setDistanceUnits([]);
      } else {
        setDistanceUnits(distanceUnitsData || []);
      }

    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveSetToSupabase = async (
    exerciseId: number,
    categoryId: number,
    set: LocalSet,
    date: Date
  ): Promise<number | null> => {
    try {
      const dateStr = formatDate(date);
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      
      // Check if this is a PR
      const isPR = await checkIsPR(
        exerciseId,
        user.id,
        set.weight,
        set.reps,
        set.distance,
        set.time
      );

      const workoutData: WorkoutData = {
        date: dateStr,
        exercise: exerciseId,
        category: categoryId,
        weight: set.weight || null,
        weight_unit: set.weight_unit || null,
        reps: set.reps || null,
        distance: set.distance || null,
        distance_unit: set.distance_unit || null,
        time: set.time || null,
        comment: null,
        is_pr: isPR,
        user_id: user.id
      };

      // Optimistically add to cache with temporary ID
      const tempWorkout = {
        id: -Date.now(), // Temporary negative ID
        date: workoutData.date,
        exercise: workoutData.exercise,
        category: workoutData.category,
        weight: workoutData.weight || undefined,
        weight_unit: workoutData.weight_unit || undefined,
        reps: workoutData.reps || undefined,
        distance: workoutData.distance || undefined,
        distance_unit: workoutData.distance_unit || undefined,
        time: workoutData.time || undefined,
        comment: workoutData.comment || undefined,
        is_pr: workoutData.is_pr || undefined,
        user_id: user.id
      };
      addWorkoutToCache(tempWorkout);

      try {
        const { data, error } = await supabase
          .from('workouts')
          .insert([workoutData])
          .select(`
            id, date, exercise, category, weight, weight_unit, reps,
            distance, distance_unit, time, comment, is_pr,
            exercises(name), categories(name), weight_units(name), distance_units(name)
          `)
          .single();

        if (error) throw error;

        // Replace temp workout with real one
        const realWorkout = {
          id: data.id,
          date: data.date,
          exercise: data.exercise,
          category: data.category,
          weight: data.weight,
          weight_unit: data.weight_unit,
          reps: data.reps,
          distance: data.distance,
          distance_unit: data.distance_unit,
          time: data.time,
          comment: data.comment,
          is_pr: data.is_pr,
          exercises: (data as any).exercises ? { name: (data as any).exercises.name } : undefined,
          categories: (data as any).categories ? { name: (data as any).categories.name } : undefined,
          weight_units: (data as any).weight_units ? { name: (data as any).weight_units.name } : undefined,
          distance_units: (data as any).distance_units ? { name: (data as any).distance_units.name } : undefined,
          user_id: user.id
        };
        
        // Remove temp and add real
        deleteWorkoutFromCache(tempWorkout.id);
        addWorkoutToCache(realWorkout);

        return data.id;
      } catch (error) {
        // Rollback: remove the temp workout
        deleteWorkoutFromCache(tempWorkout.id);
        throw error;
      }
    } catch (err) {
      console.error('Error saving set:', err);
      return null;
    }
  };

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return {
    exercises,
    categories,
    weightUnits,
    distanceUnits,
    loading,
    saveSetToSupabase
  };
}
