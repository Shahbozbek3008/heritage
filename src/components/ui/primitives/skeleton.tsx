import { cn } from '@/lib/utils';

/** Shimmering placeholder; the sweep is what distinguishes it from a dead box. */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.ReactElement {
  return (
    <div className={cn('relative overflow-hidden rounded-xl bg-white/[0.065]', className)} {...props}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/[0.095] to-transparent" />
    </div>
  );
}

export { Skeleton };
