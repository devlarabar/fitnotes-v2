import React, { useState, useEffect } from 'react';
import { Exercise, Workout } from '@/app/lib/schema';
import { Card } from '@/app/components/ui';
import { TrackerHeader } from './tracker-header';
import { SetForm } from './set-form';
import { TodaySetsList } from './today-sets-list';
import { ExerciseHistory } from './exercise-history';
import { ExerciseProgress } from './exercise-progress';
import { supabase } from '@/app/lib/supabase';
import { toast } from 'sonner';
import { useWorkout } from '@/app/hooks/use-workout';

interface LocalSet {
  weight?: number;
  weight_unit?: number;
  reps?: number;
  distance?: number;
  distance_unit?: number;
  time?: string;
  comment?: string;
}

interface Props {
  exercise: Exercise;
  date: Date;
  onSaveSet: (
    exerciseId: number,
    categoryId: number,
    set: any,
    date: Date,
  ) => Promise<number | null>;
  onBack: () => void;
}

export function ExerciseTracker({ exercise, date, onSaveSet, onBack }: Props) {
  const { weightUnits, distanceUnits } = useWorkout();
  const [activeTab, setActiveTab] = useState<'sets' | 'history' | 'progress'>('sets');
  const [currentSet, setCurrentSet] = useState<LocalSet>({
    weight: 0,
    weight_unit: weightUnits[0]?.id || 1,
    reps: 0,
    distance: 0,
    distance_unit: distanceUnits[0]?.id || 1,
    time: '00:00',
    comment: ''
  });
  const [saving, setSaving] = useState(false);
  const [todaySets, setTodaySets] = useState<Workout[]>([]);
  const [editingSetId, setEditingSetId] = useState<number | null>(null);

  const measurementType = exercise.measurement_type?.name;

  useEffect(() => {
    fetchLastSetData();
    fetchTodaySets();
  }, [exercise.id, date]);

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchLastSetData = async () => {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select('weight, weight_unit, reps, distance, distance_unit, time')
        .eq('exercise', exercise.id)
        .order('date', { ascending: false })
        .order('id', { ascending: false })
        .limit(1)
        .single();

      if (data && !error) {
        setCurrentSet({
          weight: data.weight || 0,
          weight_unit: data.weight_unit || weightUnits[0]?.id || 1,
          reps: data.reps || 0,
          distance: data.distance || 0,
          distance_unit: data.distance_unit || distanceUnits[0]?.id || 1,
          time: data.time || '00:00',
          comment: ''
        });
      }
    } catch (err) {
      console.error('Error fetching last set:', err);
    }
  };

  const fetchTodaySets = async () => {
    try {
      const dateStr = formatDate(date);
      const { data, error } = await supabase
        .from('workouts')
        .select(`
          id,
          weight,
          weight_unit,
          reps,
          distance,
          distance_unit,
          time,
          comment,
          is_pr,
          weight_units(name),
          distance_units(name)
        `)
        .eq('exercise', exercise.id)
        .eq('date', dateStr)
        .order('id', { ascending: true });

      if (error) throw error;

      const workouts = (data || []).map((item: any) => ({
        id: item.id,
        date: dateStr,
        exercise: exercise.id,
        category: exercise.category || 0,
        weight: item.weight,
        weight_unit: item.weight_unit,
        reps: item.reps,
        distance: item.distance,
        distance_unit: item.distance_unit,
        time: item.time,
        comment: item.comment,
        is_pr: item.is_pr,
        weight_units: item.weight_units
          ? { name: item.weight_units.name }
          : undefined,
        distance_units: item.distance_units
          ? { name: item.distance_units.name }
          : undefined,
      }));

      setTodaySets(workouts);
    } catch (err) {
      console.error('Error fetching today sets:', err);
    }
  };

  const handleSaveSet = async () => {
    setSaving(true);
    try {
      if (editingSetId) {
        const { error } = await supabase
          .from('workouts')
          .update({
            weight: currentSet.weight || null,
            weight_unit: currentSet.weight_unit || null,
            reps: currentSet.reps || null,
            distance: currentSet.distance || null,
            distance_unit: currentSet.distance_unit || null,
            time: currentSet.time || null,
            comment: currentSet.comment || null
          })
          .eq('id', editingSetId);

        if (error) throw error;
        toast.success('Set updated');
        setEditingSetId(null);
      } else {
        const setId = await onSaveSet(
          exercise.id,
          exercise.category || 1,
          currentSet,
          date
        );

        if (!setId) {
          toast.error('Failed to save set');
          return;
        }
        toast.success('Set saved');
      }

      await fetchTodaySets();

      setCurrentSet({
        weight: currentSet.weight,
        weight_unit: currentSet.weight_unit,
        reps: currentSet.reps,
        distance: currentSet.distance,
        distance_unit: currentSet.distance_unit,
        time: currentSet.time,
        comment: ''
      });
    } catch (err) {
      toast.error('Failed to save set');
    } finally {
      setSaving(false);
    }
  };

  const handleEditSet = (set: Workout) => {
    setEditingSetId(set.id);
    setCurrentSet({
      weight: set.weight || 0,
      weight_unit: set.weight_unit || weightUnits[0]?.id || 1,
      reps: set.reps || 0,
      distance: set.distance || 0,
      distance_unit: set.distance_unit || distanceUnits[0]?.id || 1,
      time: set.time || '00:00',
      comment: set.comment || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingSetId(null);
    fetchLastSetData();
  };

  const handleDeleteSet = async (setId: number) => {
    if (!confirm('Delete this set?')) return;

    try {
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', setId);

      if (error) throw error;

      toast.success('Set deleted');
      await fetchTodaySets();

      if (editingSetId === setId) {
        setEditingSetId(null);
        fetchLastSetData();
      }
    } catch (err) {
      console.error('Error deleting set:', err);
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <TrackerHeader exercise={exercise} onBack={onBack} />

      <Card className="p-0 overflow-hidden">
        <div className="flex border-b border-border-primary">
          <button
            onClick={() => setActiveTab('sets')}
            className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'sets'
              ? 'text-accent-secondary border-b-2 border-accent-primary'
              : 'text-text-dim hover:text-text-secondary hover:cursor-pointer'
              }`}
          >
            Track Set
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'history'
              ? 'text-accent-secondary border-b-2 border-accent-primary'
              : 'text-text-dim hover:text-text-secondary hover:cursor-pointer'
              }`}
          >
            History
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'progress'
              ? 'text-accent-secondary border-b-2 border-accent-primary'
              : 'text-text-dim hover:text-text-secondary hover:cursor-pointer'
              }`}
          >
            Progress
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'sets' && (
            <div className="space-y-6">
              <SetForm
                set={currentSet}
                measurementType={measurementType}
                isEditing={!!editingSetId}
                saving={saving}
                onUpdate={(updates) => setCurrentSet(prev => ({ ...prev, ...updates }))}
                onSave={handleSaveSet}
                onCancel={editingSetId ? handleCancelEdit : undefined}
              />

              <TodaySetsList
                sets={todaySets}
                editingSetId={editingSetId}
                onEdit={handleEditSet}
                onDelete={handleDeleteSet}
              />
            </div>
          )}
          {activeTab === 'history' && (
            <ExerciseHistory exerciseId={exercise.id} />
          )}
          {activeTab === 'progress' && (
            <ExerciseProgress exerciseId={exercise.id} measurementType={measurementType} />
          )}
        </div>
      </Card>
    </div>
  );
}
