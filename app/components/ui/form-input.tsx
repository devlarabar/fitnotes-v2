import React from 'react';
import { cn } from '@/app/lib/utils';

interface FormInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function FormInput({
  label,
  id,
  className,
  ...props
}: FormInputProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className={`
          block text-sm font-bold 
          text-text-secondary mb-2
        `}
      >
        {label}
      </label>
      <input
        id={id}
        className={cn(
          `
            w-full px-4 py-3 rounded-xl bg-bg-tertiary 
            border border-border-secondary text-text-primary 
            placeholder:text-text-dim focus:outline-none 
            focus:ring-2 focus:ring-accent-primary
          `,
          className
        )}
        {...props}
      />
    </div>
  );
}
