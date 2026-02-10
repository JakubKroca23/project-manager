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
        <nav className="sticky top-0 z-50 w-full">
            <div className="mx-auto max-w-4xl px-4">
                <div className="flex h-11 items-center justify-center gap-2 rounded-b-2xl px-4" style={{ backgroundColor: '#2d2d2d' }}>

                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition-all duration-200 uppercase whitespace-nowrap",
                                    isActive
                                        ? "text-[#00aaff]"
                                        : "text-gray-300 hover:text-white"
                                )}
                            >
                                <item.icon size={15} />
                                <span className="hidden sm:inline">{item.name}</span>
                            </Link>
                        );
                    })}

                    <Link href="/profile" className="no-underline">
                        <div className="flex items-center px-3 py-1 rounded-md bg-[#0099ee] hover:bg-[#00aaff] transition-colors whitespace-nowrap">
                            <span className="text-white text-xs font-bold tracking-wider uppercase">
                                {userEmail ? userEmail.split('@')[0] : 'ContSystem'}
                            </span>
                        </div>
                    </Link>

                    <div className="text-gray-300 hover:text-white">
                        <ThemeToggle />
                    </div>

                    <button
                        onClick={handleLogout}
                        className="p-1.5 text-gray-300 hover:text-red-400 transition-colors"
                        title="Odhlásit se"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
