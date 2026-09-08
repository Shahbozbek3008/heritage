import type { Metadata } from 'next';
import Link from 'next/link';
import { repository } from '@/lib/data';
import { PageHeader } from '@/components/ui/SectionHeader';
import { ArchivalImage } from '@/components/ui/ArchivalImage';
import { Reveal } from '@/components/ui/Reveal';
import { ArrowRight } from 'lucide-react';
import type { ID, MediaAsset } from '@/types/heritage';

export const metadata: Metadata = {
  title: 'Places',
  description:
    'The places this family passed through: Vilna, Riga, Hamburg, Orchard Street, Flatbush and Berkeley.',
};

export default async function PlacesPage(): Promise<React.ReactElement> {
  const [places, allMedia] = await Promise.all([repository.listPlaces(), repository.listMedia()]);
  const mediaById = new Map<ID, MediaAsset>(allMedia.map((m) => [m.id, m]));

  return (
    <div className="mx-auto max-w-shell px-4 sm:px-6 lg:px-10">
      <PageHeader
        eyebrow="Places"
        title="Six places, in the order we left them."
        lede="A route rather than a map: each place held the family for a while, and each one appears in the record differently — some in photographs, some only in a rent receipt."
        meta={`${places.length} places · 1849 to the present`}
      />

      <ol className="space-y-4 py-10 md:py-14">
        {places.map((place, i) => {
          const cover = place.coverMediaId ? mediaById.get(place.coverMediaId) : undefined;
          return (
            <Reveal as="li" key={place.id} delay={i * 60}>
              <Link
                href={`/places/${place.slug}`}
                className="group grid gap-5 rounded-2xl border border-border/10 bg-white/[0.035] p-5 transition-all duration-500 ease-heritage hover:border-gold/25 hover:bg-white/[0.065] sm:p-6 sm:grid-cols-[minmax(0,16rem),1fr] sm:gap-8 md:py-10 lg:grid-cols-[minmax(0,22rem),1fr] lg:gap-14"
              >
                {cover && (
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                    <ArchivalImage
                      asset={cover}
                      sizes="(max-width: 640px) 92vw, (max-width: 1024px) 30vw, 22rem"
                      framed={false}
                      className="h-full w-full"
                      imageClassName="transition-transform [transition-duration:1400ms] ease-heritage group-hover:scale-[1.04]"
                    />
                  </div>
                )}

                <div className="flex min-w-0 flex-col justify-center">
                  <p className="label-mono text-[0.625rem] text-gold-200">
                    {String(i + 1).padStart(2, '0')} · {place.country}
                    {place.generations && place.generations.length > 0
                      ? ` · Generations ${place.generations.join(', ')}`
                      : ''}
                  </p>

                  <h2 className="text-gradient mt-3 font-display text-fluid-2xl leading-tight tracking-[-0.02em]">
                    {place.name}
                  </h2>

                  {place.historicalName && (
                    <p className="mt-1.5 font-serif text-fluid-sm italic text-muted-foreground/80">
                      then {place.historicalName}
                    </p>
                  )}

                  <p className="mt-4 max-w-prose font-serif text-fluid-base leading-relaxed text-muted-foreground">
                    {place.summary}
                  </p>

                  <span className="mt-6 inline-flex items-center gap-2 font-sans text-sm text-muted-foreground transition-colors group-hover:text-gold-100">
                    What happened here
                    <ArrowRight className="h-4 w-4 transition-transform duration-500 ease-heritage group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </ol>
    </div>
  );
}
