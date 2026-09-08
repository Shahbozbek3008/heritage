import { Skeleton } from '@/components/ui/primitives/skeleton';

export default function Loading(): React.ReactElement {
  return (
    <div
      className="mx-auto max-w-shell px-4 py-20 sm:px-6 lg:px-10"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Loading</span>
      <Skeleton className="h-3 w-28 rounded-full" />
      <Skeleton className="mt-6 h-11 w-3/4 max-w-2xl" />
      <Skeleton className="mt-5 h-4 w-full max-w-prose rounded-full" />
      <Skeleton className="mt-2.5 h-4 w-2/3 max-w-prose rounded-full" />

      <div className="mt-12 grid grid-cols-2 gap-5 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
