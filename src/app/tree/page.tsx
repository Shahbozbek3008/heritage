import type { Metadata } from 'next';
import Link from 'next/link';
import { repository } from '@/lib/data';
import { FamilyTreeCanvas } from '@/components/tree/FamilyTreeCanvas';
import { formatLifespan, fullName } from '@/lib/format';
import type { ID, MediaAsset } from '@/types/heritage';

export const metadata: Metadata = {
  title: 'Family Tree',
  description:
    'Five generations of the Abramowicz, Abrams and Feld family, drawn as an interactive tree. Pinch, pan and expand to explore.',
};

export default async function TreePage(): Promise<React.ReactElement> {
  const [people, generations, allMedia] = await Promise.all([
    repository.listPeople(),
    repository.listGenerations(),
    repository.listMedia(),
  ]);

  const mediaById = new Map<ID, MediaAsset>(allMedia.map((m) => [m.id, m]));
  const portraits: Record<ID, MediaAsset | undefined> = {};
  for (const person of people) {
    portraits[person.id] = person.portraitMediaId
      ? mediaById.get(person.portraitMediaId)
      : undefined;
  }

  // The earliest generation with no recorded parents is the tree's root.
  const root = people.find((p) => p.parentIds.length === 0) ?? people[0];
  if (!root) {
    return (
      <div className="mx-auto max-w-shell px-4 py-20 sm:px-6 lg:px-10">
        <p className="font-serif text-muted-foreground">No people are recorded in this archive yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-shell px-4 pb-8 pt-10 sm:px-6 md:pt-16 lg:px-10">
        <p className="label-mono text-gold-200">The family tree</p>
        <h1 className="text-gradient mt-5 max-w-[16ch] font-display text-fluid-3xl font-normal leading-[1.02] tracking-[-0.03em]">
          Five generations, drawn out.
        </h1>
        <p className="mt-6 max-w-prose font-serif text-fluid-base leading-relaxed text-muted-foreground">
          Drag to move around. Pinch or scroll to zoom. Tap anyone to see who they were, and use the
          markers beneath a name to fold a branch away.
        </p>
      </div>

      <FamilyTreeCanvas people={people} rootId={root.id} portraits={portraits} />

      {/*
        Accessible equivalent. The canvas is a pointer-driven surface; this
        list gives keyboard and screen-reader users the same structure, and
        doubles as a printable index.
      */}
      <section className="mx-auto max-w-shell px-4 py-14 sm:px-6 md:py-20 lg:px-10">
        <h2 className="text-gradient font-display text-fluid-xl">Every person, by generation</h2>
        <p className="mt-2 max-w-prose font-serif text-fluid-sm leading-relaxed text-muted-foreground">
          The same family, as a list. Each entry links to a full profile.
        </p>

        <div className="mt-10 space-y-12">
          {generations.map((generation) => (
            <div key={generation.index}>
              <div className="flex items-baseline gap-3 border-b border-border/10 pb-3">
                <span className="text-gradient-gold font-display text-fluid-lg leading-none">
                  {String(generation.index).padStart(2, '0')}
                </span>
                <h3 className="font-display text-fluid-lg text-foreground">{generation.label}</h3>
                <span className="font-sans text-xs text-muted-foreground">{generation.period}</span>
              </div>

              <ul className="mt-4 grid gap-x-8 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
                {generation.people.map((person) => (
                  <li key={person.id}>
                    <Link
                      href={`/people/${person.slug}`}
                      className="group flex items-baseline justify-between gap-4 border-b border-border/[0.07] py-2.5 transition-colors hover:border-gold/30"
                    >
                      <span className="font-serif text-fluid-base text-foreground transition-colors group-hover:text-gold-100">
                        {fullName(person)}
                      </span>
                      <span className="shrink-0 font-sans text-xs tabular-nums text-muted-foreground">
                        {formatLifespan(person)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
