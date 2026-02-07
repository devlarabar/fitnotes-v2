import React from 'react';
import { Workout, Exercise } from '@/app/lib/schema';
import { Card } from './ui';
import { ExerciseGroup } from './workout/exercise-group';

interface GroupedWorkout {
  exercise: {
    id: number;
    name: string;
    category: string;
  };
  sets: Workout[];
}

interface Props {
  date: string;
  groupedWorkouts: GroupedWorkout[];
  exercises: Exercise[];
  onUpdate?: () => void;
  showTitle?: boolean;
  onExerciseClick: (exerciseId: number) => void;
}

export function WorkoutDayView({
  date,
  groupedWorkouts,
  exercises,
  onUpdate,
  showTitle = true,
  onExerciseClick
}: Props) {
  return (
    <Card className="p-6">
      {showTitle && (
        <h3 className="text-xl font-black text-white mb-4">
          {new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })}
        </h3>
      )}

      <div className="space-y-4">
        {groupedWorkouts.filter(group => group.sets.length > 0).map((group) => {
          const exerciseData = exercises.find(e => e.id === group.exercise.id);
          const measurementType = exerciseData?.measurement_type?.name;

          return (
            <ExerciseGroup
              key={group.exercise.id}
              group={group}
              measurementType={measurementType}
              onExerciseClick={() => onExerciseClick(group.exercise.id)}
              onUpdate={() => onUpdate?.()}
            />
          );
        })}
      </div>
    </Card>
  );
}
