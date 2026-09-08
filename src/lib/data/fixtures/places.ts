import type { Place } from '@/types/heritage';

export const places: readonly Place[] = [
  {
    id: 'pl-vilna',
    slug: 'vilna',
    name: 'Vilnius',
    historicalName: 'Vilna, Russian Empire',
    region: 'Vilna Governorate',
    country: 'Lithuania',
    coordinates: { lat: 54.6872, lng: 25.2797 },
    summary:
      'The city where the family name first appears in a written record - a workshop registry from 1871.',
    description: [
      'For three generations the family lived within a half-mile of the Neris river, in the quarter of narrow courtyards behind the old market. The men bound books; the women kept the accounts and, according to Miriam, the secrets.',
      'The workshop at 14 Rudninku was lost in 1915. Nothing of it survives but a brass stamp, now in the archive, and the smell of glue that Aleksander swore he could still summon at eighty.',
    ],
    coverMediaId: 'md-vilna-street',
    generations: [1, 2],
  },
  {
    id: 'pl-riga',
    slug: 'riga',
    name: 'Riga',
    region: 'Latvia',
    country: 'Latvia',
    coordinates: { lat: 56.9496, lng: 24.1052 },
    summary: 'A waypoint. The family waited here eleven months for papers that never came.',
    description: [
      'The Riga years are the thinnest part of the record. Two letters, one photograph, and a rent receipt. What we know is mostly what Miriam later told her granddaughter: that it rained, that the room was cold, and that her mother sold a wedding ring to a man on Marijas iela for less than it was worth.',
    ],
    coverMediaId: 'md-riga-harbour',
    generations: [2],
  },
  {
    id: 'pl-hamburg',
    slug: 'hamburg',
    name: 'Hamburg',
    region: 'Hamburg',
    country: 'Germany',
    coordinates: { lat: 53.5511, lng: 9.9937 },
    summary: 'Port of departure, 4 March 1921. The last European ground the family stood on.',
    description: [
      'The passenger manifest of the SS Mount Clay lists them on lines 22 through 26: five names, one misspelled, and a column marked "able to read" ticked for all but the youngest.',
    ],
    coverMediaId: 'md-hamburg-dock',
    generations: [2],
  },
  {
    id: 'pl-lowereastside',
    slug: 'lower-east-side',
    name: 'Lower East Side, New York',
    region: 'New York',
    country: 'United States',
    coordinates: { lat: 40.7154, lng: -73.9868 },
    summary:
      'Two rooms on Orchard Street, six people, and the first family photograph taken on new ground.',
    description: [
      'They arrived on 19 March 1921 and were on Orchard Street by the end of the week, in rooms belonging to a cousin whose exact relation nobody could later reconstruct.',
      'Aleksander found work within a month - not binding books, which he had trained for, but cutting patterns in a garment shop on Ludlow. He did that for thirty-one years and never once described it as a disappointment.',
    ],
    coverMediaId: 'md-orchard-street',
    generations: [2, 3],
  },
  {
    id: 'pl-brooklyn',
    slug: 'brooklyn',
    name: 'Flatbush, Brooklyn',
    region: 'New York',
    country: 'United States',
    coordinates: { lat: 40.6409, lng: -73.9624 },
    summary: 'The first house with a garden. Bought in 1948 for $9,200 and never sold.',
    description: [
      'Ruth and David moved to Flatbush the year after they married. The house on East 21st Street held four generations at one point or another, and the kitchen table in the archive photographs is the same table now in Naomi’s apartment.',
    ],
    coverMediaId: 'md-flatbush-house',
    generations: [3, 4],
  },
  {
    id: 'pl-berkeley',
    slug: 'berkeley',
    name: 'Berkeley, California',
    region: 'California',
    country: 'United States',
    coordinates: { lat: 37.8715, lng: -122.273 },
    summary: 'Where the fourth generation scattered to, and where the archive was first assembled.',
    description: [
      'Naomi began collecting in 1994, with a shoebox her grandmother handed her and the instruction: “Do something with this before I forget who they are.”',
    ],
    coverMediaId: 'md-berkeley-desk',
    generations: [4, 5],
  },
];
