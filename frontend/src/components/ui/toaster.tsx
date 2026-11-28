'use client';

import { Toaster as Sonner } from 'sonner';

export function Toaster() {
  return (
    <Sonner
      position="top-center"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            'flex w-full items-start gap-3 rounded-xl border border-border bg-surface p-4 text-sm text-ink shadow-lg',
          title: 'font-medium',
          description: 'text-ink-muted',
          icon: 'mt-0.5 shrink-0',
          success: 'border-success/40',
          error: 'border-danger/40',
        },
      }}
    />
  );
}
