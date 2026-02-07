import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { Exercise, WeightUnit, DistanceUnit } from '@/app/lib/schema';
import { Button, Card, Badge } from '@/app/components/ui';
import { SetInputs } from '@/app/components/set-inputs';
import { ExerciseHistory } from './exercise-history';
import { toast } from 'sonner';

interface LocalSet {
  weight?: number;
  weight_unit?: number;
  reps?: number;
  distance?: number;
  distance_unit?: number;
  time?: string;
}

interface Props {
  exercise: Exercise;
  date: Date;
  weightUnits: WeightUnit[];
  distanceUnits: DistanceUnit[];
  onSaveSet: (exerciseId: number, categoryId: number, set: any, date: Date) => Promise<number | null>;
  onBack: () => void;
}

export function ExerciseTracker({
  exercise,
  date,
  weightUnits,
  distanceUnits,
  onSaveSet,
  onBack
}: Props) {
  const [activeTab, setActiveTab] = useState<'sets' | 'history'>('sets');
  const [currentSet, setCurrentSet] = useState<LocalSet>({
    weight: 0,
    weight_unit: weightUnits[0]?.id || 1,
    reps: 0,
    distance: 0,
    distance_unit: distanceUnits[0]?.id || 1,
    time: '00:00'
  });
  const [saving, setSaving] = useState(false);

  const measurementType = exercise.measurement_type?.name;

  const handleSaveSet = async () => {
    setSaving(true);
    try {
      const setId = await onSaveSet(
        exercise.id,
        exercise.category || 1,
        currentSet,
        date
      );

      if (setId) {
        toast.success('Set saved');
        // Reset to new set with last values
        setCurrentSet({
          weight: currentSet.weight,
          weight_unit: currentSet.weight_unit,
          reps: currentSet.reps,
          distance: currentSet.distance,
          distance_unit: currentSet.distance_unit,
          time: currentSet.time
        });
        // Refresh history
        setActiveTab('sets');
      } else {
        toast.error('Failed to save set');
      }
    } catch (err) {
      toast.error('Failed to save set');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSet = (updates: any) => {
    setCurrentSet(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Tabs */}
      <Card className="p-0 overflow-hidden">
        <div className="flex border-b border-border-primary">
          <button
            onClick={() => setActiveTab('sets')}
            className={`flex-1 py-3 text-sm font-bold transition-colors ${
              activeTab === 'sets'
                ? 'text-accent-secondary border-b-2 border-accent-primary'
                : 'text-text-dim hover:text-text-secondary'
            }`}
          >
            Track Set
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 text-sm font-bold transition-colors ${
              activeTab === 'history'
                ? 'text-accent-secondary border-b-2 border-accent-primary'
                : 'text-text-dim hover:text-text-secondary'
            }`}
          >
            History
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'sets' ? (
            <div className="space-y-6">
              <div className="flex items-end gap-3">
                <SetInputs
                  set={{
                    id: 'current',
                    ...currentSet
                  }}
                  measurementType={measurementType}
                  weightUnits={weightUnits}
                  distanceUnits={distanceUnits}
                  onUpdate={handleUpdateSet}
                />
              </div>

              <Button
                variant="accent"
                size="lg"
                onClick={handleSaveSet}
                disabled={saving}
                className="w-full"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Set
                  </>
                )}
              </Button>
            </div>
          ) : (
            <ExerciseHistory exerciseId={exercise.id} />
          )}
        </div>
      </Card>
    </div>
  );
}
