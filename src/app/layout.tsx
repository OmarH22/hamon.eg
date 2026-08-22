import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Sans_Arabic } from 'next/font/google';
import './globals.css';
import { META } from '@/lib/copy';
import { OG_IMAGE } from '@/lib/assets';
import MetaPixel from '@/components/MetaPixel';
import { getSiteUrl } from '@/lib/site';

// Only the three weights the design actually uses. Adding a weight here means
// shipping another ~50KB of Arabic + Latin font data on every mobile visit.
const arabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600'],
  variable: '--font-arabic',
  display: 'swap',
  preload: true,
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: META.title,
  description: META.description,
  applicationName: 'HAMON',
  icons: {
    icon: [{ url: '/brand/favicon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/brand/favicon.svg' }],
  },
  openGraph: {
    type: 'website',
    siteName: 'HAMON',
    title: META.title,
    description: META.description,
    locale: 'ar_EG',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'HAMON' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: META.title,
    description: META.description,
    images: [OG_IMAGE],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#F7F5F1',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={arabic.variable}>
      <body>
        {children}
        <MetaPixel />
      </body>
    </html>
  );
}
