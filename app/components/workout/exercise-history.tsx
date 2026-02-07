import React, { useState, useEffect } from 'react';
import { Trophy, MessageSquare } from 'lucide-react';
import { supabase } from '@/app/lib/supabase';
import { Workout } from '@/app/lib/schema';
import { SetNumberBadge } from '@/app/components/ui';
import { CenteredSpinner } from '../ui/spinner';
import { useUser } from '@/app/contexts/user-context';

interface Props {
  exerciseId: number;
}

interface GroupedByDate {
  date: string;
  sets: Workout[];
}

export function ExerciseHistory({ exerciseId }: Props) {
  const { user } = useUser();
  const [history, setHistory] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchHistory();
    }
  }, [exerciseId, user?.id]);

  const fetchHistory = async () => {
    try {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from('workouts')
        .select(`
          id,
          date,
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
        .eq('exercise', exerciseId)
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('id', { ascending: false });

      if (error) throw error;

      const workouts = (data || []).map((item: any) => ({
        id: item.id,
        date: item.date,
        exercise: exerciseId,
        category: 0,
        weight: item.weight,
        weight_unit: item.weight_unit,
        reps: item.reps,
        distance: item.distance,
        distance_unit: item.distance_unit,
        time: item.time,
        comment: item.comment,
        is_pr: item.is_pr,
        weight_units: item.weight_units ? { name: item.weight_units.name } : undefined,
        distance_units: item.distance_units ? { name: item.distance_units.name } : undefined
      }));

      setHistory(workouts);
    } catch (err) {
      console.error('Error fetching exercise history:', err);
    } finally {
      setLoading(false);
    }
  };

  // Group sets by date
  const groupedByDate: GroupedByDate[] = history.reduce((acc, set) => {
    const existing = acc.find(g => g.date === set.date);
    if (existing) {
      existing.sets.push(set);
    } else {
      acc.push({ date: set.date, sets: [set] });
    }
    return acc;
  }, [] as GroupedByDate[]);

  if (loading) {
    return (
      <CenteredSpinner />
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-text-muted text-sm">No previous sets recorded</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {groupedByDate.map((group) => (
        <div key={group.date} className="space-y-2">
          <h4 className="text-xs text-text-dim font-bold uppercase tracking-wider sticky top-0 bg-bg-secondary py-2">
            {new Date(group.date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </h4>
          <div className="space-y-2">
            {group.sets.map((set, idx) => (
              <div
                key={set.id}
                className="bg-bg-tertiary/30 rounded-xl"
              >
                <div className="flex items-center justify-between p-3 text-sm">
                  <div className="flex items-center gap-3">
                    <SetNumberBadge number={idx + 1} />
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex gap-3">
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
                  </div>
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
      ))}
    </div>
  );
}
