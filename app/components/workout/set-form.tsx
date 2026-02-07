import React from 'react';
import { Save, X } from 'lucide-react';
import { Button, SpinnerInline } from '../ui';
import { Textarea } from '../ui/form/textarea';
import { SetInputs } from '../set-inputs';
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
  set: LocalSet;
  measurementType?: string;
  isEditing: boolean;
  saving: boolean;
  onUpdate: (updates: any) => void;
  onSave: () => void;
  onCancel?: () => void;
}

export function SetForm({
  set,
  measurementType,
  isEditing,
  saving,
  onUpdate,
  onSave,
  onCancel
}: Props) {
  const { weightUnits, distanceUnits } = useWorkout();

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-end gap-3">
          <SetInputs
            set={{ id: 'current', ...set }}
            measurementType={measurementType}
            weightUnits={weightUnits}
            distanceUnits={distanceUnits}
            onUpdate={onUpdate}
          />
        </div>
        
        <Textarea
          placeholder="Add a note (optional)"
          value={set.comment || ''}
          onChange={(e) => onUpdate({ comment: e.target.value })}
          className="bg-bg-tertiary border-border-primary text-text-primary"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {isEditing && onCancel ? (
          <>
            <Button
              variant="ghost"
              size="lg"
              onClick={onCancel}
              disabled={saving}
            >
              <X size={18} />
              Cancel
            </Button>
            <Button
              variant="accent"
              size="lg"
              onClick={onSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <SpinnerInline />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Update Set
                </>
              )}
            </Button>
          </>
        ) : (
          <Button
            variant="accent"
            size="lg"
            onClick={onSave}
            disabled={saving}
            className="col-span-2"
          >
            {saving ? (
              <>
                <SpinnerInline />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Set
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
