import type {
  FamilyMeta,
  Generation,
  ID,
  LifeEvent,
  MediaAsset,
  MediaQuery,
  Person,
  PersonDetail,
  PersonQuery,
  Place,
  Slug,
  Story,
} from '@/types/heritage';
import type { HeritageRepository } from './repository';
import { events } from './fixtures/events';
import { media } from './fixtures/media';
import { people } from './fixtures/people';
import { places } from './fixtures/places';
import { familyMeta, stories } from './fixtures/stories';
import { compareHistoricalDates } from '../format';

/**
 * In-memory implementation backed by the fixture set.
 *
 * Indexes are built once at module scope: the module is a singleton per server
 * process, so profile pages resolve relationships by map lookup rather than
 * scanning the person list for every relative.
 */
const personById = new Map<ID, Person>(people.map((p) => [p.id, p]));
const personBySlug = new Map<Slug, Person>(people.map((p) => [p.slug, p]));
const placeById = new Map<ID, Place>(places.map((p) => [p.id, p]));
const mediaById = new Map<ID, MediaAsset>(media.map((m) => [m.id, m]));
const eventById = new Map<ID, LifeEvent>(events.map((e) => [e.id, e]));
const storyById = new Map<ID, Story>(stories.map((s) => [s.id, s]));

const GENERATION_LABELS: Readonly<Record<number, { label: string; period: string; summary: string }>> =
  {
    1: {
      label: 'The Bindery',
      period: '1849 - 1919',
      summary:
        'Vilna. A workshop at 14 Rudninku, four hundred pages of accounts, and no photograph of the woman who kept them.',
    },
    2: {
      label: 'The Crossing',
      period: '1892 - 1988',
      summary:
        'From Vilna to Riga to Hamburg to Orchard Street, with eleven dollars declared and a brass stamp undeclared.',
    },
    3: {
      label: 'Brooklyn',
      period: '1917 - 2009',
      summary:
        'A classroom, a letterpress, a house with a garden, and a son who did not come back from Normandy.',
    },
    4: {
      label: 'The Archive',
      period: '1951 -',
      summary:
        'The generation that started writing it down, nine years after the tapes were made and six after the voice on them fell silent.',
    },
    5: {
      label: 'The Inheritors',
      period: '1984 -',
      summary: 'Three thousand miles from Orchard Street, holding the stamp.',
    },
  };

/** Sorts people into a stable, meaningful order: by generation, then birth. */
function byGenerationThenBirth(a: Person, b: Person): number {
  if (a.generation !== b.generation) return a.generation - b.generation;
  return compareHistoricalDates(a.birth?.date, b.birth?.date);
}

function matchesSearch(person: Person, term: string): boolean {
  const haystack = [
    person.givenName,
    person.familyName,
    person.birthName ?? '',
    person.nickname ?? '',
    person.occupation ?? '',
    person.summary,
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(term);
}

export class MockHeritageRepository implements HeritageRepository {
  async getFamilyMeta(): Promise<FamilyMeta> {
    return familyMeta;
  }

  async listPeople(query: PersonQuery = {}): Promise<readonly Person[]> {
    let result = [...people];

    if (typeof query.generation === 'number') {
      result = result.filter((p) => p.generation === query.generation);
    }
    if (query.featured) {
      result = result.filter((p) => p.featured === true);
    }
    if (query.search?.trim()) {
      const term = query.search.trim().toLowerCase();
      result = result.filter((p) => matchesSearch(p, term));
    }

    result.sort(byGenerationThenBirth);
    return typeof query.limit === 'number' ? result.slice(0, query.limit) : result;
  }

  async getPersonBySlug(slug: Slug): Promise<Person | null> {
    return personBySlug.get(slug) ?? null;
  }

  async getPersonDetail(slug: Slug): Promise<PersonDetail | null> {
    const person = personBySlug.get(slug);
    if (!person) return null;

    const resolvePeople = (ids: readonly ID[]): readonly Person[] =>
      ids.map((id) => personById.get(id)).filter((p): p is Person => p !== undefined);

    const parents = resolvePeople(person.parentIds);

    // Siblings share at least one parent. Half-siblings therefore appear,
    // which is correct for a genealogy: the profile does not distinguish them
    // visually, but neither does it silently drop them.
    const siblingIds = new Set<ID>();
    for (const parent of parents) {
      for (const childId of parent.childIds) {
        if (childId !== person.id) siblingIds.add(childId);
      }
    }

    const portraitId = person.portraitMediaId;
    const portrait = portraitId ? mediaById.get(portraitId) : undefined;

    const detail: PersonDetail = {
      person,
      parents,
      spouses: resolvePeople(person.spouseIds),
      children: resolvePeople(person.childIds).slice().sort(byGenerationThenBirth),
      siblings: resolvePeople([...siblingIds]).slice().sort(byGenerationThenBirth),
      ...(portrait ? { portrait } : {}),
      media: (person.mediaIds ?? [])
        .map((id) => mediaById.get(id))
        .filter((m): m is MediaAsset => m !== undefined),
      events: (person.eventIds ?? [])
        .map((id) => eventById.get(id))
        .filter((e): e is LifeEvent => e !== undefined)
        .sort((a, b) => compareHistoricalDates(a.date, b.date)),
      places: (person.placeIds ?? [])
        .map((id) => placeById.get(id))
        .filter((p): p is Place => p !== undefined),
      stories: (person.storyIds ?? [])
        .map((id) => storyById.get(id))
        .filter((s): s is Story => s !== undefined),
    };

    return detail;
  }

  async listGenerations(): Promise<readonly Generation[]> {
    const indexes = [...new Set(people.map((p) => p.generation))].sort((a, b) => a - b);
    return indexes.map((index) => {
      const meta = GENERATION_LABELS[index];
      return {
        index,
        label: meta?.label ?? `Generation ${index}`,
        period: meta?.period ?? '',
        summary: meta?.summary ?? '',
        people: people.filter((p) => p.generation === index).sort(byGenerationThenBirth),
      };
    });
  }

  async listEvents(options: { includeHistorical?: boolean } = {}): Promise<readonly LifeEvent[]> {
    const includeHistorical = options.includeHistorical ?? true;
    return [...events]
      .filter((e) => includeHistorical || !e.historical)
      .sort((a, b) => compareHistoricalDates(a.date, b.date));
  }

  async listStories(options: { featured?: boolean; limit?: number } = {}): Promise<readonly Story[]> {
    let result = [...stories];
    if (options.featured) result = result.filter((s) => s.featured === true);
    result.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    return typeof options.limit === 'number' ? result.slice(0, options.limit) : result;
  }

  async getStoryBySlug(slug: Slug): Promise<Story | null> {
    return stories.find((s) => s.slug === slug) ?? null;
  }

  async listPlaces(): Promise<readonly Place[]> {
    return places;
  }

  async getPlaceBySlug(slug: Slug): Promise<Place | null> {
    return places.find((p) => p.slug === slug) ?? null;
  }

  async listMedia(query: MediaQuery = {}): Promise<readonly MediaAsset[]> {
    let result = [...media];
    if (query.kind) result = result.filter((m) => m.kind === query.kind);
    if (query.collection) result = result.filter((m) => m.collection === query.collection);
    if (query.personId) {
      const personId = query.personId;
      result = result.filter((m) => m.personIds?.includes(personId) ?? false);
    }
    if (query.placeId) result = result.filter((m) => m.placeId === query.placeId);
    return typeof query.limit === 'number' ? result.slice(0, query.limit) : result;
  }

  async getMediaById(id: ID): Promise<MediaAsset | null> {
    return mediaById.get(id) ?? null;
  }
}
