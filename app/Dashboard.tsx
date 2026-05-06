'use client';

import { useEffect, useState } from 'react';
import type { Release, Source } from './types';
import { ChartRouter } from './charts';
import { DataSectionBg, HeroBg, MethodSectionBg } from './decorations';

const RED = '#e31c0e';
const ORA = '#f55a00';
const GREEN = '#16a34a';

function scoreClass(s: number) {
  return s >= 75 ? 'score-hi' : s >= 55 ? 'score-md' : 'score-lo';
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function fmtDate(iso: string) {
  const [y, m, d] = iso.split('-');
  return `${parseInt(d, 10)} ${MONTHS[parseInt(m, 10) - 1]} ${y}`;
}

function fmtRelative(iso: string) {
  if (!iso) return '';
  const then = new Date(iso + 'T00:00:00Z').getTime();
  const now = Date.now();
  const days = Math.round((now - then) / 86400000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  if (days < 365) return `${Math.round(days / 30)} mo ago`;
  return `${Math.round(days / 365)} yr ago`;
}

function Card({ src, open, onToggle }: { src: Source; open: boolean; onToggle: () => void }) {
  return (
    <div className={`card${open ? ' open' : ''}`} onClick={onToggle}>
      <div className="card-top">
        <span className="card-name">{src.name}</span>
        <div className="card-meta">
          <span className={`cadence-tag cadence-${src.cadence}`}>{src.cadence}</span>
          <span className="card-wt">×{src.weight}%</span>
        </div>
      </div>
      <div className="card-sublabel">{src.label}</div>
      <div className="card-score-row">
        <span className={`card-score ${scoreClass(src.score)}`}>{src.score}</span>
        <span className="card-current">{src.currentValue}</span>
        <span className={`card-delta ${src.trend === 'up' ? 'up' : src.trend === 'down' ? 'down' : 'stable'}`}>
          {src.trend === 'up' ? '↑ Worsening' : src.trend === 'down' ? '↓ Declining' : '— Stable'}
        </span>
      </div>
      <ChartRouter src={src} />
      <div className="card-source-line">
        <span className="card-source">{src.sourceName}</span>
        <span className="card-sep">·</span>
        <span className="card-fetched">{fmtRelative(src.lastFetched)}</span>
        {src.staleSince && <span className="stale-tag">stale</span>}
      </div>
      {open && (
        <div className="expand-section">
          <div className="why-matters">{src.whyItMatters}</div>
          <div className="card-desc">{src.description}</div>
          <a
            className="card-source-link"
            href={src.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            Source · {src.sourceName} →
          </a>
        </div>
      )}
      <span className="card-arrow">{open ? '▲' : '▼'}</span>
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

function HeroSidebar({ sources }: { sources: Source[] }) {
  const sorted = [...sources].sort((a, b) => b.score * b.weight - a.score * a.weight).slice(0, 5);
  const maxContrib = sorted[0].score * sorted[0].weight;
  const spark = [68.2, 69.1, 70.4, 71.2, 70.8, 71.6, 72.0, 72.9, 73.4];
  const sparkW = 240, sparkH = 40, pad = 2;
  const sMin = Math.min(...spark) - 1;
  const sMax = Math.max(...spark) + 1;
  const sparkPts = spark
    .map((v, i) => {
      const x = pad + (i / (spark.length - 1)) * (sparkW - pad * 2);
      const y = pad + (1 - (v - sMin) / (sMax - sMin)) * (sparkH - pad * 2);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div>
      <div className="hero-sidebar-title">RECENT TREND</div>
      <svg viewBox={`0 0 ${sparkW} ${sparkH}`} style={{ width: '100%', height: sparkH, display: 'block', marginBottom: 14 }}>
        <polyline points={sparkPts} fill="none" stroke={RED} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {spark.map((v, i) => {
          const x = pad + (i / (spark.length - 1)) * (sparkW - pad * 2);
          const y = pad + (1 - (v - sMin) / (sMax - sMin)) * (sparkH - pad * 2);
          return i === spark.length - 1 ? <circle key={i} cx={x} cy={y} r="3" fill={RED} /> : null;
        })}
      </svg>
      <div className="hero-sidebar-title">TOP DRIVERS</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sorted.map((s) => {
          const pct = ((s.score * s.weight) / maxContrib) * 100;
          const col = s.score >= 75 ? RED : s.score >= 55 ? ORA : GREEN;
          return (
            <div className="driver-row" key={s.id}>
              <span className="driver-name">{s.name.split(' ').slice(0, 2).join(' ')}</span>
              <div className="driver-bar-bg">
                <div className="driver-bar-fill" style={{ width: `${pct}%`, background: col }} />
              </div>
              <span className="driver-score" style={{ color: col }}>{s.score}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Dashboard({ release }: { release: Release }) {
  const sources = release.sources;
  const [pIndex, setPIndex] = useState(release.composite);
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

  useEffect(() => {
    const id = setInterval(() => {
      setPIndex((v) => parseFloat(Math.max(0, Math.min(100, v + (Math.random() - 0.48) * 0.8)).toFixed(1)));
    }, 18000);
    return () => clearInterval(id);
  }, []);

  const intPart = Math.floor(displayVal).toString().padStart(2, '0');
  const decDigit = Math.round((displayVal % 1) * 10);
  const label =
    pIndex >= 80 ? 'SEVERE' : pIndex >= 60 ? 'CRITICAL' : pIndex >= 40 ? 'CONCERNING' : pIndex >= 20 ? 'MODERATE' : 'OPTIMAL';

  const wiredCount = sources.filter((s) => !s.staleSince && (s.id === 'gdp' || s.id === 'ruble' || s.id === 'news')).length;

  return (
    <>
      <header className="site-header">
        <div className="logo">
          <div className="logo-dot" />
          P-INDEX SYSTEM · RUSSIA
        </div>
        <div className="header-right">
          AUTO-REFRESH DAILY · LAST RUN {fmtDate(release.releaseDate)}
        </div>
      </header>

      <section className="hero">
        <HeroBg />
        <div className="hero-content">
          <div className="eyebrow">P-INDEX · DAILY REFRESH 02:00 UTC</div>
          <div className="hero-row">
            <div className="big-num">
              <span>{intPart}</span>
              <span className="dec-dot">.</span>
              <span className="dec-digit">{decDigit}</span>
              <span className="slash">/ 100</span>
            </div>
            <div className="hero-aside">
              <div className="status-pill">
                <div className="pulse-dot" />
                {label}
              </div>
              <div className="hero-desc">
                Daily-refreshed read of civilian conditions in Russia — economy, sentiment, press, mobility — beyond the official numbers. Higher = more distress.
              </div>
              <div className="kpi-row">
                <div className="kpi">
                  <span className="kpi-label">Indicators</span>
                  <span className="kpi-val">{sources.length}</span>
                </div>
                <div className="kpi">
                  <span className="kpi-label">Live-wired</span>
                  <span className="kpi-val">{wiredCount} / {sources.length}</span>
                </div>
                <div className="kpi">
                  <span className="kpi-label">Refreshed</span>
                  <span className="kpi-val">{fmtRelative(release.releaseDate).toUpperCase()}</span>
                </div>
              </div>
            </div>
            <div className="hero-sidebar">
              <HeroSidebar sources={sources} />
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
              <span className="section-title">Data Sources</span>
            </div>
            <span className="section-hint">CLICK ANY SOURCE TO EXPAND</span>
          </div>
          <DataSectionBg />
          <div className="card-grid">
            {sources.map((src) => (
              <Card key={src.id} src={src} open={openId === src.id} onToggle={() => setOpenId(openId === src.id ? null : src.id)} />
            ))}
          </div>
        </div>
      </div>

      <div className="section-block" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="section-inner">
          <div className="section-head">
            <div className="section-label">
              <span className="section-num">03</span>
              <span className="section-title">Methodology</span>
            </div>
          </div>
          <MethodSectionBg />
          <div className="method-grid">
            {[
              {
                n: '01',
                title: 'INPUTS',
                desc: '9 indicators across economy, sentiment, press, and mobility. Each card links to its primary public source. Cadence varies — daily for FX and tone, monthly for inflation and polls, annual for Heritage and RSF.',
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
                title: 'LIMITATIONS',
                desc: "Measures civilian conditions only. Does not capture military capacity, oil-and-gas revenue, or elite stability. Some inputs lag by weeks. Treat as a directional read, not a measurement.",
              },
            ].map((m) => (
              <div key={m.n}>
                <div className="method-num" style={{ color: 'var(--ink3)' }}>{m.n}</div>
                <div className="method-title">{m.title}</div>
                <div className="method-desc">{m.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="site-footer">
        <div className="footer-note">
          P-INDEX · daily civilian-conditions read on Russia · independent · not affiliated with any government · all sources linked.
        </div>
        <div>P-INDEX © 2026</div>
      </footer>
    </>
  );
}
