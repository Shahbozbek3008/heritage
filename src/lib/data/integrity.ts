import type { LifeEvent, MediaAsset, Person, Place, Story } from '@/types/heritage';

export interface IntegrityIssue {
  readonly severity: 'error' | 'warning';
  readonly message: string;
}

interface GraphInput {
  readonly people: readonly Person[];
  readonly places: readonly Place[];
  readonly media: readonly MediaAsset[];
  readonly events: readonly LifeEvent[];
  readonly stories: readonly Story[];
}

/**
 * Genealogy data degrades quietly: a child points at a parent who does not
 * point back, a portrait id survives a rename, a story references someone who
 * was merged into another record. None of that throws at runtime — it just
 * renders a slightly wrong family.
 *
 * This validates referential integrity across the whole graph. It runs in
 * development only (see `index.ts`) so a real backend can reuse it as an
 * import-time check without paying for it on every production request.
 */
export function validateGraph(input: GraphInput): readonly IntegrityIssue[] {
  const issues: IntegrityIssue[] = [];
  const { people, places, media, events, stories } = input;

  const personIds = new Set(people.map((p) => p.id));
  const placeIds = new Set(places.map((p) => p.id));
  const mediaIds = new Set(media.map((m) => m.id));
  const eventIds = new Set(events.map((e) => e.id));
  const storyIds = new Set(stories.map((s) => s.id));
  const byId = new Map(people.map((p) => [p.id, p]));

  const err = (message: string): void => void issues.push({ severity: 'error', message });
  const warn = (message: string): void => void issues.push({ severity: 'warning', message });

  const seenSlugs = new Set<string>();
  for (const person of people) {
    if (seenSlugs.has(person.slug)) err(`Duplicate person slug: ${person.slug}`);
    seenSlugs.add(person.slug);

    for (const parentId of person.parentIds) {
      const parent = byId.get(parentId);
      if (!parent) {
        err(`${person.id} lists unknown parent ${parentId}`);
        continue;
      }
      if (!parent.childIds.includes(person.id)) {
        err(`${parent.id} is a parent of ${person.id} but does not list them as a child`);
      }
      if (parent.generation >= person.generation) {
        warn(`${parent.id} (gen ${parent.generation}) is not older than child ${person.id} (gen ${person.generation})`);
      }
    }

    for (const childId of person.childIds) {
      const child = byId.get(childId);
      if (!child) {
        err(`${person.id} lists unknown child ${childId}`);
        continue;
      }
      if (!child.parentIds.includes(person.id)) {
        err(`${child.id} is a child of ${person.id} but does not list them as a parent`);
      }
    }

    for (const spouseId of person.spouseIds) {
      const spouse = byId.get(spouseId);
      if (!spouse) {
        err(`${person.id} lists unknown spouse ${spouseId}`);
        continue;
      }
      if (!spouse.spouseIds.includes(person.id)) {
        err(`Spouse link between ${person.id} and ${spouse.id} is not reciprocal`);
      }
    }

    if (person.portraitMediaId && !mediaIds.has(person.portraitMediaId)) {
      err(`${person.id} references missing portrait ${person.portraitMediaId}`);
    }
    for (const id of person.mediaIds ?? []) {
      if (!mediaIds.has(id)) err(`${person.id} references missing media ${id}`);
    }
    for (const id of person.eventIds ?? []) {
      if (!eventIds.has(id)) err(`${person.id} references missing event ${id}`);
    }
    for (const id of person.storyIds ?? []) {
      if (!storyIds.has(id)) err(`${person.id} references missing story ${id}`);
    }
    for (const id of person.placeIds ?? []) {
      if (!placeIds.has(id)) err(`${person.id} references missing place ${id}`);
    }

    const birthYear = yearOf(person.birth?.date?.iso);
    const deathYear = yearOf(person.death?.date?.iso);
    if (birthYear !== null && deathYear !== null && deathYear < birthYear) {
      err(`${person.id} dies (${deathYear}) before being born (${birthYear})`);
    }
  }

  for (const event of events) {
    for (const id of event.personIds ?? []) {
      if (!personIds.has(id)) err(`Event ${event.id} references missing person ${id}`);
    }
    if (event.placeId && !placeIds.has(event.placeId)) {
      err(`Event ${event.id} references missing place ${event.placeId}`);
    }
    for (const id of event.sourceIds ?? []) {
      if (!mediaIds.has(id)) err(`Event ${event.id} references missing source ${id}`);
    }
  }

  for (const story of stories) {
    for (const id of story.personIds) {
      if (!personIds.has(id)) err(`Story ${story.id} references missing person ${id}`);
    }
    for (const id of story.placeIds ?? []) {
      if (!placeIds.has(id)) err(`Story ${story.id} references missing place ${id}`);
    }
    if (story.coverMediaId && !mediaIds.has(story.coverMediaId)) {
      err(`Story ${story.id} references missing cover ${story.coverMediaId}`);
    }
    if (story.narratorId && !personIds.has(story.narratorId)) {
      err(`Story ${story.id} references missing narrator ${story.narratorId}`);
    }
    for (const block of story.body) {
      if (block.type === 'image' && !mediaIds.has(block.mediaId)) {
        err(`Story ${story.id} embeds missing image ${block.mediaId}`);
      }
    }
  }

  for (const asset of media) {
    for (const id of asset.personIds ?? []) {
      if (!personIds.has(id)) err(`Media ${asset.id} references missing person ${id}`);
    }
    if (asset.placeId && !placeIds.has(asset.placeId)) {
      err(`Media ${asset.id} references missing place ${asset.placeId}`);
    }
    if (!asset.alt.trim()) err(`Media ${asset.id} has empty alt text`);
  }

  for (const place of places) {
    if (place.coverMediaId && !mediaIds.has(place.coverMediaId)) {
      err(`Place ${place.id} references missing cover ${place.coverMediaId}`);
    }
  }

  return issues;
}

function yearOf(iso: string | undefined): number | null {
  if (!iso) return null;
  const year = Number.parseInt(iso.slice(0, 4), 10);
  return Number.isFinite(year) ? year : null;
}
