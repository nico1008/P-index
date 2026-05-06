const URL = 'https://www.cbr.ru/scripts/XML_daily.asp';
const SOURCE_URL = 'https://www.cbr.ru/eng/key-indicators/';

export default async function fetchCBR() {
  const res = await fetch(URL, {
    headers: { 'User-Agent': 'p-index-fetcher/1.0' },
  });
  if (!res.ok) throw new Error(`CBR HTTP ${res.status}`);
  const xml = await res.text();

  const block = xml.match(/<Valute[^>]*>\s*<NumCode>\s*840\s*<\/NumCode>[\s\S]*?<\/Valute>/);
  if (!block) throw new Error('CBR: USD entry (NumCode 840) not found');

  const rateMatch = block[0].match(/<VunitRate>\s*([\d.,]+)\s*<\/VunitRate>/);
  if (!rateMatch) throw new Error('CBR: VunitRate not found in USD entry');
  const value = parseFloat(rateMatch[1].replace(',', '.'));
  if (!Number.isFinite(value)) throw new Error(`CBR: parsed VunitRate is not finite: ${rateMatch[1]}`);

  const dateMatch = xml.match(/<ValCurs[^>]*Date="(\d{2})\.(\d{2})\.(\d{4})"/);
  const fetchedAt = dateMatch
    ? `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`
    : new Date().toISOString().slice(0, 10);

  return { value: Number(value.toFixed(2)), fetchedAt, sourceUrl: SOURCE_URL };
}
