'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/primitives/button';

export default function ErrorBoundary({
  error,
  reset,
}: {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}): React.ReactElement {
  useEffect(() => {
    // Replace with the project's error reporter when one is wired up.
    console.error('[heritage]', error);
  }, [error]);

  return (
    <div className="relative mx-auto flex min-h-[60dvh] max-w-shell flex-col items-center justify-center overflow-hidden px-4 py-20 text-center sm:px-6 lg:px-10">
      <div
        aria-hidden
        className="aurora left-1/2 top-1/3 h-56 w-[32rem] -translate-x-1/2 bg-gold/[0.06]"
      />

      <p className="label-mono text-gold-200">Something went wrong</p>
      <h1 className="text-gradient mt-5 max-w-[20ch] font-display text-fluid-2xl font-normal leading-[1.1]">
        The archive could not be opened.
      </h1>
      <p className="mt-5 max-w-prose font-serif text-fluid-base leading-relaxed text-muted-foreground">
        This is a fault on our side, not a missing record. Trying again usually works.
      </p>

      <Button size="lg" className="mt-9" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
