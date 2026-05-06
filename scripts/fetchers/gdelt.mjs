const URL =
  'https://api.gdeltproject.org/api/v2/doc/doc?query=russia&mode=tonechart&format=json&timespan=7d';
const SOURCE_URL = 'https://www.gdeltproject.org/';

export default async function fetchGDELT() {
  const res = await fetch(URL, { headers: { 'User-Agent': 'p-index-fetcher/1.0' } });
  if (!res.ok) throw new Error(`GDELT HTTP ${res.status}`);
  const data = await res.json();

  const buckets = data.tonechart;
  if (!Array.isArray(buckets) || buckets.length === 0) {
    throw new Error('GDELT: empty or missing tonechart array');
  }

  let total = 0;
  let negative = 0;
  for (const b of buckets) {
    const bin = parseFloat(b.bin);
    const count = parseInt(b.count, 10) || 0;
    if (!Number.isFinite(bin)) continue;
    total += count;
    if (bin <= -2) negative += count;
  }

  if (total === 0) throw new Error('GDELT: zero articles in window');

  const pct = (negative / total) * 100;
  return {
    value: Number(pct.toFixed(1)),
    fetchedAt: new Date().toISOString().slice(0, 10),
    sourceUrl: SOURCE_URL,
  };
}
