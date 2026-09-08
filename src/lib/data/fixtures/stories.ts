import type { FamilyMeta, Story } from '@/types/heritage';

export const familyMeta: FamilyMeta = {
  surname: 'Abramowicz / Abrams / Feld',
  motto: 'What fit in our hands we carried. The rest we remembered.',
  origin: 'Vilna, Lithuania',
  foundedYear: 1849,
  introduction: [
    'This archive holds what remains of five generations: a bindery in Vilna, a crossing made with eleven dollars, two rooms on Orchard Street, a house in Flatbush, and the children of children who now live three thousand miles from any of it.',
    'Much of it survives because one woman talked for eleven hours into a cassette recorder in 1985, and because her granddaughter, nine years later, finally sat down to listen.',
  ],
  stats: { people: 14, generations: 5, years: 176, photographs: 1340 },
};

export const stories: readonly Story[] = [
  {
    id: 'st-eleven-dollars',
    slug: 'eleven-dollars',
    title: 'Eleven Dollars',
    subtitle: 'What the manifest recorded, and what it left out',
    excerpt:
      'The column is headed "Capital in possession." Beside Aleksander’s name, in a clerk’s hand: $11. It is the most complete inventory we have of what the family owned in March 1921.',
    era: '1921',
    readingMinutes: 6,
    publishedAt: '2019-04-02',
    featured: true,
    narratorId: 'p-naomi',
    personIds: ['p-aleksander', 'p-miriam', 'p-sara', 'p-ruth'],
    placeIds: ['pl-hamburg', 'pl-lowereastside'],
    coverMediaId: 'md-manifest',
    body: [
      {
        type: 'paragraph',
        text: 'The manifest of the SS Mount Clay is a wide ruled sheet with thirty columns, and the family occupies lines 22 through 26. Someone at Hamburg wrote the surname as "Abramowitz," someone at New York corrected it to "Abrams," and the correction stuck for a hundred years.',
      },
      {
        type: 'paragraph',
        text: 'Column 17 asks for capital in possession. The clerk has written eleven dollars. Not eleven dollars each: eleven dollars for the party of five.',
      },
      {
        type: 'quote',
        text: 'They asked what we had. He said eleven dollars. They asked if anyone was meeting us. He said a cousin. They did not ask which cousin, which was lucky, because we did not know.',
        attribution: 'Miriam Abrams, recorded 1985',
      },
      {
        type: 'paragraph',
        text: 'What the column does not record is the brass stamp in his coat pocket, which was worth more than eleven dollars and which he did not declare. It does not record Miriam’s mother’s wedding ring, because that had been sold in Riga eleven months earlier. It does not record Sara’s midwifery instruments, wrapped in a shirt at the bottom of a case, which within eighteen months were earning more than Aleksander’s wages.',
      },
      { type: 'image', mediaId: 'md-orchard-street' },
      {
        type: 'paragraph',
        text: 'The document is an accurate record of almost nothing. It is also the only official trace of the single most consequential day in this family’s history, and I have looked at it more often than any photograph.',
      },
      {
        type: 'note',
        text: 'Manifest reproduced from NARA microfilm T715. The original correction to "Abrams" appears in a second hand, in pencil.',
      },
    ],
  },
  {
    id: 'st-the-ring',
    slug: 'the-ring',
    title: 'The Ring, and the Man on Marijas Iela',
    subtitle: 'Riga, 1920',
    excerpt:
      'She told this story perhaps forty times. The details never varied, which is either a sign of truth or a sign of long practice.',
    era: '1920',
    readingMinutes: 5,
    publishedAt: '2019-06-11',
    featured: true,
    narratorId: 'p-naomi',
    personIds: ['p-miriam'],
    placeIds: ['pl-riga'],
    coverMediaId: 'md-riga-harbour',
    body: [
      {
        type: 'paragraph',
        text: 'They had been in Riga nine months when the broker told them the papers required a further payment. Aleksander had no money. Miriam had her mother’s wedding ring, which she had carried out of Vilna sewn into a hem.',
      },
      {
        type: 'quote',
        text: 'He gave me less than it was worth and I knew it was less than it was worth, and I took it, because a ring you cannot eat and a ring cannot put you on a ship.',
        attribution: 'Miriam Abrams, recorded 1985',
      },
      {
        type: 'paragraph',
        text: 'The broker took the money and was not seen again. They waited another two months, found a different broker, and paid him with wages from work Sara took in a laundry.',
      },
      {
        type: 'heading',
        text: 'What she made of it',
      },
      {
        type: 'paragraph',
        text: 'She never told it as a tragedy. She told it as a procedural lesson, usually to a grandchild about to sign something. The point was never the ring. The point was that you find out what a person is before you hand them the only thing you have.',
      },
    ],
  },
  {
    id: 'st-fourteen-letters',
    slug: 'fourteen-letters',
    title: 'Fourteen Letters',
    subtitle: 'Samuel, 1943 to 1944',
    excerpt:
      'He wrote fourteen times in eleven months. His mother kept every one in the drawer of her sewing table and asked that they not be read aloud while she lived.',
    era: '1944',
    readingMinutes: 7,
    publishedAt: '2020-06-06',
    featured: true,
    narratorId: 'p-naomi',
    personIds: ['p-samuel', 'p-miriam', 'p-aleksander'],
    coverMediaId: 'md-letter-samuel',
    body: [
      {
        type: 'paragraph',
        text: 'Samuel Abrams was the first of the family born on this side of the ocean and the first to be buried on the other. He enlisted at eighteen, trained as a radio operator, and was killed in Normandy on 11 June 1944, five days after the landings.',
      },
      {
        type: 'paragraph',
        text: 'The letters are almost entirely cheerful, which is the hardest thing about them. He asks after the neighbours. He complains about the food and then apologises for complaining. In the ninth letter he asks his mother to stop sending socks.',
      },
      {
        type: 'quote',
        text: 'Tell Pop I have not forgotten how to fold a sheet properly. Tell him they do not care here, but I have not forgotten.',
        attribution: 'Samuel Abrams, letter nine, February 1944',
      },
      {
        type: 'paragraph',
        text: 'That line is the only place in the archive where the bindery reaches the third generation. He had never seen the workshop. He had never been within four thousand miles of Vilna. He had been taught to fold a sheet by a father who cut patterns in a garment shop and who had, evidently, kept teaching it anyway.',
      },
      { type: 'image', mediaId: 'md-telegram' },
      {
        type: 'paragraph',
        text: 'The telegram arrived on 24 June. Miriam kept it with the letters for forty-four years. She died in 1988 and we read them that winter, all fourteen, aloud, at the kitchen table on East 21st Street.',
      },
    ],
  },
  {
    id: 'st-second-hand',
    slug: 'the-second-hand',
    title: 'The Second Hand',
    subtitle: 'What the ledgers give back to Rivka',
    excerpt:
      'There is no photograph of her. There are four hundred pages of her handwriting, and for eighty years nobody noticed.',
    era: '1878-1919',
    readingMinutes: 8,
    publishedAt: '2021-03-08',
    featured: true,
    narratorId: 'p-naomi',
    personIds: ['p-rivka', 'p-jozef'],
    placeIds: ['pl-vilna'],
    coverMediaId: 'md-ledger-page',
    body: [
      {
        type: 'paragraph',
        text: 'The family story had it that Jozef ran the bindery and his wife helped. That is what I was told, and it is what I wrote down in 1994, and it was wrong.',
      },
      {
        type: 'paragraph',
        text: 'There are two hands in the surviving ledgers. One is small, upright, careful and slow: it appears on the title pages, on the formal inventories, and on anything a customer would see. The other is faster, slanted, and abbreviates constantly. It appears on roughly four hundred of the six hundred surviving pages.',
      },
      {
        type: 'heading',
        text: 'Attribution',
      },
      {
        type: 'paragraph',
        text: 'The 1874 marriage record carries both signatures. The fast hand is hers. Once you know that, the ledgers reorganise themselves: the debts, the collections, the correspondence with suppliers in Konigsberg, the decision in 1893 to stop extending credit to the seminary. All of it is Rivka.',
      },
      {
        type: 'quote',
        text: 'She kept the books. That is how it was said, and I understood it to mean she wrote things down. It did not occur to me for fifty years that it meant she ran the business.',
        attribution: 'Naomi Feld, 2021',
      },
      {
        type: 'paragraph',
        text: 'We have no portrait of her. We have her handwriting on four hundred pages, her judgement in every credit decision the bindery made for forty-one years, and a marriage record that proves the hand is hers. It is more than survives of most people. It only felt like less because we had been looking for a face.',
      },
    ],
  },
  {
    id: 'st-eleven-hours',
    slug: 'eleven-hours',
    title: 'Eleven Hours',
    subtitle: 'How this archive came to exist',
    excerpt:
      'A college assignment, four afternoons, and a cassette recorder borrowed from the library. Then nine years in which I did nothing at all.',
    era: '1985-1994',
    readingMinutes: 6,
    publishedAt: '2018-11-20',
    narratorId: 'p-naomi',
    personIds: ['p-naomi', 'p-miriam'],
    placeIds: ['pl-brooklyn', 'pl-berkeley'],
    coverMediaId: 'md-cassettes',
    body: [
      {
        type: 'paragraph',
        text: 'I was thirty-three and taking a night course, and the assignment was to record an oral history with someone over seventy. My grandmother was eighty-nine and lived forty minutes away. I would like to say I chose her out of reverence. I chose her because she was close.',
      },
      {
        type: 'paragraph',
        text: 'We sat at the kitchen table on four afternoons in the spring of 1985. I asked bad questions. She answered them anyway, and then answered the questions I should have asked instead.',
      },
      { type: 'image', mediaId: 'md-miriam-late' },
      {
        type: 'paragraph',
        text: 'I handed in the assignment, got a B, and put the tapes in a drawer. She died in 1988. In 1994 my mother could not remember the name of her own aunt, and I went and found the drawer.',
      },
      {
        type: 'quote',
        text: 'Write it down. I will not always be here to be asked.',
        attribution: 'Miriam Abrams, tape one, side A',
      },
      {
        type: 'paragraph',
        text: 'She said that in the first ten minutes of the first tape, before I had asked her anything of substance. I had not heard it at the time. I have built the last thirty years around it.',
      },
    ],
  },
  {
    id: 'st-the-stamp',
    slug: 'the-stamp',
    title: 'The Stamp',
    subtitle: 'The oldest object we hold',
    excerpt:
      'Brass, worn smooth on one face, about the weight of an egg. It has crossed an ocean in a coat pocket and outlived everyone who used it professionally.',
    era: '1878',
    readingMinutes: 4,
    publishedAt: '2022-01-15',
    personIds: ['p-jozef', 'p-aleksander'],
    placeIds: ['pl-vilna', 'pl-brooklyn'],
    coverMediaId: 'md-workshop-stamp',
    body: [
      {
        type: 'paragraph',
        text: 'It is a finishing tool: heated, then pressed into leather to mark the binder’s work. The face carries three letters and a small device that may be a bird and may be damage.',
      },
      {
        type: 'paragraph',
        text: 'Jozef used it from 1878. Aleksander used it from 1911 until the workshop was requisitioned in 1915, and then carried it, unused, for fifty-nine years.',
      },
      {
        type: 'paragraph',
        text: 'It is the only object in the archive that was touched, daily, by a person born in 1849 and by a person born in 1892 and by everyone who has since taken it out of its box to look at it. There is no photograph that does that.',
      },
    ],
  },
  {
    id: 'st-three-languages',
    slug: 'three-languages',
    title: 'Three Languages, Three Spellings',
    subtitle: 'Ruth’s birth certificate, Riga 1919',
    excerpt:
      'She was born in a rented room during eleven months of waiting, and the state that issued her papers could not agree with itself on who she was.',
    era: '1919',
    readingMinutes: 4,
    publishedAt: '2020-09-30',
    personIds: ['p-ruth', 'p-miriam'],
    placeIds: ['pl-riga'],
    coverMediaId: 'md-birth-cert',
    body: [
      {
        type: 'paragraph',
        text: 'The certificate is printed in Latvian, Russian and German, and the surname is rendered differently in each. Ruth spent her adult life explaining to clerks that all three were her.',
      },
      {
        type: 'paragraph',
        text: 'She taught fourth grade for thirty-eight years and kept the certificate framed in the hallway, which her mother thought was strange and her daughter thought was the whole point.',
      },
    ],
  },
  {
    id: 'st-six-hundred-eleven',
    slug: 'six-hundred-eleven',
    title: 'Six Hundred and Eleven',
    subtitle: 'Sara’s account book',
    excerpt:
      'Between 1922 and 1958 she recorded every delivery. The fees range from four dollars to nothing, and the nothings are not marked as charity.',
    era: '1922-1958',
    readingMinutes: 5,
    publishedAt: '2021-07-19',
    personIds: ['p-sara'],
    placeIds: ['pl-lowereastside'],
    coverMediaId: 'md-sara-ledger',
    body: [
      {
        type: 'paragraph',
        text: 'Sara Abramowicz never married, never held a New York licence, and delivered six hundred and eleven children within a twelve-block radius of Orchard Street.',
      },
      {
        type: 'paragraph',
        text: 'The account book records date, address, duration, and fee. Ninety-four entries have a dash in the fee column. She did not write "no charge" or "gratis." She wrote a dash, in the same ink as everything else, and moved to the next line.',
      },
      {
        type: 'quote',
        text: 'People still stopped her in the street in 1968 to say she had delivered them. She was seventy-four. She could usually remember the address.',
        attribution: 'Ruth Feld, recorded 1985',
      },
    ],
  },
  {
    id: 'st-shoebox',
    slug: 'the-shoebox',
    title: 'The Shoebox',
    subtitle: 'Where all of this started',
    excerpt: 'It held about two hundred photographs, and not one of them was labelled.',
    era: '1994',
    readingMinutes: 3,
    publishedAt: '2018-10-02',
    narratorId: 'p-naomi',
    personIds: ['p-naomi', 'p-ruth'],
    placeIds: ['pl-berkeley'],
    coverMediaId: 'md-berkeley-desk',
    body: [
      {
        type: 'paragraph',
        text: 'My mother handed it to me in 1994 and said: do something with this before I forget who they are. She was seventy-five and had begun to lose names.',
      },
      {
        type: 'paragraph',
        text: 'We identified a hundred and forty of the two hundred over the following two years, working from the tapes and from her memory while it lasted. Sixty remain unidentified. They are in this archive too. Someone in them is family, and I do not know which.',
      },
    ],
  },
];
