'use client';

import { useEffect, useState } from 'react';
import type { Release, Source } from './types';
import { ChartRouter } from './charts';
import { DataSectionBg, HeroBg, MethodSectionBg } from './decorations';

const INK = '#0d0c0b';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function fmtDate(iso: string) {
  const [y, m, d] = iso.split('-');
  return `${parseInt(d, 10)} ${MONTHS[parseInt(m, 10) - 1]} ${y}`;
}

function Card({ src, open, onToggle }: { src: Source; open: boolean; onToggle: () => void }) {
  const trendLabel = src.trend === 'up' ? '↑ Rising' : src.trend === 'down' ? '↓ Falling' : '— Stable';
  const detailId = `card-detail-${src.id}`;
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  };
  const stopBoth = (e: React.SyntheticEvent) => e.stopPropagation();
  return (
    <div
      className={`card${open ? ' open' : ''}`}
      onClick={onToggle}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-expanded={open}
      aria-controls={detailId}
    >
      <div className="card-eyebrow">
        <h4 className="card-name">
          {src.name}
          <span className={`card-delta ${src.trend}`}>{trendLabel}</span>
        </h4>
        <span className="card-wt">×{src.weight}%</span>
      </div>
      <div className="card-hero">
        <span className="card-current">{src.currentValue}</span>
      </div>
      <ChartRouter src={src} />
      <div className="card-source-line">
        <span className="card-source">{src.sourceName}</span>
        {src.staleSince && <span className="stale-tag">stale</span>}
      </div>
      {open && (
        <div className="expand-section" id={detailId}>
          <div className="card-desc">{src.description}</div>
          <a
            className="card-source-link"
            href={src.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={stopBoth}
            onKeyDown={stopBoth}
            aria-label={`Source: ${src.sourceName} (opens in new tab)`}
          >
            Source · {src.sourceName} →
          </a>
        </div>
      )}
      <span className="card-arrow" aria-hidden="true">{open ? '▲' : '▼'}</span>
    </div>
  );
}

function CardSection({
  title,
  blurb,
  children,
}: {
  title: string;
  blurb: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card-section">
      <div className="card-section-head">
        <h3 className="card-section-title">{title}</h3>
        <span className="card-section-blurb">{blurb}</span>
      </div>
      <div className="card-grid">{children}</div>
    </div>
  );
}

function ScaleBar({ value }: { value: number }) {
  const zones = ['OPTIMAL', 'MODERATE', 'CONCERNING', 'CRITICAL', 'SEVERE'];
  return (
    <div className="scale-outer">
      <div className="scale-zones">{zones.map((z) => <span key={z}>{z}</span>)}</div>
      <div className="scale-bar">
        <div className="scale-needle" style={{ left: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
      <div className="scale-ticks">{[0, 20, 40, 60, 80, 100].map((v) => <span key={v}>{v}</span>)}</div>
    </div>
  );
}

function IndexDataChart({ composite, releaseDate }: { composite: number; releaseDate: string }) {
  // Chronological (oldest → today). Deterministic so SSR matches CSR.
  // TODO: replace placeholder series with release.compositeHistory once historical composites are persisted.
  const series = [41.5, 42.0, 42.8, 43.3, 42.9, 42.1, composite];
  const W = 220, H = 170, PL = 22, PR = 14, PT = 22, PB = 26;
  const xR = W - PL - PR, yR = H - PT - PB;
  const min = Math.min(...series) - 0.6;
  const max = Math.max(...series) + 0.9;
  const yspan = max - min;
  const baseDate = new Date(releaseDate + 'T00:00:00Z');
  const points = series.map((v, i) => {
    const x = PL + (i / (series.length - 1)) * xR;
    const y = PT + (1 - (v - min) / yspan) * yR;
    const d = new Date(baseDate);
    d.setUTCDate(d.getUTCDate() - (series.length - 1 - i));
    const isToday = i === series.length - 1;
    const label = isToday ? 'TODAY' : `${d.getUTCDate()}`;
    return { x, y, v, label, isToday };
  });
  const baseY = H - PB;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <defs>
        <linearGradient id="idxStem" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1c2340" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#1c2340" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="idxStemToday" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e31c0e" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#e31c0e" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* baseline */}
      <line x1={PL - 4} x2={W - PR + 4} y1={baseY} y2={baseY} stroke="rgba(0,0,0,0.18)" strokeWidth="1" />
      {/* stems with vertical fade — the gimmick: each day "drips" toward the baseline */}
      {points.map((p, i) => (
        <rect
          key={`stem${i}`}
          x={p.x - (p.isToday ? 1.2 : 0.6)}
          y={p.y}
          width={p.isToday ? 2.4 : 1.2}
          height={baseY - p.y}
          fill={p.isToday ? 'url(#idxStemToday)' : 'url(#idxStem)'}
        />
      ))}
      {/* dashed pulse connector through the dots */}
      <polyline
        points={points.map((p) => `${p.x},${p.y}`).join(' ')}
        fill="none"
        stroke="rgba(28,35,64,0.32)"
        strokeWidth="1"
        strokeDasharray="2.5,2.5"
        strokeLinecap="round"
      />
      {/* dots */}
      {points.map((p, i) => (
        <g key={`dot${i}`}>
          {p.isToday && (
            <circle cx={p.x} cy={p.y} r="9" fill="#e31c0e" opacity="0.18">
              <animate attributeName="r" values="6;11;6" dur="2.2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.28;0;0.28" dur="2.2s" repeatCount="indefinite" />
            </circle>
          )}
          <circle
            cx={p.x}
            cy={p.y}
            r={p.isToday ? 4.2 : 2.4}
            fill={p.isToday ? '#e31c0e' : '#1c2340'}
            stroke={p.isToday ? '#fff' : 'none'}
            strokeWidth={p.isToday ? 1.5 : 0}
          />
        </g>
      ))}
      {/* today value label */}
      {points
        .filter((p) => p.isToday)
        .map((p, i) => (
          <text
            key={i}
            x={p.x}
            y={p.y - 11}
            textAnchor="middle"
            fontSize="11"
            fontWeight="700"
            fontFamily="Space Mono,monospace"
            fill={INK}
          >
            {p.v.toFixed(1)}
          </text>
        ))}
      {/* x labels */}
      {points.map((p, i) => (
        <text
          key={`xl${i}`}
          x={p.x}
          y={H - PB + 14}
          textAnchor="middle"
          fontSize={p.isToday ? 8 : 7.5}
          fontFamily="Space Mono,monospace"
          fill={INK}
          fontWeight={p.isToday ? 700 : 400}
          letterSpacing={p.isToday ? '1.4' : '0.6'}
        >
          {p.label}
        </text>
      ))}
    </svg>
  );
}

function HeroSidebar({
  sources,
  composite,
  releaseDate,
}: {
  sources: Source[];
  composite: number;
  releaseDate: string;
}) {
  const sorted = [...sources].sort((a, b) => b.score * b.weight - a.score * a.weight).slice(0, 5);
  const maxContrib = sorted[0].score * sorted[0].weight;

  return (
    <div className="hero-sidebar-grid">
      <div className="sidebar-col">
        <div className="hero-sidebar-title">Index Data</div>
        <div className="index-data-chart">
          <IndexDataChart composite={composite} releaseDate={releaseDate} />
        </div>
      </div>
      <div className="sidebar-col">
        <div className="hero-sidebar-title">Top Drivers</div>
        <div className="driver-list">
          {sorted.map((s) => {
            const pct = ((s.score * s.weight) / maxContrib) * 100;
            return (
              <div className="driver-row" key={s.id}>
                <span className="driver-name">{s.name.split(' ').slice(0, 2).join(' ')}</span>
                <div className="driver-bar-bg">
                  <div className="driver-bar-fill" style={{ width: `${pct}%`, background: INK }} />
                </div>
                <span className="driver-score">{s.score}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard({ release }: { release: Release }) {
  const sources = release.sources;
  const pIndex = release.composite;
  const [displayVal, setDisplayVal] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    let frame: number;
    let start: number | null = null;
    const dur = 2400;
    const target = pIndex;
    const animate = (ts: number) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      setDisplayVal(parseFloat((target * (1 - Math.pow(1 - p, 4))).toFixed(1)));
      if (p < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [pIndex]);

  // Intentionally no random-drift loop — composite is updated by the data pipeline,
  // not by client-side animation. (See methodology section.)

  const intPart = Math.floor(displayVal).toString().padStart(2, '0');
  const decDigit = Math.round((displayVal % 1) * 10);
  const label =
    pIndex >= 80 ? 'SEVERE' : pIndex >= 60 ? 'CRITICAL' : pIndex >= 40 ? 'CONCERNING' : pIndex >= 20 ? 'MODERATE' : 'OPTIMAL';

  return (
    <>
      <header className="site-header">
        <div className="logo">
          <div className="logo-dot" />
          P-INDEX SYSTEM · RUSSIA
        </div>
        <div className="header-right">
          LAST RUN · {fmtDate(release.releaseDate).toUpperCase()}
        </div>
      </header>

      <main>
      <section className="hero">
        <HeroBg />
        <div className="hero-content">
          <div className="hero-row">
            <h1
              className="big-num"
              aria-label={`P-INDEX score ${pIndex.toFixed(1)} of 100, ${label}`}
              aria-live="off"
            >
              <span aria-hidden="true">{intPart}</span>
              <span className="dec-dot" aria-hidden="true">.</span>
              <span className="dec-digit" aria-hidden="true">{decDigit}</span>
              <span className="slash" aria-hidden="true">/ 100</span>
            </h1>
            <div className="hero-aside">
              <div className="status-pill">
                <div className="pulse-dot" />
                {label}
              </div>
              <div className="hero-desc">
                Composite index of 14 indicators across economy, society, and institutions in Russia. Refreshed daily. Score range 0–100.
              </div>
              <div className="kpi-row">
                <div className="kpi">
                  <span className="kpi-label">Indicators</span>
                  <span className="kpi-val">{sources.length}</span>
                </div>
              </div>
            </div>
            <div className="hero-sidebar">
              <HeroSidebar sources={sources} composite={release.composite} releaseDate={release.releaseDate} />
            </div>
          </div>
          <ScaleBar value={pIndex} />
        </div>
      </section>

      <div className="section-block data-block">
        <div className="section-inner">
          <div className="section-head">
            <div className="section-label">
              <span className="section-num">02</span>
              <h2 className="section-title">Data Sources</h2>
            </div>
          </div>
          <DataSectionBg />
          {(
            [
              {
                key: 'economy' as const,
                title: 'ECONOMY',
                blurb: 'Output, prices, currency, credit, wages.',
              },
              {
                key: 'people' as const,
                title: 'PEOPLE',
                blurb: 'Sentiment, polling, departures, news tone.',
              },
              {
                key: 'institutions' as const,
                title: 'INSTITUTIONS',
                blurb: 'Press, courts, statistics, defense.',
              },
            ]
          ).map(({ key, title, blurb }) => {
            const items = sources.filter((s) => s.category === key);
            if (items.length === 0) return null;
            return (
              <CardSection key={key} title={title} blurb={blurb}>
                {items.map((src) => (
                  <Card
                    key={src.id}
                    src={src}
                    open={openId === src.id}
                    onToggle={() => setOpenId(openId === src.id ? null : src.id)}
                  />
                ))}
              </CardSection>
            );
          })}
        </div>
      </div>

      <div className="section-block" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="section-inner">
          <div className="section-head">
            <div className="section-label">
              <span className="section-num">03</span>
              <h2 className="section-title">Methodology</h2>
            </div>
          </div>
          <MethodSectionBg />
          <div className="method-grid">
            {[
              {
                n: '01',
                title: 'INPUTS',
                desc: '14 indicators across economy, sentiment, press, governance, and mobility. Each card links to its primary public source. Cadence varies — daily for FX, policy rate, and news tone, monthly for inflation, wages, and polls, annual for RSF, Heritage, TI, and SIPRI.',
              },
              {
                n: '02',
                title: 'TRANSFORMATIONS',
                desc: 'Each indicator → 0–100 by an explicit formula in scripts/compute.mjs. Inflation: clamp((cpi − 2) ÷ 18 × 100, 0, 100). Ruble: clamp((rate − 60) ÷ 60 × 100, 0, 100). No hidden percentile mapping.',
              },
              {
                n: '03',
                title: 'WEIGHTS',
                desc: 'Editorial judgements, not derived. Each card displays its own weight (×N%) above the value. Weights live in data/sources.json and only change with a commit.',
              },
              {
                n: '04',
                title: 'COMPOSITE',
                desc: 'Weighted average of subscores, recomputed on every fetch. No smoothing. Failed fetchers do not silently overwrite — last-known-good value persists with a stale tag.',
              },
              {
                n: '05',
                title: 'SCOPE',
                desc: 'Includes civilian, economic, and institutional indicators. Does not include military capacity, hydrocarbon revenue, or political stability. Some inputs lag by weeks.',
              },
            ].map((m) => (
              <div key={m.n} className="method-card">
                <div className="method-head">
                  <span className="method-num">{m.n}</span>
                  <span className="method-title">{m.title}</span>
                </div>
                <div className="method-desc">{m.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </main>

      <footer className="site-footer">
        <div className="footer-note">
          P-INDEX · daily index of {sources.length} indicators on Russia · all sources linked.
        </div>
        <div>P-INDEX © {new Date().getFullYear()}</div>
      </footer>
    </>
  );
}
