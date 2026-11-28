'use client';

import {
  createContext,
  useContext,
  useId,
  useRef,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/utils';

export interface TabItem {
  value: string;
  label: string;
  count?: number;
}

const TabsContext = createContext<{ baseId: string; value: string } | null>(null);

interface TabsProps {
  items: TabItem[];
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
  className?: string;
}

export function Tabs({ items, value, onValueChange, children, className }: TabsProps) {
  const baseId = useId();
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Arrow keys, Home and End move between tabs
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const index = items.findIndex((item) => item.value === value);
    let next = index;
    if (e.key === 'ArrowRight') next = (index + 1) % items.length;
    else if (e.key === 'ArrowLeft') next = (index - 1 + items.length) % items.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = items.length - 1;
    else return;

    e.preventDefault();
    const target = items[next].value;
    onValueChange(target);
    refs.current[target]?.focus();
  };

  return (
    <TabsContext.Provider value={{ baseId, value }}>
      <div className={className}>
        <div
          role="tablist"
          onKeyDown={onKeyDown}
          className="flex gap-1 overflow-x-auto border-b border-border"
        >
          {items.map((item) => {
            const selected = item.value === value;
            return (
              <button
                key={item.value}
                ref={(el) => {
                  refs.current[item.value] = el;
                }}
                type="button"
                role="tab"
                id={`${baseId}-tab-${item.value}`}
                aria-selected={selected}
                aria-controls={`${baseId}-panel-${item.value}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => onValueChange(item.value)}
                className={cn(
                  '-mb-px flex h-11 shrink-0 items-center gap-2 border-b-2 px-4 text-sm font-medium transition-colors',
                  selected
                    ? 'border-primary text-primary'
                    : 'border-transparent text-ink-muted hover:text-ink'
                )}
              >
                {item.label}
                {item.count !== undefined && (
                  <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs text-ink-muted">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="pt-5">{children}</div>
      </div>
    </TabsContext.Provider>
  );
}

export function TabPanel({ value, children }: { value: string; children: ReactNode }) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('TabPanel must be used inside Tabs');
  if (ctx.value !== value) return null;

  return (
    <div
      role="tabpanel"
      id={`${ctx.baseId}-panel-${value}`}
      aria-labelledby={`${ctx.baseId}-tab-${value}`}
      tabIndex={0}
    >
      {children}
    </div>
  );
}
