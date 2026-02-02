import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TopBar } from "@/components/layout/TopBar";

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
                    <div className="relative min-h-screen flex flex-col bg-muted/30">
                        <TopBar role={role} />
                        <main className="flex-1 w-full max-w-7xl mx-auto pt-28 px-6 pb-12">
                            {children}
                        </main>
                    </div>
                </ThemeProvider>
            </body>
        </html>
    );
}
