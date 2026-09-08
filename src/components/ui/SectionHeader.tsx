import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  readonly eyebrow: string;
  readonly title: string;
  readonly lede?: string;
  readonly href?: string;
  readonly hrefLabel?: string;
  readonly align?: 'start' | 'center';
}

/** Gold dot + hairline: the recurring mark that opens every section. */
function EyebrowMark(): React.ReactElement {
  return (
    <span aria-hidden className="flex items-center gap-2">
      <span className="h-1 w-1 rounded-full bg-gold shadow-[0_0_8px_1px_hsl(var(--gold)/0.6)]" />
      <span className="h-px w-6 bg-gradient-to-r from-gold/60 to-transparent" />
    </span>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  lede,
  href,
  hrefLabel = 'View all',
  align = 'start',
}: SectionHeaderProps): React.ReactElement {
  return (
    <div
      className={cn(
        'flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between',
        align === 'center' && 'text-center sm:text-left',
      )}
    >
      <div className={cn('max-w-prose', align === 'center' && 'mx-auto sm:mx-0')}>
        <div
          className={cn(
            'flex items-center gap-2.5',
            align === 'center' && 'justify-center sm:justify-start',
          )}
        >
          <EyebrowMark />
          <p className="label-mono text-gold-200">{eyebrow}</p>
        </div>

        <h2 className="text-gradient mt-4 font-display text-fluid-2xl font-normal leading-[1.08] tracking-[-0.02em]">
          {title}
        </h2>

        {lede && (
          <p className="mt-4 font-serif text-fluid-base leading-relaxed text-muted-foreground">
            {lede}
          </p>
        )}
      </div>

      {href && (
        <Link
          href={href}
          className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-border/12 bg-white/[0.08] px-4 py-2 font-sans text-sm text-muted-foreground transition-all duration-300 hover:border-gold/35 hover:bg-gold/[0.07] hover:text-gold-200"
        >
          {hrefLabel}
          <ArrowRight className="h-4 w-4 transition-transform duration-500 ease-heritage group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}

/** Page-opening header used at the top of each section index. */
export function PageHeader({
  eyebrow,
  title,
  lede,
  meta,
}: {
  readonly eyebrow: string;
  readonly title: string;
  readonly lede?: string;
  readonly meta?: string;
}): React.ReactElement {
  return (
    <header className="relative isolate overflow-hidden pb-12 pt-14 md:pb-16 md:pt-24">
      {/* Ambient bloom: keeps the top of a long dark page from reading as flat. */}
      <div
        aria-hidden
        className="aurora -top-40 left-1/4 h-64 w-[36rem] -translate-x-1/2 bg-gold/[0.07] motion-safe:animate-aurora"
      />

      <div className="flex items-center gap-2.5">
        <span aria-hidden className="h-1 w-1 rounded-full bg-gold shadow-[0_0_8px_1px_hsl(var(--gold)/0.6)]" />
        <p className="label-mono text-gold-200">{eyebrow}</p>
      </div>

      <h1 className="text-gradient mt-5 max-w-[18ch] font-display text-fluid-3xl font-normal leading-[1.02] tracking-[-0.03em]">
        {title}
      </h1>

      {lede && (
        <p className="mt-6 max-w-prose font-serif text-fluid-lg leading-relaxed text-muted-foreground">
          {lede}
        </p>
      )}

      {meta && (
        <p className="mt-7 font-sans text-xs tracking-[0.12em] text-muted-foreground/70">{meta}</p>
      )}

      <div className="rule-gold mt-10 md:mt-14" />
    </header>
  );
}
