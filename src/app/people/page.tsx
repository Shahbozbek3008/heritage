import type { Metadata } from 'next';
import { Suspense } from 'react';
import { repository } from '@/lib/data';
import { PageHeader } from '@/components/ui/SectionHeader';
import { PeopleBrowser } from '@/components/people/PeopleBrowser';
import type { ID, MediaAsset } from '@/types/heritage';

export const metadata: Metadata = {
  title: 'People',
  description:
    'Everyone recorded in the family archive, across five generations - with portraits, dates and trades.',
};

export default async function PeoplePage(): Promise<React.ReactElement> {
  const [generations, allMedia, meta] = await Promise.all([
    repository.listGenerations(),
    repository.listMedia(),
    repository.getFamilyMeta(),
  ]);

  const mediaById = new Map<ID, MediaAsset>(allMedia.map((m) => [m.id, m]));
  const portraits: Record<ID, MediaAsset | undefined> = {};
  for (const generation of generations) {
    for (const person of generation.people) {
      portraits[person.id] = person.portraitMediaId
        ? mediaById.get(person.portraitMediaId)
        : undefined;
    }
  }

  return (
    <div className="mx-auto max-w-shell px-4 sm:px-6 lg:px-10">
      <PageHeader
        eyebrow="The people"
        title="Everyone we can name."
        lede="Fourteen people across five generations, from a bookbinder born around 1849 to the children of his great-great-grandchildren. Sixty faces in the photograph archive remain unidentified."
        meta={`${meta.stats.people} people · ${meta.stats.generations} generations · ${meta.stats.years} years`}
      />

      <div className="pt-8">
        {/*
          The generation deep-link (/people?generation=3) is read on the client
          so this page stays fully static. Reading searchParams on the server
          would force dynamic rendering for what is otherwise fixed content.
        */}
        <Suspense fallback={<div className="min-h-[50dvh]" />}>
          <PeopleBrowser generations={generations} portraits={portraits} />
        </Suspense>
      </div>
    </div>
  );
}
