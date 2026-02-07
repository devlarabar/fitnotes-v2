import React from 'react';
import { cn } from '@/app/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
}

export const Card = ({ children, className, glass, ...props }: CardProps) => (
  <div 
    className={cn(
      "bg-slate-900 border border-slate-800 rounded-3xl p-5 transition-all duration-300",
      glass && "bg-slate-900/50 backdrop-blur-md",
      props.onClick && "active:scale-[0.98] cursor-pointer hover:border-slate-700/50 hover:bg-slate-800/30",
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
    primary: "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/20",
    secondary: "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700",
    ghost: "bg-transparent hover:bg-slate-800 text-slate-400 hover:text-slate-200",
    accent: "bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-xl shadow-violet-900/30",
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
    default: "bg-slate-800 text-slate-400",
    outline: "border border-slate-700 text-slate-500",
    vivid: "bg-violet-500/10 text-violet-400 border border-violet-500/20",
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
    {label && <label className="block text-[10px] font-black text-slate-600 uppercase tracking-tighter mb-1 px-1">{label}</label>}
    <input
      className={cn(
        "w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white focus:border-violet-500 outline-none transition-all text-center font-bold placeholder:text-slate-800",
        className
      )}
      {...props}
    />
  </div>
);

export const SectionHeader = ({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) => (
  <div className="mb-8 flex items-start justify-between">
    <div>
      <h1 className="text-3xl font-black text-white mb-1">{title}</h1>
      {subtitle && <p className="text-slate-500 text-sm">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

// Re-export cn utility for convenience
export { cn } from '@/app/lib/utils';
