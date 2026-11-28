'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, description, children, className }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descId = useId();

  // Open or close the native dialog when `open` changes
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      onClose={onClose}
      onClick={(e) => {
        // a click on the dark backdrop lands on the dialog element itself
        if (e.target === e.currentTarget) onClose();
      }}
      className={cn(
        'm-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-border bg-surface p-0 text-ink shadow-xl',
        'backdrop:bg-ink/40',
        className
      )}
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-xl font-semibold">
              {title}
            </h2>
            {description && (
              <p id={descId} className="mt-1 text-sm text-ink-muted">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-m-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-muted hover:text-ink"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <div className="mt-4">{open && children}</div>
      </div>
    </dialog>
  );
}
