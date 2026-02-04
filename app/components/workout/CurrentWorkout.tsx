import React from 'react';
import { Exercise, WeightUnit, DistanceUnit } from '@/app/lib/schema';
import { WorkoutLogger } from '@/app/components/WorkoutLogger';
import { Button, Card } from '@/app/components/ui';

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

interface Props {
  currentWorkout: LocalWorkout;
  exercises: Exercise[];
  weightUnits: WeightUnit[];
  distanceUnits: DistanceUnit[];
  hasWorkoutsForDay: boolean;
  onAddSet: (exId: string) => void;
  onUpdateSet: (exId: string, setId: string, updates: any) => void;
  onRemoveSet: (exId: string, setId: string) => void;
  onRemoveExercise: (exId: string) => void;
  onOpenSelector: () => void;
  onFinish: () => void;
}

export function CurrentWorkout({
  currentWorkout,
  exercises,
  weightUnits,
  distanceUnits,
  hasWorkoutsForDay,
  onAddSet,
  onUpdateSet,
  onRemoveSet,
  onRemoveExercise,
  onOpenSelector,
  onFinish
}: Props) {
  const showEmptyState = !hasWorkoutsForDay && currentWorkout.exercises.length === 0;

  return (
    <>
      <WorkoutLogger
        workout={currentWorkout}
        exercises={exercises}
        weightUnits={weightUnits}
        distanceUnits={distanceUnits}
        onAddSet={onAddSet}
        onUpdateSet={onUpdateSet}
        onRemoveSet={onRemoveSet}
        onRemoveExercise={onRemoveExercise}
        onOpenSelector={onOpenSelector}
        showEmptyState={showEmptyState}
      />
      
      {currentWorkout.exercises.length > 0 && (
        <Button variant="accent" size="lg" onClick={onFinish} className="w-full">
          Complete Session
        </Button>
      )}
    </>
  );
}
