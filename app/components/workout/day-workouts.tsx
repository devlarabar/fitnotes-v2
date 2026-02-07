import React from 'react';
import { Exercise, WeightUnit, DistanceUnit } from '@/app/lib/schema';
import { WorkoutDayView } from '@/app/components/workout-day-view';
import { Button, Card } from '../ui';

interface GroupedWorkout {
  exercise: {
    id: number;
    name: string;
    category: string;
  };
  sets: any[];
}

interface Props {
  date: string;
  groupedWorkouts: GroupedWorkout[];
  exercises: Exercise[];
  weightUnits: WeightUnit[];
  distanceUnits: DistanceUnit[];
  onUpdate: () => void;
  onOpenSelector?: () => void;
  showEmptyState?: boolean;
  onExerciseClick: (exerciseId: number) => void;
}

export function DayWorkouts({
  date,
  groupedWorkouts,
  exercises,
  weightUnits,
  distanceUnits,
  onUpdate,
  onOpenSelector,
  showEmptyState = false,
  onExerciseClick
}: Props) {
  console.log('DayWorkouts render:', {
    groupedWorkoutsLength: groupedWorkouts.length,
    showEmptyState,
    hasOnOpenSelector: !!onOpenSelector
  });

  if (groupedWorkouts.length === 0 && showEmptyState) {
    console.log('Rendering empty state with button');
    return (
      <Card className="py-20 flex flex-col items-center justify-center text-center border-dashed border-2 bg-transparent">
        <p className="text-text-muted max-w-50">No workouts recorded for this day</p>
        <Button variant="secondary" onClick={onOpenSelector} className="mt-6">
          Browse Exercises
        </Button>
      </Card>
    );
  }

  if (groupedWorkouts.length === 0) {
    console.log('No workouts, not showing empty state');
    return null;
  }

  return (
    <WorkoutDayView
      date={date}
      groupedWorkouts={groupedWorkouts}
      exercises={exercises}
      onUpdate={onUpdate}
      showTitle={false}
      onExerciseClick={onExerciseClick}
    />
  );
}
