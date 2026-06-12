# P-Index

**P-INDEX SYSTEM · RUSSIA** — a single-page dashboard that distils 14 economic,
social, and institutional indicators into one composite 0–100 read on civilian
conditions in Russia. Every card links to its primary public source and every
sub-score is computed from an explicit, published formula — no hidden weighting.

Built with **Next.js** (static export), **Tailwind CSS**, and a single JSON data
file. Hosted on Vercel with no backend.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16, App Router, `output: 'export'` |
| Styling | Tailwind 3 + custom CSS in `app/globals.css` (Space Mono, CSS variables) |
| Charts | Hand-rolled SVG — no chart library (`app/charts.tsx`) |
| Data | `data/sources.json` — static, imported at build time |
| Pipeline | `scripts/fetch.mjs` + GitHub Action (`.github/workflows/daily.yml`) |
| Hosting | Vercel (zero config) |

## Getting started

```bash
npm install
npm run dev       # → http://localhost:3000
npm run build     # → ./out  (fully static; TypeScript is checked here)
```

There is no separate test or lint step — `next build` runs the TypeScript check.

## How the index works

1. **Inputs** — 14 indicators across `economy`, `people`, and `institutions`.
   Cadence varies (daily FX/rate/news tone, monthly inflation/wages/polls, annual
   RSF/Heritage/TI/SIPRI).
2. **Transforms** — each indicator's `rawValue` maps to a 0–100 sub-score via an
   explicit formula in [`scripts/compute.mjs`](scripts/compute.mjs)
   (`TRANSFORMS` / `TRANSFORM_DOCS`).
3. **Weights** — editorial, stored per-indicator in `data/sources.json` and shown
   on each card as `×N%`.
4. **Composite** — weighted average of sub-scores, normalised against total
   weight. Recomputed by `computeRelease()` on every fetch.

## Editing the dashboard

[`data/sources.json`](data/sources.json) is the single source of truth for the
cards. Each entry contains:

- `category` — `economy` / `people` / `institutions` (sets the card grouping)
- `weight` — editorial weight shown as `×N%`; dilutes other weights when changed
- `rawValue` + `currentValue` — the underlying number and its human-readable form
- `score` — 0–100 sub-score (computed from `rawValue`; **hidden in the UI**)
- `trend` — `"up"` / `"down"` / `"stable"` (sets the inline trend label)
- `chartType` — `"line"` / `"linezero"` / `"twoline"` (the active variants;
  `bar` / `heatmap` exist in the router but are not exercised by the data)
- `data` (+ `data2` / `legend1` / `legend2` for `twoline`) and `tLabels` — the
  chart series and its x-axis labels
- `description` + `sourceUrl` / `sourceName` — shown when a card is expanded

> **Chart scope:** every chart spans at most one year — monthly → 12 points,
> quarterly → 4, annual → exactly 2 (latest + prior). After editing any
> `rawValue`, run `computeRelease()` so `score` and `composite` stay consistent.

The composite, status label, and scale-bar needle in the hero are all derived from
`release.composite` in `app/Dashboard.tsx` — nothing in the hero is hardcoded.

## Daily refresh

`scripts/fetch.mjs` pulls the wired indicators (ruble → CBR, GDP → World Bank,
news tone → GDELT), recomputes the release, and writes `data/sources.json`. The
`daily.yml` Action runs it on a cron and commits any change. A failed fetcher
keeps its last-known-good value and gets a `stale` tag rather than overwriting.
