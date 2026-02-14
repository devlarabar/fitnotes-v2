import React, { useState } from 'react';
import { Trash2, Trophy, MessageSquare, Save, X } from 'lucide-react';
import { Workout } from '@/app/lib/schema';
import { Button, SetNumberBadge, SpinnerInline } from '../ui';
import { Textarea } from '../ui/form/textarea';
import { SetInputs } from '../set-inputs';
import { useWorkoutData } from '@/app/contexts/workout-data-context';
import { supabase } from '@/app/lib/supabase';
import { toast } from 'sonner';
import { normalizeTimeForDb } from '@/app/lib/time';

interface Props {
  set: Workout;
  index: number;
  measurementType?: string;
  onUpdate: () => void;
}

export function SetRow({ set, index, measurementType, onUpdate }: Props) {
  const { weightUnits, distanceUnits, updateWorkout, deleteWorkout, addWorkout } = useWorkoutData();
  const [isEditing, setIsEditing] = useState(false);
  const [editedSet, setEditedSet] = useState(set);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    
    // Optimistically update cache
    const backup = { ...set };
    updateWorkout(editedSet.id, {
      weight: editedSet.weight,
      weight_unit: editedSet.weight_unit,
      reps: editedSet.reps,
      distance: editedSet.distance,
      distance_unit: editedSet.distance_unit,
      time: editedSet.time,
      comment: editedSet.comment
    });

    try {
      const { error } = await supabase
        .from('workouts')
        .update({
          weight: editedSet.weight || null,
          weight_unit: editedSet.weight_unit || null,
          reps: editedSet.reps || null,
          distance: editedSet.distance || null,
          distance_unit: editedSet.distance_unit || null,
          time: normalizeTimeForDb(editedSet.time, measurementType),
          comment: editedSet.comment || null
        })
        .eq('id', editedSet.id);

      if (error) throw error;

      toast.success('Set updated');
      setIsEditing(false);
      onUpdate();
    } catch (err) {
      // Rollback on error
      updateWorkout(backup.id, backup);
      console.error('Error saving set:', err);
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this set?')) return;

    // Optimistically delete from cache
    const backup = { ...set };
    deleteWorkout(set.id);

    try {
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', set.id);

      if (error) throw error;

      toast.success('Set deleted');
      onUpdate();
    } catch (err) {
      // Rollback on error
      addWorkout(backup);
      console.error('Error deleting set:', err);
      toast.error('Failed to delete');
    }
  };

  const handleCancel = () => {
    setEditedSet(set);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="space-y-2 p-2 bg-accent-primary/10 rounded-xl border border-accent-primary/30">
        <div className="flex items-end gap-3">
          <div className="w-6 pb-3 text-center text-xs font-bold text-accent-secondary">
            {index + 1}
          </div>
          <SetInputs
            set={editedSet}
            measurementType={measurementType}
            weightUnits={weightUnits}
            distanceUnits={distanceUnits}
            onUpdate={(updates) => setEditedSet(prev => ({ ...prev, ...updates } as Workout))}
          />
          <div className="flex gap-2 mb-1.5">
            <Button
              variant="ghost"
              onClick={handleCancel}
              className="p-2 h-auto text-text-primary0 hover:text-text-primary"
              disabled={saving}
            >
              <X size={16} />
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              className="p-2 h-auto"
              disabled={saving}
            >
              {saving ? <SpinnerInline /> : <Save size={16} />}
            </Button>
          </div>
        </div>
        <Textarea
          placeholder="Add a note (optional)"
          value={editedSet.comment || ''}
          onChange={(e) => setEditedSet(prev => ({ ...prev, comment: e.target.value }))}
          className="bg-bg-tertiary border-border-primary text-text-primary"
        />
      </div>
    );
  }

  return (
    <div className="bg-bg-secondary/50 rounded-xl">
      <div
        className="flex items-center gap-3 p-2 cursor-pointer hover:bg-bg-secondary transition-colors"
        onClick={() => setIsEditing(true)}
      >
        <SetNumberBadge number={index + 1} className="bg-bg-tertiary" />
        <div className="flex-1 flex items-center gap-4 text-sm min-w-0">
          <div className="flex gap-4">
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
          {set.comment && (
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <MessageSquare size={12} className="text-text-subtle shrink-0" />
              <span className="text-xs text-text-primary0 truncate">
                {set.comment}
              </span>
            </div>
          )}
        </div>
        {set.is_pr && (
          <Trophy size={16} className="text-yellow-500 shrink-0" />
        )}
        <Button
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          className="p-2 h-auto text-text-faint hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 size={16} />
        </Button>
      </div>
    </div>
  );
}
