import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { repository } from '@/lib/data';
import { ArchivalImage } from '@/components/ui/ArchivalImage';
import { PersonCard } from '@/components/people/PersonCard';
import { Reveal } from '@/components/ui/Reveal';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { ageOf, formatHistoricalDate, formatLifespan, fullName, isLiving } from '@/lib/format';
import type { ID, MediaAsset, Person } from '@/types/heritage';

interface PageProps {
  readonly params: Promise<{ readonly slug: string }>;
}

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const people = await repository.listPeople();
  return people.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const person = await repository.getPersonBySlug(slug);
  if (!person) return { title: 'Person not found' };

  return {
    title: `${fullName(person)} (${formatLifespan(person)})`,
    description: person.summary,
    openGraph: {
      type: 'profile',
      title: `${fullName(person)} - ${formatLifespan(person)}`,
      description: person.summary,
    },
  };
}

export default async function PersonPage({ params }: PageProps): Promise<React.ReactElement> {
  const { slug } = await params;
  const detail = await repository.getPersonDetail(slug);
  if (!detail) notFound();

  const { person, parents, spouses, children, siblings, portrait, media, events, places, stories } =
    detail;

  const allMedia = await repository.listMedia();
  const mediaById = new Map<ID, MediaAsset>(allMedia.map((m) => [m.id, m]));
  const portraitOf = (p: Person): MediaAsset | undefined =>
    p.portraitMediaId ? mediaById.get(p.portraitMediaId) : undefined;

  const age = ageOf(person);
  const gallery = media.filter((m) => m.id !== person.portraitMediaId);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: fullName(person),
    ...(person.birthName ? { alternateName: person.birthName } : {}),
    ...(person.occupation ? { jobTitle: person.occupation } : {}),
    ...(person.birth?.date ? { birthDate: person.birth.date.iso } : {}),
    ...(person.death?.date ? { deathDate: person.death.date.iso } : {}),
    description: person.summary,
    ...(parents.length > 0 ? { parent: parents.map((p) => ({ '@type': 'Person', name: fullName(p) })) } : {}),
    ...(children.length > 0
      ? { children: children.map((c) => ({ '@type': 'Person', name: fullName(c) })) }
      : {}),
  };

  return (
    <article className="mx-auto max-w-shell px-4 sm:px-6 lg:px-10">
      <nav className="pt-8 md:pt-12" aria-label="Breadcrumb">
        <Link
          href="/people"
          className="group inline-flex items-center gap-2 font-sans text-xs tracking-wide text-muted-foreground transition-colors hover:text-gold-200"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-500 ease-heritage group-hover:-translate-x-1" />
          All people
        </Link>
      </nav>

      {/* ---------- Header ---------- */}
      <header className="grid gap-8 pb-12 pt-8 md:grid-cols-[minmax(0,22rem),1fr] md:gap-14 md:pb-16 lg:gap-20">
        <div>
          <div className="relative aspect-[3/4] w-full max-w-sm overflow-hidden rounded-2xl border border-border/10 bg-white/[0.065] shadow-elevated md:max-w-none">
            {portrait ? (
              <ArchivalImage
                asset={portrait}
                sizes="(max-width: 768px) 90vw, 22rem"
                priority
                className="h-full w-full"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-white/[0.095] to-transparent p-8 text-center">
                <span className="text-gradient-gold font-display text-fluid-4xl">
                  {person.givenName.charAt(0)}
                  {person.familyName.charAt(0)}
                </span>
                <p className="max-w-[22ch] font-serif text-fluid-sm italic leading-relaxed text-muted-foreground">
                  No photograph of {person.givenName} is known to survive.
                </p>
              </div>
            )}
          </div>
          {portrait?.caption && (
            <p className="mt-3 max-w-sm font-serif text-fluid-xs leading-relaxed text-muted-foreground">
              {portrait.caption}
            </p>
          )}
        </div>

        <div className="min-w-0">
          <p className="label-mono text-gold-200">
            Generation {person.generation}
            {person.occupation ? ` · ${person.occupation}` : ''}
          </p>

          <h1 className="text-gradient mt-4 font-display text-fluid-3xl font-normal leading-[1.02] tracking-[-0.03em]">
            {fullName(person)}
          </h1>

          {person.birthName && person.birthName !== fullName(person) && (
            <p className="mt-2 font-serif text-fluid-base italic text-muted-foreground">
              born {person.birthName}
            </p>
          )}

          <p className="mt-4 font-sans text-sm tracking-wide text-muted-foreground">
            {formatLifespan(person)}
            {age !== null && (
              <span className="text-muted-foreground/60">
                {' · '}
                {isLiving(person) ? `aged ${age}` : `died aged ${age}`}
              </span>
            )}
          </p>

          <p className="mt-7 max-w-prose font-serif text-fluid-lg leading-[1.65] text-foreground/85">
            {person.summary}
          </p>

          {person.epitaph && (
            <blockquote className="text-gradient mt-8 border-l-2 border-gold/50 pl-5 font-display text-fluid-lg italic leading-snug">
              “{person.epitaph}”
            </blockquote>
          )}

          {/* Vital record */}
          <dl className="mt-9 grid gap-x-8 gap-y-5 border-t border-border/10 pt-7 sm:grid-cols-2">
            {person.birth?.date && (
              <VitalRow
                label="Born"
                value={formatHistoricalDate(person.birth.date)}
                place={places.find((p) => p.id === person.birth?.placeId)?.name}
                placeSlug={places.find((p) => p.id === person.birth?.placeId)?.slug}
              />
            )}
            {person.death?.date && (
              <VitalRow
                label="Died"
                value={formatHistoricalDate(person.death.date)}
                place={places.find((p) => p.id === person.death?.placeId)?.name}
                placeSlug={places.find((p) => p.id === person.death?.placeId)?.slug}
              />
            )}
            {person.occupation && <VitalRow label="Trade" value={person.occupation} />}
            {spouses.length > 0 && (
              <div>
                <dt className="label-mono text-[0.625rem]">
                  {spouses.length === 1 ? 'Married' : 'Marriages'}
                </dt>
                <dd className="mt-1.5 font-serif text-fluid-base text-foreground">
                  {spouses.map((spouse, i) => (
                    <span key={spouse.id}>
                      {i > 0 && ', '}
                      <Link
                        href={`/people/${spouse.slug}`}
                        className="underline decoration-border/25 underline-offset-4 transition-colors hover:text-gold-200 hover:decoration-gold"
                      >
                        {fullName(spouse)}
                      </Link>
                    </span>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </header>

      {/* ---------- Biography ---------- */}
      {person.biography && person.biography.length > 0 && (
        <section className="border-t border-border/10 py-12 md:py-16">
          <div className="grid gap-8 md:grid-cols-[12rem,1fr] md:gap-14">
            <h2 className="label-mono pt-1.5 text-gold-200">Life</h2>
            <div className="max-w-prose space-y-6">
              {person.biography.map((paragraph, i) => (
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

      {/* ---------- Relations ---------- */}
      <section className="border-t border-border/10 py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-[12rem,1fr] md:gap-14">
          <h2 className="label-mono pt-1.5 text-gold-200">Family</h2>
          <div className="space-y-10">
            <RelationGroup title="Parents" people={parents} portraitOf={portraitOf} />
            <RelationGroup title="Siblings" people={siblings} portraitOf={portraitOf} />
            <RelationGroup title="Children" people={children} portraitOf={portraitOf} />
            {parents.length === 0 && siblings.length === 0 && children.length === 0 && (
              <p className="font-serif text-fluid-base italic text-muted-foreground">
                No immediate family is recorded for {person.givenName} in this archive.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ---------- Events ---------- */}
      {events.length > 0 && (
        <section className="border-t border-border/10 py-12 md:py-16">
          <div className="grid gap-8 md:grid-cols-[12rem,1fr] md:gap-14">
            <h2 className="label-mono pt-1.5 text-gold-200">Events</h2>
            <ol className="max-w-3xl">
              {events.map((event, i) => (
                <Reveal as="li" key={event.id} delay={i * 40}>
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
                    </div>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* ---------- Places ---------- */}
      {places.length > 0 && (
        <section className="border-t border-border/10 py-12 md:py-16">
          <div className="grid gap-8 md:grid-cols-[12rem,1fr] md:gap-14">
            <h2 className="label-mono pt-1.5 text-gold-200">Places</h2>
            <ul className="flex flex-wrap gap-2.5">
              {places.map((place) => (
                <li key={place.id}>
                  <Link
                    href={`/places/${place.slug}`}
                    className="touch-target inline-flex items-center rounded-full border border-border/12 bg-white/[0.08] px-4 font-sans text-sm text-muted-foreground transition-all duration-300 hover:border-gold/40 hover:bg-gold/[0.08] hover:text-gold-100"
                  >
                    {place.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ---------- Photographs ---------- */}
      {gallery.length > 0 && (
        <section className="border-t border-border/10 py-12 md:py-16">
          <div className="grid gap-8 md:grid-cols-[12rem,1fr] md:gap-14">
            <h2 className="label-mono pt-1.5 text-gold-200">In the archive</h2>
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5">
              {gallery.map((asset) => (
                <li key={asset.id}>
                  <figure>
                    <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-border/10">
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

      {/* ---------- Stories ---------- */}
      {stories.length > 0 && (
        <section className="border-t border-border/10 py-12 md:py-16">
          <div className="grid gap-8 md:grid-cols-[12rem,1fr] md:gap-14">
            <h2 className="label-mono pt-1.5 text-gold-200">Stories</h2>
            <ul className="max-w-3xl">
              {stories.map((story) => (
                <li key={story.id}>
                  <Link
                    href={`/stories/${story.slug}`}
                    className="group flex items-start justify-between gap-6 border-b border-border/[0.08] py-5 transition-colors"
                  >
                    <div className="min-w-0">
                      <h3 className="font-display text-fluid-lg leading-snug text-foreground transition-colors group-hover:text-gold-100">
                        {story.title}
                      </h3>
                      <p className="mt-1.5 line-clamp-2 max-w-prose font-serif text-fluid-sm leading-relaxed text-muted-foreground">
                        {story.excerpt}
                      </p>
                    </div>
                    <ArrowRight className="mt-1.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-500 ease-heritage group-hover:translate-x-1" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </article>
  );
}

function VitalRow({
  label,
  value,
  place,
  placeSlug,
}: {
  readonly label: string;
  readonly value: string;
  readonly place?: string | undefined;
  readonly placeSlug?: string | undefined;
}): React.ReactElement {
  return (
    <div>
      <dt className="label-mono text-[0.625rem]">{label}</dt>
      <dd className="mt-1.5 font-serif text-fluid-base text-foreground">
        {value}
        {place && (
          <>
            <span className="text-muted-foreground/60">, </span>
            {placeSlug ? (
              <Link
                href={`/places/${placeSlug}`}
                className="underline decoration-border/25 underline-offset-4 transition-colors hover:text-gold-200 hover:decoration-gold"
              >
                {place}
              </Link>
            ) : (
              place
            )}
          </>
        )}
      </dd>
    </div>
  );
}

function RelationGroup({
  title,
  people,
  portraitOf,
}: {
  readonly title: string;
  readonly people: readonly Person[];
  readonly portraitOf: (p: Person) => MediaAsset | undefined;
}): React.ReactElement | null {
  if (people.length === 0) return null;
  return (
    <div>
      <h3 className="font-sans text-xs uppercase tracking-[0.16em] text-muted-foreground">{title}</h3>
      <ul className="mt-2 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
        {people.map((person) => (
          <li key={person.id}>
            <PersonCard person={person} portrait={portraitOf(person)} variant="row" />
          </li>
        ))}
      </ul>
    </div>
  );
}
