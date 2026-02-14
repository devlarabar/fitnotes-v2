'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWorkoutData } from '@/app/contexts/workout-data-context';
import { useWorkout } from '@/app/hooks/use-workout';
import { Exercise } from '@/app/lib/schema';
import { DayNavigation } from '@/app/components/workout/day-navigation';
import { DayWorkouts } from '@/app/components/workout/day-workouts';
import { ExerciseTracker } from '@/app/components/workout/exercise-tracker';
import { DayComment } from '@/app/components/day-comment';
import { Plus } from 'lucide-react';
import { Button, Card } from '@/app/components/ui';
import { CenteredSpinner } from '@/app/components/ui/spinner';

function WorkoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [viewDate, setViewDate] = useState(new Date());
  const [trackingExercise, setTrackingExercise] = useState<Exercise | null>(null);

  const {
    exercises,
    weightUnits,
    distanceUnits,
    workouts,
    dayComments,
    loading,
    refetch: refetchHistory
  } = useWorkoutData();

  const { saveSetToSupabase } = useWorkout();

  const getCommentForDate = (date: string) => {
    return dayComments.get(date) || null;
  };

  // Handle URL params
  useEffect(() => {
    const dateParam = searchParams.get('date');
    const exerciseIdParam = searchParams.get('exerciseId');

    if (dateParam) {
      const [y, m, d] = dateParam.split('-').map(Number);
      setViewDate(new Date(y, m - 1, d));
    }

    if (exerciseIdParam) {
      const exercise = exercises.find(e => e.id === Number(exerciseIdParam));
      if (exercise) {
        setTrackingExercise(exercise);
      }
    }
  }, [searchParams, exercises]);

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const viewDateStr = formatDate(viewDate);
  const dayComment = getCommentForDate(viewDateStr);

  const getGroupedWorkouts = (date: string) => {
    const dayWorkouts = workouts.filter(w => w.date === date);
    const grouped = new Map<number, typeof dayWorkouts>();

    dayWorkouts.forEach(workout => {
      const existing = grouped.get(workout.exercise);
      if (existing) {
        existing.push(workout);
      } else {
        grouped.set(workout.exercise, [workout]);
      }
    });

    return Array.from(grouped.entries()).map(([exerciseId, sets]) => ({
      exercise: {
        id: exerciseId,
        name: sets[0].exercises?.name || 'Unknown',
        category: sets[0].categories?.name || 'Other'
      },
      sets
    }));
  };

  const groupedWorkouts = getGroupedWorkouts(viewDateStr);
  const hasWorkoutsForDay = groupedWorkouts.length > 0;

  const handleOpenSelector = () => {
    const params = new URLSearchParams();
    params.set('date', viewDateStr);
    router.push(`/workout/category?${params}`);
  };

  const handleSaveSet = async (
    exerciseId: number,
    categoryId: number,
    set: any,
    date: Date
  ) => {
    return await saveSetToSupabase(
      exerciseId, categoryId, set, date
    );
  };

  if (loading) {
    return <CenteredSpinner size="lg" />;
  }

  if (trackingExercise) {
    return (
      <ExerciseTracker
        exercise={trackingExercise}
        date={viewDate}
        onSaveSet={handleSaveSet}
        onBack={() => {
          setTrackingExercise(null);
          const params = new URLSearchParams();
          params.set('date', viewDateStr);
          router.push(`/workout?${params}`);
        }}
      />
    );
  }

  const handlePrevDay = () => {
    const newDate = new Date(viewDate);
    newDate.setDate(newDate.getDate() - 1);
    setViewDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(viewDate);
    newDate.setDate(newDate.getDate() + 1);
    setViewDate(newDate);
  };

  const handleToday = () => {
    setViewDate(new Date());
  };

  const isToday = viewDate.toDateString() === new Date().toDateString();

  return (
    <div className="space-y-6">
      <DayNavigation
        date={viewDate}
        isToday={isToday}
        onPrevious={handlePrevDay}
        onNext={handleNextDay}
        onToday={handleToday}
      />

      <DayComment
        date={viewDateStr}
        initialComment={dayComment}
        onUpdate={refetchHistory}
      />

      {hasWorkoutsForDay ? (
        <DayWorkouts
          date={viewDateStr}
          groupedWorkouts={groupedWorkouts}
          exercises={exercises}
          weightUnits={weightUnits}
          distanceUnits={distanceUnits}
          onExerciseClick={(exerciseId) => {
            const exercise = exercises.find(e => e.id === exerciseId);
            if (exercise) setTrackingExercise(exercise);
          }}
          onUpdate={refetchHistory}
        />
      ) : (
        <Card className="py-20 flex flex-col items-center justify-center text-center border-dashed border-2 bg-transparent">
          <p className="text-text-muted max-w-50">
            No workouts recorded for this day
          </p>
          <Button variant="secondary" onClick={handleOpenSelector} className="mt-6">
            Browse Exercises
          </Button>
        </Card>
      )}

      {hasWorkoutsForDay && (
        <div className="flex justify-center">
          <Button variant="primary" onClick={handleOpenSelector} className="w-14 h-14 rounded-full">
            <Plus size={24} />
          </Button>
        </div>
      )}
    </div>
  );
}

export default function WorkoutRoute() {
  return (
    <Suspense fallback={<CenteredSpinner size="lg" />}>
      <WorkoutPageContent />
    </Suspense>
  );
}

