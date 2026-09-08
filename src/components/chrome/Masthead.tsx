'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
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
/** Must match the drawer-out / fade-out duration in the Tailwind config. */
const CLOSE_MS = 280;

export function Masthead(): React.ReactElement {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [condensed, setCondensed] = useState(false);

  /*
   * Unmounting on click would cut the exit animation off, so a close request
   * first plays `closing` and only then drops the drawer from the tree.
   */
  const closeDrawer = useCallback((): void => {
    setClosing(true);
  }, []);

  useEffect(() => {
    if (!closing) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = window.setTimeout(
      () => {
        setOpen(false);
        setClosing(false);
      },
      prefersReduced ? 0 : CLOSE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [closing]);

  useEffect(() => {
    const onScroll = (): void => setCondensed(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close on navigation, without animating: the page underneath is changing.
  useEffect(() => {
    setOpen(false);
    setClosing(false);
  }, [pathname]);

  // Lock background scroll while the drawer is open.
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
      if (e.key === 'Escape') closeDrawer();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, closeDrawer]);

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
                <span className="mt-1 font-sans text-[0.6875rem] uppercase tracking-[0.22em] text-muted-foreground/70">
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
            className={cn(
              'absolute inset-0 bg-background/80 backdrop-blur-md',
              closing ? 'animate-fade-out' : 'animate-fade-in',
            )}
            onClick={closeDrawer}
            aria-label="Close menu"
            tabIndex={-1}
          />

          {/*
            Left drawer. It runs the full height and is pinned to the left
            edge, so the panel reads as sliding in from off-screen rather than
            as a floating card.
          */}
          <div
            className={cn(
              'glass absolute inset-y-0 left-0 flex w-[min(20rem,86vw)] flex-col rounded-none border-l-0 pb-safe pt-safe',
              closing ? 'animate-drawer-out' : 'animate-drawer-in',
            )}
          >
            <div className="flex items-center justify-between border-b border-border/10 px-5 py-4">
              <Link href="/" className="flex min-w-0 items-center gap-2.5" onClick={closeDrawer}>
                <span
                  aria-hidden
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-gold/30 bg-gradient-to-b from-gold/20 to-transparent font-display text-xs text-gold-100"
                >
                  FA
                </span>
                <span className="truncate font-display text-base text-foreground">
                  The Family Archive
                </span>
              </Link>

              <button
                type="button"
                onClick={closeDrawer}
                className="touch-target -mr-2 flex items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav aria-label="All sections" className="min-h-0 flex-1 overflow-y-auto">
              <ul className="px-2 py-3">
                {NAV_ITEMS.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          'relative flex flex-col gap-0.5 rounded-2xl px-3 py-3 transition-colors active:bg-white/[0.095]',
                          active && 'bg-gold/[0.08]',
                        )}
                        aria-current={active ? 'page' : undefined}
                      >
                        {active && (
                          <span
                            aria-hidden
                            className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-gold"
                          />
                        )}
                        <span
                          className={cn(
                            'font-display text-fluid-lg leading-tight',
                            active ? 'text-gold-100' : 'text-foreground',
                          )}
                        >
                          {item.label}
                        </span>
                        <span className="font-sans text-xs text-muted-foreground/70">
                          {item.description}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <p className="border-t border-border/10 px-5 py-4 font-sans text-[0.6875rem] uppercase tracking-[0.22em] text-muted-foreground/60">
              Est. 1849
            </p>
          </div>
        </div>
      )}
    </>
  );
}
