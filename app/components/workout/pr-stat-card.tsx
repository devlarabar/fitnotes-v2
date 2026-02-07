import React from 'react';
import { Trophy, Info } from 'lucide-react';
import { Card } from '../ui';
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';

interface WeightStats {
  type: 'weight';
  maxWeight: number;
  bestReps: number;
  unit: string;
}

interface DistanceStats {
  type: 'distance';
  maxDistance: number;
  bestTime: number;
  unit: string;
}

interface TimeStats {
  type: 'time';
  maxTime: number;
}

type PRStats = WeightStats | DistanceStats | TimeStats;

interface Props {
  stats: PRStats;
}

export function PRStatCard({ stats }: Props) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <Card className="p-6 bg-linear-to-br from-violet-500/10 to-pink-500/10 border-accent-primary/20">
      <div className="flex items-center gap-3 mb-4">
        <Trophy size={20} className="text-yellow-500" />
        <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider">
          Personal Records
        </h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {stats.type === 'weight' && (
          <>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <p className="text-xs text-text-dim">Max Weight</p>
                <Tooltip>
                  <TooltipTrigger>
                    <Info 
                      size={12} 
                      className="text-text-dim hover:text-text-secondary" 
                    />
                  </TooltipTrigger>
                  <TooltipContent 
                    className="bg-bg-tertiary text-text-primary border border-border-primary"
                  >
                    The heaviest weight you&apos;ve lifted for this exercise
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-3xl font-black text-text-primary">
                {stats.maxWeight}{' '}
                <span className="text-lg text-accent-secondary">{stats.unit}</span>
              </p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <p className="text-xs text-text-dim">Best Reps</p>
                <Tooltip>
                  <TooltipTrigger>
                    <Info 
                      size={12} 
                      className="text-text-dim hover:text-text-secondary" 
                    />
                  </TooltipTrigger>
                  <TooltipContent 
                    className="bg-bg-tertiary text-text-primary border border-border-primary"
                  >
                    Most reps completed at your max weight
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-3xl font-black text-text-primary">
                {stats.bestReps}
              </p>
            </div>
          </>
        )}
        {stats.type === 'distance' && (
          <>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <p className="text-xs text-text-dim">Longest Distance</p>
                <Tooltip>
                  <TooltipTrigger>
                    <Info 
                      size={12} 
                      className="text-text-dim hover:text-text-secondary" 
                    />
                  </TooltipTrigger>
                  <TooltipContent 
                    className="bg-bg-tertiary text-text-primary border border-border-primary"
                  >
                    The farthest distance you&apos;ve covered
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-3xl font-black text-text-primary">
                {stats.maxDistance}{' '}
                <span className="text-lg text-accent-secondary">{stats.unit}</span>
              </p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <p className="text-xs text-text-dim">Best Time</p>
                <Tooltip>
                  <TooltipTrigger>
                    <Info 
                      size={12} 
                      className="text-text-dim hover:text-text-secondary" 
                    />
                  </TooltipTrigger>
                  <TooltipContent 
                    className="bg-bg-tertiary text-text-primary border border-border-primary"
                  >
                    Fastest time at your longest distance
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-3xl font-black text-text-primary">
                {formatTime(stats.bestTime)}
              </p>
            </div>
          </>
        )}
        {stats.type === 'time' && (
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <p className="text-xs text-text-dim">Longest Time</p>
              <Tooltip>
                <TooltipTrigger>
                  <Info 
                    size={12} 
                    className="text-text-dim hover:text-text-secondary" 
                  />
                </TooltipTrigger>
                <TooltipContent 
                  className="bg-bg-tertiary text-text-primary border border-border-primary"
                >
                  The longest duration you&apos;ve held this exercise
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-3xl font-black text-text-primary">
              {formatTime(stats.maxTime)}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
