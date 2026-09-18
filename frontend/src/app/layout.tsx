import type { Metadata, Viewport } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900']
});

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://ai.loopsintegrated.co'),
  title: 'Elephant House Ice Cream | AR Tongue Catch Game',
  description: 'Catch delicious Elephant House ice cream popsicles with your mouth and tongue! Score marks and climb the leaderboard in this interactive AR camera game.',
  keywords: ['Elephant House', 'Ice Cream', 'Popsicle Game', 'AR Game', 'Tongue Catch', 'Sri Lanka'],
  icons: {
    icon: [
      { url: `${basePath}/favicon.ico` },
      { url: `${basePath}/favicon.png`, type: 'image/png' },
      { url: `${basePath}/logo.png`, type: 'image/png' },
    ],
    shortcut: `${basePath}/favicon.ico`,
    apple: `${basePath}/logo.png`,
  },
  openGraph: {
    title: 'Elephant House AR Tongue Catch Game',
    description: 'Catch delicious falling popsicles with your tongue and win marks!',
    type: 'website',
    url: 'https://ai.loopsintegrated.co/ElephantHouseGame/',
    siteName: 'Elephant House Wonder Game',
    images: [
      {
        url: `${basePath}/og_image.png`,
        width: 1200,
        height: 630,
        alt: 'Elephant House AR Tongue Catch Game',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Elephant House AR Tongue Catch Game',
    description: 'Catch delicious falling popsicles with your tongue and win marks!',
    images: [`${basePath}/og_image.png`],
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#020617'
};

import SecurityShield from '@/components/SecurityShield';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${outfit.className} antialiased bg-slate-950 text-slate-100 min-h-screen`}>
        <SecurityShield />
        {children}
      </body>
    </html>
  );
}
