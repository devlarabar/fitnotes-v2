import React from 'react';
import { Button } from '../ui';

type TimeRange = '30d' | '90d' | '1y' | 'all';
type ChartType = 'line' | 'bar';

interface Props {
  timeRange: TimeRange;
  chartType: ChartType;
  onTimeRangeChange: (range: TimeRange) => void;
  onChartTypeChange: (type: ChartType) => void;
}

const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  '30d': '30 Days',
  '90d': '90 Days',
  '1y': '1 Year',
  'all': 'All Time'
};

export function ProgressControls({
  timeRange,
  chartType,
  onTimeRangeChange,
  onChartTypeChange
}: Props) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex gap-2">
        {(['30d', '90d', '1y', 'all'] as TimeRange[]).map((range) => (
          <Button
            key={range}
            variant={timeRange === range ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => onTimeRangeChange(range)}
          >
            {TIME_RANGE_LABELS[range]}
          </Button>
        ))}
      </div>
      <div className="flex gap-2">
        <Button
          variant={chartType === 'line' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => onChartTypeChange('line')}
        >
          Line
        </Button>
        <Button
          variant={chartType === 'bar' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => onChartTypeChange('bar')}
        >
          Bar
        </Button>
      </div>
    </div>
  );
}
