import 'server-only';

import type { HeritageRepository } from './repository';
import { MockHeritageRepository } from './mock-repository';
import { validateGraph } from './integrity';
import { events } from './fixtures/events';
import { media } from './fixtures/media';
import { people } from './fixtures/people';
import { places } from './fixtures/places';
import { stories } from './fixtures/stories';

/**
 * The application's single data entry point.
 *
 * Every server component imports `repository` from here and nothing else.
 * Swapping in a real backend is a one-line change:
 *
 *   export const repository: HeritageRepository = new PrismaHeritageRepository(db);
 *
 * `server-only` guarantees this module (and the whole fixture set behind it)
 * can never be pulled into a client bundle by an accidental import.
 */
export const repository: HeritageRepository = new MockHeritageRepository();

if (process.env.NODE_ENV !== 'production') {
  const issues = validateGraph({ people, places, media, events, stories });
  if (issues.length > 0) {
    const errors = issues.filter((i) => i.severity === 'error');
    const warnings = issues.filter((i) => i.severity === 'warning');
    const render = (label: string, list: typeof issues): string =>
      `${label}:\n${list.map((i) => `  - ${i.message}`).join('\n')}`;

    if (warnings.length > 0) {
      console.warn(`[heritage] graph ${render('warnings', warnings)}`);
    }
    if (errors.length > 0) {
      // Fail loudly in development: a broken family graph renders a wrong
      // family, which is worse than not rendering at all.
      throw new Error(`[heritage] graph ${render('errors', errors)}`);
    }
  }
}

export type { HeritageRepository };
