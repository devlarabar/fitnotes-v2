'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { Exercise, WeightUnit, DistanceUnit, WorkoutData, Category } from '@/app/lib/schema';

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

const STORAGE_KEY = 'fitnotes_current_workout';

export function useWorkout() {
  const [currentWorkout, setCurrentWorkout] = useState<LocalWorkout>({
    id: Math.random().toString(36).substr(2, 9),
    date: new Date().toISOString(),
    exercises: [],
  });
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [weightUnits, setWeightUnits] = useState<WeightUnit[]>([]);
  const [distanceUnits, setDistanceUnits] = useState<DistanceUnit[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch exercises, units from Supabase
  useEffect(() => {
    fetchData();
  }, []);

  // Load current workout from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const c = JSON.parse(saved);
        const isToday = new Date(c.date).toDateString() === new Date().toDateString();
        if (isToday) {
          setCurrentWorkout(c);
        }
      } catch (e) {
        console.error("Storage error", e);
      }
    }
  }, []);

  // Save current workout to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentWorkout));
  }, [currentWorkout]);

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

  const addExercise = (exercise: Exercise) => {
    const newEx: LocalWorkoutExercise = {
      id: Math.random().toString(36).substr(2, 9),
      exerciseId: exercise.id,
      sets: [{
        id: Math.random().toString(36).substr(2, 9),
        weight: 0,
        weight_unit: weightUnits[0]?.id || 1,
        reps: 0,
        distance: 0,
        distance_unit: distanceUnits[0]?.id || 1,
        time: '00:00',
        timestamp: Date.now()
      }]
    };
    setCurrentWorkout(prev => ({ ...prev, exercises: [...prev.exercises, newEx] }));
  };

  const removeExercise = (id: string) => {
    setCurrentWorkout(prev => ({ ...prev, exercises: prev.exercises.filter(ex => ex.id !== id) }));
  };

  const updateSet = (exerciseId: string, setId: string, updates: Partial<LocalSet>) => {
    setCurrentWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map(ex => {
        if (ex.id !== exerciseId) return ex;
        return {
          ...ex,
          sets: ex.sets.map(s => s.id === setId ? { ...s, ...updates } : s)
        };
      })
    }));
  };

  const addSet = (exerciseId: string) => {
    setCurrentWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map(ex => {
        if (ex.id !== exerciseId) return ex;
        const last = ex.sets[ex.sets.length - 1];
        return {
          ...ex,
          sets: [...ex.sets, {
            id: Math.random().toString(36).substr(2, 9),
            weight: last?.weight || 0,
            weight_unit: last?.weight_unit || weightUnits[0]?.id || 1,
            reps: last?.reps || 0,
            distance: last?.distance || 0,
            distance_unit: last?.distance_unit || distanceUnits[0]?.id || 1,
            time: last?.time || '00:00',
            timestamp: Date.now()
          }]
        };
      })
    }));
  };

  const removeSet = (exerciseId: string, setId: string) => {
    setCurrentWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map(ex => {
        if (ex.id !== exerciseId) return ex;
        return { ...ex, sets: ex.sets.filter(s => s.id !== setId) };
      })
    }));
  };

  const finishWorkout = async () => {
    if (currentWorkout.exercises.length === 0) return false;

    try {
      const date = new Date(currentWorkout.date).toISOString().split('T')[0];
      
      for (const exercise of currentWorkout.exercises) {
        const exerciseData = exercises.find(e => e.id === exercise.exerciseId);
        if (!exerciseData) continue;

        for (const set of exercise.sets) {
          const workoutData: WorkoutData = {
            date,
            exercise: exercise.exerciseId,
            category: exerciseData.category || 1,
            weight: set.weight || null,
            weight_unit: set.weight_unit || null,
            reps: set.reps || null,
            distance: set.distance || null,
            distance_unit: set.distance_unit || null,
            time: set.time || null,
            comment: null
          };

          const { error } = await supabase
            .from('workouts')
            .insert([workoutData]);

          if (error) throw error;
        }
      }

      setCurrentWorkout({
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString(),
        exercises: [],
      });
      localStorage.removeItem(STORAGE_KEY);

      return true;
    } catch (err) {
      console.error('Error saving workout:', err);
      return false;
    }
  };

  return {
    currentWorkout,
    exercises,
    categories,
    weightUnits,
    distanceUnits,
    loading,
    addExercise,
    removeExercise,
    updateSet,
    addSet,
    removeSet,
    finishWorkout
  };
}
