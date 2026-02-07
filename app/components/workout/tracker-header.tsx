import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Exercise } from '@/app/lib/schema';
import { Button, Badge } from '../ui';

interface Props {
  exercise: Exercise;
  onBack: () => void;
}

export function TrackerHeader({ exercise, onBack }: Props) {
  const measurementType = exercise.measurement_type?.name;

  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" onClick={onBack} className="p-2">
        <ArrowLeft size={24} />
      </Button>
      <div className="flex-1">
        <h1 className="text-2xl font-black text-white">{exercise.name}</h1>
        <div className="flex gap-2 mt-1">
          <Badge variant="outline">{exercise.categories?.name}</Badge>
          {measurementType && (
            <Badge variant="vivid">{measurementType}</Badge>
          )}
        </div>
      </div>
    </div>
  );
}
