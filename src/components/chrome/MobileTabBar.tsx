'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Clock, GitFork, ScrollText, Users } from 'lucide-react';
import { PRIMARY_MOBILE } from './nav-items';
import { cn } from '@/lib/utils';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  '/tree': GitFork,
  '/people': Users,
  '/timeline': Clock,
  '/stories': ScrollText,
};

/**
 * Thumb-zone navigation for phones.
 *
 * A floating glass pill rather than a full-width bar: it reads as a control
 * that sits above the page, and leaves the page edges visible behind it.
 * Hidden from md up, where the masthead rail takes over.
 */
export function MobileTabBar(): React.ReactElement {
  const pathname = usePathname();

  return (
    <nav
      className="no-print fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden"
      aria-label="Primary, mobile"
    >
      <ul className="glass mx-auto flex max-w-md items-stretch justify-around rounded-2xl p-1.5">
        {PRIMARY_MOBILE.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = ICONS[item.href] ?? GitFork;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex min-h-[3rem] flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 transition-colors duration-300',
                  active ? 'text-gold-100' : 'text-muted-foreground',
                )}
              >
                {active && (
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-xl border border-gold/25 bg-gold/[0.1]"
                  />
                )}
                <Icon className="relative h-[1.125rem] w-[1.125rem]" />
                <span className="relative font-sans text-[0.6875rem] tracking-wide">
                  {item.short}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
