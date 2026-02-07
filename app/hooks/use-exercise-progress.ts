import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { Workout } from '@/app/lib/schema';

type TimeRange = '30d' | '90d' | '1y' | 'all';

export function useExerciseProgress(
  exerciseId: number,
  measurementType?: string
) {
  const [history, setHistory] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

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
          reps,
          distance,
          time,
          is_pr,
          weight_units(name),
          distance_units(name)
        `)
        .eq('exercise', exerciseId)
        .order('date', { ascending: true });

      if (error) throw error;

      const workouts = (data || []).map((item: any) => ({
        id: item.id,
        date: item.date,
        exercise: exerciseId,
        category: 0,
        weight: item.weight,
        reps: item.reps,
        distance: item.distance,
        time: item.time,
        is_pr: item.is_pr,
        weight_units: item.weight_units 
          ? { name: item.weight_units.name } 
          : undefined,
        distance_units: item.distance_units 
          ? { name: item.distance_units.name } 
          : undefined
      }));

      setHistory(workouts);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPRStats = () => {
    if (history.length === 0) return null;

    const timeToSeconds = (t: string): number => {
      const [mins, secs] = t.split(':').map(Number);
      return (mins || 0) * 60 + (secs || 0);
    };

    if (measurementType !== 'distance' && measurementType !== 'time') {
      const maxWeight = Math.max(...history.map(s => s.weight || 0));
      const setsAtMaxWeight = history.filter(s => s.weight === maxWeight);
      const bestSet = setsAtMaxWeight.reduce((best, current) => {
        return (current.reps || 0) > (best.reps || 0) ? current : best;
      }, setsAtMaxWeight[0]);

      return {
        type: 'weight' as const,
        maxWeight,
        bestReps: bestSet?.reps || 0,
        unit: bestSet?.weight_units?.name || 'kg'
      };
    }

    if (measurementType === 'distance') {
      const maxDistance = Math.max(...history.map(s => s.distance || 0));
      const setsAtMaxDistance = history.filter(
        s => s.distance === maxDistance && s.time
      );
      const bestSet = setsAtMaxDistance.reduce((best, current) => {
        const bestTime = timeToSeconds(best.time!);
        const currentTime = timeToSeconds(current.time!);
        return currentTime < bestTime ? current : best;
      }, setsAtMaxDistance[0]);

      return {
        type: 'distance' as const,
        maxDistance,
        bestTime: bestSet?.time ? timeToSeconds(bestSet.time) : 0,
        unit: bestSet?.distance_units?.name || 'km'
      };
    }

    if (measurementType === 'time') {
      const maxTime = Math.max(
        ...history.filter(s => s.time).map(s => timeToSeconds(s.time!))
      );

      return {
        type: 'time' as const,
        maxTime
      };
    }

    return null;
  };

  const getFilteredData = (timeRange: TimeRange) => {
    const now = new Date();
    const cutoffDate = new Date();

    switch (timeRange) {
      case '30d':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        cutoffDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
        return history;
    }

    return history.filter(w => new Date(w.date) >= cutoffDate);
  };

  const getChartData = (timeRange: TimeRange) => {
    const filtered = getFilteredData(timeRange);

    const timeToSeconds = (t: string): number => {
      const [mins, secs] = t.split(':').map(Number);
      return (mins || 0) * 60 + (secs || 0);
    };

    const grouped = filtered.reduce((acc, set) => {
      const existing = acc.find(d => d.date === set.date);

      let value = 0;
      if (measurementType === 'distance') {
        value = set.distance || 0;
      } else if (measurementType === 'time') {
        value = set.time ? timeToSeconds(set.time) : 0;
      } else {
        value = set.weight || 0;
      }

      if (!existing) {
        acc.push({ date: set.date, value });
      } else if (value > existing.value) {
        existing.value = value;
      }

      return acc;
    }, [] as { date: string; value: number }[]);

    return grouped.map(d => ({
      date: new Date(d.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      }),
      value: d.value
    }));
  };

  return {
    loading,
    prStats: getPRStats(),
    getChartData
  };
}
