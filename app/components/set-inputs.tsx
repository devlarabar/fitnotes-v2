import React, { useState, useRef, useEffect } from 'react';
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

function TimeInput({ value, onChange, label, className }: {
  value: string;
  onChange: (time: string) => void;
  label?: string;
  className?: string;
}) {
  const parse = (v: string) => {
    const p = (v || '').split(':');
    return { h: p[0] || '', m: p[1] || '', s: p[2] || '' };
  };

  const [fields, setFields] = useState(() => parse(value));
  const lastEmitted = useRef(value);
  const minsRef = useRef<HTMLInputElement>(null);
  const secsRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value !== lastEmitted.current) {
      setFields(parse(value));
      lastEmitted.current = value;
    }
  }, [value]);

  const emit = (h: string, m: string, s: string) => {
    if (!h && !m && !s) {
      lastEmitted.current = '';
      onChange('');
      return;
    }
    const combined = `${h || '0'}:${m.padStart(2, '0')}:${s.padStart(2, '0')}`;
    lastEmitted.current = combined;
    onChange(combined);
  };

  const handleChange = (field: 'h' | 'm' | 's', input: string) => {
    const digits = input.replace(/\D/g, '');
    const maxLen = field === 'h' ? 1 : 2;
    const val = digits.slice(0, maxLen);

    if ((field === 'm' || field === 's') && val.length === 2 && parseInt(val) > 59) {
      return;
    }

    const newFields = { ...fields, [field]: val };
    setFields(newFields);
    emit(newFields.h, newFields.m, newFields.s);

    if (field === 'h' && val.length === 1) minsRef.current?.focus();
    if (field === 'm' && val.length === 2) secsRef.current?.focus();
  };

  const handleBlur = () => {
    if (!fields.h && !fields.m && !fields.s) return;
    setFields(prev => ({
      h: prev.h || '0',
      m: prev.m ? prev.m.padStart(2, '0') : '00',
      s: prev.s ? prev.s.padStart(2, '0') : '00'
    }));
  };

  const fieldClass = "text-center font-bold text-text-primary bg-transparent outline-none";

  return (
    <div className={`flex-1 ${className || ''}`}>
      {label && (
        <label className="block text-[10px] font-black text-text-subtle uppercase tracking-tighter mb-1 px-1">
          {label}
        </label>
      )}
      <div className="flex items-center justify-center gap-1 bg-bg-primary border border-border-primary rounded-xl py-2 px-3 focus-within:border-accent-primary transition-all">
        <input
          type="text"
          inputMode="numeric"
          value={fields.h}
          placeholder="H"
          className={`w-5 ${fieldClass} placeholder:text-text-faint`}
          onChange={e => handleChange('h', e.target.value)}
          onFocus={e => e.target.select()}
          onBlur={handleBlur}
        />
        <span className="text-text-subtle font-bold">:</span>
        <input
          ref={minsRef}
          type="text"
          inputMode="numeric"
          value={fields.m}
          placeholder="MM"
          className={`w-8 ${fieldClass} placeholder:text-text-faint`}
          onChange={e => handleChange('m', e.target.value)}
          onFocus={e => e.target.select()}
          onBlur={handleBlur}
        />
        <span className="text-text-subtle font-bold">:</span>
        <input
          ref={secsRef}
          type="text"
          inputMode="numeric"
          value={fields.s}
          placeholder="SS"
          className={`w-8 ${fieldClass} placeholder:text-text-faint`}
          onChange={e => handleChange('s', e.target.value)}
          onFocus={e => e.target.select()}
          onBlur={handleBlur}
        />
      </div>
    </div>
  );
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
            className="bg-bg-primary border border-border-primary rounded-xl px-2 text-text-primary focus:border-accent-primary outline-none transition-all text-sm font-bold mt-5"
          >
            {distanceUnits.map(unit => (
              <option key={unit.id} value={unit.id}>{unit.name}</option>
            ))}
          </select>
        </div>
        <TimeInput
          label="Time"
          value={set.time || ''}
          onChange={time => onUpdate({ time })}
        />
      </>
    );
  }

  // Time Only
  if (type === 'time') {
    return (
      <TimeInput
        label="Time"
        value={set.time || ''}
        onChange={time => onUpdate({ time })}
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
          className="bg-bg-primary border border-border-primary rounded-xl px-2 text-text-primary focus:border-accent-primary outline-none transition-all text-sm font-bold mt-5"
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
