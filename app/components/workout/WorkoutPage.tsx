'use client';

import React, { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { CategorySelector } from '@/app/components/CategorySelector';
import { ExerciseSelectorWithSupabase } from '@/app/components/ExerciseSelectorWithSupabase';
import { useWorkout } from '@/app/hooks/useWorkout';
import { useWorkoutHistory } from '@/app/hooks/useWorkoutHistory';
import { Category } from '@/app/lib/schema';
import { toast } from 'sonner';
import { DayNavigation } from './DayNavigation';
import { DayWorkouts } from './DayWorkouts';
import { CurrentWorkout } from './CurrentWorkout';

export function WorkoutPage() {
  const [isCategorySelectorOpen, setIsCategorySelectorOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [viewDate, setViewDate] = useState(new Date());

  const {
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
  } = useWorkout();

  const { workouts, refetch: refetchHistory } = useWorkoutHistory();

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getGroupedWorkouts = (date: string) => {
    const dayWorkouts = workouts.filter(w => w.date === date);
    const grouped = new Map<number, { exercise: any; sets: any[] }>();

    dayWorkouts.forEach(workout => {
      if (!grouped.has(workout.exercise)) {
        grouped.set(workout.exercise, {
          exercise: {
            id: workout.exercise,
            name: workout.exercises?.name || 'Unknown',
            category: workout.categories?.name || 'Unknown'
          },
          sets: []
        });
      }
      grouped.get(workout.exercise)!.sets.push(workout);
    });

    return Array.from(grouped.values());
  };

  const goToPreviousDay = () => {
    const newDate = new Date(viewDate);
    newDate.setDate(newDate.getDate() - 1);
    setViewDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(viewDate);
    newDate.setDate(newDate.getDate() + 1);
    setViewDate(newDate);
  };

  const goToToday = () => {
    setViewDate(new Date());
  };

  const handleFinish = async () => {
    const success = await finishWorkout();
    if (success) {
      toast.success("Workout saved to Supabase");
      refetchHistory();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      toast.error("Add at least one exercise to finish session");
    }
  };

  const handleOpenSelector = () => {
    setIsCategorySelectorOpen(true);
  };

  const isToday = viewDate.toDateString() === new Date().toDateString();
  const viewDateStr = formatDate(viewDate);
  const hasWorkoutsForDay = getGroupedWorkouts(viewDateStr).length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DayNavigation
        date={viewDate}
        isToday={isToday}
        onPrevious={goToPreviousDay}
        onNext={goToNextDay}
        onToday={goToToday}
      />

      <DayWorkouts
        date={viewDateStr}
        groupedWorkouts={getGroupedWorkouts(viewDateStr)}
        exercises={exercises}
        weightUnits={weightUnits}
        distanceUnits={distanceUnits}
        onUpdate={refetchHistory}
        onOpenSelector={handleOpenSelector}
        showEmptyState={!hasWorkoutsForDay}
      />

      {isToday && (
        <CurrentWorkout
          currentWorkout={currentWorkout}
          exercises={exercises}
          weightUnits={weightUnits}
          distanceUnits={distanceUnits}
          hasWorkoutsForDay={hasWorkoutsForDay}
          onAddSet={addSet}
          onUpdateSet={updateSet}
          onRemoveSet={removeSet}
          onRemoveExercise={removeExercise}
          onOpenSelector={handleOpenSelector}
          onFinish={handleFinish}
        />
      )}

      <AnimatePresence>
        {isCategorySelectorOpen && !selectedCategory && (
          <CategorySelector
            categories={categories}
            onSelect={(category) => setSelectedCategory(category)}
            onClose={() => setIsCategorySelectorOpen(false)}
          />
        )}
        {isCategorySelectorOpen && selectedCategory && (
          <ExerciseSelectorWithSupabase
            exercises={exercises}
            category={selectedCategory}
            onBack={() => setSelectedCategory(null)}
            onClose={() => {
              setIsCategorySelectorOpen(false);
              setSelectedCategory(null);
            }}
            onSelect={(ex) => {
              addExercise(ex);
              setIsCategorySelectorOpen(false);
              setSelectedCategory(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
