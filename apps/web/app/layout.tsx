import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Breathe Mail',
  description: 'Focused email triage for high-signal work.'
};

export default function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-slate-950 text-slate-50">
      <body className={`${inter.className} min-h-screen antialiased`}>{children}</body>
    </html>
  );
}
