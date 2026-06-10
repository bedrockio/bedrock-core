import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge class names with Tailwind-aware conflict resolution.
 * Used by every shadcn/ui component.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
