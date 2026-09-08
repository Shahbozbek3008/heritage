import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { repository } from '@/lib/data';
import { ArchivalImage } from '@/components/ui/ArchivalImage';
import { ArrowLeft } from 'lucide-react';
import { fullName } from '@/lib/format';
import type { ID, MediaAsset, Person, StoryBlock } from '@/types/heritage';

interface PageProps {
  readonly params: Promise<{ readonly slug: string }>;
}

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const stories = await repository.listStories();
  return stories.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const story = await repository.getStoryBySlug(slug);
  if (!story) return { title: 'Story not found' };

  return {
    title: story.title,
    description: story.excerpt,
    openGraph: {
      type: 'article',
      title: story.title,
      description: story.excerpt,
      publishedTime: story.publishedAt,
    },
  };
}

export default async function StoryPage({ params }: PageProps): Promise<React.ReactElement> {
  const { slug } = await params;
  const story = await repository.getStoryBySlug(slug);
  if (!story) notFound();

  const [allMedia, allPeople, allStories] = await Promise.all([
    repository.listMedia(),
    repository.listPeople(),
    repository.listStories(),
  ]);

  const mediaById = new Map<ID, MediaAsset>(allMedia.map((m) => [m.id, m]));
  const personById = new Map<ID, Person>(allPeople.map((p) => [p.id, p]));

  const cover = story.coverMediaId ? mediaById.get(story.coverMediaId) : undefined;
  const narrator = story.narratorId ? personById.get(story.narratorId) : undefined;
  const featuredPeople = story.personIds
    .map((id) => personById.get(id))
    .filter((p): p is Person => p !== undefined);

  const more = allStories.filter((s) => s.id !== story.id).slice(0, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: story.title,
    description: story.excerpt,
    datePublished: story.publishedAt,
    ...(narrator ? { author: { '@type': 'Person', name: fullName(narrator) } } : {}),
  };

  return (
    <>
      <article className="mx-auto max-w-shell px-4 sm:px-6 lg:px-10">
        <nav className="pt-8 md:pt-12" aria-label="Breadcrumb">
          <Link
            href="/stories"
            className="group inline-flex items-center gap-2 font-sans text-xs tracking-wide text-muted-foreground transition-colors hover:text-gold-200"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-500 ease-heritage group-hover:-translate-x-1" />
            All stories
          </Link>
        </nav>

        <header className="mx-auto max-w-3xl pb-10 pt-8 text-center md:pb-14 md:pt-14">
          <p className="label-mono text-gold-200">
            {story.era} · {story.readingMinutes} min read
          </p>
          <h1 className="text-gradient mt-5 font-display text-fluid-3xl font-normal leading-[1.03] tracking-[-0.03em]">
            {story.title}
          </h1>
          {story.subtitle && (
            <p className="mt-4 font-serif text-fluid-lg italic text-muted-foreground">{story.subtitle}</p>
          )}
          {narrator && (
            <p className="mt-6 font-sans text-xs tracking-[0.16em] text-muted-foreground/70">
              <span className="uppercase">Told by</span>{' '}
              <Link
                href={`/people/${narrator.slug}`}
                className="underline decoration-border/25 underline-offset-4 transition-colors hover:text-gold-200"
              >
                {fullName(narrator)}
              </Link>
            </p>
          )}
        </header>

        {cover && (
          <figure className="mb-12 md:mb-16">
            <div className="relative aspect-[16/10] w-full overflow-hidden md:aspect-[16/8]">
              <ArchivalImage
                asset={cover}
                sizes="(max-width: 1024px) 100vw, 90rem"
                priority
                className="h-full w-full"
              />
            </div>
            {cover.caption && (
              <figcaption className="mx-auto mt-3 max-w-prose text-center font-serif text-fluid-xs leading-relaxed text-muted-foreground">
                {cover.caption}
              </figcaption>
            )}
          </figure>
        )}

        <div className="mx-auto max-w-prose pb-12 md:pb-16">
          {story.body.map((block, i) => (
            <StoryBlockView key={i} block={block} index={i} mediaById={mediaById} />
          ))}
        </div>

        {featuredPeople.length > 0 && (
          <section className="mx-auto max-w-prose border-t border-border/10 py-10">
            <h2 className="label-mono text-gold-200">People in this story</h2>
            <ul className="mt-4 flex flex-wrap gap-2.5">
              {featuredPeople.map((person) => (
                <li key={person.id}>
                  <Link
                    href={`/people/${person.slug}`}
                    className="touch-target inline-flex items-center rounded-full border border-border/12 bg-white/[0.08] px-4 font-sans text-sm text-muted-foreground transition-all duration-300 hover:border-gold/40 hover:bg-gold/[0.08] hover:text-gold-100"
                  >
                    {fullName(person)}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>

      {more.length > 0 && (
        <section className="border-t border-border/10 bg-white/[0.028] py-14 md:py-20">
          <div className="mx-auto max-w-shell px-4 sm:px-6 lg:px-10">
            <h2 className="text-gradient font-display text-fluid-xl">More from the archive</h2>
            <ul className="mt-8 grid gap-8 sm:grid-cols-3">
              {more.map((other) => (
                <li key={other.id}>
                  <Link href={`/stories/${other.slug}`} className="group block">
                    <p className="label-mono text-[0.625rem] text-gold-200">{other.era}</p>
                    <h3 className="mt-2 font-display text-fluid-lg leading-snug text-foreground transition-colors group-hover:text-gold-100">
                      {other.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 font-serif text-fluid-sm leading-relaxed text-muted-foreground">
                      {other.excerpt}
                    </p>
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
    </>
  );
}

function StoryBlockView({
  block,
  index,
  mediaById,
}: {
  readonly block: StoryBlock;
  readonly index: number;
  readonly mediaById: ReadonlyMap<ID, MediaAsset>;
}): React.ReactElement | null {
  switch (block.type) {
    case 'paragraph':
      return (
        <p
          className={`mt-6 font-serif text-fluid-lg leading-[1.75] text-foreground/85 first:mt-0 ${
            index === 0 ? 'drop-cap' : ''
          }`}
        >
          {block.text}
        </p>
      );

    case 'heading':
      return (
        <h2 className="text-gradient mt-12 font-display text-fluid-xl leading-tight">{block.text}</h2>
      );

    case 'quote':
      return (
        <figure className="my-10 border-l-2 border-gold/50 pl-6">
          <blockquote className="text-gradient font-display text-fluid-xl italic leading-[1.35]">
            “{block.text}”
          </blockquote>
          {block.attribution && (
            <figcaption className="mt-3 font-sans text-xs tracking-wide text-muted-foreground">
              {block.attribution}
            </figcaption>
          )}
        </figure>
      );

    case 'image': {
      const asset = mediaById.get(block.mediaId);
      if (!asset) return null;
      return (
        <figure className="my-10">
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            <ArchivalImage asset={asset} sizes="(max-width: 768px) 92vw, 68ch" className="h-full w-full" />
          </div>
          {asset.caption && (
            <figcaption className="mt-3 font-serif text-fluid-xs leading-relaxed text-muted-foreground">
              {asset.caption}
            </figcaption>
          )}
        </figure>
      );
    }

    case 'note':
      return (
        <aside className="my-10 rounded-2xl border border-border/10 bg-white/[0.042] px-5 py-4">
          <p className="font-sans text-xs leading-relaxed text-muted-foreground">{block.text}</p>
        </aside>
      );

    default:
      return null;
  }
}
