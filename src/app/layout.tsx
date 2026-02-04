import React from 'react';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import './globals.css';

import { ThemeProvider } from '@/lib/ThemeContext';

const inter = Inter({ subsets: ['latin', 'latin-ext'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs">
      <body className={inter.className}>
        <ThemeProvider>
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
