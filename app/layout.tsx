import type { Metadata, Viewport } from 'next';
import { Inter, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://ember-commit.vercel.app'),
  title: 'Ember Commit | Real Daily Micro-Journaling',
  description:
    'Protect your GitHub contribution streak with meaningful daily log entries committed directly to your repository.',
  manifest: '/manifest.json',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'Ember Commit | Real Daily Micro-Journaling',
    description:
      'Protect your GitHub contribution streak with meaningful daily log entries committed directly to your repository.',
    url: 'https://ember-commit.vercel.app',
    siteName: 'Ember Commit',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'Ember Commit Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Ember Commit | Real Daily Micro-Journaling',
    description:
      'Protect your GitHub contribution streak with meaningful daily log entries committed directly to your repository.',
    images: ['/logo.png'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Ember Commit',
  },
};

export const viewport: Viewport = {
  themeColor: '#0C0F14',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${ibmPlexMono.variable} antialiased min-h-screen bg-ink text-text-primary font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
