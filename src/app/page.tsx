import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { repository } from '@/lib/data';
import { ArchivalImage } from '@/components/ui/ArchivalImage';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { PersonCard } from '@/components/people/PersonCard';
import { Button } from '@/components/ui/primitives/button';
import { Badge } from '@/components/ui/primitives/badge';
import { formatHistoricalDate } from '@/lib/format';
import type { MediaAsset } from '@/types/heritage';

export default async function HomePage(): Promise<React.ReactElement> {
  const [meta, generations, featured, stories, events, allMedia] = await Promise.all([
    repository.getFamilyMeta(),
    repository.listGenerations(),
    repository.listPeople({ featured: true }),
    repository.listStories({ featured: true, limit: 3 }),
    repository.listEvents(),
    repository.listMedia(),
  ]);

  const mediaById = new Map<string, MediaAsset>(allMedia.map((m) => [m.id, m]));
  const hero = mediaById.get('md-vilna-street');
  const milestones = events.filter((e) => !e.historical).slice(0, 6);

  return (
    <>
      {/* ---------------- Hero ---------------- */}
      <section className="relative isolate grain overflow-hidden">
        <div className="absolute inset-0 -z-10">
          {hero && (
            <ArchivalImage
              asset={hero}
              sizes="100vw"
              priority
              framed={false}
              className="h-full w-full"
              imageClassName="object-cover opacity-[0.28]"
            />
          )}
          {/* Drops the photograph back far enough for text to sit on it. */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/88 to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_0%,hsl(var(--background))_72%)]" />
        </div>

        {/* Warm bloom behind the headline. */}
        <div
          aria-hidden
          className="aurora -top-20 left-[15%] h-[26rem] w-[40rem] bg-gold/[0.09] motion-safe:animate-aurora"
        />

        <div className="mx-auto max-w-shell px-4 pb-20 pt-16 sm:px-6 md:pb-32 md:pt-28 lg:px-10">
          <Reveal>
            <Badge>
              {meta.origin} · Est. {meta.foundedYear}
            </Badge>
          </Reveal>

          <Reveal delay={90}>
            <h1 className="text-gradient mt-7 max-w-[13ch] font-display text-fluid-4xl font-normal leading-[0.96] tracking-[-0.04em] md:max-w-[14ch]">
              This is where we came from.
            </h1>
          </Reveal>

          <Reveal delay={180}>
            <div className="mt-8 max-w-prose space-y-4 md:mt-10">
              {meta.introduction.map((paragraph, i) => (
                <p
                  key={i}
                  className="font-serif text-fluid-lg leading-[1.7] text-muted-foreground"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </Reveal>

          <Reveal delay={260}>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center md:mt-12">
              <Button asChild size="lg">
                <Link href="/tree" className="group">
                  Explore the family tree
                  <ArrowRight className="transition-transform duration-500 ease-heritage group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/stories">Read the stories</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------- Generations ---------------- */}
      <section className="mx-auto max-w-shell px-4 py-20 sm:px-6 md:py-28 lg:px-10">
        <SectionHeader
          eyebrow="Five generations"
          title="Each one further from the bindery, and closer to us."
          lede="The archive is organised by generation. Every person belongs to one, and every generation carries a different distance from the place it started."
          href="/people"
          hrefLabel="All people"
        />

        <ol className="mt-14 space-y-3 md:mt-20">
          {generations.map((generation, index) => (
            <Reveal as="li" key={generation.index} delay={index * 60}>
              <Link
                href={`/people?generation=${generation.index}`}
                className="group relative grid grid-cols-[auto,1fr] items-start gap-x-5 overflow-hidden rounded-2xl border border-border/10 bg-white/[0.035] p-5 transition-all duration-500 ease-heritage hover:border-gold/25 hover:bg-white/[0.072] sm:grid-cols-[5rem,1fr,auto] sm:items-center sm:gap-x-8 sm:p-7"
              >
                {/* Left rail lights up on hover: a small reward for pointing. */}
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-0 w-px origin-top scale-y-0 bg-gradient-to-b from-transparent via-gold to-transparent transition-transform duration-700 ease-heritage group-hover:scale-y-100"
                />

                <span className="text-gradient-gold font-display text-fluid-2xl leading-none opacity-50 transition-opacity duration-500 group-hover:opacity-100">
                  {String(generation.index).padStart(2, '0')}
                </span>

                <div className="min-w-0">
                  <h3 className="font-display text-fluid-xl leading-tight text-foreground">
                    {generation.label}
                  </h3>
                  <p className="mt-1.5 font-sans text-xs tracking-wide text-muted-foreground/70">
                    {generation.period} · {generation.people.length}{' '}
                    {generation.people.length === 1 ? 'person' : 'people'}
                  </p>
                  <p className="mt-3 max-w-prose font-serif text-fluid-sm leading-relaxed text-muted-foreground">
                    {generation.summary}
                  </p>
                </div>

                <ArrowRight className="col-start-2 mt-4 h-4 w-4 text-muted-foreground/50 transition-all duration-500 ease-heritage group-hover:translate-x-1 group-hover:text-gold sm:col-start-3 sm:mt-0" />
              </Link>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* ---------------- Featured ancestors ---------------- */}
      <section className="relative border-y border-border/10 bg-white/[0.028] py-20 md:py-28">
        <div className="mx-auto max-w-shell px-4 sm:px-6 lg:px-10">
          <SectionHeader
            eyebrow="The people"
            title="Those whose lives shaped the rest."
            href="/people"
            hrefLabel="Everyone"
          />
        </div>

        {/* Horizontal snap rail on mobile; grid from sm up. */}
        <div className="mt-12 md:mt-16">
          <ul className="rail flex snap-x gap-5 overflow-x-auto px-4 pb-2 sm:hidden">
            {featured.map((person) => (
              <li key={person.id} className="w-[62vw] shrink-0">
                <PersonCard
                  person={person}
                  portrait={
                    person.portraitMediaId ? mediaById.get(person.portraitMediaId) : undefined
                  }
                />
              </li>
            ))}
          </ul>

          <ul className="mx-auto hidden max-w-shell grid-cols-2 gap-x-6 gap-y-12 px-6 sm:grid lg:grid-cols-4 lg:px-10">
            {featured.map((person, i) => (
              <Reveal as="li" key={person.id} delay={(i % 4) * 70}>
                <PersonCard
                  person={person}
                  portrait={
                    person.portraitMediaId ? mediaById.get(person.portraitMediaId) : undefined
                  }
                />
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------------- Timeline preview ---------------- */}
      <section className="border-t border-border/10 py-20 md:py-28">
        <div className="mx-auto max-w-shell px-4 sm:px-6 lg:px-10">
          <SectionHeader
            eyebrow="Timeline"
            title="1849 to the present, in the order it happened."
            href="/timeline"
            hrefLabel="Full timeline"
          />

          {/* Spine + nodes: the vertical line is what makes this read as time. */}
          <ol className="relative mt-14 md:mt-20">
            <span
              aria-hidden
              className="absolute inset-y-0 left-[0.3125rem] w-px bg-gradient-to-b from-transparent via-border/15 to-transparent sm:left-[7.4rem]"
            />

            {milestones.map((event, i) => (
              <Reveal as="li" key={event.id} delay={i * 50}>
                <div className="group relative grid grid-cols-[1.75rem,1fr] gap-x-4 py-5 sm:grid-cols-[7rem,1.75rem,1fr] sm:gap-x-4 md:py-6">
                  <time
                    dateTime={event.date.iso}
                    className="order-2 font-sans text-xs tracking-wide text-gold-200 sm:order-1 sm:text-right sm:text-sm"
                  >
                    {formatHistoricalDate(event.date)}
                  </time>

                  <span aria-hidden className="order-1 flex justify-start pt-1.5 sm:order-2 sm:justify-center">
                    <span className="h-[0.4375rem] w-[0.4375rem] rounded-full bg-gold/40 ring-4 ring-background transition-all duration-500 group-hover:bg-gold group-hover:shadow-[0_0_12px_2px_hsl(var(--gold)/0.6)]" />
                  </span>

                  <div className="order-3 col-start-2 min-w-0 sm:col-start-3">
                    <h3 className="font-display text-fluid-lg leading-snug text-foreground">
                      {event.title}
                    </h3>
                    {event.description && (
                      <p className="mt-1.5 max-w-prose font-serif text-fluid-sm leading-relaxed text-muted-foreground">
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

      {/* ---------------- Stories ---------------- */}
      <section className="border-t border-border/10 bg-white/[0.028] py-20 md:py-28">
        <div className="mx-auto max-w-shell px-4 sm:px-6 lg:px-10">
          <SectionHeader
            eyebrow="Stories"
            title="What we still tell each other."
            href="/stories"
            hrefLabel="All stories"
          />

          <ul className="mt-12 grid gap-10 md:mt-16 md:grid-cols-3 md:gap-8">
            {stories.map((story, i) => {
              const cover = story.coverMediaId ? mediaById.get(story.coverMediaId) : undefined;
              return (
                <Reveal as="li" key={story.id} delay={i * 80}>
                  <Link href={`/stories/${story.slug}`} className="group block">
                    {cover && (
                      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border/10 transition-all duration-500 ease-heritage group-hover:border-gold/25 group-hover:shadow-float">
                        <ArchivalImage
                          asset={cover}
                          sizes="(max-width: 768px) 92vw, 30vw"
                          framed={false}
                          className="h-full w-full"
                          imageClassName="transition-transform [transition-duration:1200ms] ease-heritage group-hover:scale-[1.05]"
                        />
                      </div>
                    )}
                    <p className="label-mono mt-5 text-gold-200">
                      {story.era} · {story.readingMinutes} min read
                    </p>
                    <h3 className="mt-2.5 font-display text-fluid-xl leading-tight text-foreground transition-colors duration-300 group-hover:text-gold-100">
                      {story.title}
                    </h3>
                    <p className="mt-2.5 line-clamp-3 font-serif text-fluid-sm leading-relaxed text-muted-foreground">
                      {story.excerpt}
                    </p>
                  </Link>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </section>

    </>
  );
}
