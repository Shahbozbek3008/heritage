import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { MediaAsset, Person } from '@/types/heritage';
import { ArchivalImage } from '@/components/ui/ArchivalImage';
import { formatLifespan, fullName } from '@/lib/format';

interface PersonCardProps {
  readonly person: Person;
  readonly portrait?: MediaAsset | undefined;
  readonly variant?: 'portrait' | 'row';
  readonly priority?: boolean;
}

/**
 * When no portrait survives, the card says so rather than showing a silhouette.
 * The absence of an image is itself information in a family archive.
 */
function MissingPortrait({
  person,
  compact = false,
}: {
  readonly person: Person;
  readonly compact?: boolean;
}): React.ReactElement {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-white/[0.095] to-transparent p-4">
      <div className="text-center">
        <span
          className={cn(
            'text-gradient-gold font-display leading-none',
            compact ? 'text-base' : 'text-fluid-2xl',
          )}
        >
          {person.givenName.charAt(0)}
          {person.familyName.charAt(0)}
        </span>
        {!compact && (
          <span className="mt-1.5 block font-sans text-[0.6875rem] uppercase tracking-[0.16em] text-muted-foreground/60">
            No portrait
          </span>
        )}
      </div>
    </div>
  );
}

export function PersonCard({
  person,
  portrait,
  variant = 'portrait',
  priority = false,
}: PersonCardProps): React.ReactElement {
  if (variant === 'row') {
    return (
      <Link
        href={`/people/${person.slug}`}
        className="group flex items-center gap-4 rounded-2xl border border-transparent px-3 py-3 transition-colors duration-300 hover:border-border/10 hover:bg-white/[0.065]"
      >
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full ring-1 ring-border/12 transition-all duration-500 group-hover:ring-gold/40 sm:h-16 sm:w-16">
          {portrait ? (
            <ArchivalImage
              asset={portrait}
              sizes="64px"
              framed={false}
              className="h-full w-full"
              imageClassName="transition-transform duration-700 ease-heritage group-hover:scale-[1.08]"
            />
          ) : (
            <MissingPortrait person={person} compact />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-fluid-lg leading-tight text-foreground transition-colors group-hover:text-gold-100">
            {fullName(person)}
          </p>
          <p className="mt-0.5 truncate font-sans text-xs text-muted-foreground">
            {formatLifespan(person)}
            {person.occupation ? ` · ${person.occupation}` : ''}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/people/${person.slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-border/10 bg-white/[0.08] shadow-elevated transition-all duration-500 ease-heritage group-hover:border-gold/25 group-hover:shadow-float">
        {portrait ? (
          <ArchivalImage
            asset={portrait}
            sizes="(max-width: 640px) 62vw, (max-width: 1024px) 32vw, 22vw"
            priority={priority}
            framed={false}
            className="h-full w-full"
            imageClassName="transition-transform [transition-duration:1200ms] ease-heritage group-hover:scale-[1.06]"
          />
        ) : (
          <MissingPortrait person={person} />
        )}

        {/* Reading ground for the badge, and a floor for the portrait. */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/85 via-background/10 to-transparent" />

        <div className="pointer-events-none absolute bottom-3 left-3">
          <span className="rounded-full border border-gold/25 bg-background/60 px-2.5 py-1 font-sans text-[0.6875rem] uppercase tracking-[0.14em] text-gold-200 backdrop-blur-md">
            Gen {person.generation}
          </span>
        </div>
      </div>

      <div className="pt-4">
        <h3 className="font-display text-fluid-lg leading-tight text-foreground transition-colors duration-300 group-hover:text-gold-100">
          {fullName(person)}
        </h3>
        <p className="mt-1 font-sans text-xs tracking-wide text-muted-foreground/80">
          {formatLifespan(person)}
        </p>
        <p className="mt-2.5 line-clamp-3 font-serif text-fluid-sm leading-relaxed text-muted-foreground">
          {person.summary}
        </p>
      </div>
    </Link>
  );
}
