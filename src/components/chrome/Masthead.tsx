'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { NAV_ITEMS } from './nav-items';
import { cn } from '@/lib/utils';

/**
 * Floating glass masthead.
 *
 * At the top of the page it sits transparent over the hero; once scrolled it
 * condenses into a floating frosted pill. Mobile carries only the wordmark and
 * a menu trigger — primary navigation lives in the thumb-reachable bottom bar.
 */
export function Masthead(): React.ReactElement {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [condensed, setCondensed] = useState(false);

  useEffect(() => {
    const onScroll = (): void => setCondensed(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the sheet on navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock background scroll while the sheet is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const isActive = (href: string): boolean =>
    pathname === href || (href !== '/' && pathname.startsWith(`${href}/`));

  return (
    <>
      <header className="no-print fixed inset-x-0 top-0 z-50 pt-safe">
        <div
          className={cn(
            'mx-auto flex max-w-shell items-center justify-between gap-4 px-4 transition-all duration-500 ease-heritage sm:px-6 lg:px-10',
            condensed ? 'py-2.5' : 'py-4 md:py-6',
          )}
        >
          <div
            className={cn(
              'flex w-full items-center justify-between gap-4 rounded-full transition-all duration-500 ease-heritage',
              condensed ? 'glass px-4 py-2 md:px-5 md:py-2.5' : 'border border-transparent px-0 py-1',
            )}
          >
            <Link
              href="/"
              className="group flex min-w-0 items-center gap-3"
              aria-label="The Family Archive, home"
            >
              {/* Monogram: a small piece of metal, and the only ornament here. */}
              <span
                aria-hidden
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-gold/30 bg-gradient-to-b from-gold/20 to-transparent font-display text-[0.8125rem] text-gold-100 transition-all duration-500 group-hover:border-gold/60 group-hover:shadow-[0_0_20px_-4px_hsl(var(--gold)/0.6)]"
              >
                FA
              </span>
              <span className="flex min-w-0 flex-col leading-none">
                <span className="truncate font-display text-[1.0625rem] font-normal tracking-tight text-foreground sm:text-lg">
                  The Family Archive
                </span>
                <span className="mt-1 font-sans text-[0.5625rem] uppercase tracking-[0.22em] text-muted-foreground/70">
                  Est. 1849
                </span>
              </span>
            </Link>

            <nav className="hidden md:block" aria-label="Primary">
              <ul className="flex items-center gap-0.5 lg:gap-1">
                {NAV_ITEMS.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'relative block rounded-full px-3 py-2 font-sans text-[0.8125rem] tracking-wide transition-colors duration-300',
                          active
                            ? 'text-foreground'
                            : 'text-muted-foreground hover:bg-white/[0.08] hover:text-foreground',
                        )}
                      >
                        {active && (
                          <span
                            aria-hidden
                            className="absolute inset-0 rounded-full border border-gold/25 bg-gold/[0.09]"
                          />
                        )}
                        <span className="relative">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <button
              type="button"
              onClick={() => setOpen(true)}
              className="touch-target -mr-1 flex items-center justify-center rounded-full text-foreground transition-colors hover:text-gold-200 md:hidden"
              aria-label="Open menu"
              aria-expanded={open}
              aria-haspopup="dialog"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div
          className="no-print fixed inset-0 z-[60] md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <button
            type="button"
            className="absolute inset-0 animate-fade-in bg-background/80 backdrop-blur-md"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            tabIndex={-1}
          />
          <div className="glass absolute inset-x-2 bottom-2 max-h-[88dvh] animate-sheet-up overflow-y-auto rounded-3xl pb-safe">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/10 bg-card/80 px-5 py-4 backdrop-blur-xl">
              <span className="label-mono">Navigate</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="touch-target -mr-2 flex items-center justify-center text-muted-foreground"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav aria-label="All sections">
              <ul className="px-2 pb-6 pt-2">
                {NAV_ITEMS.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          'flex items-baseline justify-between gap-4 rounded-2xl px-3 py-3.5 transition-colors active:bg-white/[0.095]',
                          active && 'bg-gold/[0.08]',
                        )}
                        aria-current={active ? 'page' : undefined}
                      >
                        <span
                          className={cn(
                            'font-display text-fluid-lg',
                            active ? 'text-gold-100' : 'text-foreground',
                          )}
                        >
                          {item.label}
                        </span>
                        <span className="shrink-0 font-sans text-xs text-muted-foreground/70">
                          {item.description}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
