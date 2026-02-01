"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    LayoutDashboard,
    FolderKanban,
    CheckSquare,
    CalendarDays,
    Users,
    Settings,
    LogOut,
    Menu
} from "lucide-react"

const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/projects", icon: FolderKanban, label: "Projects" },
    { href: "/dashboard/tasks", icon: CheckSquare, label: "My Tasks" },
    { href: "/dashboard/timeline", icon: CalendarDays, label: "Timeline" },
    { href: "/dashboard/team", icon: Users, label: "Team" },
]

export function Navbar() {
    const pathname = usePathname()

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center px-4 md:px-6">
                <Link href="/" className="mr-6 flex items-center gap-2 font-bold">
                    <span className="text-xl tracking-tight text-primary">PM</span>
                    <span className="hidden sm:inline-block">Contsystem</span>
                </Link>
                <nav className="flex items-center gap-4 text-sm font-medium lg:gap-6">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "transition-colors hover:text-primary",
                                    isActive ? "text-foreground" : "text-muted-foreground"
                                )}
                            >
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>
                <div className="ml-auto flex items-center gap-2">
                    <Link href="/dashboard/settings">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Settings className="h-4 w-4" />
                            <span className="sr-only">Settings</span>
                        </Button>
                    </Link>
                    <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-destructive">
                        <LogOut className="h-4 w-4" />
                        <span className="hidden sm:inline">Sign Out</span>
                    </Button>
                </div>
            </div>
        </header>
    )
}
