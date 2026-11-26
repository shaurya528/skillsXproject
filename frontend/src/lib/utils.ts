import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Combine class names, letting later ones win over conflicting earlier ones
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

// "Shaurya Raj" -> "SR", "Priya" -> "P"
export const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
};
