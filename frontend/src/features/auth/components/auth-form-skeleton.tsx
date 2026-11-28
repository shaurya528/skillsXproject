import { Skeleton } from '@/components/ui/skeleton';

// Shown for a moment while the form waits for the address (?next=...)
export function AuthFormSkeleton({ fields = 2 }: { fields?: number }) {
  return (
    <div className="space-y-4" aria-hidden>
      {Array.from({ length: fields }, (_, i) => (
        <div key={i} className="space-y-1.5">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>
      ))}
      <Skeleton className="h-12 w-full rounded-lg" />
    </div>
  );
}
