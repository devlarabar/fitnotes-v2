import { cn } from '@/app/lib/utils';
import { ReactNode } from 'react';

interface IconContainerProps {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12'
};

const variantClasses = {
  primary: 'bg-violet-500/10 text-violet-400',
  secondary: 'bg-bg-tertiary text-text-dim'
};

export function IconContainer({
  children,
  size = 'md',
  variant = 'primary',
  className
}: IconContainerProps) {
  return (
    <div
      className={cn(
        'rounded-xl flex items-center justify-center',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      {children}
    </div>
  );
}
