import React from 'react';
import { Dumbbell, ChevronRight } from 'lucide-react';
import { IconContainer } from '../ui';
import { SetRow } from './set-row';

interface GroupedWorkout {
  exercise: {
    id: number;
    name: string;
    category: string;
  };
  sets: any[];
}

interface Props {
  group: GroupedWorkout;
  measurementType?: string;
  onExerciseClick?: () => void;
  onUpdate: () => void;
}

export function ExerciseGroup({
  group,
  measurementType,
  onExerciseClick,
  onUpdate
}: Props) {
  return (
    <div className="bg-slate-800/30 rounded-2xl p-4 border border-slate-800">
      <div
        className={`flex items-center gap-3 mb-3
          ${onExerciseClick
            ? 'cursor-pointer hover:opacity-80 transition-opacity'
            : ''
          }`}
        onClick={onExerciseClick}
      >
        <IconContainer>
          <Dumbbell size={18} />
        </IconContainer>
        <div className="flex-1">
          <h4 className="font-bold text-white">{group.exercise.name}</h4>
          <p className="text-xs text-slate-500 uppercase tracking-wider">
            {group.exercise.category}
          </p>
        </div>
        {onExerciseClick && (
          <ChevronRight size={20} className="text-slate-600" />
        )}
      </div>

      <div className="space-y-2">
        {group.sets.map((set, idx) => (
          <div key={set.id} className="group">
            <SetRow
              set={set}
              index={idx}
              measurementType={measurementType}
              onUpdate={onUpdate}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
