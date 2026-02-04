import React from 'react';
import { Exercise, WeightUnit, DistanceUnit } from '@/app/lib/schema';
import { WorkoutDayView } from '@/app/components/WorkoutDayView';
import { Card, Button } from '@/app/components/ui';

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
}

export function DayWorkouts({
  date,
  groupedWorkouts,
  exercises,
  weightUnits,
  distanceUnits,
  onUpdate,
  onOpenSelector,
  showEmptyState = false
}: Props) {
  if (groupedWorkouts.length === 0) {
    if (!showEmptyState) return null;
    
    return (
      <Card className="py-20 flex flex-col items-center justify-center text-center border-dashed border-2 bg-transparent">
        <p className="text-text-muted max-w-[200px]">No workouts recorded for this day</p>
        {onOpenSelector && (
          <Button variant="secondary" onClick={onOpenSelector} className="mt-6">
            Browse Exercises
          </Button>
        )}
      </Card>
    );
  }

  return (
    <WorkoutDayView
      date={date}
      groupedWorkouts={groupedWorkouts}
      exercises={exercises}
      weightUnits={weightUnits}
      distanceUnits={distanceUnits}
      onUpdate={onUpdate}
      showTitle={false}
    />
  );
}
