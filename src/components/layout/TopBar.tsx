"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { LayoutGrid, Briefcase, Factory, Wrench, Calendar, Search, Bell } from "lucide-react"
import { cn } from "@/lib/utils"
import { ModeToggle } from "@/components/mode-toggle"

const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutGrid },
    { name: "Projekty", href: "/projects", icon: Briefcase },
    { name: "Výroba", href: "/production", icon: Factory },
    { name: "Servis", href: "/services", icon: Wrench },
    { name: "Timeline", href: "/timeline", icon: Calendar },
]

export function TopBar() {
    const pathname = usePathname()

    return (
        <header className="fixed top-0 left-0 right-0 z-50 px-6 py-3">
            <div className="mx-auto max-w-7xl">
                <div className="glass-heavy rounded-2xl flex items-center justify-between px-4 py-2 ring-1 ring-white/20 dark:ring-white/5">
                    {/* Logo */}
                    <div className="flex items-center gap-2 mr-8">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold shadow-lg shadow-primary/20">
                            PM
                        </div>
                        <span className="font-semibold text-lg tracking-tight hidden sm:block">
                            ProjectManager
                        </span>
                    </div>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href
                            const Icon = item.icon

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "relative px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                                        isActive
                                            ? "text-primary bg-primary/10"
                                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                                    )}
                                >
                                    <span className="flex items-center gap-2 relative z-10">
                                        <Icon className="w-4 h-4" />
                                        {item.name}
                                    </span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-pill"
                                            className="absolute inset-0 bg-primary/10 rounded-xl z-0"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2">
                        <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary/80 rounded-lg transition-colors">
                            <Search className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary/80 rounded-lg transition-colors relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-background"></span>
                        </button>

                        <div className="h-6 w-px bg-border/50 mx-1"></div>

                        <ModeToggle />

                        <div className="ml-2 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-500 ring-2 ring-background shadow-sm hover:ring-primary transition-all cursor-pointer"></div>
                    </div>
                </div>
            </div>
        </header>
    )
}
