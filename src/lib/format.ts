import type { HistoricalDate, Person } from '@/types/heritage';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

/**
 * Genealogical dates are often partial ("1849") or qualified ("before 1911").
 * Render exactly the precision we actually have, never more.
 */
export function formatHistoricalDate(date: HistoricalDate | undefined): string {
  if (!date) return 'Unknown';
  if (date.display) return date.display;

  const [yearRaw, monthRaw, dayRaw] = date.iso.split('-');
  if (!yearRaw) return 'Unknown';

  const monthIndex = monthRaw ? Number.parseInt(monthRaw, 10) - 1 : null;
  const monthName = monthIndex !== null ? MONTHS[monthIndex] : undefined;

  let base: string;
  if (dayRaw && monthName) {
    base = `${Number.parseInt(dayRaw, 10)} ${monthName} ${yearRaw}`;
  } else if (monthName) {
    base = `${monthName} ${yearRaw}`;
  } else {
    base = yearRaw;
  }

  switch (date.precision) {
    case 'about':
      return `c. ${base}`;
    case 'before':
      return `before ${base}`;
    case 'after':
      return `after ${base}`;
    case 'unknown':
      return 'Unknown';
    default:
      return base;
  }
}

export function yearOf(date: HistoricalDate | undefined): number | null {
  if (!date) return null;
  const year = Number.parseInt(date.iso.slice(0, 4), 10);
  return Number.isFinite(year) ? year : null;
}

/** Sorts partial dates chronologically; unknown dates sort last. */
export function compareHistoricalDates(
  a: HistoricalDate | undefined,
  b: HistoricalDate | undefined,
): number {
  const left = a?.iso ?? '';
  const right = b?.iso ?? '';
  if (!left && !right) return 0;
  if (!left) return 1;
  if (!right) return -1;
  // Pad so "1919" sorts before "1919-08-07" rather than lexically after.
  return left.padEnd(10, '0').localeCompare(right.padEnd(10, '0'));
}

/** "1892 - 1974", "b. 1984", or "Dates unknown". */
export function formatLifespan(person: Person): string {
  const birth = yearOf(person.birth?.date);
  const death = yearOf(person.death?.date);
  if (birth !== null && death !== null) return `${birth} - ${death}`;
  if (birth !== null) return `b. ${birth}`;
  if (death !== null) return `d. ${death}`;
  return 'Dates unknown';
}

export function fullName(person: Person): string {
  return `${person.givenName} ${person.familyName}`;
}

/** Age at death, or current age. Null when it cannot be computed honestly. */
export function ageOf(person: Person): number | null {
  const birth = yearOf(person.birth?.date);
  if (birth === null) return null;
  const end = yearOf(person.death?.date) ?? new Date().getFullYear();
  const age = end - birth;
  return age >= 0 ? age : null;
}

export function isLiving(person: Person): boolean {
  return person.death === undefined;
}

/** Formats a count with its noun, pluralised. */
export function pluralize(count: number, singular: string, plural?: string): string {
  return `${count} ${count === 1 ? singular : (plural ?? `${singular}s`)}`;
}
