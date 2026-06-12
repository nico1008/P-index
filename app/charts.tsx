'use client';

import type { Source } from './types';

const RED = '#e31c0e';
const NAVY = '#1c2340';

export function niceRange(data: number[]): [number, number] {
  const mn = Math.min(...data);
  const mx = Math.max(...data);
  const pad = (mx - mn) * 0.12 || 1;
  return [mn - pad, mx + pad];
}

// Pick up to `max` evenly-spaced tick indices for the x-axis, always keeping the
// first and last point. A 12-point monthly series thins to ~5 labels; a 4-point
// quarterly or 2-point annual series shows every point. Ticks sit on the real
// data x-positions, so the axis never lies about the cadence of the series.
function tickIndices(n: number, max = 6): number[] {
  if (n <= max) return Array.from({ length: n }, (_, i) => i);
  const step = Math.ceil((n - 1) / (max - 1));
  const idx: number[] = [];
  for (let i = 0; i < n; i += step) idx.push(i);
  if (idx[idx.length - 1] !== n - 1) idx.push(n - 1);
  return idx;
}

// Renders the real tLabels along the bottom axis. Edge labels are start/end
// anchored so they never clip the plot bounds; interior labels are centred.
function XAxis({
  labels,
  toX,
  y,
  edgeAnchor = true,
}: {
  labels: string[];
  toX: (i: number) => number;
  y: number;
  edgeAnchor?: boolean;
}) {
  const n = labels.length;
  return (
    <>
      {tickIndices(n).map((i) => {
        const anchor = edgeAnchor && i === 0 ? 'start' : edgeAnchor && i === n - 1 ? 'end' : 'middle';
        return (
          <text
            key={i}
            x={toX(i)}
            y={y}
            textAnchor={anchor}
            fontSize="12"
            fontWeight="700"
            fontFamily="Space Mono,monospace"
            fill="#0d0c0b"
          >
            {labels[i]}
          </text>
        );
      })}
    </>
  );
}

// Catmull-Rom → cubic Bézier with low tension: a gentle, polished curve that
// stays close to the data points (minimal overshoot). Two points stay a straight
// segment so annual cards don't bow.
function smoothPath(pts: [number, number][]): string {
  if (pts.length < 2) return pts.length ? `M ${pts[0][0]},${pts[0][1]}` : '';
  if (pts.length === 2) return `M ${pts[0][0]},${pts[0][1]} L ${pts[1][0]},${pts[1][1]}`;
  const t = 0.16;
  let d = `M ${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) * t;
    const c1y = p1[1] + (p2[1] - p0[1]) * t;
    const c2x = p2[0] - (p3[0] - p1[0]) * t;
    const c2y = p2[1] - (p3[1] - p1[1]) * t;
    d += ` C ${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${p2[0].toFixed(2)},${p2[1].toFixed(2)}`;
  }
  return d;
}

// Adaptive decimal precision for the high/low axis labels.
function axisFmt(range: number): (v: number) => string {
  const decimals = range < 1 ? 2 : range < 10 ? 1 : 0;
  return (v: number) => v.toFixed(decimals);
}

interface LineProps {
  data: number[];
  labels: string[];
  uid?: string;
  showZero?: boolean;
}

export function LineChart({ data, labels, uid = 'lc', showZero = false }: LineProps) {
  // The .chart-bleed wrapper pulls the SVG past the card padding; PL reserves the
  // left bleed gutter for the high/low labels. One restrained navy line, a soft
  // area, and a single red "current" dot — no per-point clutter, no score color.
  const W = 300, H = 180, PL = 32, PR = 14, PT = 20, PB = 28;
  const [yMin, yMax] = niceRange(data);
  const yR = yMax - yMin;
  const xR = W - PL - PR;
  const yR2 = H - PT - PB;
  const baseY = H - PB;
  const toX = (i: number) => PL + (i / (data.length - 1)) * xR;
  const toY = (v: number) => PT + (1 - (v - yMin) / yR) * yR2;
  const pts = data.map<[number, number]>((v, i) => [toX(i), toY(v)]);
  const first = pts[0];
  const last = pts[pts.length - 1];
  const linePath = smoothPath(pts);
  const areaPath = `${linePath} L ${last[0]},${baseY} L ${first[0]},${baseY} Z`;
  const gid = `g_${uid}`;
  const dMax = Math.max(...data), dMin = Math.min(...data);
  const fmt = axisFmt(dMax - dMin);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={NAVY} stopOpacity=".13" />
          <stop offset="100%" stopColor={NAVY} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* high / low reference — quiet labels mark the band the series moved in,
          replacing the old three-gridline grid. */}
      <text x={PL - 6} y={toY(dMax)} textAnchor="end" dominantBaseline="middle" fontSize="12" fontFamily="Space Mono,monospace" fill="#0d0c0b">{fmt(dMax)}</text>
      <text x={PL - 6} y={toY(dMin)} textAnchor="end" dominantBaseline="middle" fontSize="12" fontFamily="Space Mono,monospace" fill="#0d0c0b">{fmt(dMin)}</text>
      {showZero && yMin < 0 && yMax > 0 && (
        <line x1={PL} x2={W - PR} y1={toY(0)} y2={toY(0)} stroke="rgba(0,0,0,0.22)" strokeWidth="1" strokeDasharray="4,3" />
      )}
      {/* faint red drop-line anchors the current reading to the time axis */}
      <line x1={last[0]} x2={last[0]} y1={last[1]} y2={baseY} stroke="rgba(227,28,14,0.22)" strokeWidth="1" />
      <line x1={PL} x2={W - PR} y1={baseY} y2={baseY} stroke="rgba(0,0,0,0.16)" strokeWidth="1" />
      <XAxis labels={labels} toX={toX} y={baseY + 16} />
      <path d={areaPath} fill={`url(#${gid})`} />
      <path className="chart-line" pathLength={1} d={linePath} fill="none" stroke={NAVY} strokeWidth="1.75" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={first[0]} cy={first[1]} r="2" fill={NAVY} opacity="0.4" />
      <circle cx={last[0]} cy={last[1]} r="3.6" fill={RED} stroke="#fff" strokeWidth="1.4" />
    </svg>
  );
}

interface TwoLineProps {
  data1: number[];
  data2: number[];
  labels: string[];
  uid?: string;
  legend1?: string;
  legend2?: string;
}

export function TwoLineChart({ data1, data2, labels, uid = 'tlc', legend1 = 'SHADOW', legend2 = 'OFFICIAL' }: TwoLineProps) {
  void uid;
  const allData = [...data1, ...data2];
  const W = 300, H = 210, PL = 30, PR = 6, PT = 26, PB = 32;
  const [yMin, yMax] = niceRange(allData);
  const yR = yMax - yMin, xR = W - PL - PR, yR2 = H - PT - PB;
  const toX = (i: number) => PL + (i / (data1.length - 1)) * xR;
  const toY = (v: number) => PT + (1 - (v - yMin) / yR) * yR2;
  const yTicks = [0, 0.5, 1].map((f) => yMin + f * yR);
  const pts1 = data1.map<[number, number]>((v, i) => [toX(i), toY(v)]);
  const pts2 = data2.map<[number, number]>((v, i) => [toX(i), toY(v)]);
  const path1 = `M ${pts1.map((p) => p.join(',')).join(' L ')}`;
  const path2 = `M ${pts2.map((p) => p.join(',')).join(' L ')}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      {yTicks.map((v, i) => {
        const y = toY(v);
        return (
          <g key={i}>
            <line x1={PL} x2={W - PR} y1={y} y2={y} stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
            <text x={PL - 4} y={y} textAnchor="end" dominantBaseline="middle" fontSize="11" fontWeight="700" fontFamily="Space Mono,monospace" fill="#0d0c0b">{v.toFixed(2)}</text>
          </g>
        );
      })}
      <XAxis labels={labels} toX={toX} y={H - PB + 18} />
      <line x1={PL} x2={W - PR} y1={H - PB} y2={H - PB} stroke="rgba(0,0,0,0.18)" strokeWidth="1" />
      <path className="chart-line" pathLength={1} d={path1} fill="none" stroke={RED} strokeWidth="2" strokeLinejoin="round" />
      <path d={path2} fill="none" stroke={NAVY} strokeWidth="2" strokeLinejoin="round" strokeDasharray="5,3" />
      {/* Legend sits above the plot, right-aligned, so it doesn't collide with y-tick labels */}
      <line x1={W - 96} x2={W - 84} y1={10} y2={10} stroke={RED} strokeWidth="2" />
      <text x={W - 81} y={13} fontSize="10" fontWeight="700" fontFamily="Space Mono,monospace" fill="#0d0c0b">{legend1}</text>
      <line x1={W - 44} x2={W - 32} y1={10} y2={10} stroke={NAVY} strokeWidth="2" strokeDasharray="4,2" />
      <text x={W - 29} y={13} fontSize="10" fontWeight="700" fontFamily="Space Mono,monospace" fill="#0d0c0b">{legend2}</text>
    </svg>
  );
}

interface BarProps {
  data: number[];
  labels: string[];
  color?: string;
  uid?: string;
}

export function BarChart({ data, labels, color = RED, uid = 'bc' }: BarProps) {
  void uid;
  const W = 300, H = 170, PL = 30, PR = 6, PT = 14, PB = 32;
  const [yMin0, yMax] = niceRange(data);
  const yMin = Math.min(yMin0, 0);
  const yR = yMax - yMin, xR = W - PL - PR, yR2 = H - PT - PB;
  const toY = (v: number) => PT + (1 - (v - yMin) / yR) * yR2;
  const slot = xR / data.length;
  const bw = slot - 3;
  const barCenterX = (i: number) => PL + i * slot + 1.5 + bw / 2;
  const yTicks = [0, 0.5, 1].map((f) => yMin + f * yR);
  const zeroY = toY(0);
  const maxAbs = Math.max(...data.map((v) => Math.abs(v)));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      {yTicks.map((v, i) => {
        const y = toY(v);
        return (
          <g key={i}>
            <line x1={PL} x2={W - PR} y1={y} y2={y} stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
            <text x={PL - 4} y={y} textAnchor="end" dominantBaseline="middle" fontSize="11" fontWeight="700" fontFamily="Space Mono,monospace" fill="#0d0c0b">{v.toFixed(1)}</text>
          </g>
        );
      })}
      <XAxis labels={labels} toX={barCenterX} y={H - PB + 18} edgeAnchor={false} />
      <line x1={PL} x2={W - PR} y1={zeroY} y2={zeroY} stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
      {data.map((v, i) => {
        const x = PL + i * slot + 1.5;
        const y = Math.min(toY(v), zeroY);
        const h = Math.abs(toY(v) - zeroY);
        const alpha = 0.45 + 0.55 * (Math.abs(v) / maxAbs);
        return <rect key={i} x={x} y={y} width={Math.max(bw, 2)} height={Math.max(h, 1)} fill={color} opacity={alpha} />;
      })}
    </svg>
  );
}

interface HeatmapProps {
  data: number[];
  labels: string[];
}

// Deterministic ±0.5 hash so server and client render identical cells (no
// hydration mismatch). Replaces the previous Math.random() jitter.
function cellJitter(mi: number, r: number): number {
  const x = Math.sin(mi * 127.1 + r * 311.7) * 43758.5453;
  return x - Math.floor(x) - 0.5;
}

export function HeatmapChart({ data, labels }: HeatmapProps) {
  const cols = 12, rows = 4, cw = 20, ch = 13, PL = 0, PT = 18;
  const W = cols * cw + PL, H = rows * ch + PT + 4;
  const cells = data.flatMap((v, mi) =>
    Array.from({ length: rows }, (_, r) => ({ mi, r, v: Math.max(0, Math.min(100, v + cellJitter(mi, r) * 12)) })),
  );
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: H + 10, display: 'block' }}>
      {labels.map((l, i) => (
        <text key={i} x={PL + i * cw + cw / 2} y={PT - 4} textAnchor="middle" fontSize="7.5" fontFamily="Space Mono,monospace" fill="#0d0c0b">{l}</text>
      ))}
      {cells.map((c, idx) => {
        const t = c.v / 100;
        const fill = t < 0.4 ? `rgba(28,35,64,${0.12 + t * 0.35})` : `rgba(227,28,14,${t * 0.88})`;
        return <rect key={idx} x={PL + c.mi * cw} y={PT + c.r * ch} width={cw - 1} height={ch - 1} fill={fill} rx="1.5" />;
      })}
      <text x={-2} y={PT + 2 * ch} textAnchor="end" fontSize="7" fontFamily="Space Mono,monospace" fill="#0d0c0b" transform={`rotate(-90,${-2},${PT + 2 * ch})`}>WK</text>
    </svg>
  );
}

// A spoken summary of the series for screen-reader users. The SVG itself carries
// no semantics, so without this the chart is invisible to assistive tech.
function chartAriaLabel(src: Source): string {
  const trendWord = src.trend === 'up' ? 'rising' : src.trend === 'down' ? 'falling' : 'stable';
  const n = src.data.length;
  const first = src.data[0];
  const last = src.data[n - 1];
  const from = src.tLabels[0];
  const to = src.tLabels[n - 1];
  if (src.chartType === 'twoline' && src.data2) {
    const l1 = (src.legend1 ?? 'series 1').toLowerCase();
    const l2 = (src.legend2 ?? 'series 2').toLowerCase();
    const last2 = src.data2[src.data2.length - 1];
    return `${src.name} chart, ${src.cadence}, ${from} to ${to}. ${l1} ${first} to ${last}; ${l2} ${src.data2[0]} to ${last2}. Trend ${trendWord}.`;
  }
  return `${src.name} chart, ${src.cadence}, ${from} to ${to}: ${first} to ${last}. Trend ${trendWord}.`;
}

export function ChartRouter({ src }: { src: Source }) {
  let chart: JSX.Element;
  if (src.chartType === 'bar') chart = <BarChart data={src.data} labels={src.tLabels} uid={src.id} />;
  else if (src.chartType === 'linezero') chart = <LineChart data={src.data} labels={src.tLabels} uid={src.id} showZero={true} />;
  else if (src.chartType === 'heatmap') chart = <HeatmapChart data={src.data} labels={src.tLabels} />;
  else if (src.chartType === 'twoline' && src.data2) chart = <TwoLineChart data1={src.data} data2={src.data2} labels={src.tLabels} uid={src.id} legend1={src.legend1} legend2={src.legend2} />;
  else chart = <LineChart data={src.data} labels={src.tLabels} color={src.score >= 75 ? RED : ORA} uid={src.id} />;
  // The .chart-bleed wrapper pulls the chart out past the card's horizontal padding
  // so the plot area is visibly wider than the card text bracket. role="img" +
  // aria-label exposes the series as a single labelled image to screen readers.
  return (
    <div className="chart-bleed" role="img" aria-label={chartAriaLabel(src)}>
      {chart}
    </div>
  );
}
