import Link from 'next/link';
import { Button } from '@/components/ui/primitives/button';

export default function NotFound(): React.ReactElement {
  return (
    <div className="relative mx-auto flex min-h-[60dvh] max-w-shell flex-col items-center justify-center overflow-hidden px-4 py-20 text-center sm:px-6 lg:px-10">
      <div
        aria-hidden
        className="aurora left-1/2 top-1/3 h-56 w-[32rem] -translate-x-1/2 bg-gold/[0.06]"
      />

      <p className="label-mono text-gold-200">Not in the archive</p>
      <h1 className="text-gradient mt-5 max-w-[18ch] font-display text-fluid-3xl font-normal leading-[1.04] tracking-[-0.03em]">
        This page is not among the papers.
      </h1>
      <p className="mt-5 max-w-prose font-serif text-fluid-base leading-relaxed text-muted-foreground">
        Whatever was here has either not been catalogued yet, or never existed. Both happen often
        enough in a family archive.
      </p>

      <div className="mt-9 flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href="/">Return home</Link>
        </Button>
        <Button asChild size="lg" variant="secondary">
          <Link href="/people">Browse the people</Link>
        </Button>
      </div>
    </div>
  );
}
