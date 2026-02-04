"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { LayoutGrid, Briefcase, Factory, Wrench, Calendar, Search, Bell, Users, Database, Menu, X, Settings, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { ModeToggle } from "@/components/mode-toggle"
import { useState } from "react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutGrid },
    { name: "Projekty", href: "/projects", icon: Briefcase },
    { name: "Výroba", href: "/production", icon: Factory },
    { name: "Servis", href: "/services", icon: Wrench },
    { name: "Timeline", href: "/timeline", icon: Calendar },
]

interface TopBarProps {
    role?: string | null;
    user?: any;
}

export function TopBar({ role, user }: TopBarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    // Create a copy of navItems
    const items = [...navItems];

    if (role === 'admin') {
        items.push({ name: "Admin", href: "/admin/users", icon: Users });
    }

    const handleLogout = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.refresh()
    }

    // Get initials
    const getInitials = () => {
        if (!user) return "U"
        const email = user.email || ""
        const name = user.user_metadata?.full_name || email.split("@")[0] || "U"
        return name.slice(0, 2).toUpperCase()
    }

    // Mobile Menu Animation Variants
    const menuVariants = {
        closed: { opacity: 0, scale: 0.95, y: -20, transition: { duration: 0.2 } },
        open: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2 } }
    }

    return (
        <header className="fixed top-0 left-0 right-0 z-50 px-6 py-3">
            <div className="mx-auto max-w-7xl">
                <div className="glass-heavy rounded-2xl flex items-center justify-between px-4 py-2 ring-1 ring-white/20 dark:ring-white/5 relative bg-background/80 backdrop-blur-md">
                    {/* ... Logo ... */}
                    <div className="flex items-center gap-2 mr-4 md:mr-8 z-50">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold shadow-lg shadow-primary/20">
                            PM
                        </div>
                        <span className="font-semibold text-lg tracking-tight hidden sm:block">
                            ProjectManager
                        </span>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-1">
                        {items.map((item) => {
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
                    <div className="flex items-center gap-2 z-50 ml-auto md:ml-0">
                        <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary/80 rounded-lg transition-colors hidden sm:block">
                            <Search className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary/80 rounded-lg transition-colors relative hidden sm:block">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-background"></span>
                        </button>

                        <div className="h-6 w-px bg-border/50 mx-1 hidden sm:block"></div>

                        <ModeToggle />

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div className="ml-2 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-500 ring-2 ring-background shadow-sm hover:ring-primary transition-all cursor-pointer flex items-center justify-center text-xs font-bold text-white">
                                    {getInitials()}
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Můj účet</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer">
                                    <Settings className="w-4 h-4 mr-2" />
                                    Nastavení
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-500 cursor-pointer" onClick={handleLogout}>
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Odhlásit se
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Mobile Menu Toggle */}
                        <button
                            className="md:hidden p-2 ml-1 text-foreground"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial="closed"
                            animate="open"
                            exit="closed"
                            variants={menuVariants}
                            className="absolute top-16 left-6 right-6 bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl p-4 flex flex-col gap-2 md:hidden z-40"
                        >
                            {items.map((item) => {
                                const isActive = pathname === item.href
                                const Icon = item.icon
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors",
                                            isActive
                                                ? "bg-primary/10 text-primary"
                                                : "hover:bg-secondary/50 text-foreground"
                                        )}
                                    >
                                        <Icon className="w-5 h-5" />
                                        {item.name}
                                    </Link>
                                )
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </header>
    )
}

