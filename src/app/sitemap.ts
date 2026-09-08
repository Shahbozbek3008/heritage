import type { MetadataRoute } from 'next';
import { repository } from '@/lib/data';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://archive.example.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [people, stories, places] = await Promise.all([
    repository.listPeople(),
    repository.listStories(),
    repository.listPlaces(),
  ]);

  const staticRoutes = ['', '/tree', '/people', '/timeline', '/stories', '/photos', '/places', '/archive'];

  return [
    ...staticRoutes.map((route) => ({
      url: `${SITE_URL}${route}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: route === '' ? 1 : 0.8,
    })),
    ...people.map((person) => ({
      url: `${SITE_URL}/people/${person.slug}`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.7,
    })),
    ...stories.map((story) => ({
      url: `${SITE_URL}/stories/${story.slug}`,
      lastModified: new Date(story.publishedAt),
      changeFrequency: 'yearly' as const,
      priority: 0.6,
    })),
    ...places.map((place) => ({
      url: `${SITE_URL}/places/${place.slug}`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    })),
  ];
}
