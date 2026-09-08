import type { Metadata } from 'next';
import Link from 'next/link';
import { repository } from '@/lib/data';
import { PageHeader } from '@/components/ui/SectionHeader';
import { ArchivalImage } from '@/components/ui/ArchivalImage';
import { Reveal } from '@/components/ui/Reveal';
import type { ID, MediaAsset } from '@/types/heritage';

export const metadata: Metadata = {
  title: 'Stories',
  description:
    'Family stories and memories, written down: the crossing, the ring sold in Riga, fourteen letters, and the ledgers that gave a woman her work back.',
};

export default async function StoriesPage(): Promise<React.ReactElement> {
  const [stories, allMedia] = await Promise.all([
    repository.listStories(),
    repository.listMedia(),
  ]);

  const mediaById = new Map<ID, MediaAsset>(allMedia.map((m) => [m.id, m]));
  const [lead, ...rest] = stories;

  return (
    <div className="mx-auto max-w-shell px-4 sm:px-6 lg:px-10">
      <PageHeader
        eyebrow="Stories"
        title="What we still tell each other."
        lede="Some of these were told so often they wore smooth. Others were reconstructed from a ledger, a manifest, or eleven hours of cassette tape."
        meta={`${stories.length} stories`}
      />

      {lead && (
        <Reveal>
          <Link href={`/stories/${lead.slug}`} className="group block border-b border-border/10 py-12 md:py-16">
            <div className="grid gap-8 md:grid-cols-2 md:gap-14 lg:gap-20">
              {lead.coverMediaId && mediaById.has(lead.coverMediaId) && (
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border/10 transition-all duration-500 ease-heritage group-hover:border-gold/25 group-hover:shadow-float md:aspect-[5/4]">
                  <ArchivalImage
                    asset={mediaById.get(lead.coverMediaId)!}
                    sizes="(max-width: 768px) 92vw, 46vw"
                    framed={false}
                    priority
                    className="h-full w-full"
                    imageClassName="transition-transform [transition-duration:1400ms] ease-heritage group-hover:scale-[1.03]"
                  />
                </div>
              )}
              <div className="flex flex-col justify-center">
                <p className="label-mono text-gold-200">
                  Featured · {lead.era} · {lead.readingMinutes} min read
                </p>
                <h2 className="text-gradient mt-4 max-w-[14ch] font-display text-fluid-3xl font-normal leading-[1.04] tracking-[-0.03em]">
                  {lead.title}
                </h2>
                {lead.subtitle && (
                  <p className="mt-3 font-serif text-fluid-lg italic text-muted-foreground">
                    {lead.subtitle}
                  </p>
                )}
                <p className="mt-5 max-w-prose font-serif text-fluid-base leading-relaxed text-muted-foreground">
                  {lead.excerpt}
                </p>
                <span className="mt-7 inline-block border-b border-border/25 pb-1 font-sans text-sm text-foreground transition-colors group-hover:border-gold group-hover:text-gold-100">
                  Read this story
                </span>
              </div>
            </div>
          </Link>
        </Reveal>
      )}

      <ul className="grid gap-x-8 gap-y-14 py-12 sm:grid-cols-2 md:py-16 lg:grid-cols-3">
        {rest.map((story, i) => {
          const cover = story.coverMediaId ? mediaById.get(story.coverMediaId) : undefined;
          return (
            <Reveal as="li" key={story.id} delay={(i % 3) * 80}>
              <Link href={`/stories/${story.slug}`} className="group block">
                {cover && (
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border/10 transition-all duration-500 ease-heritage group-hover:border-gold/25 group-hover:shadow-float">
                    <ArchivalImage
                      asset={cover}
                      sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 30vw"
                      framed={false}
                      className="h-full w-full"
                      imageClassName="transition-transform [transition-duration:1200ms] ease-heritage group-hover:scale-[1.04]"
                    />
                  </div>
                )}
                <p className="label-mono mt-5 text-[0.625rem] text-gold-200">
                  {story.era} · {story.readingMinutes} min read
                </p>
                <h2 className="mt-2.5 font-display text-fluid-xl leading-tight text-foreground transition-colors duration-300 group-hover:text-gold-100">
                  {story.title}
                </h2>
                {story.subtitle && (
                  <p className="mt-1.5 font-serif text-fluid-sm italic text-muted-foreground/80">
                    {story.subtitle}
                  </p>
                )}
                <p className="mt-3 line-clamp-3 font-serif text-fluid-sm leading-relaxed text-muted-foreground">
                  {story.excerpt}
                </p>
              </Link>
            </Reveal>
          );
        })}
      </ul>
    </div>
  );
}
