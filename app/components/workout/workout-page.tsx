'use client';

import React, { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { CategorySelector } from '@/app/components/category-selector';
import { ExerciseSelector } from '@/app/components/exercise-selector';
import { useWorkout } from '@/app/hooks/use-workout';
import { useWorkoutHistory } from '@/app/hooks/use-workout-history';
import { useTrainerAccess } from '@/app/hooks/use-trainer-access';
import { useUser } from '@/app/contexts/user-context';
import { Category, Exercise } from '@/app/lib/schema';
import { DayNavigation } from './day-navigation';
import { DayWorkouts } from './day-workouts';
import { ExerciseTracker } from './exercise-tracker';
import { DayComment } from '@/app/components/day-comment';
import { Plus } from 'lucide-react';
import { Button } from '@/app/components/ui';
import { CenteredSpinner } from '../ui/spinner';
import { toast } from 'sonner';

interface Props {
  initialDate?: Date | null;
  onDateChange?: () => void;
}

export function WorkoutPage({ initialDate, onDateChange }: Props = {}) {
  const { user, trainee, hasTrainer } = useUser();
  const [isCategorySelectorOpen, setIsCategorySelectorOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [viewDate, setViewDate] = useState(initialDate || new Date());
  const [trackingExercise, setTrackingExercise] = useState<Exercise | null>(null);

  const isTrainer = user?.role === 'trainer';

  const {
    exercises,
    categories,
    weightUnits,
    distanceUnits,
    loading,
    saveSetToSupabase
  } = useWorkout();

  const { workouts, getCommentForDate, refetch: refetchHistory } = useWorkoutHistory();

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const viewDateStr = formatDate(viewDate);
  const dayComment = getCommentForDate(viewDateStr);

  const trainerAccess = useTrainerAccess(viewDateStr);
  // Trainers can only write on days the trainee has granted access
  const canWrite = !isTrainer || trainerAccess.hasAccess;

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
    onDateChange?.();
  };

  const goToNextDay = () => {
    const newDate = new Date(viewDate);
    newDate.setDate(newDate.getDate() + 1);
    setViewDate(newDate);
    onDateChange?.();
  };

  const goToToday = () => {
    setViewDate(new Date());
    onDateChange?.();
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

  const handleToggleTrainerAccess = async () => {
    try {
      await trainerAccess.toggle();
    } catch {
      toast.error('Failed to update trainer access');
    }
  };

  const isToday = viewDate.toDateString() === new Date().toDateString();
  const hasWorkoutsForDay = getGroupedWorkouts(viewDateStr).length > 0;

  // Trainer with no trainee assigned yet
  if (isTrainer && !trainee) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <p className="text-text-muted text-center">
          No trainee assigned to your account yet.
        </p>
        <p className="text-text-subtle text-sm text-center">
          Ask your admin to set up the trainer relationship.
        </p>
      </div>
    );
  }

  // If tracking a specific exercise, show the tracker
  if (trackingExercise) {
    return (
      <ExerciseTracker
        exercise={trackingExercise}
        date={viewDate}
        onSaveSet={saveSetToSupabase}
        onBack={() => {
          setTrackingExercise(null);
          refetchHistory();
        }}
        canWrite={canWrite}
      />
    );
  }

  if (loading) {
    return (
      <CenteredSpinner size="lg" />
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

      {/* Trainer write access toggle — only shown to trainees who have a trainer */}
      {!isTrainer && hasTrainer && (
        <div className={`flex items-center justify-between px-5 py-4
          bg-bg-secondary rounded-2xl border border-border-secondary`}
        >
          <div>
            <p className="text-sm font-bold text-text-primary">
              Trainer write access
            </p>
            <p className="text-xs text-text-muted mt-0.5">
              Allow your trainer to edit this day
            </p>
          </div>
          <button
            onClick={handleToggleTrainerAccess}
            disabled={trainerAccess.loading || trainerAccess.toggling}
            aria-checked={trainerAccess.hasAccess}
            role="switch"
            className={`relative inline-flex h-6 w-11 shrink-0 items-center
              rounded-full transition-colors focus:outline-none
              disabled:opacity-50 ${
              trainerAccess.hasAccess
                ? 'bg-accent-primary'
                : 'bg-bg-tertiary border border-border-primary'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white
                shadow transition-transform duration-200 ${
                trainerAccess.hasAccess ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      )}

      {/* Day comment */}
      {hasWorkoutsForDay && (
        <DayComment
          date={viewDateStr}
          initialComment={dayComment}
          onUpdate={refetchHistory}
          readOnly={!canWrite}
        />
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
        readOnly={!canWrite}
      />

      {/* Add exercise button — only shown when write access is available */}
      {hasWorkoutsForDay && canWrite && (
        <div className="flex justify-center">
          <Button
            variant="primary"
            onClick={handleOpenSelector}
            className="w-14 h-14 rounded-full"
          >
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
