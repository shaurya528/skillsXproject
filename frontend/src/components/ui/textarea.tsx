'use client';

import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { FormField, controlClasses } from './form-field';

export interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id' | 'required'> {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, required, className, rows = 4, ...props },
  ref
) {
  return (
    <FormField label={label} error={error} hint={hint} required={required} className={className}>
      {(control) => (
        <textarea
          ref={ref}
          rows={rows}
          className={cn(controlClasses(!!error), 'min-h-28 resize-y py-2.5')}
          {...control}
          {...props}
        />
      )}
    </FormField>
  );
});
