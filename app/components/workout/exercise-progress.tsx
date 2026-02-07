import React, { useState, useEffect } from 'react';
import { Trophy, Info } from 'lucide-react';
import { supabase } from '@/app/lib/supabase';
import { Workout } from '@/app/lib/schema';
import { Button, Card, Spinner } from '../ui';
import { Tooltip as ChartTooltip, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';

interface Props {
  exerciseId: number;
  measurementType?: string;
}

type TimeRange = '30d' | '90d' | '1y' | 'all';
type ChartType = 'line' | 'bar';

export function ExerciseProgress({ exerciseId, measurementType }: Props) {
  const [history, setHistory] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [chartType, setChartType] = useState<ChartType>('line');

  useEffect(() => {
    fetchHistory();
  }, [exerciseId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('workouts')
        .select('id, date, weight, reps, distance, time, is_pr, weight_units(name), distance_units(name)')
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
        weight_units: item.weight_units ? { name: item.weight_units.name } : undefined,
        distance_units: item.distance_units ? { name: item.distance_units.name } : undefined
      }));

      setHistory(workouts);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredData = () => {
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

  const getPRStats = () => {
    if (history.length === 0) return null;

    // Weight/Reps exercises
    if (measurementType !== 'distance' && measurementType !== 'time') {
      // Find the highest weight
      const maxWeight = Math.max(...history.map(s => s.weight || 0));
      
      // Of all sets at max weight, find the most reps
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

    // Distance exercises
    if (measurementType === 'distance') {
      const timeToSeconds = (t: string): number => {
        const [mins, secs] = t.split(':').map(Number);
        return (mins || 0) * 60 + (secs || 0);
      };

      // Find the longest distance
      const maxDistance = Math.max(...history.map(s => s.distance || 0));
      
      // Of all sets at max distance, find the fastest time
      const setsAtMaxDistance = history.filter(s => s.distance === maxDistance && s.time);
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

    // Time exercises
    if (measurementType === 'time') {
      const timeToSeconds = (t: string): number => {
        const [mins, secs] = t.split(':').map(Number);
        return (mins || 0) * 60 + (secs || 0);
      };

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

  const getChartData = () => {
    const filtered = getFilteredData();
    
    // Group by date and get max value per day
    const grouped = filtered.reduce((acc, set) => {
      const existing = acc.find(d => d.date === set.date);
      
      if (measurementType === 'distance') {
        const value = set.distance || 0;
        if (!existing) {
          acc.push({ date: set.date, value });
        } else if (value > existing.value) {
          existing.value = value;
        }
      } else if (measurementType === 'time') {
        const timeToSeconds = (t: string): number => {
          const [mins, secs] = t.split(':').map(Number);
          return (mins || 0) * 60 + (secs || 0);
        };
        const value = set.time ? timeToSeconds(set.time) : 0;
        if (!existing) {
          acc.push({ date: set.date, value });
        } else if (value > existing.value) {
          existing.value = value;
        }
      } else {
        // Weight/reps - use weight as primary metric
        const value = set.weight || 0;
        if (!existing) {
          acc.push({ date: set.date, value });
        } else if (value > existing.value) {
          existing.value = value;
        }
      }
      
      return acc;
    }, [] as { date: string; value: number }[]);

    return grouped.map(d => ({
      date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: d.value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Spinner />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-text-muted text-sm">No data to show progress</p>
      </div>
    );
  }

  const prStats = getPRStats();
  const chartData = getChartData();

  return (
    <div className="space-y-6">
      {/* PR Stats */}
      {prStats && (
        <Card className="p-6 bg-linear-to-br from-violet-500/10 to-pink-500/10 border-violet-500/20">
          <div className="flex items-center gap-3 mb-4">
            <Trophy size={20} className="text-yellow-500" />
            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider">
              Personal Records
            </h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {prStats.type === 'weight' && (
              <>
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <p className="text-xs text-text-dim">Max Weight</p>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info size={12} className="text-text-dim hover:text-text-secondary" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-slate-800 text-white border border-slate-700">
                        The heaviest weight you've lifted for this exercise
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-3xl font-black text-white">
                    {prStats.maxWeight} <span className="text-lg text-violet-400">{prStats.unit}</span>
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <p className="text-xs text-text-dim">Best Reps</p>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info size={12} className="text-text-dim hover:text-text-secondary" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-slate-800 text-white border border-slate-700">
                        Most reps completed at your max weight
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-3xl font-black text-white">{prStats.bestReps}</p>
                </div>
              </>
            )}
            {prStats.type === 'distance' && (
              <>
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <p className="text-xs text-text-dim">Longest Distance</p>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info size={12} className="text-text-dim hover:text-text-secondary" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-slate-800 text-white border border-slate-700">
                        The farthest distance you've covered
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-3xl font-black text-white">
                    {prStats.maxDistance} <span className="text-lg text-violet-400">{prStats.unit}</span>
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <p className="text-xs text-text-dim">Best Time</p>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info size={12} className="text-text-dim hover:text-text-secondary" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-slate-800 text-white border border-slate-700">
                        Fastest time at your longest distance
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-3xl font-black text-white">
                    {Math.floor((prStats.bestTime || 0) / 60)}:{String((prStats.bestTime || 0) % 60).padStart(2, '0')}
                  </p>
                </div>
              </>
            )}
            {prStats.type === 'time' && (
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <p className="text-xs text-text-dim">Longest Time</p>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info size={12} className="text-text-dim hover:text-text-secondary" />
                    </TooltipTrigger>
                    <TooltipContent className="bg-slate-800 text-white border border-slate-700">
                      The longest duration you've held this exercise
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-3xl font-black text-white">
                  {Math.floor((prStats.maxTime || 0) / 60)}:{String((prStats.maxTime || 0) % 60).padStart(2, '0')}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Chart Controls */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-2">
          {(['30d', '90d', '1y', 'all'] as TimeRange[]).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : range === '1y' ? '1 Year' : 'All Time'}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button
            variant={chartType === 'line' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setChartType('line')}
          >
            Line
          </Button>
          <Button
            variant={chartType === 'bar' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setChartType('bar')}
          >
            Bar
          </Button>
        </div>
      </div>

      {/* Chart */}
      <Card className="p-6">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b"
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <YAxis 
                  stroke="#64748b"
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <ChartTooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    color: '#f8fafc'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            ) : (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b"
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <YAxis 
                  stroke="#64748b"
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <ChartTooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    color: '#f8fafc'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  fill="#8b5cf6"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
