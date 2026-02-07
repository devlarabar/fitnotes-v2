import React, { useState } from 'react';
import { Spinner } from '../ui';
import { PRStatCard } from './pr-stat-card';
import { ProgressControls } from './progress-controls';
import { ProgressChart } from './progress-chart';
import { useExerciseProgress } from '@/app/hooks/use-exercise-progress';

interface Props {
  exerciseId: number;
  measurementType?: string;
}

type TimeRange = '30d' | '90d' | '1y' | 'all';
type ChartType = 'line' | 'bar';

export function ExerciseProgress({ exerciseId, measurementType }: Props) {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [chartType, setChartType] = useState<ChartType>('line');

  const { loading, prStats, getChartData } = useExerciseProgress(
    exerciseId,
    measurementType
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Spinner />
      </div>
    );
  }

  if (!prStats) {
    return (
      <div className="text-center py-10">
        <p className="text-text-muted text-sm">No data to show progress</p>
      </div>
    );
  }

  const chartData = getChartData(timeRange);

  return (
    <div className="space-y-6">
      <PRStatCard stats={prStats} />

      <div className="space-y-4">
        <ProgressControls
          timeRange={timeRange}
          chartType={chartType}
          onTimeRangeChange={setTimeRange}
          onChartTypeChange={setChartType}
        />

        {chartData.length > 0 ? (
          <ProgressChart data={chartData} chartType={chartType} />
        ) : (
          <div className="text-center py-10 text-text-muted text-sm">
            No data for selected time range
          </div>
        )}
      </div>
    </div>
  );
}
