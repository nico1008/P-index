const URL =
  'https://api.worldbank.org/v2/country/RUS/indicator/NY.GDP.MKTP.KD.ZG?format=json&per_page=10';
const SOURCE_URL = 'https://data.worldbank.org/country/russian-federation';

export default async function fetchWorldBank() {
  const res = await fetch(URL, { headers: { 'User-Agent': 'p-index-fetcher/1.0' } });
  if (!res.ok) throw new Error(`World Bank HTTP ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data) || !Array.isArray(data[1])) {
    throw new Error('World Bank: unexpected response shape');
  }

  const latest = data[1].find((d) => d && d.value != null);
  if (!latest) throw new Error('World Bank: no non-null GDP entry');

  return {
    value: Number(parseFloat(latest.value).toFixed(2)),
    year: latest.date,
    fetchedAt: new Date().toISOString().slice(0, 10),
    sourceUrl: SOURCE_URL,
  };
}
