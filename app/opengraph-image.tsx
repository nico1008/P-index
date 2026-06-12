import { ImageResponse } from 'next/og';

// Prerender the image at build time so it ships with `output: 'export'`.
export const dynamic = 'force-static';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'P-INDEX SYSTEM · RUSSIA — a composite 0–100 index of civilian conditions in Russia';

// Static, evergreen share card (no daily-changing composite number), generated at
// build time. Mirrors the site palette: cream ground, ink type, brand-red accents.
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#f9f8f6',
          padding: '72px 80px',
          borderTop: '14px solid #e31c0e',
          fontFamily: 'monospace',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: '#e31c0e' }} />
          <div style={{ fontSize: 28, letterSpacing: 8, color: '#0d0c0b', fontWeight: 700 }}>
            P-INDEX SYSTEM · RUSSIA
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ fontSize: 76, fontWeight: 700, color: '#0d0c0b', lineHeight: 1.05, letterSpacing: -2 }}>
            Civilian conditions in Russia,
          </div>
          <div style={{ fontSize: 76, fontWeight: 700, color: '#0d0c0b', lineHeight: 1.05, letterSpacing: -2, display: 'flex' }}>
            as a single&nbsp;
            <span style={{ color: '#e31c0e' }}>0–100</span>
            &nbsp;index.
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div
            style={{
              width: '100%',
              height: 12,
              background: 'linear-gradient(90deg, #22c55e 0%, #eab308 25%, #f55a00 52%, #e31c0e 75%, #7f1d1d 100%)',
            }}
          />
          <div style={{ fontSize: 28, color: '#0d0c0b', letterSpacing: 2 }}>
            14 indicators · economy · society · institutions · every source linked
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
