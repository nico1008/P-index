'use client';

import type { CSSProperties } from 'react';

const RED = '#e31c0e';

export function HeroBg() {
  const a = (deg: number) => (deg * Math.PI) / 180;
  const px = (cx: number, cy: number, r: number, deg: number) => [cx + r * Math.cos(a(deg)), cy + r * Math.sin(a(deg))];
  const arcPath = (cx: number, cy: number, r: number, a1: number, a2: number) => {
    const [x1, y1] = px(cx, cy, r, a1);
    const [x2, y2] = px(cx, cy, r, a2);
    return `M${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`;
  };
  return (
    <svg
      className="hero-bg"
      viewBox="0 0 1400 440"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      aria-hidden="true"
      role="presentation"
    >
      {[160, 220, 280, 340, 400, 460].map((r, i) => (
        <circle key={i} cx={1360} cy={-30} r={r} fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth="1" />
      ))}
      <path d={arcPath(1360, -30, 250, -175, -55)} fill="none" stroke={RED} strokeWidth="1.5" opacity="0.13" />
      <path d={arcPath(1360, -30, 310, -185, -45)} fill="none" stroke={RED} strokeWidth="0.8" opacity="0.07" />
      <line x1="52" y1="340" x2="128" y2="340" stroke="rgba(0,0,0,0.09)" strokeWidth="1" />
      <line x1="90" y1="302" x2="90" y2="378" stroke="rgba(0,0,0,0.09)" strokeWidth="1" />
      <circle cx="90" cy="340" r="5" fill="none" stroke={RED} strokeWidth="1.2" opacity="0.28" />
      <circle cx="90" cy="340" r="2" fill={RED} opacity="0.25" />
      <line x1="1260" y1="260" x2="1310" y2="260" stroke="rgba(0,0,0,0.07)" strokeWidth="1" />
      <line x1="1285" y1="235" x2="1285" y2="285" stroke="rgba(0,0,0,0.07)" strokeWidth="1" />
      <line x1="0" y1="1" x2="1400" y2="1" stroke="rgba(0,0,0,0.04)" strokeWidth="1" />
      {Array.from({ length: 28 }, (_, i) => (
        <line key={i} x1={50 * i} y1={0} x2={50 * i} y2={i % 4 === 0 ? 14 : 7} stroke="rgba(0,0,0,0.07)" strokeWidth="1" />
      ))}
      <line x1="0" y1="440" x2="420" y2="0" stroke="rgba(0,0,0,0.03)" strokeWidth="1" strokeDasharray="6,10" />
    </svg>
  );
}

interface SpikyEyeProps {
  size?: number;
  opacity?: number;
  rotate?: number;
  which?: number;
  style?: CSSProperties;
}

export function SpikyEye({ size = 120, opacity = 0.13, rotate = 0, which = 0, style = {} }: SpikyEyeProps) {
  const imgW = size;
  const imgH = imgW * (980 / 570);
  const eyeH = imgH / 3;
  const offsets = [0, 1, 2];
  const topOffset = -(offsets[which % 3] * eyeH);

  return (
    <div
      aria-hidden="true"
      style={{
        width: imgW,
        height: eyeH,
        overflow: 'hidden',
        opacity,
        transform: `rotate(${rotate}deg)`,
        display: 'block',
        flexShrink: 0,
        ...style,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/uploads/eye.png"
        alt=""
        aria-hidden="true"
        style={{
          width: imgW,
          height: imgH,
          display: 'block',
          marginTop: topOffset,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      />
    </div>
  );
}

interface EyeSpec {
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  size: number;
  opacity: number;
  rotate: number;
  which: number;
}

function EyeLayer({ eyes }: { eyes: EyeSpec[] }) {
  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {eyes.map((e, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: e.top,
            left: e.left,
            right: e.right,
            bottom: e.bottom,
          }}
        >
          <SpikyEye size={e.size} opacity={e.opacity} rotate={e.rotate} which={e.which} />
        </div>
      ))}
    </div>
  );
}

export function DataSectionBg() {
  const eyes: EyeSpec[] = [
    { top: '6%', left: '1.5%', size: 110, opacity: 0.13, rotate: -15, which: 0 },
    { top: '2%', right: '2%', size: 90, opacity: 0.10, rotate: 12, which: 1 },
    { bottom: '8%', left: '0.5%', size: 130, opacity: 0.11, rotate: 8, which: 2 },
    { bottom: '4%', right: '1%', size: 100, opacity: 0.09, rotate: -20, which: 0 },
    { top: '45%', left: '1%', size: 80, opacity: 0.08, rotate: 5, which: 1 },
    { top: '40%', right: '1.5%', size: 95, opacity: 0.10, rotate: -8, which: 2 },
  ];
  return <EyeLayer eyes={eyes} />;
}

export function MethodSectionBg() {
  const eyes: EyeSpec[] = [
    { top: '10%', left: '1%', size: 105, opacity: 0.11, rotate: -10, which: 2 },
    { bottom: '12%', left: '2%', size: 85, opacity: 0.09, rotate: 18, which: 0 },
    { top: '8%', right: '1.5%', size: 120, opacity: 0.10, rotate: 8, which: 1 },
    { bottom: '10%', right: '2%', size: 90, opacity: 0.11, rotate: -14, which: 2 },
  ];
  return <EyeLayer eyes={eyes} />;
}
