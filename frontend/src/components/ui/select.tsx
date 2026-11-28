'use client';

import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormField, controlClasses } from './form-field';

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id' | 'required'> {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, hint, required, className, placeholder, children, ...props },
  ref
) {
  return (
    <FormField label={label} error={error} hint={hint} required={required} className={className}>
      {(control) => (
        <div className="relative">
          <select
            ref={ref}
            className={cn(controlClasses(!!error), 'h-11 appearance-none pr-10')}
            {...control}
            {...props}
          >
            {placeholder !== undefined && <option value="">{placeholder}</option>}
            {children}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted"
            aria-hidden
          />
        </div>
      )}
    </FormField>
  );
});
