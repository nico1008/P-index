# P-Index

A composite index dashboard that tracks quality of life in Russia across 9 economic, social, and press-freedom indicators — updated with a live decorative ticker.

Built with **Next.js** (static export), **Tailwind CSS**, and **JSON data**. Hosted on Vercel with no backend.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16, App Router, `output: 'export'` |
| Styling | Tailwind 3 + custom CSS (Space Mono, CSS variables) |
| Charts | Hand-rolled SVG — no chart library |
| Data | `data/sources.json` — static, build-time |
| Hosting | Vercel (zero config) |

## Getting started

```bash
npm install
npm run dev       # → http://localhost:3000
npm run build     # → ./out  (fully static, open out/index.html directly)
```

## Updating indicator data

All 9 cards are driven by [`data/sources.json`](data/sources.json). Each entry contains:

- `score` — the 0–100 subscore (drives card color: red ≥75, orange ≥55, green <55)
- `currentValue` — the human-readable current reading shown on the card
- `trend` — `"up"` / `"down"` / `"stable"` (sets the delta badge)
- `chartType` — `"line"` / `"linezero"` / `"bar"` (selects the SVG chart variant)
- `data` + `tLabels` — the chart series and x-axis labels
- `description` — the text shown when a card is expanded

The hero's composite score (73.4 by default) and the 30-day sparkline are hardcoded in `app/Dashboard.tsx` and can be updated there alongside the KPI change values (`+2.1 pts`, `+11.4 pts`).

## Deploy

Import the repo into [Vercel](https://vercel.com) — it auto-detects Next.js static export. No environment variables needed. The `out/` directory is gitignored (Vercel builds from source).
