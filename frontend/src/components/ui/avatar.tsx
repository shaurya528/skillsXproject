import { cn, getInitials } from '@/lib/utils';

type AvatarSize = 'sm' | 'md' | 'lg';

const sizes: Record<AvatarSize, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
};

const palettes = [
  'bg-primary-soft text-primary',
  'bg-info-soft text-info',
  'bg-success-soft text-success',
  'bg-warning-soft text-warning',
];

// The same name always gets the same colour
const paletteFor = (name: string) => {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return palettes[hash % palettes.length];
};

export function Avatar({
  name,
  size = 'md',
  className,
}: {
  name: string;
  size?: AvatarSize;
  className?: string;
}) {
  return (
    <span
      role="img"
      aria-label={name}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold',
        paletteFor(name),
        sizes[size],
        className
      )}
    >
      {getInitials(name)}
    </span>
  );
}
