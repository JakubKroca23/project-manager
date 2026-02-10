'use client';

import { Search, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { usePathname } from 'next/navigation';

export function Header() {
    const pathname = usePathname();

    // Mapping pathnames to titles
    const getTitle = () => {
        if (pathname === '/') return 'Workspace Overview';
        if (pathname === '/projekty') return 'Projects';
        if (pathname === '/vyroba') return 'Výroba';
        if (pathname === '/servis') return 'Servis';
        if (pathname === '/profile') return 'Profil';
        return 'Dashboard';
    };

    // Don't show header on login
    if (pathname === '/login') return null;

    return (
        <header className="h-20 px-8 border-b border-border flex items-center justify-between shrink-0 bg-background/50 backdrop-blur-sm z-10">
            <div className="flex flex-col">
                <h1 className="text-2xl font-bold text-foreground tracking-tight">{getTitle()}</h1>
                <p className="text-sm text-muted-foreground hidden sm:block">
                    Welcome back. You have access to all modules.
                </p>
            </div>

            <div className="flex items-center gap-4">
                {/* Search Bar - hidden on mobile */}
                <div className="hidden md:flex relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search anything..."
                        className="h-10 w-64 bg-secondary/50 border border-input rounded-full pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/70"
                    />
                </div>

                <div className="flex items-center gap-2 border-l border-border pl-4">
                    <ThemeToggle />

                    <button className="h-10 px-4 bg-primary hover:bg-primary-hover text-primary-foreground text-sm font-medium rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-primary/20">
                        <Plus size={18} />
                        <span>New Project</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
