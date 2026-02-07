import { cn } from '@/app/lib/utils';

interface SetNumberBadgeProps {
  number: number;
  className?: string;
}

export function SetNumberBadge({ number, className }: SetNumberBadgeProps) {
  return (
    <div
      className={cn(
        `w-6 h-6 rounded-lg bg-bg-tertiary flex items-center justify-center 
        text-xs font-bold text-text-dim`,
        className
      )}
    >
      {number}
    </div>
  );
}
