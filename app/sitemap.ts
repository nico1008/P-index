import type { MetadataRoute } from 'next';
import release from '../data/sources.json';
import { siteUrl } from './site';

// Generated to /sitemap.xml at build time (works with `output: 'export'`).
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: new Date(release.releaseDate),
      changeFrequency: 'daily',
      priority: 1,
    },
  ];
}
