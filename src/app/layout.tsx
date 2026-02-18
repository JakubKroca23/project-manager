import React from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { SearchProvider } from '@/providers/SearchProvider';
import { ActionProvider } from '@/providers/ActionProvider';
import NavbarWrapper from '@/components/NavbarWrapper';
import AuthGuard from '@/components/AuthGuard';
import { Toaster } from 'sonner';
import ImportWizard from '@/components/ImportWizard';

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
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <ActionProvider>
            <SearchProvider>
              <AuthGuard>
                <div className="h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
                  <NavbarWrapper />
                  <main className="flex-1 overflow-hidden p-6">
                    {children}
                  </main>
                  <ImportWizard />
                </div>
                <Toaster position="top-right" richColors closeButton />
              </AuthGuard>
            </SearchProvider>
          </ActionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
