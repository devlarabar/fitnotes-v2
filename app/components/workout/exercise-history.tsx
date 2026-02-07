import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Trophy } from 'lucide-react';
import { supabase } from '@/app/lib/supabase';
import { Workout } from '@/app/lib/schema';
import { Button } from '@/app/components/ui';

interface Props {
  exerciseId: number;
}

const SETS_PER_PAGE = 20;

export function ExerciseHistory({ exerciseId }: Props) {
  const [history, setHistory] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetchHistory();
  }, [exerciseId]);

  const fetchHistory = async () => {
    try {
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
          is_pr,
          weight_units(name),
          distance_units(name)
        `)
        .eq('exercise', exerciseId)
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

  const totalPages = Math.ceil(history.length / SETS_PER_PAGE);
  const startIdx = page * SETS_PER_PAGE;
  const endIdx = startIdx + SETS_PER_PAGE;
  const paginatedHistory = history.slice(startIdx, endIdx);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="w-8 h-8 border-4 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
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
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-text-dim font-bold uppercase tracking-wider">
          {history.length} total sets
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1 h-auto"
            >
              <ChevronLeft size={16} />
            </Button>
            <span className="text-xs text-text-dim font-bold">
              {page + 1} / {totalPages}
            </span>
            <Button
              variant="ghost"
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="p-1 h-auto"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-2 max-h-100 overflow-y-auto">
        {paginatedHistory.map((set, idx) => (
          <div
            key={set.id}
            className="flex items-center justify-between p-3 bg-bg-tertiary/30 rounded-xl text-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg bg-bg-tertiary flex items-center justify-center text-xs font-bold text-text-dim">
                {startIdx + idx + 1}
              </div>
              <span className="text-text-dim text-xs">
                {new Date(set.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
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
        ))}
      </div>
    </div>
  );
}
