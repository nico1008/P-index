import type { Metadata, Viewport } from 'next';
import { Space_Mono } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';
import { siteUrl, siteDescription } from './site';
import './globals.css';

const mono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-mono',
  display: 'swap',
});

const title = 'P-INDEX · Russia civilian-conditions index';
const description = siteDescription;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: '%s · P-INDEX',
  },
  description,
  applicationName: 'P-INDEX',
  keywords: [
    'Russia',
    'composite index',
    'economic indicators',
    'inflation',
    'ruble',
    'press freedom',
    'sanctions',
    'civilian conditions',
    'data dashboard',
  ],
  authors: [{ name: 'P-INDEX' }],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'P-INDEX',
    title,
    description,
    locale: 'en_US',
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
};

export const viewport: Viewport = {
  themeColor: '#f9f8f6',
  colorScheme: 'light',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={mono.variable}>
      <body>{children}<SpeedInsights /><Analytics /></body>
    </html>
  );
}
