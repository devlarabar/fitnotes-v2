'use client';

import React, { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { CategorySelector } from '@/app/components/category-selector';
import { ExerciseSelector } from '@/app/components/exercise-selector';
import { useWorkout } from '@/app/hooks/use-workout';
import { useWorkoutHistory } from '@/app/hooks/use-workout-history';
import { Category, Exercise } from '@/app/lib/schema';
import { DayNavigation } from './day-navigation';
import { DayWorkouts } from './day-workouts';
import { ExerciseTracker } from './exercise-tracker';
import { DayComment } from '@/app/components/day-comment';
import { Plus } from 'lucide-react';
import { Button } from '@/app/components/ui';

export function WorkoutPage() {
  const [isCategorySelectorOpen, setIsCategorySelectorOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [viewDate, setViewDate] = useState(new Date());
  const [trackingExercise, setTrackingExercise] = useState<Exercise | null>(null);

  const {
    exercises,
    categories,
    weightUnits,
    distanceUnits,
    loading,
    saveSetToSupabase
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

  const handleOpenSelector = () => {
    setIsCategorySelectorOpen(true);
  };

  const handleExerciseClick = (exerciseId: number) => {
    const exercise = exercises.find(e => e.id === exerciseId);
    if (exercise) {
      setTrackingExercise(exercise);
    }
  };

  const isToday = viewDate.toDateString() === new Date().toDateString();
  const viewDateStr = formatDate(viewDate);
  const hasWorkoutsForDay = getGroupedWorkouts(viewDateStr).length > 0;

  // If tracking a specific exercise, show the tracker
  if (trackingExercise) {
    return (
      <ExerciseTracker
        exercise={trackingExercise}
        date={viewDate}
        weightUnits={weightUnits}
        distanceUnits={distanceUnits}
        onSaveSet={saveSetToSupabase}
        onBack={() => {
          setTrackingExercise(null);
          refetchHistory();
        }}
      />
    );
  }

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

      {/* Day comment */}
      {hasWorkoutsForDay && (
        <DayComment date={viewDateStr} />
      )}

      <DayWorkouts
        date={viewDateStr}
        groupedWorkouts={getGroupedWorkouts(viewDateStr)}
        exercises={exercises}
        weightUnits={weightUnits}
        distanceUnits={distanceUnits}
        onUpdate={refetchHistory}
        onOpenSelector={handleOpenSelector}
        showEmptyState={!hasWorkoutsForDay}
        onExerciseClick={handleExerciseClick}
      />

      {/* Add exercise button - always show if there are workouts */}
      {hasWorkoutsForDay && (
        <div className="flex justify-center">
          <Button variant="primary" onClick={handleOpenSelector} className="w-14 h-14 rounded-full">
            <Plus size={24} />
          </Button>
        </div>
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
          <ExerciseSelector
            exercises={exercises}
            category={selectedCategory}
            onBack={() => setSelectedCategory(null)}
            onClose={() => {
              setIsCategorySelectorOpen(false);
              setSelectedCategory(null);
            }}
            onSelect={(ex) => {
              setIsCategorySelectorOpen(false);
              setSelectedCategory(null);
              setTrackingExercise(ex);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
