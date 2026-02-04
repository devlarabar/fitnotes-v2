import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility for merging tailwind classes with clsx logic
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Mock delay for simulating API calls
 */
export const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

/**
 * Formats weights to 1 decimal place if needed
 */
export const formatWeight = (w: number) => Number.isInteger(w) ? w.toString() : w.toFixed(1);
