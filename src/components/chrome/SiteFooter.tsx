import Link from 'next/link';
import { NAV_ITEMS } from './nav-items';
import type { FamilyMeta } from '@/types/heritage';

export function SiteFooter({ meta }: { readonly meta: FamilyMeta }): React.ReactElement {
  return (
    <footer className="no-print relative isolate mt-28 overflow-hidden border-t border-border/10 md:mt-40">
      {/* A last bloom on the horizon, so the page ends on light rather than void. */}
      <div
        aria-hidden
        className="aurora -top-32 left-1/2 h-56 w-[44rem] -translate-x-1/2 bg-gold/[0.06]"
      />

      <div className="mx-auto max-w-shell px-4 pb-28 pt-16 sm:px-6 md:pb-20 md:pt-24 lg:px-10">
        <div className="grid gap-12 md:grid-cols-[1.4fr,1fr] md:gap-20">
          <div className="max-w-prose">
            <div className="flex items-center gap-3">
              <span
                aria-hidden
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-gold/30 bg-gradient-to-b from-gold/20 to-transparent font-display text-[0.8125rem] text-gold-100"
              >
                FA
              </span>
              <p className="label-mono text-gold-200">The Family Archive</p>
            </div>

            {meta.motto && (
              <blockquote className="text-gradient mt-6 font-display text-fluid-xl italic leading-snug">
                “{meta.motto}”
              </blockquote>
            )}

            <p className="mt-6 font-serif text-fluid-sm leading-relaxed text-muted-foreground">
              {meta.introduction[0]}
            </p>
          </div>

          <nav aria-label="Footer">
            <p className="label-mono">Sections</p>
            <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="font-sans text-sm text-muted-foreground transition-colors hover:text-gold-200"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="rule-gold mt-16" />

        <div className="mt-6 flex flex-col gap-3 font-sans text-xs text-muted-foreground/70 sm:flex-row sm:items-center sm:justify-between">
          <p>
            {meta.stats.people} people · {meta.stats.generations} generations ·{' '}
            {meta.stats.photographs.toLocaleString('en-GB')} photographs
          </p>
          <p>
            Compiled from {meta.origin}, {meta.foundedYear} to the present. A private family record.
          </p>
        </div>
      </div>
    </footer>
  );
}
