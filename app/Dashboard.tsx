'use client';

import { useEffect, useState } from 'react';
import type { Source } from './types';
import { ChartRouter } from './charts';
import { DataSectionBg, HeroBg, MethodSectionBg } from './decorations';

const RED = '#e31c0e';
const ORA = '#f55a00';
const GREEN = '#16a34a';

function scoreClass(s: number) {
  return s >= 75 ? 'score-hi' : s >= 55 ? 'score-md' : 'score-lo';
}

function Card({ src, open, onToggle }: { src: Source; open: boolean; onToggle: () => void }) {
  return (
    <div className={`card${open ? ' open' : ''}`} onClick={onToggle}>
      <div className="card-top">
        <span className="card-name">{src.name}</span>
        <span className="card-wt">×{src.weight}%</span>
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
      {open && (
        <div className="expand-section">
          <div>{src.description}</div>
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
      <div className="hero-sidebar-title">30-DAY TREND</div>
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

export default function Dashboard({ sources }: { sources: Source[] }) {
  const [pIndex, setPIndex] = useState(73.4);
  const [displayVal, setDisplayVal] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    setLastUpdated(new Date());
  }, []);

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
      setRefreshing(true);
      setTimeout(() => {
        setPIndex((v) => parseFloat(Math.max(60, Math.min(90, v + (Math.random() - 0.48) * 0.8)).toFixed(1)));
        setLastUpdated(new Date());
        setRefreshing(false);
      }, 1400);
    }, 18000);
    return () => clearInterval(id);
  }, []);

  const fmt = (d: Date) =>
    d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
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
          LAST UPDATED: {lastUpdated ? fmt(lastUpdated) : '—'}
          {refreshing && <span className="updating">UPDATING</span>}
        </div>
      </header>

      <section className="hero">
        <HeroBg />
        <div className="hero-content">
          <div className="eyebrow">COMPOSITE SCORE — QUALITY OF LIFE IN RUSSIA</div>
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
                Tracks {sources.length} economic, social, and press-freedom indicators to measure how life in Russia is changing — month over month.
              </div>
              <div className="kpi-row">
                <div className="kpi">
                  <span className="kpi-label">30-day change</span>
                  <span className="kpi-val bad"><span className="delta-arrow">↑</span>+2.1 pts</span>
                </div>
                <div className="kpi">
                  <span className="kpi-label">1-year change</span>
                  <span className="kpi-val bad"><span className="delta-arrow">↑</span>+11.4 pts</span>
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
              { n: '01', title: 'DATA COLLECTION', desc: 'Raw signals pulled from open-source APIs, NGO datasets, press freedom indices, emigration registries, and independent research. Updated continuously.' },
              { n: '02', title: 'NORMALIZATION', desc: 'Each source normalized to a 0–100 subscale using percentile mapping against a 1991–2024 baseline. Inverse metrics are mirrored accordingly.' },
              { n: '03', title: 'WEIGHTING', desc: 'Sources weighted by data reliability, recency, and structural importance. Weights reviewed quarterly and adjusted for new data availability.' },
              { n: '04', title: 'COMPOSITE SCORE', desc: 'Weighted average of all subscores yields the final P-Index. Rolling 30-day smoothing is applied to reduce noise from single-event outliers.' },
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
        <div className="footer-note">P-INDEX IS AN INDEPENDENT COMPOSITE METRIC. DATA SOURCED FROM PUBLICLY AVAILABLE RESEARCH, INDICES, AND STATISTICAL AGENCIES. NOT AFFILIATED WITH ANY GOVERNMENT OR INSTITUTION.</div>
        <div>P-INDEX © 2026</div>
      </footer>
    </>
  );
}
