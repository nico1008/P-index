'use client';

import type { Source } from './types';

const RED = '#e31c0e';
const NAVY = '#1c2340';
const ORA = '#f55a00';

export function niceRange(data: number[]): [number, number] {
  const mn = Math.min(...data);
  const mx = Math.max(...data);
  const pad = (mx - mn) * 0.12 || 1;
  return [mn - pad, mx + pad];
}

interface LineProps {
  data: number[];
  labels: string[];
  color?: string;
  uid?: string;
  showZero?: boolean;
}

export function LineChart({ data, labels, color = RED, uid = 'lc', showZero = false }: LineProps) {
  const W = 300, H = 200, PL = 38, PR = 8, PT = 10, PB = 24;
  const [yMin, yMax] = niceRange(data);
  const yR = yMax - yMin;
  const xR = W - PL - PR;
  const yR2 = H - PT - PB;
  const toX = (i: number) => PL + (i / (data.length - 1)) * xR;
  const toY = (v: number) => PT + (1 - (v - yMin) / yR) * yR2;
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => yMin + f * yR);
  const pts = data.map<[number, number]>((v, i) => [toX(i), toY(v)]);
  const linePath = `M ${pts.map((p) => p.join(',')).join(' L ')}`;
  const areaPath = `${linePath} L ${pts[pts.length - 1][0]},${H - PB} L ${PL},${H - PB} Z`;
  const gid = `g_${uid}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: H, display: 'block' }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity=".18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {yTicks.map((v, i) => {
        const y = toY(v);
        return (
          <g key={i}>
            <line x1={PL} x2={W - PR} y1={y} y2={y} stroke="rgba(0,0,0,0.07)" strokeWidth="1" />
            <text x={PL - 4} y={y} textAnchor="end" dominantBaseline="middle" fontSize="7.5" fontFamily="Space Mono,monospace" fill="rgba(0,0,0,0.38)">{v.toFixed(1)}</text>
          </g>
        );
      })}
      {showZero && yMin < 0 && yMax > 0 && (
        <line x1={PL} x2={W - PR} y1={toY(0)} y2={toY(0)} stroke="rgba(0,0,0,0.18)" strokeWidth="1" strokeDasharray="4,3" />
      )}
      {labels.map((l, i) => {
        const skip = labels.length > 8 ? i % 3 !== 0 : labels.length > 5 ? i % 2 !== 0 : false;
        if (skip) return null;
        return <text key={i} x={toX(i)} y={H - PB + 13} textAnchor="middle" fontSize="7.5" fontFamily="Space Mono,monospace" fill="rgba(0,0,0,0.38)">{l}</text>;
      })}
      <line x1={PL} x2={W - PR} y1={H - PB} y2={H - PB} stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
      <line x1={PL} x2={PL} y1={PT} y2={H - PB} stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
      <path d={areaPath} fill={`url(#${gid})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === pts.length - 1 ? 3.5 : 2} fill={color} opacity={i === pts.length - 1 ? 1 : 0.7} />
      ))}
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
  const W = 300, H = 200, PL = 38, PR = 8, PT = 10, PB = 24;
  const [yMin, yMax] = niceRange(allData);
  const yR = yMax - yMin, xR = W - PL - PR, yR2 = H - PT - PB;
  const toX = (i: number) => PL + (i / (data1.length - 1)) * xR;
  const toY = (v: number) => PT + (1 - (v - yMin) / yR) * yR2;
  const yTicks = [0, 0.33, 0.66, 1].map((f) => yMin + f * yR);
  const pts1 = data1.map<[number, number]>((v, i) => [toX(i), toY(v)]);
  const pts2 = data2.map<[number, number]>((v, i) => [toX(i), toY(v)]);
  const path1 = `M ${pts1.map((p) => p.join(',')).join(' L ')}`;
  const path2 = `M ${pts2.map((p) => p.join(',')).join(' L ')}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: H, display: 'block' }}>
      {yTicks.map((v, i) => {
        const y = toY(v);
        return (
          <g key={i}>
            <line x1={PL} x2={W - PR} y1={y} y2={y} stroke="rgba(0,0,0,0.07)" strokeWidth="1" />
            <text x={PL - 4} y={y} textAnchor="end" dominantBaseline="middle" fontSize="7.5" fontFamily="Space Mono,monospace" fill="rgba(0,0,0,0.38)">{v.toFixed(2)}</text>
          </g>
        );
      })}
      {labels.map((l, i) => {
        if (i % 2 !== 0) return null;
        return <text key={i} x={toX(i)} y={H - PB + 13} textAnchor="middle" fontSize="7.5" fontFamily="Space Mono,monospace" fill="rgba(0,0,0,0.38)">{l}</text>;
      })}
      <line x1={PL} x2={W - PR} y1={H - PB} y2={H - PB} stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
      <line x1={PL} x2={PL} y1={PT} y2={H - PB} stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
      <path d={path1} fill="none" stroke={RED} strokeWidth="2" strokeLinejoin="round" />
      <path d={path2} fill="none" stroke={NAVY} strokeWidth="2" strokeLinejoin="round" strokeDasharray="5,3" />
      <line x1={PL + 2} x2={PL + 14} y1={PT + 5} y2={PT + 5} stroke={RED} strokeWidth="2" />
      <text x={PL + 17} y={PT + 8} fontSize="7" fontFamily="Space Mono,monospace" fill="rgba(0,0,0,0.5)">{legend1}</text>
      <line x1={PL + 70} x2={PL + 82} y1={PT + 5} y2={PT + 5} stroke={NAVY} strokeWidth="2" strokeDasharray="4,2" />
      <text x={PL + 85} y={PT + 8} fontSize="7" fontFamily="Space Mono,monospace" fill="rgba(0,0,0,0.5)">{legend2}</text>
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
  const W = 300, H = 150, PL = 38, PR = 8, PT = 8, PB = 22;
  const [yMin0, yMax] = niceRange(data);
  const yMin = Math.min(yMin0, 0);
  const yR = yMax - yMin, xR = W - PL - PR, yR2 = H - PT - PB;
  const toY = (v: number) => PT + (1 - (v - yMin) / yR) * yR2;
  const bw = xR / data.length - 3;
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => yMin + f * yR);
  const zeroY = toY(0);
  const maxAbs = Math.max(...data.map((v) => Math.abs(v)));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: H, display: 'block' }}>
      {yTicks.map((v, i) => {
        const y = toY(v);
        return (
          <g key={i}>
            <line x1={PL} x2={W - PR} y1={y} y2={y} stroke="rgba(0,0,0,0.07)" strokeWidth="1" />
            <text x={PL - 4} y={y} textAnchor="end" dominantBaseline="middle" fontSize="7.5" fontFamily="Space Mono,monospace" fill="rgba(0,0,0,0.38)">{v.toFixed(1)}</text>
          </g>
        );
      })}
      {labels.map((l, i) => {
        const skip = labels.length > 8 ? i % 3 !== 0 : labels.length > 5 ? i % 2 !== 0 : false;
        if (skip) return null;
        const x = PL + i * (xR / data.length) + (xR / data.length) / 2;
        return <text key={i} x={x} y={H - PB + 13} textAnchor="middle" fontSize="7.5" fontFamily="Space Mono,monospace" fill="rgba(0,0,0,0.38)">{l}</text>;
      })}
      <line x1={PL} x2={W - PR} y1={zeroY} y2={zeroY} stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
      <line x1={PL} x2={PL} y1={PT} y2={H - PB} stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
      {data.map((v, i) => {
        const x = PL + i * (xR / data.length) + 1.5;
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

export function HeatmapChart({ data, labels }: HeatmapProps) {
  const cols = 12, rows = 4, cw = 20, ch = 13, PL = 0, PT = 18;
  const W = cols * cw + PL, H = rows * ch + PT + 4;
  const cells = data.flatMap((v, mi) =>
    Array.from({ length: rows }, (_, r) => ({ mi, r, v: Math.max(0, Math.min(100, v + (Math.random() - 0.5) * 12)) })),
  );
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: H + 10, display: 'block' }}>
      {labels.map((l, i) => (
        <text key={i} x={PL + i * cw + cw / 2} y={PT - 4} textAnchor="middle" fontSize="7.5" fontFamily="Space Mono,monospace" fill="rgba(0,0,0,0.38)">{l}</text>
      ))}
      {cells.map((c, idx) => {
        const t = c.v / 100;
        const fill = t < 0.4 ? `rgba(28,35,64,${0.12 + t * 0.35})` : `rgba(227,28,14,${t * 0.88})`;
        return <rect key={idx} x={PL + c.mi * cw} y={PT + c.r * ch} width={cw - 1} height={ch - 1} fill={fill} rx="1.5" />;
      })}
      <text x={-2} y={PT + 2 * ch} textAnchor="end" fontSize="7" fontFamily="Space Mono,monospace" fill="rgba(0,0,0,0.3)" transform={`rotate(-90,${-2},${PT + 2 * ch})`}>WK</text>
    </svg>
  );
}

export function ChartRouter({ src }: { src: Source }) {
  if (src.chartType === 'bar') return <BarChart data={src.data} labels={src.tLabels} uid={src.id} />;
  if (src.chartType === 'linezero') return <LineChart data={src.data} labels={src.tLabels} uid={src.id} showZero={true} />;
  if (src.chartType === 'heatmap') return <HeatmapChart data={src.data} labels={src.tLabels} />;
  if (src.chartType === 'twoline' && src.data2) return <TwoLineChart data1={src.data} data2={src.data2} labels={src.tLabels} uid={src.id} legend1={src.legend1} legend2={src.legend2} />;
  return <LineChart data={src.data} labels={src.tLabels} color={src.score >= 75 ? RED : ORA} uid={src.id} />;
}
