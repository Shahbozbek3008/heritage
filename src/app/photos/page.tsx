import type { Metadata } from 'next';
import { repository } from '@/lib/data';
import { PageHeader } from '@/components/ui/SectionHeader';
import { PhotoGallery } from '@/components/gallery/PhotoGallery';

export const metadata: Metadata = {
  title: 'Photo Archive',
  description:
    'The family photograph archive: portraits, streets, rooms and objects, from Vilna in the 1890s to the present day.',
};

export default async function PhotosPage(): Promise<React.ReactElement> {
  const photographs = await repository.listMedia({ kind: 'photograph' });
  const artifacts = await repository.listMedia({ kind: 'artifact' });
  const assets = [...photographs, ...artifacts];

  return (
    <div className="mx-auto max-w-shell px-4 sm:px-6 lg:px-10">
      <PageHeader
        eyebrow="Photo archive"
        title="Faces, rooms, streets and objects."
        lede="Every photograph we hold, with what we know about it. Sixty more remain unidentified, and are not shown here until someone can name them."
        meta={`${assets.length} images · tap any photograph to view it full screen`}
      />

      <div className="py-10 md:py-14">
        <PhotoGallery assets={assets} filterBy="collection" />
      </div>
    </div>
  );
}
