'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Factory, Wrench, Calendar, Briefcase, User, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { ThemeToggle } from './ThemeToggle';

const navItems = [
    { name: 'TIMELINE', icon: Calendar, href: '/' },
    { name: 'PROJEKTY', icon: Briefcase, href: '/projekty' },
    { name: 'VÝROBA', icon: Factory, href: '/vyroba' },
    { name: 'SERVIS', icon: Wrench, href: '/servis' },
];

const Navbar = () => {
    const pathname = usePathname();
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const router = useRouter();

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

    return (
        <nav className="sticky top-0 z-50 w-full mb-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center rounded-b-2xl bg-card/80 backdrop-blur-md border border-t-0 border-border shadow-sm px-4">

                    {/* Left Spacer */}
                    <div className="flex-1" />

                    {/* Links - Centered */}
                    <div className="flex items-center gap-1 justify-center">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                                        isActive
                                            ? "bg-primary/10 text-primary shadow-sm"
                                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                    )}
                                >
                                    <item.icon size={18} />
                                    <span className="hidden sm:inline">{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Actions - Right Aligned */}
                    <div className="flex-1 flex items-center justify-end gap-3">
                        <Link href="/profile" className="no-underline group">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 hover:bg-secondary transition-colors border border-transparent hover:border-border">
                                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                                    {userEmail ? userEmail[0].toUpperCase() : 'U'}
                                </div>
                                <span className="text-sm font-medium text-foreground max-w-[100px] truncate hidden sm:block">
                                    {userEmail ? userEmail.split('@')[0] : 'Uživatel'}
                                </span>
                            </div>
                        </Link>

                        <div className="h-6 w-px bg-border mx-1"></div>

                        <ThemeToggle />

                        <button
                            onClick={handleLogout}
                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                            title="Odhlásit se"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
