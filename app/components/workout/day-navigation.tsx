import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/app/components/ui';

interface Props {
  date: Date;
  isToday: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function DayNavigation({ date, isToday, onPrevious, onNext, onToday }: Props) {
  return (
    <div className="flex items-center justify-between">
      <Button variant="ghost" onClick={onPrevious} className="p-2">
        <ChevronLeft size={24} />
      </Button>

      <div className="text-center">
        <h2 className="text-2xl font-black text-text-primary">
          {date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric'
          })}
        </h2>
        {!isToday && (
          <Button
            variant="ghost"
            onClick={onToday}
            className="text-xs text-text-dim hover:text-accent-secondary mt-1 mx-auto"
          >
            Go to Today
          </Button>
        )}
      </div>

      <Button variant="ghost" onClick={onNext} className="p-2">
        <ChevronRight size={24} />
      </Button>
    </div>
  );
}
