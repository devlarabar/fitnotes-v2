import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Save, Trophy, X } from 'lucide-react';
import { Exercise, WeightUnit, DistanceUnit, Workout } from '@/app/lib/schema';
import { Button, Card, Badge } from '@/app/components/ui';
import { SetInputs } from '@/app/components/set-inputs';
import { ExerciseHistory } from './exercise-history';
import { supabase } from '@/app/lib/supabase';
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
  const [todaySets, setTodaySets] = useState<Workout[]>([]);
  const [editingSetId, setEditingSetId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const measurementType = exercise.measurement_type?.name;

  // Fetch last set data and today's sets on mount
  useEffect(() => {
    fetchLastSetData();
    fetchTodaySets();
  }, [exercise.id, date]);

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
          time: data.time || '00:00'
        });
      }
    } catch (err) {
      console.error('Error fetching last set:', err);
    }
  };

  const fetchTodaySets = async () => {
    try {
      setLoading(true);
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
        is_pr: item.is_pr,
        weight_units: item.weight_units ? { name: item.weight_units.name } : undefined,
        distance_units: item.distance_units ? { name: item.distance_units.name } : undefined
      }));

      setTodaySets(workouts);
    } catch (err) {
      console.error('Error fetching today sets:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSaveSet = async () => {
    setSaving(true);
    try {
      if (editingSetId) {
        // Update existing set
        const { error } = await supabase
          .from('workouts')
          .update({
            weight: currentSet.weight || null,
            weight_unit: currentSet.weight_unit || null,
            reps: currentSet.reps || null,
            distance: currentSet.distance || null,
            distance_unit: currentSet.distance_unit || null,
            time: currentSet.time || null
          })
          .eq('id', editingSetId);

        if (error) throw error;
        toast.success('Set updated');
        setEditingSetId(null);
      } else {
        // Create new set
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

      // Refresh today's sets
      await fetchTodaySets();
      
      // Keep current values for next set
      setCurrentSet({
        weight: currentSet.weight,
        weight_unit: currentSet.weight_unit,
        reps: currentSet.reps,
        distance: currentSet.distance,
        distance_unit: currentSet.distance_unit,
        time: currentSet.time
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
      time: set.time || '00:00'
    });
  };

  const handleCancelEdit = () => {
    setEditingSetId(null);
    fetchLastSetData(); // Reset to last set data
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

              <div className="flex gap-2">
                {editingSetId && (
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={handleCancelEdit}
                    disabled={saving}
                    className="flex-1"
                  >
                    <X size={18} />
                    Cancel
                  </Button>
                )}
                <Button
                  variant="accent"
                  size="lg"
                  onClick={handleSaveSet}
                  disabled={saving}
                  className={editingSetId ? 'flex-1' : 'w-full'}
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      {editingSetId ? 'Update Set' : 'Save Set'}
                    </>
                  )}
                </Button>
              </div>

              {/* Today's Sets */}
              {todaySets.length > 0 && (
                <div className="space-y-2 pt-4 border-t border-border-primary">
                  <p className="text-xs text-text-dim font-bold uppercase tracking-wider">
                    Today's Sets ({todaySets.length})
                  </p>
                  <div className="space-y-2">
                    {todaySets.map((set, idx) => (
                      <div
                        key={set.id}
                        className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                          editingSetId === set.id
                            ? 'bg-violet-500/20 border border-violet-500/50'
                            : 'bg-bg-tertiary/30 hover:bg-bg-tertiary/50'
                        }`}
                        onClick={() => handleEditSet(set)}
                      >
                        <div className="w-6 h-6 rounded-lg bg-bg-tertiary flex items-center justify-center text-xs font-bold text-text-dim">
                          {idx + 1}
                        </div>
                        <div className="flex-1 flex gap-3 text-sm">
                          {set.weight !== null && set.weight !== undefined && (
                            <span className="font-bold text-accent-secondary">
                              {set.weight} {set.weight_units?.name}
                            </span>
                          )}
                          {set.reps !== null && set.reps !== undefined && (
                            <span className="text-text-secondary">{set.reps} reps</span>
                          )}
                          {set.distance !== null && set.distance !== undefined && (
                            <span className="font-bold text-accent-secondary">
                              {set.distance} {set.distance_units?.name}
                            </span>
                          )}
                          {set.time && (
                            <span className="text-text-secondary">{set.time}</span>
                          )}
                        </div>
                        {set.is_pr && (
                          <Trophy size={16} className="text-yellow-500" />
                        )}
                        <Button
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSet(set.id);
                          }}
                          className="p-2 h-auto text-slate-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <ExerciseHistory exerciseId={exercise.id} />
          )}
        </div>
      </Card>
    </div>
  );
}
