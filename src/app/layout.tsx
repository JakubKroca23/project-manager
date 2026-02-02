import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AppShell } from "@/components/layout/app-shell";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
    title: "Project Manager",
    description: "Profesionální správa projektů",
};

import { createClient } from "@/lib/supabase/server";

// ...

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let role = null;
    if (user) {
        const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        role = (data as any)?.role;
    }

    return (
        <html lang="cs" suppressHydrationWarning>
            <body className={`${inter.variable} antialiased min-h-screen bg-background text-foreground`}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <AppShell role={role} user={user}>
                        {children}
                    </AppShell>
                </ThemeProvider>
            </body>
        </html>
    );
}
