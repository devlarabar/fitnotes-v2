'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { Exercise, WeightUnit, DistanceUnit, Category, Workout, DayComment } from '@/app/lib/schema';
import { useUser } from './user-context';

interface WorkoutDataContextType {
  exercises: Exercise[];
  categories: Category[];
  weightUnits: WeightUnit[];
  distanceUnits: DistanceUnit[];
  workouts: Workout[];
  dayComments: Map<string, DayComment>;
  loading: boolean;
  refetch: () => Promise<void>;
  addWorkout: (workout: Workout) => void;
  updateWorkout: (id: number, updates: Partial<Workout>) => void;
  deleteWorkout: (id: number) => void;
  addComment: (comment: DayComment) => void;
  updateComment: (id: number, text: string) => void;
  deleteComment: (id: number) => void;
}

const WorkoutDataContext = createContext<WorkoutDataContextType | undefined>(undefined);

export function WorkoutDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [weightUnits, setWeightUnits] = useState<WeightUnit[]>([]);
  const [distanceUnits, setDistanceUnits] = useState<DistanceUnit[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [dayComments, setDayComments] = useState<Map<string, DayComment>>(new Map());
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Check if Supabase is configured
      const hasUrl = process.env.NEXT_PUBLIC_SUPABASE_URL && 
        process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co';
      const hasKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && 
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'placeholder-key';

      if (!hasUrl || !hasKey) {
        console.warn('⚠️ Supabase not configured.');
        setLoading(false);
        return;
      }

      // Fetch reference data (not user-specific)
      const [exercisesRes, categoriesRes, weightUnitsRes, distanceUnitsRes] = await Promise.all([
        supabase.from('exercises').select('id, name, category, measurement_type(name), categories(name)'),
        supabase.from('categories').select('*'),
        supabase.from('weight_units').select('*'),
        supabase.from('distance_units').select('*')
      ]);

      if (exercisesRes.data) setExercises(exercisesRes.data as any);
      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (weightUnitsRes.data) setWeightUnits(weightUnitsRes.data);
      if (distanceUnitsRes.data) setDistanceUnits(distanceUnitsRes.data);

      // Fetch user-specific data if user is logged in
      if (user?.id) {
        const [workoutsRes, commentsRes] = await Promise.all([
          supabase
            .from('workouts')
            .select(`
              id, date, exercise, category, weight, weight_unit, reps,
              distance, distance_unit, time, comment, is_pr,
              exercises(name), categories(name), weight_units(name), distance_units(name)
            `)
            .eq('user_id', user.id)
            .order('date', { ascending: false })
            .order('id', { ascending: false }),
          supabase
            .from('comments')
            .select('*')
            .eq('user_id', user.id)
        ]);

        if (workoutsRes.data) {
          const workouts = workoutsRes.data.map((item: any) => ({
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

        if (commentsRes.data) {
          const commentsMap = new Map<string, DayComment>();
          commentsRes.data.forEach((comment: any) => {
            commentsMap.set(comment.date, {
              id: comment.id,
              date: comment.date,
              comment: comment.comment
            });
          });
          setDayComments(commentsMap);
        }
      }
    } catch (err) {
      console.error('Error fetching workout data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  const addWorkout = (workout: Workout) => {
    setWorkouts(prev => [workout, ...prev]);
  };

  const updateWorkout = (id: number, updates: Partial<Workout>) => {
    setWorkouts(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  };

  const deleteWorkout = (id: number) => {
    setWorkouts(prev => prev.filter(w => w.id !== id));
  };

  const addComment = (comment: DayComment) => {
    setDayComments(prev => new Map(prev).set(comment.date, comment));
  };

  const updateComment = (id: number, text: string) => {
    setDayComments(prev => {
      const newMap = new Map(prev);
      for (const [date, comment] of newMap.entries()) {
        if (comment.id === id) {
          newMap.set(date, { ...comment, comment: text });
          break;
        }
      }
      return newMap;
    });
  };

  const deleteComment = (id: number) => {
    setDayComments(prev => {
      const newMap = new Map(prev);
      for (const [date, comment] of newMap.entries()) {
        if (comment.id === id) {
          newMap.delete(date);
          break;
        }
      }
      return newMap;
    });
  };

  return (
    <WorkoutDataContext.Provider
      value={{
        exercises,
        categories,
        weightUnits,
        distanceUnits,
        workouts,
        dayComments,
        loading,
        refetch: fetchData,
        addWorkout,
        updateWorkout,
        deleteWorkout,
        addComment,
        updateComment,
        deleteComment
      }}
    >
      {children}
    </WorkoutDataContext.Provider>
  );
}

export function useWorkoutData() {
  const context = useContext(WorkoutDataContext);
  if (context === undefined) {
    throw new Error('useWorkoutData must be used within a WorkoutDataProvider');
  }
  return context;
}
