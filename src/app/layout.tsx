import React from 'react';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import './globals.css';

import './globals.css';

const inter = Inter({ subsets: ['latin', 'latin-ext'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs">
      <body className={inter.className}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
