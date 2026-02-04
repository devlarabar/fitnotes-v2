import React from 'react';
import { WeightUnit, DistanceUnit } from '@/app/lib/schema';
import { Input } from './ui';

interface LocalSet {
  id: string | number;
  weight?: number;
  weight_unit?: number;
  reps?: number;
  distance?: number;
  distance_unit?: number;
  time?: string;
  timestamp?: number;
}

interface Props {
  set: LocalSet;
  measurementType?: string;
  weightUnits: WeightUnit[];
  distanceUnits: DistanceUnit[];
  onUpdate: (updates: Partial<LocalSet>) => void;
}

export function SetInputs({ set, measurementType, weightUnits, distanceUnits, onUpdate }: Props) {
  const type = measurementType?.toLowerCase() || '';

  // Distance (with time)
  if (type === 'distance') {
    return (
      <>
        <div className="flex-1 flex gap-2">
          <Input
            label="Distance"
            type="number"
            step="0.1"
            value={set.distance || ''}
            onChange={e => onUpdate({ distance: parseFloat(e.target.value) || 0 })}
          />
          <select
            value={set.distance_unit || distanceUnits[0]?.id}
            onChange={e => onUpdate({ distance_unit: parseInt(e.target.value) })}
            className="bg-slate-950 border border-slate-800 rounded-xl px-2 text-white focus:border-violet-500 outline-none transition-all text-sm font-bold mt-5"
          >
            {distanceUnits.map(unit => (
              <option key={unit.id} value={unit.id}>{unit.name}</option>
            ))}
          </select>
        </div>
        <Input
          label="Time"
          type="text"
          placeholder="MM:SS"
          value={set.time || ''}
          onChange={e => onUpdate({ time: e.target.value })}
        />
      </>
    );
  }

  // Time Only
  if (type === 'time') {
    return (
      <Input
        label="Time"
        type="text"
        placeholder="MM:SS"
        value={set.time || ''}
        onChange={e => onUpdate({ time: e.target.value })}
        className="flex-1"
      />
    );
  }

  // Reps (with weight) - most common for strength training
  // This includes bodyweight exercises where you might add weight (weighted pull-ups, etc.)
  return (
    <>
      <div className="flex-1 flex gap-2">
        <Input
          label="Weight"
          type="number"
          value={set.weight || ''}
          onChange={e => onUpdate({ weight: parseFloat(e.target.value) || 0 })}
        />
        <select
          value={set.weight_unit || weightUnits[0]?.id}
          onChange={e => onUpdate({ weight_unit: parseInt(e.target.value) })}
          className="bg-slate-950 border border-slate-800 rounded-xl px-2 text-white focus:border-violet-500 outline-none transition-all text-sm font-bold mt-5"
        >
          {weightUnits.map(unit => (
            <option key={unit.id} value={unit.id}>{unit.name}</option>
          ))}
        </select>
      </div>
      <Input
        label="Reps"
        type="number"
        value={set.reps || ''}
        onChange={e => onUpdate({ reps: parseInt(e.target.value) || 0 })}
      />
    </>
  );
}
