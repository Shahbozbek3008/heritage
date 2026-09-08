import type { Metadata } from 'next';
import { repository } from '@/lib/data';
import { PageHeader } from '@/components/ui/SectionHeader';
import { PhotoGallery } from '@/components/gallery/PhotoGallery';

export const metadata: Metadata = {
  title: 'Archive',
  description:
    'Documents, letters and certificates: ship manifests, ledgers, a birth certificate in three languages, and fourteen letters from Normandy.',
};

export default async function ArchivePage(): Promise<React.ReactElement> {
  const [documents, letters, certificates] = await Promise.all([
    repository.listMedia({ kind: 'document' }),
    repository.listMedia({ kind: 'letter' }),
    repository.listMedia({ kind: 'certificate' }),
  ]);

  const assets = [...documents, ...letters, ...certificates];

  return (
    <div className="mx-auto max-w-shell px-4 sm:px-6 lg:px-10">
      <PageHeader
        eyebrow="The archive"
        title="Paper that outlived the people who wrote it."
        lede="Ledgers, manifests, certificates and letters. Some were kept deliberately. Most survived by accident, in a drawer nobody cleared."
        meta={`${assets.length} items · ${letters.length} letters · ${certificates.length} certificates`}
      />

      <div className="py-10 md:py-14">
        <PhotoGallery
          assets={assets}
          filterBy="kind"
          emptyLabel="No documents of this kind are catalogued yet."
        />
      </div>
    </div>
  );
}
