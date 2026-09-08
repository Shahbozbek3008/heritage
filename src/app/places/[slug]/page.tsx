import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { repository } from '@/lib/data';
import { ArchivalImage } from '@/components/ui/ArchivalImage';
import { PersonCard } from '@/components/people/PersonCard';
import { ArrowLeft } from 'lucide-react';
import { formatHistoricalDate, fullName } from '@/lib/format';
import type { ID, MediaAsset, Person } from '@/types/heritage';

interface PageProps {
  readonly params: Promise<{ readonly slug: string }>;
}

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const places = await repository.listPlaces();
  return places.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const place = await repository.getPlaceBySlug(slug);
  if (!place) return { title: 'Place not found' };
  return { title: place.name, description: place.summary };
}

export default async function PlacePage({ params }: PageProps): Promise<React.ReactElement> {
  const { slug } = await params;
  const place = await repository.getPlaceBySlug(slug);
  if (!place) notFound();

  const [people, events, allMedia] = await Promise.all([
    repository.listPeople(),
    repository.listEvents(),
    repository.listMedia(),
  ]);

  const mediaById = new Map<ID, MediaAsset>(allMedia.map((m) => [m.id, m]));
  const personById = new Map<ID, Person>(people.map((p) => [p.id, p]));

  const cover = place.coverMediaId ? mediaById.get(place.coverMediaId) : undefined;
  const connectedPeople = people.filter((p) => p.placeIds?.includes(place.id));
  const placeEvents = events.filter((e) => e.placeId === place.id);
  const placeMedia = allMedia.filter((m) => m.placeId === place.id && m.id !== place.coverMediaId);

  return (
    <article className="mx-auto max-w-shell px-4 sm:px-6 lg:px-10">
      <nav className="pt-8 md:pt-12" aria-label="Breadcrumb">
        <Link
          href="/places"
          className="group inline-flex items-center gap-2 font-sans text-xs tracking-wide text-muted-foreground transition-colors hover:text-gold-200"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-500 ease-heritage group-hover:-translate-x-1" />
          All places
        </Link>
      </nav>

      <header className="pb-10 pt-8 md:pb-14">
        <p className="label-mono text-gold-200">
          {place.region ? `${place.region} · ` : ''}
          {place.country}
        </p>
        <h1 className="text-gradient mt-5 max-w-[16ch] font-display text-fluid-3xl font-normal leading-[1.03] tracking-[-0.03em]">
          {place.name}
        </h1>
        {place.historicalName && (
          <p className="mt-3 font-serif text-fluid-lg italic text-muted-foreground">
            known then as {place.historicalName}
          </p>
        )}
        <p className="mt-6 max-w-prose font-serif text-fluid-lg leading-relaxed text-foreground/85">
          {place.summary}
        </p>
        {place.coordinates && (
          <p className="mt-6 font-sans text-xs tabular-nums tracking-wide text-muted-foreground/70">
            {Math.abs(place.coordinates.lat).toFixed(4)}° {place.coordinates.lat >= 0 ? 'N' : 'S'},{' '}
            {Math.abs(place.coordinates.lng).toFixed(4)}° {place.coordinates.lng >= 0 ? 'E' : 'W'}
          </p>
        )}
      </header>

      {cover && (
        <figure className="mb-12 md:mb-16">
          <div className="relative aspect-[16/10] w-full overflow-hidden md:aspect-[16/7]">
            <ArchivalImage
              asset={cover}
              sizes="(max-width: 1024px) 100vw, 90rem"
              priority
              className="h-full w-full"
            />
          </div>
          {cover.caption && (
            <figcaption className="mt-3 font-serif text-fluid-xs leading-relaxed text-muted-foreground">
              {cover.caption}
            </figcaption>
          )}
        </figure>
      )}

      {place.description && place.description.length > 0 && (
        <section className="border-t border-border/10 py-12 md:py-16">
          <div className="grid gap-8 md:grid-cols-[12rem,1fr] md:gap-14">
            <h2 className="label-mono pt-1.5 text-gold-200">The place</h2>
            <div className="max-w-prose space-y-6">
              {place.description.map((paragraph, i) => (
                <p
                  key={i}
                  className={`font-serif text-fluid-lg leading-[1.7] text-foreground/85 ${
                    i === 0 ? 'drop-cap' : ''
                  }`}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </section>
      )}

      {placeEvents.length > 0 && (
        <section className="border-t border-border/10 py-12 md:py-16">
          <div className="grid gap-8 md:grid-cols-[12rem,1fr] md:gap-14">
            <h2 className="label-mono pt-1.5 text-gold-200">What happened here</h2>
            <ol className="max-w-3xl">
              {placeEvents.map((event) => (
                <li key={event.id}>
                  <div className="grid grid-cols-[5rem,1fr] gap-x-4 border-b border-border/[0.08] py-4 sm:grid-cols-[9rem,1fr] sm:gap-x-8">
                    <time
                      dateTime={event.date.iso}
                      className="font-sans text-xs tabular-nums tracking-wide text-gold-200 sm:text-sm"
                    >
                      {formatHistoricalDate(event.date)}
                    </time>
                    <div className="min-w-0">
                      <h3 className="font-display text-fluid-base leading-snug text-foreground">
                        {event.title}
                      </h3>
                      {event.description && (
                        <p className="mt-1.5 font-serif text-fluid-sm leading-relaxed text-muted-foreground">
                          {event.description}
                        </p>
                      )}
                      {(event.personIds ?? []).length > 0 && (
                        <p className="mt-2 flex flex-wrap gap-x-3 font-sans text-xs text-muted-foreground">
                          {(event.personIds ?? []).map((id) => {
                            const person = personById.get(id);
                            if (!person) return null;
                            return (
                              <Link
                                key={id}
                                href={`/people/${person.slug}`}
                                className="underline decoration-border/20 underline-offset-4 transition-colors hover:text-gold-200"
                              >
                                {fullName(person)}
                              </Link>
                            );
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {connectedPeople.length > 0 && (
        <section className="border-t border-border/10 py-12 md:py-16">
          <div className="grid gap-8 md:grid-cols-[12rem,1fr] md:gap-14">
            <h2 className="label-mono pt-1.5 text-gold-200">Who lived here</h2>
            <ul className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
              {connectedPeople.map((person) => (
                <li key={person.id}>
                  <PersonCard
                    person={person}
                    portrait={
                      person.portraitMediaId ? mediaById.get(person.portraitMediaId) : undefined
                    }
                    variant="row"
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {placeMedia.length > 0 && (
        <section className="border-t border-border/10 py-12 md:py-16">
          <div className="grid gap-8 md:grid-cols-[12rem,1fr] md:gap-14">
            <h2 className="label-mono pt-1.5 text-gold-200">From the archive</h2>
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5">
              {placeMedia.map((asset) => (
                <li key={asset.id}>
                  <figure>
                    <div className="relative aspect-[4/5] overflow-hidden">
                      <ArchivalImage
                        asset={asset}
                        sizes="(max-width: 640px) 45vw, 22vw"
                        className="h-full w-full"
                      />
                    </div>
                    {asset.caption && (
                      <figcaption className="mt-2.5 font-serif text-fluid-xs leading-relaxed text-muted-foreground">
                        {asset.caption}
                      </figcaption>
                    )}
                  </figure>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </article>
  );
}
