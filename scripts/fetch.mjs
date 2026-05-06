import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import fetchCBR from './fetchers/cbr.mjs';
import fetchWorldBank from './fetchers/worldbank.mjs';
import fetchGDELT from './fetchers/gdelt.mjs';
import { computeRelease } from './compute.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SOURCES_PATH = path.join(ROOT, 'data', 'sources.json');

const FETCHERS = {
  ruble: fetchCBR,
  gdp: fetchWorldBank,
  news: fetchGDELT,
};

const FORMATTERS = {
  ruble: (v) => `${v.toFixed(1)} ₽`,
  gdp: (v) => `${v < 0 ? '−' : ''}${Math.abs(v).toFixed(1)}%`,
  news: (v) => `${v.toFixed(0)}%`,
};

async function main() {
  const today = new Date().toISOString().slice(0, 10);
  const release = JSON.parse(await fs.readFile(SOURCES_PATH, 'utf8'));

  let updated = 0;
  const failures = [];

  for (const src of release.sources) {
    const fetcher = FETCHERS[src.id];
    if (!fetcher) continue;
    try {
      const result = await fetcher();
      src.rawValue = result.value;
      src.currentValue = (FORMATTERS[src.id] ?? ((v) => String(v)))(result.value);
      src.lastFetched = result.fetchedAt ?? today;
      if (result.sourceUrl) src.sourceUrl = result.sourceUrl;
      delete src.staleSince;
      updated++;
      console.log(`[ok]   ${src.id.padEnd(10)} ${src.currentValue}`);
    } catch (err) {
      if (!src.staleSince) src.staleSince = today;
      failures.push({ id: src.id, error: err.message });
      console.error(`[fail] ${src.id.padEnd(10)} ${err.message}`);
    }
  }

  computeRelease(release);

  release.releaseDate = today;
  release.lastRunAt = new Date().toISOString();

  await fs.writeFile(SOURCES_PATH, JSON.stringify(release, null, 2) + '\n', 'utf8');

  console.log(`\nupdated ${updated} indicator(s); failed ${failures.length}; composite ${release.composite}`);

  const wired = Object.keys(FETCHERS).length;
  if (failures.length === wired) {
    console.error('all wired fetchers failed; signalling CI failure');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('fatal:', err);
  process.exit(1);
});
