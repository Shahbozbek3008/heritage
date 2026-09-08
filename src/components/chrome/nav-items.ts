export interface NavItem {
  readonly href: string;
  readonly label: string;
  /** Shorter label for the mobile tab bar. */
  readonly short: string;
  readonly description: string;
}

export const NAV_ITEMS: readonly NavItem[] = [
  {
    href: '/tree',
    label: 'Family Tree',
    short: 'Tree',
    description: 'Five generations, drawn out',
  },
  { href: '/people', label: 'People', short: 'People', description: 'Everyone in the archive' },
  { href: '/timeline', label: 'Timeline', short: 'Timeline', description: '1849 to the present' },
  { href: '/stories', label: 'Stories', short: 'Stories', description: 'What we still tell' },
  { href: '/photos', label: 'Photographs', short: 'Photos', description: 'The picture archive' },
  { href: '/places', label: 'Places', short: 'Places', description: 'Where it happened' },
  { href: '/archive', label: 'Archive', short: 'Archive', description: 'Documents and letters' },
];

/** The four surfaced in the mobile tab bar; the rest live behind "More". */
export const PRIMARY_MOBILE: readonly NavItem[] = [
  NAV_ITEMS[0]!,
  NAV_ITEMS[1]!,
  NAV_ITEMS[2]!,
  NAV_ITEMS[3]!,
];
