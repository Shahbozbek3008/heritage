import type { Metadata, Viewport } from 'next';
import { Fraunces, Inter, Newsreader } from 'next/font/google';
import '@/styles/globals.css';
import { Masthead } from '@/components/chrome/Masthead';
import { MobileTabBar } from '@/components/chrome/MobileTabBar';
import { SiteFooter } from '@/components/chrome/SiteFooter';
import { repository } from '@/lib/data';

const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  axes: ['SOFT', 'WONK', 'opsz'],
});

const serif = Newsreader({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  style: ['normal', 'italic'],
});

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://archive.example.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'The Family Archive - Abramowicz, Abrams, Feld',
    template: '%s - The Family Archive',
  },
  description:
    'Five generations, from a bindery in Vilna to the present day. Portraits, letters, documents, places and the stories that survived the crossing.',
  keywords: ['family history', 'genealogy', 'family tree', 'archive', 'ancestry', 'oral history'],
  authors: [{ name: 'The Feld Family Archive' }],
  openGraph: {
    type: 'website',
    siteName: 'The Family Archive',
    title: 'The Family Archive - Abramowicz, Abrams, Feld',
    description:
      'Five generations, from a bindery in Vilna to the present day. The stories that survived the crossing.',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Family Archive',
    description: 'Five generations, from a bindery in Vilna to the present day.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Zoom is never disabled: pinch-to-zoom is an accessibility requirement,
  // and the family tree implements its own gesture handling within that.
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#161F2B' },
    { media: '(prefers-color-scheme: dark)', color: '#161F2B' },
  ],
  viewportFit: 'cover',
};

export default async function RootLayout({
  children,
}: {
  readonly children: React.ReactNode;
}): Promise<React.ReactElement> {
  const meta = await repository.getFamilyMeta();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'The Family Archive',
    url: SITE_URL,
    description: meta.introduction[0] ?? '',
    inLanguage: 'en',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/people?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang="en" className={`${display.variable} ${serif.variable} ${sans.variable}`}>
      <body className="min-h-dvh bg-background font-serif text-fluid-base text-foreground antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-gold-200 focus:px-5 focus:py-3 focus:font-sans focus:text-sm focus:text-background"
        >
          Skip to content
        </a>

        <Masthead />

        {/*
          Top padding clears the fixed masthead; bottom padding clears the
          floating mobile tab bar, which is absent from md up.
        */}
        <main id="main" className="pb-28 pt-[4.75rem] md:pb-0 md:pt-[6.5rem]">
          {children}
        </main>

        <SiteFooter meta={meta} />
        <MobileTabBar />

        <script
          type="application/ld+json"
          // Static, developer-authored structured data.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
