// Single source of truth for the production origin, shared by metadata, the
// Open Graph image, robots.txt, sitemap.xml, and JSON-LD.
//
// Set NEXT_PUBLIC_SITE_URL in the Vercel project to the canonical domain so
// absolute URLs resolve correctly. Falls back to the Vercel-injected production
// URL, then to localhost for `next dev`.
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000');

export const siteName = 'P-INDEX';

export const siteDescription =
  'A composite 0–100 index of civilian conditions in Russia, built from 14 economic, social, and institutional indicators. Each sub-score is computed from a published formula and links to its primary source.';
