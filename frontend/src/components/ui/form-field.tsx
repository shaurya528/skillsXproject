'use client';

import { useId, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

// What every control receives, so label, hint and error are connected to it
export interface FieldControlProps {
  id: string;
  'aria-invalid': true | undefined;
  'aria-required': true | undefined;
  'aria-describedby': string | undefined;
}

export interface FormFieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: (control: FieldControlProps) => ReactNode;
}

// Classes shared by input, textarea and select
export const controlClasses = (hasError: boolean) =>
  cn(
    'w-full rounded-lg border bg-surface px-3 text-base text-ink transition-colors',
    'placeholder:text-ink-muted/70',
    'disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-70',
    hasError ? 'border-danger' : 'border-border hover:border-ink-muted/50'
  );

export function FormField({ label, error, hint, required, className, children }: FormFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  const describedBy =
    [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
        {required && (
          <span className="text-danger" aria-hidden>
            {' '}*
          </span>
        )}
      </label>

      {children({
        id,
        'aria-invalid': error ? true : undefined,
        'aria-required': required ? true : undefined,
        'aria-describedby': describedBy,
      })}

      {hint && (
        <p id={hintId} className="text-sm text-ink-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
