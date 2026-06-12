import release from '../data/sources.json';
import Dashboard from './Dashboard';
import type { Release } from './types';
import { siteUrl, siteName, siteDescription } from './site';

const data = release as Release;

// schema.org Dataset markup so search engines understand the page is a structured
// index, not just prose. Emitted into the static HTML at build time.
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Dataset',
  name: 'P-INDEX — Russia civilian-conditions index',
  description: siteDescription,
  url: siteUrl,
  isAccessibleForFree: true,
  creator: { '@type': 'Organization', name: siteName },
  dateModified: data.releaseDate,
  measurementTechnique:
    'Weighted composite of 14 indicators, each transformed to a 0–100 sub-score by a published formula.',
  variableMeasured: data.sources.map((s) => s.name),
  spatialCoverage: { '@type': 'Country', name: 'Russia' },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Dashboard release={data} />
    </>
  );
}
