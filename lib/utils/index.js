import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS classes intelligently to prevent conflicts.
 * Example: cn('px-2 py-1 bg-red-500', isHovered && 'bg-blue-500')
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}