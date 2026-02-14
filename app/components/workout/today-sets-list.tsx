import React from 'react';
import { Trash2, Trophy, MessageSquare } from 'lucide-react';
import { Workout } from '@/app/lib/schema';
import { Button, SetNumberBadge } from '../ui';

interface Props {
  sets: Workout[];
  date: Date;
  editingSetId: number | null;
  onEdit: (set: Workout) => void;
  onDelete: (setId: number) => void;
}

export function TodaySetsList({ sets, date, editingSetId, onEdit, onDelete }: Props) {
  if (sets.length === 0) return null;

  const isToday = date.toDateString() === new Date().toDateString();
  const dateLabel = isToday
    ? 'today'
    : date.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric'
    });
  const count = sets.length;
  const label = `${count} set${count !== 1 ? 's' : ''} for ${dateLabel}`;

  return (
    <div className="space-y-2 pt-4 border-t border-border-primary">
      <p className="text-xs text-text-dim font-bold uppercase tracking-wider">
        {label}
      </p>
      <div className="space-y-2">
        {sets.map((set, idx) => (
          <div
            key={set.id}
            className={`group rounded-xl cursor-pointer transition-colors ${
              editingSetId === set.id
                ? 'bg-accent-primary/20 border border-accent-primary/50'
                : 'bg-bg-tertiary/30 hover:bg-bg-tertiary/50'
            }`}
            onClick={() => onEdit(set)}
          >
            <div className="flex items-center gap-3 p-3">
              <SetNumberBadge number={idx + 1} />
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
                  onDelete(set.id);
                }}
                className="p-2 h-auto text-text-faint hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={16} />
              </Button>
            </div>
            {set.comment && (
              <div className="px-3 pb-3 pt-0">
                <div className="flex items-start gap-1.5">
                  <MessageSquare size={12} className="text-text-subtle shrink-0 mt-0.5" />
                  <p className="text-xs text-text-muted italic">{set.comment}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
