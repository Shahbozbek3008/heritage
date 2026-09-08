import type { Metadata } from 'next';
import { repository } from '@/lib/data';
import { PageHeader } from '@/components/ui/SectionHeader';
import { PhotoGallery } from '@/components/gallery/PhotoGallery';
import { FileText } from 'lucide-react';

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

      <div className="grid gap-4 py-10 sm:grid-cols-3">
        {[
          {
            title: 'Bindery papers',
            body: 'Four hundred pages of accounts in two hands, 1878 to 1911. The faster hand is Rivka’s.',
          },
          {
            title: 'Passage papers',
            body: 'The manifest of the SS Mount Clay, and a birth certificate issued in three languages.',
          },
          {
            title: 'Samuel’s letters',
            body: 'Fourteen letters and one telegram, kept in a sewing table drawer for forty-four years.',
          },
        ].map((collection) => (
          <div key={collection.title} className="flex gap-3 rounded-2xl border border-border/10 bg-white/[0.035] p-5 transition-colors duration-500 hover:border-gold/20 hover:bg-white/[0.065]">
            <FileText aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
            <div>
              <h2 className="font-display text-fluid-base text-foreground">{collection.title}</h2>
              <p className="mt-1.5 font-serif text-fluid-sm leading-relaxed text-muted-foreground">
                {collection.body}
              </p>
            </div>
          </div>
        ))}
      </div>

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
