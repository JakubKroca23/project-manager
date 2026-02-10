import React from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/providers/ThemeProvider';
import NavbarWrapper from '@/components/NavbarWrapper';

const inter = Inter({ subsets: ['latin', 'latin-ext'] });

export const metadata = {
  title: 'Nexus Project Manager',
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
          <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            <NavbarWrapper />
            <main className="p-6">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
