'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Calendar, Briefcase, Factory, Wrench, User, LogOut, Settings } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const navItems = [
    { name: 'Dashboard', icon: Calendar, href: '/' },
    { name: 'Projekty', icon: Briefcase, href: '/projekty' },
    { name: 'Výroba', icon: Factory, href: '/vyroba' },
    { name: 'Servis', icon: Wrench, href: '/servis' },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [userEmail, setUserEmail] = useState<string | null>(null);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.email) {
                setUserEmail(user.email);
            }
        };
        getUser();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    // Don't show sidebar on login page
    if (pathname === '/login') return null;

    return (
        <aside className="w-64 h-screen bg-card border-r border-border flex flex-col shrink-0 transition-all duration-300">
            {/* Logo Area */}
            <div className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg shadow-primary/20">
                    N
                </div>
                <span className="font-bold text-xl tracking-tight text-foreground">Nexus.</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">
                    Start
                </div>
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                            )}
                        >
                            <item.icon size={18} />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}

                <div className="mt-8 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">
                    Settings
                </div>
                <Link
                    href="/profile"
                    className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        pathname === '/profile'
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                >
                    <Settings size={18} />
                    <span>Profil</span>
                </Link>
            </nav>

            {/* User Profile Footer */}
            <div className="p-4 border-t border-border">
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors group">
                    <div className="w-9 h-9 bg-accent rounded-full flex items-center justify-center text-accent-foreground">
                        <User size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                            {userEmail ? userEmail.split('@')[0] : 'Uživatel'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                            {userEmail || 'Načítání...'}
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                        title="Odhlásit"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </aside>
    );
}
