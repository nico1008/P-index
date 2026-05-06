function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

export const TRANSFORMS = {
  gdp:        (v) => clamp((6 - v) / 12 * 100, 0, 100),
  inflation:  (v) => clamp((v - 2) / 18 * 100, 0, 100),
  sentiment:  (v) => clamp(100 - v, 0, 100),
  polls:      (v) => clamp(100 - v, 0, 100),
  emigration: (v) => clamp((v - 5) / 45 * 100, 0, 100),
  news:       (v) => clamp(v, 0, 100),
  rosstat:    (v) => clamp((v - 1) * 100, 0, 100),
  freedom:    (v) => clamp(100 - v, 0, 100),
  ruble:      (v) => clamp((v - 60) / 60 * 100, 0, 100),
};

export const TRANSFORM_DOCS = {
  gdp:        'clamp((6 − gdp_growth_pct) ÷ 12 × 100, 0, 100)',
  inflation:  'clamp((cpi_yoy − 2) ÷ 18 × 100, 0, 100)',
  sentiment:  '100 − sentiment_score',
  polls:      '100 − life_satisfaction_pts',
  emigration: 'clamp((monthly_thousands − 5) ÷ 45 × 100, 0, 100)',
  news:       'clamp(negative_share_pct, 0, 100)',
  rosstat:    'clamp((divergence_multiplier − 1) × 100, 0, 100)',
  freedom:    '100 − heritage_score',
  ruble:      'clamp((rate_rub_per_usd − 60) ÷ 60 × 100, 0, 100)',
};

export function computeSubscore(id, rawValue) {
  const fn = TRANSFORMS[id];
  if (!fn || !Number.isFinite(rawValue)) return null;
  return Math.round(fn(rawValue) * 10) / 10;
}

export function computeRelease(release) {
  let weightedSum = 0;
  let totalWeight = 0;

  for (const src of release.sources) {
    if (typeof src.rawValue === 'number') {
      const score = computeSubscore(src.id, src.rawValue);
      if (score != null) src.score = score;
    }
    if (typeof src.score === 'number' && typeof src.weight === 'number') {
      weightedSum += src.score * src.weight;
      totalWeight += src.weight;
    }
  }

  if (totalWeight > 0) {
    release.composite = Number((weightedSum / totalWeight).toFixed(1));
  }
  return release;
}
