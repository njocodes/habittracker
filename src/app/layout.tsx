// Root Layout - Komplett neu implementiert

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SessionProvider } from '@/components/SessionProvider';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Habit Tracker',
  description: 'Eine schöne und intuitive Habit-Tracking-App für bessere tägliche Routinen',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className={inter.className}>
        <SessionProvider>
          {children}
          {process.env.NODE_ENV === 'production' && <Analytics />}
          {process.env.NODE_ENV === 'production' && <SpeedInsights />}
        </SessionProvider>
      </body>
    </html>
  );
}