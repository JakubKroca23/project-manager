import React from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/providers/ThemeProvider';
import NavbarWrapper from '@/components/NavbarWrapper';
import AuthGuard from '@/components/AuthGuard';
import { SpeedInsights } from '@vercel/speed-insights/next';

import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin', 'latin-ext'] });

export const metadata = {
  title: 'Plánování projektů Contsystem',
  description: 'Profi Project Management Dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Toaster position="top-right" richColors closeButton />
          <AuthGuard>
            <div className="h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
              <NavbarWrapper />
              <main className="flex-1 overflow-hidden p-6">
                {children}
              </main>
            </div>
          </AuthGuard>
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
