import React from 'react';
import { cn } from '@/app/lib/utils';

interface FormSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Array<{ id: number; name: string }>;
  placeholder?: string;
}

export function FormSelect({
  label,
  id,
  options,
  placeholder = 'Select an option',
  className,
  ...props
}: FormSelectProps) {
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
      <select
        id={id}
        className={cn(
          `
            w-full px-4 py-3 rounded-xl bg-bg-tertiary 
            border border-border-secondary text-text-primary 
            focus:outline-none focus:ring-2 
            focus:ring-accent-primary
          `,
          className
        )}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  );
}
