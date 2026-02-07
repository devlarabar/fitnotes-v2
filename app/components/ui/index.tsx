import React from 'react';
import { cn } from '@/app/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
}

export const Card = ({ children, className, glass, ...props }: CardProps) => (
  <div 
    className={cn(
      "bg-bg-secondary border border-border-primary rounded-3xl p-4 transition-all duration-300",
      glass && "bg-bg-secondary/50 backdrop-blur-md",
      props.onClick && "active:scale-[0.98] cursor-pointer hover:border-border-primary/50 hover:bg-bg-tertiary/30",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'accent' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className, 
  ...props 
}: ButtonProps) => {
  const variants = {
    primary: "bg-accent-primary hover:bg-accent-primary text-white shadow-lg shadow-accent-primary/20",
    secondary: "bg-bg-tertiary hover:bg-bg-tertiary text-text-secondary border border-border-primary",
    ghost: "bg-transparent hover:bg-bg-tertiary text-text-muted hover:text-text-secondary",
    accent: "bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-xl shadow-accent-primary/30",
    danger: "bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-xl",
    md: "px-4 py-2.5 rounded-2xl",
    lg: "px-6 py-4 text-lg rounded-3xl",
    icon: "p-3 rounded-full"
  };

  return (
    <button 
      className={cn(
        `font-bold transition-all duration-300 active:scale-95 flex items-center 
        justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none hover:cursor-pointer`,
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export const Badge = ({ children, variant = 'default' }: { children: React.ReactNode, variant?: 'default' | 'outline' | 'vivid' | 'success' }) => {
  const variants = {
    default: "bg-bg-tertiary text-text-muted",
    outline: "border border-border-primary text-text-primary0",
    vivid: "bg-accent-primary/10 text-accent-secondary border border-accent-primary/20",
    success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
  };

  return (
    <span className={cn("px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest", variants[variant])}>
      {children}
    </span>
  );
};

export const Input = ({ label, className, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) => (
  <div className="flex-1">
    {label && <label className="block text-[10px] font-black text-text-subtle uppercase tracking-tighter mb-1 px-1">{label}</label>}
    <input
      className={cn(
        "w-full bg-bg-primary border border-border-primary rounded-xl py-2 px-3 text-text-primary focus:border-accent-primary outline-none transition-all text-center font-bold placeholder:text-text-faint",
        className
      )}
      {...props}
    />
  </div>
);

export const SectionHeader = ({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) => (
  <div className="mb-8 flex items-start justify-between">
    <div>
      <h1 className="text-3xl font-black text-text-primary mb-1">{title}</h1>
      {subtitle && <p className="text-text-primary0 text-sm">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

// Re-export cn utility for convenience
export { cn } from '@/app/lib/utils';

// Re-export new components
export { Spinner, SpinnerInline } from './spinner';
export { SetNumberBadge } from './set-number-badge';
export { IconContainer } from './icon-container';
