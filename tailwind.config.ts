import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#f9f8f6',
        ink: '#0d0c0b',
        ink2: '#4a4845',
        ink3: '#9e9b96',
        red: '#e31c0e',
        navy: '#1c2340',
        orange: '#f55a00',
      },
      fontFamily: {
        mono: ['var(--font-mono)', 'Space Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
