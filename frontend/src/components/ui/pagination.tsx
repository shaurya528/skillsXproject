import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ page, limit, total, onPageChange, className }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Pagination" className={cn('flex items-center justify-between gap-3', className)}>
      <p className="text-sm text-ink-muted" aria-live="polite">
        Page {page} of {totalPages}
        <span className="hidden sm:inline"> · {total} results</span>
      </p>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">Previous</span>
        </Button>
        <Button
          variant="secondary"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    </nav>
  );
}
