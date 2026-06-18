import type { Metadata } from 'next';
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
  title: 'AI Portfolio Assistant — Андрей Макаревич',
  description:
    'Desktop-only MVP портфолио с stateful AI assistant: кейсы, опыт работы, доказательства и прямой выход на контакт.',
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
