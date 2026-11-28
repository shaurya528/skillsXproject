'use client';

import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormField, controlClasses } from './form-field';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'required'> {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, required, className, type = 'text', ...props },
  ref
) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === 'password';

  return (
    <FormField label={label} error={error} hint={hint} required={required} className={className}>
      {(control) => (
        <div className="relative">
          <input
            ref={ref}
            type={isPassword && visible ? 'text' : type}
            className={cn(controlClasses(!!error), 'h-11', isPassword && 'pr-11')}
            {...control}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              aria-label={visible ? 'Hide password' : 'Show password'}
              aria-pressed={visible}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-ink-muted hover:text-ink"
            >
              {visible ? (
                <EyeOff className="h-5 w-5" aria-hidden />
              ) : (
                <Eye className="h-5 w-5" aria-hidden />
              )}
            </button>
          )}
        </div>
      )}
    </FormField>
  );
});
