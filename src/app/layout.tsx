import type { Metadata, Viewport } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900']
});

export const metadata: Metadata = {
  title: 'Elephant House Ice Cream | AR Tongue Catch Game',
  description: 'Catch delicious Elephant House ice cream popsicles with your mouth and tongue! Score marks and climb the leaderboard in this interactive AR camera game.',
  keywords: ['Elephant House', 'Ice Cream', 'Popsicle Game', 'AR Game', 'Tongue Catch', 'Sri Lanka'],
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'Elephant House AR Tongue Catch Game',
    description: 'Catch delicious falling popsicles with your tongue and win marks!',
    type: 'website',
    images: ['/logo.png'],
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#020617'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${outfit.className} antialiased bg-slate-950 text-slate-100 min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
