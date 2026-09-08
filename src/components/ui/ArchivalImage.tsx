import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { MediaAsset } from '@/types/heritage';

interface ArchivalImageProps {
  readonly asset: MediaAsset;
  readonly sizes: string;
  readonly className?: string;
  readonly imageClassName?: string;
  /** Only true for the LCP image; everything else stays lazy. */
  readonly priority?: boolean;
  /** Retained for call-site compatibility; images now render untinted. */
  readonly treatment?: 'archival' | 'deep' | 'none';
  readonly fill?: boolean;
  /** Adds the standard rounded frame. Off for full-bleed hero backdrops. */
  readonly framed?: boolean;
}

/**
 * Photographs and documents share one presentation: a dark mat, a hairline
 * lit edge, and rounded corners. Images render at their true colour — the
 * collection is unified by the frame, not by a filter over the picture.
 */
export function ArchivalImage({
  asset,
  sizes,
  className = '',
  imageClassName = '',
  priority = false,
  fill = true,
  framed = true,
}: ArchivalImageProps): React.ReactElement {
  if (!fill) {
    return (
      <Image
        src={asset.src}
        alt={asset.alt}
        width={asset.width}
        height={asset.height}
        sizes={sizes}
        priority={priority}
        placeholder={asset.blurDataURL ? 'blur' : 'empty'}
        blurDataURL={asset.blurDataURL}
        className={imageClassName}
      />
    );
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-white/[0.065]',
        framed && 'rounded-2xl',
        className,
      )}
    >
      <Image
        src={asset.src}
        alt={asset.alt}
        fill
        sizes={sizes}
        priority={priority}
        placeholder={asset.blurDataURL ? 'blur' : 'empty'}
        blurDataURL={asset.blurDataURL}
        className={cn('object-cover', imageClassName)}
      />
      {framed && (
        <>
          {/* Lit edge: seats the image on the dark ground. */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_0_0_1px_hsl(0_0%_100%/0.09)]" />
          {/* Weights the lower edge so captions sit against tone, not glare. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background/45 to-transparent" />
        </>
      )}
    </div>
  );
}
