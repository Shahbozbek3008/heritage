import type { Metadata } from 'next';
import Link from 'next/link';
import { repository } from '@/lib/data';
import { PageHeader } from '@/components/ui/SectionHeader';
import { Reveal } from '@/components/ui/Reveal';
import { formatHistoricalDate, fullName, yearOf } from '@/lib/format';
import type { ID, LifeEvent, Person, Place } from '@/types/heritage';

export const metadata: Metadata = {
  title: 'Timeline',
  description:
    'The family record in the order it happened, from a bindery in Vilna in 1849 to the present day.',
};

/** Groups events into decades so a long list reads as a history, not a feed. */
function groupByDecade(
  events: readonly LifeEvent[],
): ReadonlyArray<{ decade: number; events: readonly LifeEvent[] }> {
  const map = new Map<number, LifeEvent[]>();
  for (const event of events) {
    const year = yearOf(event.date);
    if (year === null) continue;
    const decade = Math.floor(year / 10) * 10;
    const list = map.get(decade) ?? [];
    list.push(event);
    map.set(decade, list);
  }
  return [...map.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([decade, list]) => ({ decade, events: list }));
}

export default async function TimelinePage(): Promise<React.ReactElement> {
  const [events, people, places] = await Promise.all([
    repository.listEvents(),
    repository.listPeople(),
    repository.listPlaces(),
  ]);

  const personById = new Map<ID, Person>(people.map((p) => [p.id, p]));
  const placeById = new Map<ID, Place>(places.map((p) => [p.id, p]));
  const decades = groupByDecade(events);

  return (
    <div className="mx-auto max-w-shell px-4 sm:px-6 lg:px-10">
      <PageHeader
        eyebrow="Timeline"
        title="In the order it happened."
        lede="Family events set against the history that moved them. Muted entries mark the wider world; the rest is ours."
        meta={`${events.length} recorded events · 1849 to the present`}
      />

      <div className="py-12 md:py-16">
        {decades.map(({ decade, events: decadeEvents }) => (
          <section key={decade} className="relative">
            <div className="sticky top-[4.25rem] z-20 -mx-4 px-4 py-3 sm:-mx-6 sm:px-6 md:top-[5.5rem] lg:-mx-10 lg:px-10">
              <h2 className="text-gradient-gold inline-flex items-baseline rounded-full border border-border/10 bg-card/70 px-4 py-1.5 font-display text-fluid-xl backdrop-blur-xl">
                {decade}s
                <span className="ml-3 font-sans text-xs tracking-wide text-muted-foreground">
                  {decadeEvents.length} {decadeEvents.length === 1 ? 'entry' : 'entries'}
                </span>
              </h2>
            </div>

            <ol className="relative mb-10 mt-2 pl-6 sm:pl-8">
              {/* Spine */}
              <span
                aria-hidden
                className="absolute bottom-3 left-[3px] top-3 w-px bg-gradient-to-b from-transparent via-border/15 to-transparent sm:left-[5px]"
              />

              {decadeEvents.map((event, i) => {
                const place = event.placeId ? placeById.get(event.placeId) : undefined;
                const related = (event.personIds ?? [])
                  .map((id) => personById.get(id))
                  .filter((p): p is Person => p !== undefined);

                return (
                  <Reveal as="li" key={event.id} delay={Math.min(i * 40, 200)}>
                    <div className="relative py-5">
                      <span
                        aria-hidden
                        className={`absolute -left-6 top-[1.65rem] h-[7px] w-[7px] rounded-full sm:-left-8 ${
                          event.historical ? 'bg-border/25' : 'bg-gold shadow-[0_0_10px_1px_hsl(var(--gold)/0.55)]'
                        }`}
                      />

                      <time
                        dateTime={event.date.iso}
                        className={`font-sans text-xs tracking-wide ${
                          event.historical ? 'text-muted-foreground/60' : 'text-gold-200'
                        }`}
                      >
                        {formatHistoricalDate(event.date)}
                      </time>

                      <h3
                        className={`mt-1.5 font-display leading-snug ${
                          event.historical
                            ? 'text-fluid-base italic text-muted-foreground'
                            : 'text-fluid-xl text-foreground'
                        }`}
                      >
                        {event.title}
                      </h3>

                      {event.description && (
                        <p className="mt-2 max-w-prose font-serif text-fluid-sm leading-relaxed text-muted-foreground">
                          {event.description}
                        </p>
                      )}

                      {(related.length > 0 || place) && (
                        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 font-sans text-xs text-muted-foreground">
                          {related.map((person) => (
                            <Link
                              key={person.id}
                              href={`/people/${person.slug}`}
                              className="underline decoration-border/20 underline-offset-4 transition-colors hover:text-gold-200 hover:decoration-gold"
                            >
                              {fullName(person)}
                            </Link>
                          ))}
                          {place && (
                            <Link
                              href={`/places/${place.slug}`}
                              className="text-muted-foreground underline decoration-border/20 underline-offset-4 transition-colors hover:text-gold-200 hover:decoration-gold"
                            >
                              {place.name}
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  </Reveal>
                );
              })}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}
