"use client"

import { usePathname } from "next/navigation"
import { TopBar } from "./TopBar"

interface AppShellProps {
    children: React.ReactNode
    role?: string | null
    user?: any
}

export function AppShell({ children, role, user }: AppShellProps) {
    const pathname = usePathname()
    // Define public routes where TopBar should be hidden
    const isPublicRoute = pathname?.startsWith('/login') || pathname?.startsWith('/signup')

    if (isPublicRoute) {
        return <main className="min-h-screen bg-background">{children}</main>
    }

    return (
        <div className="relative min-h-screen flex flex-col bg-muted/30">
            <TopBar role={role} user={user} />
            <main className="flex-1 w-full max-w-7xl mx-auto pt-28 px-6 pb-12 flex flex-col">
                {children}
            </main>
        </div>
    )
}
