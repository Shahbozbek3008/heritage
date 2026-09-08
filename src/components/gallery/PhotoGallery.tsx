'use client';

import { useMemo, useState } from 'react';
import type { MediaAsset } from '@/types/heritage';
import { ArchivalImage } from '@/components/ui/ArchivalImage';
import { Lightbox } from './Lightbox';
import { formatHistoricalDate } from '@/lib/format';
import { cn } from '@/lib/utils';

interface PhotoGalleryProps {
  readonly assets: readonly MediaAsset[];
  /** Filter dimension shown as chips above the grid. */
  readonly filterBy?: 'collection' | 'kind';
  readonly emptyLabel?: string;
}

const KIND_LABELS: Readonly<Record<MediaAsset['kind'], string>> = {
  photograph: 'Photographs',
  document: 'Documents',
  letter: 'Letters',
  certificate: 'Certificates',
  artifact: 'Objects',
};

export function PhotoGallery({
  assets,
  filterBy = 'collection',
  emptyLabel = 'Nothing here yet.',
}: PhotoGalleryProps): React.ReactElement {
  const [active, setActive] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const facets = useMemo(() => {
    const values = new Set<string>();
    for (const asset of assets) {
      const value = filterBy === 'kind' ? asset.kind : asset.collection;
      if (value) values.add(value);
    }
    return [...values].sort();
  }, [assets, filterBy]);

  const visible = useMemo(() => {
    if (!active) return assets;
    return assets.filter((asset) =>
      filterBy === 'kind' ? asset.kind === active : asset.collection === active,
    );
  }, [assets, active, filterBy]);

  const labelFor = (value: string): string =>
    filterBy === 'kind' ? (KIND_LABELS[value as MediaAsset['kind']] ?? value) : value;

  return (
    <>
      {facets.length > 1 && (
        <div className="-mx-4 mb-10 overflow-x-auto px-4 no-scrollbar sm:mx-0 sm:px-0">
          <div className="flex items-center gap-2">
            <Chip active={active === null} onClick={() => setActive(null)}>
              All
            </Chip>
            {facets.map((facet) => (
              <Chip
                key={facet}
                active={active === facet}
                onClick={() => setActive(active === facet ? null : facet)}
              >
                {labelFor(facet)}
              </Chip>
            ))}
          </div>
        </div>
      )}

      {visible.length === 0 ? (
        <p className="py-16 text-center font-serif text-fluid-base italic text-muted-foreground">
          {emptyLabel}
        </p>
      ) : (
        /*
         * CSS columns give a masonry flow without measuring anything in JS,
         * so tall documents and wide photographs pack together without gaps
         * and without layout thrash on resize.
         */
        <ul className="columns-2 gap-3 sm:columns-2 sm:gap-5 lg:columns-3 xl:columns-4">
          {visible.map((asset, i) => (
            <li key={asset.id} className="mb-3 break-inside-avoid sm:mb-5">
              <button
                type="button"
                onClick={() => setLightboxIndex(i)}
                className="group block w-full text-left"
                aria-label={`Open ${asset.alt}`}
              >
                <div className="relative overflow-hidden rounded-2xl border border-border/10 bg-white/[0.08] transition-all duration-500 ease-heritage group-hover:border-gold/25 group-hover:shadow-float">
                  <ArchivalImage
                    asset={asset}
                    fill={false}
                    sizes="(max-width: 640px) 48vw, (max-width: 1024px) 45vw, 24vw"
                    imageClassName="w-full h-auto transition-transform [transition-duration:1200ms] ease-heritage group-hover:scale-[1.05]"
                  />
                  <span className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_0_0_1px_hsl(0_0%_100%/0.08)]" />
                </div>

                {asset.caption && (
                  <p className="mt-3 line-clamp-2 font-serif text-fluid-xs leading-relaxed text-muted-foreground">
                    {asset.caption}
                  </p>
                )}
                {asset.date && (
                  <p className="mt-1 font-sans text-[0.6875rem] tracking-[0.14em] text-gold-200/70">
                    {formatHistoricalDate(asset.date).toUpperCase()}
                  </p>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {lightboxIndex !== null && (
        <Lightbox
          assets={visible}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  readonly active: boolean;
  readonly onClick: () => void;
  readonly children: React.ReactNode;
}): React.ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'flex h-9 shrink-0 items-center whitespace-nowrap rounded-full border px-4 font-sans text-xs transition-all duration-300',
        active
          ? 'border-gold/40 bg-gold/15 text-gold-100 shadow-[0_0_18px_-6px_hsl(var(--gold)/0.6)]'
          : 'border-border/12 bg-white/[0.08] text-muted-foreground hover:border-border/25 hover:text-foreground',
      )}
    >
      {children}
    </button>
  );
}
