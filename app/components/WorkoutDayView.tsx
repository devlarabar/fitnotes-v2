import React, { useState } from 'react';
import { Dumbbell, Trash2, Save, X } from 'lucide-react';
import { Workout, Exercise, WeightUnit, DistanceUnit } from '@/app/lib/schema';
import { Button, Card } from './ui';
import { SetInputs } from './SetInputs';
import { supabase } from '@/app/lib/supabase';
import { toast } from 'sonner';

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
  weightUnits: WeightUnit[];
  distanceUnits: DistanceUnit[];
  onUpdate?: () => void;
  showTitle?: boolean;
}

export function WorkoutDayView({
  date,
  groupedWorkouts,
  exercises,
  weightUnits,
  distanceUnits,
  onUpdate,
  showTitle = true
}: Props) {
  const [editingSetId, setEditingSetId] = useState<number | null>(null);
  const [editedSet, setEditedSet] = useState<Workout | null>(null);
  const [saving, setSaving] = useState(false);

  const handleStartEdit = (set: Workout) => {
    setEditingSetId(set.id);
    setEditedSet({ ...set });
  };

  const handleCancelEdit = () => {
    setEditingSetId(null);
    setEditedSet(null);
  };

  const handleSaveSet = async () => {
    if (!editedSet) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('workouts')
        .update({
          weight: editedSet.weight || null,
          weight_unit: editedSet.weight_unit || null,
          reps: editedSet.reps || null,
          distance: editedSet.distance || null,
          distance_unit: editedSet.distance_unit || null,
          time: editedSet.time || null,
          comment: editedSet.comment || null
        })
        .eq('id', editedSet.id);

      if (error) throw error;

      toast.success('Set updated');
      if (onUpdate) onUpdate();
      setEditingSetId(null);
      setEditedSet(null);
    } catch (err) {
      console.error('Error saving set:', err);
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
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
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Error deleting set:', err);
      toast.error('Failed to delete');
    }
  };

  const handleUpdateEditedSet = (updates: any) => {
    if (editedSet) {
      setEditedSet({ ...editedSet, ...updates });
    }
  };

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
        {groupedWorkouts.map((group) => {
          const exerciseData = exercises.find(e => e.id === group.exercise.id);
          const measurementType = exerciseData?.measurement_type?.name;

          return (
            <div key={group.exercise.id} className="bg-slate-800/30 rounded-2xl p-4 border border-slate-800">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
                  <Dumbbell size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-white">{group.exercise.name}</h4>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">{group.exercise.category}</p>
                </div>
              </div>

              <div className="space-y-2">
                {group.sets.map((set, idx) => {
                  const isEditing = editingSetId === set.id;
                  const displaySet = isEditing && editedSet ? editedSet : set;

                  return (
                    <div key={set.id} className="group">
                      {isEditing ? (
                        // Edit Mode
                        <div className="flex items-end gap-3 p-2 bg-violet-500/10 rounded-xl border border-violet-500/30">
                          <div className="w-6 pb-3 text-center text-xs font-bold text-violet-400">{idx + 1}</div>
                          <SetInputs
                            set={{
                              id: displaySet.id,
                              weight: displaySet.weight,
                              weight_unit: displaySet.weight_unit,
                              reps: displaySet.reps,
                              distance: displaySet.distance,
                              distance_unit: displaySet.distance_unit,
                              time: displaySet.time
                            }}
                            measurementType={measurementType}
                            weightUnits={weightUnits}
                            distanceUnits={distanceUnits}
                            onUpdate={handleUpdateEditedSet}
                          />
                          <div className="flex gap-2 mb-1.5">
                            <Button
                              variant="ghost"
                              onClick={handleCancelEdit}
                              className="p-2 h-auto text-slate-500 hover:text-white"
                              disabled={saving}
                            >
                              <X size={16} />
                            </Button>
                            <Button
                              variant="primary"
                              onClick={handleSaveSet}
                              className="p-2 h-auto"
                              disabled={saving}
                            >
                              {saving ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <Save size={16} />
                              )}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <div
                          className="flex items-center gap-3 p-2 bg-slate-900/50 rounded-xl cursor-pointer hover:bg-slate-900 transition-colors"
                          onClick={() => handleStartEdit(set)}
                        >
                          <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500">
                            {idx + 1}
                          </div>
                          <div className="flex-1 flex gap-4 text-sm">
                            {set.weight !== null && set.weight !== undefined && (
                              <span className="font-bold text-violet-400">
                                {set.weight} {set.weight_units?.name}
                              </span>
                            )}
                            {set.reps !== null && set.reps !== undefined && (
                              <span className="text-slate-300">{set.reps} reps</span>
                            )}
                            {set.distance !== null && set.distance !== undefined && (
                              <span className="font-bold text-violet-400">
                                {set.distance} {set.distance_units?.name}
                              </span>
                            )}
                            {set.time && (
                              <span className="text-slate-300">{set.time}</span>
                            )}
                          </div>
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
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
