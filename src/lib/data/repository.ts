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

/**
 * The single seam between the UI and its data source.
 *
 * Every page and server component depends on this interface only — never on
 * the fixtures directly. Swapping to Prisma, a headless CMS, or a GEDCOM
 * importer means writing one new implementation and changing one line in
 * `index.ts`. All methods are async so a network-backed adapter is a drop-in.
 */
export interface HeritageRepository {
  getFamilyMeta(): Promise<FamilyMeta>;

  listPeople(query?: PersonQuery): Promise<readonly Person[]>;
  getPersonBySlug(slug: Slug): Promise<Person | null>;
  /** Relationships resolved for profile rendering. */
  getPersonDetail(slug: Slug): Promise<PersonDetail | null>;
  listGenerations(): Promise<readonly Generation[]>;

  listEvents(options?: { includeHistorical?: boolean }): Promise<readonly LifeEvent[]>;

  listStories(options?: { featured?: boolean; limit?: number }): Promise<readonly Story[]>;
  getStoryBySlug(slug: Slug): Promise<Story | null>;

  listPlaces(): Promise<readonly Place[]>;
  getPlaceBySlug(slug: Slug): Promise<Place | null>;

  listMedia(query?: MediaQuery): Promise<readonly MediaAsset[]>;
  getMediaById(id: ID): Promise<MediaAsset | null>;
}
