/**
 * Core domain model for the family archive.
 * These types are storage-agnostic: the mock repository and any future
 * database/CMS adapter must both satisfy them.
 */

export type ID = string;
export type Slug = string;

/** Genealogical dates are frequently imprecise. Model that honestly. */
export interface HistoricalDate {
  /** ISO-8601 date or partial date: "1897", "1897-04", "1897-04-12". */
  readonly iso: string;
  /** How reliable the date is. Displayed as "c." / "before" / "after". */
  readonly precision: 'exact' | 'about' | 'before' | 'after' | 'unknown';
  /** Optional human display override, e.g. "Spring 1897". */
  readonly display?: string;
}

export type Sex = 'male' | 'female' | 'unknown';

export type LifeEventType =
  | 'birth'
  | 'baptism'
  | 'marriage'
  | 'migration'
  | 'military'
  | 'education'
  | 'occupation'
  | 'residence'
  | 'death'
  | 'burial'
  | 'other';

export interface LifeEvent {
  readonly id: ID;
  readonly type: LifeEventType;
  readonly title: string;
  readonly date: HistoricalDate;
  readonly placeId?: ID;
  readonly description?: string;
  /** Related people (witnesses, spouses, comrades). */
  readonly personIds?: readonly ID[];
  /** Marks world-historical context rather than a family occurrence. */
  readonly historical?: boolean;
  readonly sourceIds?: readonly ID[];
}

export interface MediaAsset {
  readonly id: ID;
  readonly src: string;
  readonly width: number;
  readonly height: number;
  /** Required: this is an accessibility-critical archive. */
  readonly alt: string;
  readonly caption?: string;
  readonly date?: HistoricalDate;
  readonly placeId?: ID;
  readonly personIds?: readonly ID[];
  readonly kind: 'photograph' | 'document' | 'letter' | 'certificate' | 'artifact';
  readonly collection?: string;
  /** Tiny blurred placeholder for LQIP. */
  readonly blurDataURL?: string;
}

export interface Place {
  readonly id: ID;
  readonly slug: Slug;
  readonly name: string;
  /** Name at the time the family lived there, if it has changed. */
  readonly historicalName?: string;
  readonly region?: string;
  readonly country: string;
  readonly coordinates?: { readonly lat: number; readonly lng: number };
  readonly summary: string;
  readonly description?: readonly string[];
  readonly coverMediaId?: ID;
  readonly generations?: readonly number[];
}

export interface Story {
  readonly id: ID;
  readonly slug: Slug;
  readonly title: string;
  readonly subtitle?: string;
  readonly excerpt: string;
  /** Long-form body as ordered blocks; renders to editorial typography. */
  readonly body: readonly StoryBlock[];
  readonly narratorId?: ID;
  readonly personIds: readonly ID[];
  readonly placeIds?: readonly ID[];
  readonly era: string;
  readonly readingMinutes: number;
  readonly coverMediaId?: ID;
  readonly publishedAt: string;
  readonly featured?: boolean;
}

export type StoryBlock =
  | { readonly type: 'paragraph'; readonly text: string }
  | { readonly type: 'heading'; readonly text: string }
  | { readonly type: 'quote'; readonly text: string; readonly attribution?: string }
  | { readonly type: 'image'; readonly mediaId: ID }
  | { readonly type: 'note'; readonly text: string };

export interface Person {
  readonly id: ID;
  readonly slug: Slug;
  readonly givenName: string;
  readonly familyName: string;
  /** Maiden name, patronymic, or name used before migration. */
  readonly birthName?: string;
  readonly nickname?: string;
  readonly sex: Sex;
  /** 1 = earliest documented generation. */
  readonly generation: number;
  readonly birth?: { readonly date?: HistoricalDate; readonly placeId?: ID };
  readonly death?: { readonly date?: HistoricalDate; readonly placeId?: ID };
  readonly occupation?: string;
  readonly summary: string;
  readonly biography?: readonly string[];
  readonly parentIds: readonly ID[];
  readonly spouseIds: readonly ID[];
  readonly childIds: readonly ID[];
  readonly portraitMediaId?: ID;
  readonly mediaIds?: readonly ID[];
  readonly eventIds?: readonly ID[];
  readonly storyIds?: readonly ID[];
  readonly placeIds?: readonly ID[];
  readonly featured?: boolean;
  /** Short pull-quote attributed to the person. */
  readonly epitaph?: string;
}

/** Person with relationships resolved — what profile pages consume. */
export interface PersonDetail {
  readonly person: Person;
  readonly parents: readonly Person[];
  readonly spouses: readonly Person[];
  readonly children: readonly Person[];
  readonly siblings: readonly Person[];
  readonly portrait?: MediaAsset;
  readonly media: readonly MediaAsset[];
  readonly events: readonly LifeEvent[];
  readonly places: readonly Place[];
  readonly stories: readonly Story[];
}

export interface Generation {
  readonly index: number;
  readonly label: string;
  readonly period: string;
  readonly summary: string;
  readonly people: readonly Person[];
}

export interface FamilyMeta {
  readonly surname: string;
  readonly motto?: string;
  readonly origin: string;
  readonly introduction: readonly string[];
  readonly foundedYear: number;
  readonly stats: {
    readonly people: number;
    readonly generations: number;
    readonly years: number;
    readonly photographs: number;
  };
}

/** Query options for listing endpoints; mirrors what a real API would take. */
export interface PersonQuery {
  readonly generation?: number;
  readonly search?: string;
  readonly featured?: boolean;
  readonly limit?: number;
}

export interface MediaQuery {
  readonly kind?: MediaAsset['kind'];
  readonly personId?: ID;
  readonly placeId?: ID;
  readonly collection?: string;
  readonly limit?: number;
}
