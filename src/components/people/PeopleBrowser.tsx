'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { Generation, ID, MediaAsset, Person } from '@/types/heritage';
import { PersonCard } from './PersonCard';
import { Button } from '@/components/ui/primitives/button';
import { cn } from '@/lib/utils';

interface PeopleBrowserProps {
  readonly generations: readonly Generation[];
  readonly portraits: Readonly<Record<ID, MediaAsset | undefined>>;
}

/**
 * Client-side search and generation filter.
 *
 * The whole set is small enough (tens of people, not thousands) that filtering
 * in the browser is instant and avoids a round trip per keystroke. If the
 * archive grows past a few hundred people this should move to a server action
 * with the repository's `PersonQuery` — which already supports it.
 */
export function PeopleBrowser({ generations, portraits }: PeopleBrowserProps): React.ReactElement {
  const searchParams = useSearchParams();
  const requested = Number.parseInt(searchParams.get('generation') ?? '', 10);
  const linkedGeneration =
    Number.isFinite(requested) && generations.some((g) => g.index === requested) ? requested : null;

  const [query, setQuery] = useState('');
  const [generation, setGeneration] = useState<number | null>(linkedGeneration);

  const allPeople = useMemo(() => generations.flatMap((g) => g.people), [generations]);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    return allPeople.filter((person) => {
      if (generation !== null && person.generation !== generation) return false;
      if (!term) return true;
      return [
        person.givenName,
        person.familyName,
        person.birthName ?? '',
        person.nickname ?? '',
        person.occupation ?? '',
        person.summary,
      ]
        .join(' ')
        .toLowerCase()
        .includes(term);
    });
  }, [allPeople, generation, query]);

  const grouped = useMemo(() => {
    const map = new Map<number, Person[]>();
    for (const person of results) {
      const list = map.get(person.generation) ?? [];
      list.push(person);
      map.set(person.generation, list);
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [results]);

  const generationLabel = (index: number): string =>
    generations.find((g) => g.index === index)?.label ?? `Generation ${index}`;

  return (
    <>
      {/* Sticky filter bar. Offset clears the fixed masthead above it. */}
      <div className="sticky top-[4.25rem] z-30 -mx-4 mb-12 px-4 sm:-mx-6 sm:px-6 md:top-[5.5rem] lg:-mx-10 lg:px-10">
        <div className="glass rounded-2xl px-4 py-3.5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
            <div className="relative flex-1">
              <Search
                aria-hidden
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, trade or story"
                aria-label="Search people"
                className="h-11 w-full rounded-full border border-border/12 bg-white/[0.08] pl-11 pr-4 font-sans text-sm text-foreground transition-colors placeholder:text-muted-foreground/60 focus-visible:border-gold/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
              />
            </div>

            <div className="-mx-4 overflow-x-auto px-4 no-scrollbar sm:mx-0 sm:overflow-visible sm:px-0">
              <div className="flex items-center gap-1.5">
                <FilterChip active={generation === null} onClick={() => setGeneration(null)}>
                  All
                </FilterChip>
                {generations.map((g) => (
                  <FilterChip
                    key={g.index}
                    active={generation === g.index}
                    onClick={() => setGeneration(generation === g.index ? null : g.index)}
                  >
                    {g.index}
                  </FilterChip>
                ))}
              </div>
            </div>
          </div>

          <p
            className="mt-3 font-sans text-xs text-muted-foreground/70"
            role="status"
            aria-live="polite"
          >
            {results.length} {results.length === 1 ? 'person' : 'people'}
            {generation !== null ? ` in ${generationLabel(generation)}` : ''}
            {query.trim() ? ` matching “${query.trim()}”` : ''}
          </p>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-gradient font-display text-fluid-xl">Nobody by that name.</p>
          <p className="mx-auto mt-3 max-w-prose font-serif text-fluid-sm leading-relaxed text-muted-foreground">
            The archive holds {allPeople.length} people across {generations.length} generations. Try
            a surname, a trade, or clear the filters.
          </p>
          <Button
            variant="secondary"
            className="mt-7"
            onClick={() => {
              setQuery('');
              setGeneration(null);
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="space-y-20 pb-8">
          {grouped.map(([index, list]) => (
            <section key={index} aria-labelledby={`gen-${index}`}>
              <div className="flex items-baseline gap-3 border-b border-border/10 pb-4">
                <span className="text-gradient-gold font-display text-fluid-lg leading-none">
                  {String(index).padStart(2, '0')}
                </span>
                <h2 id={`gen-${index}`} className="font-display text-fluid-lg text-foreground">
                  {generationLabel(index)}
                </h2>
                <span className="font-sans text-xs text-muted-foreground/70">
                  {list.length} {list.length === 1 ? 'person' : 'people'}
                </span>
              </div>

              <ul className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:grid-cols-5">
                {list.map((person) => (
                  <li key={person.id}>
                    <PersonCard person={person} portrait={portraits[person.id]} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  readonly active: boolean;
  readonly onClick: () => void;
  readonly children: React.ReactNode;
}): React.ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'flex h-9 min-w-[2.25rem] items-center justify-center rounded-full border px-3.5 font-sans text-xs transition-all duration-300',
        active
          ? 'border-gold/40 bg-gold/15 text-gold-100 shadow-[0_0_18px_-6px_hsl(var(--gold)/0.6)]'
          : 'border-border/12 bg-white/[0.08] text-muted-foreground hover:border-border/25 hover:text-foreground',
      )}
    >
      {children}
    </button>
  );
}
