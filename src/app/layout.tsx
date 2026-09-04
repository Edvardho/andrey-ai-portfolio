import type { Metadata, Viewport } from 'next';
import { Geist_Mono, Onest } from 'next/font/google';

import './globals.css';

const onest = Onest({
  variable: '--font-onest',
  subsets: ['latin', 'cyrillic'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Андрей Макаревич — Product Designer',
  description:
    'Портфолио продуктового дизайнера Андрея Макаревича: финтех, кибербезопасность, enterprise и сложные B2B/B2C-продукты.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${onest.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-white text-zinc-950">{children}</body>
    </html>
  );
}
