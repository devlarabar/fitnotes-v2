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
import { useWorkoutData } from '@/app/contexts/workout-data-context';
import { useUser } from '@/app/contexts/user-context';
import { normalizeTimeForDb } from '@/app/lib/time';
import { ConfirmModal } from '@/app/components/ui/confirm-modal';

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
  const { user } = useUser();
  const {
    weightUnits, distanceUnits, workouts,
    deleteWorkout, updateWorkout,
  } = useWorkoutData();
  const [activeTab, setActiveTab] = useState<'sets' | 'history' | 'progress'>('sets');
  const [setDate, setSetDate] = useState(date);
  const [currentSet, setCurrentSet] = useState<LocalSet>({
    weight: 0,
    weight_unit: weightUnits[0]?.id || 1,
    reps: 0,
    distance: 0,
    distance_unit: distanceUnits[0]?.id || 1,
    comment: ''
  });
  const [saving, setSaving] = useState(false);
  const [todaySets, setTodaySets] = useState<Workout[]>([]);
  const [editingSetId, setEditingSetId] = useState<number | null>(null);
  const [deleteSetId, setDeleteSetId] = useState<number | null>(null);

  const measurementType = exercise.measurement_type?.name;

  useEffect(() => {
    fetchLastSetData();
    updateTodaySetsFromCache();
  }, [exercise.id, setDate, workouts]);

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchLastSetData = async () => {
    try {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('workouts')
        .select('weight, weight_unit, reps, distance, distance_unit, time')
        .eq('exercise', exercise.id)
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('id', { ascending: false })
        .limit(1)
        .single();

      if (data && !error) {
        setCurrentSet({
          weight: data.weight || 0,
          weight_unit: data.weight_unit || weightUnits[0]?.id || 1,
          reps: data.reps || 0,
          distance: 0,
          distance_unit: data.distance_unit || distanceUnits[0]?.id || 1,
          comment: ''
        });
      }
    } catch (err) {
      console.error('Error fetching last set:', err);
    }
  };

  const updateTodaySetsFromCache = () => {
    const dateStr = formatDate(setDate);
    const sets = workouts.filter(w =>
      w.exercise === exercise.id && w.date === dateStr
    );
    setTodaySets(sets);
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
            time: normalizeTimeForDb(currentSet.time, measurementType),
            comment: currentSet.comment || null
          })
          .eq('id', editingSetId);

        if (error) throw error;
        updateWorkout(editingSetId, {
          weight: currentSet.weight || undefined,
          weight_unit: currentSet.weight_unit || undefined,
          reps: currentSet.reps || undefined,
          distance: currentSet.distance || undefined,
          distance_unit: currentSet.distance_unit || undefined,
          time: normalizeTimeForDb(
            currentSet.time, measurementType
          ) || undefined,
          comment: currentSet.comment || undefined,
        });
        toast.success('Set updated');
        setEditingSetId(null);
      } else {
        const normalizedSet = {
          ...currentSet,
          time: normalizeTimeForDb(currentSet.time, measurementType),
        };
        const setId = await onSaveSet(
          exercise.id,
          exercise.category || 1,
          normalizedSet,
          setDate
        );

        if (!setId) {
          toast.error('Failed to save set');
          return;
        }
        toast.success('Set saved');
      }

      updateTodaySetsFromCache();

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
      time: set.time || undefined,
      comment: set.comment || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingSetId(null);
    fetchLastSetData();
  };

  const handleDeleteSet = (setId: number) => {
    setDeleteSetId(setId);
  };

  const confirmDeleteSet = async () => {
    if (!deleteSetId) return;

    try {
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', deleteSetId);

      if (error) throw error;

      toast.success('Set deleted');
      deleteWorkout(deleteSetId);

      if (editingSetId === deleteSetId) {
        setEditingSetId(null);
        fetchLastSetData();
      }
    } catch (err) {
      console.error('Error deleting set:', err);
      toast.error('Failed to delete');
    } finally {
      setDeleteSetId(null);
    }
  };

  return (
    <div className="space-y-6">
      <ConfirmModal
        open={deleteSetId !== null}
        onOpenChange={(open) => { if (!open) setDeleteSetId(null); }}
        title="Delete this set?"
        description="This action cannot be undone."
        onConfirm={confirmDeleteSet}
      />
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
                date={setDate}
                onDateChange={setSetDate}
                measurementType={measurementType}
                isEditing={!!editingSetId}
                saving={saving}
                onUpdate={(updates) => setCurrentSet(prev => ({ ...prev, ...updates }))}
                onSave={handleSaveSet}
                onCancel={editingSetId ? handleCancelEdit : undefined}
              />

              <TodaySetsList
                sets={todaySets}
                date={setDate}
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
