'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Factory, Wrench, Calendar, Briefcase, User, LogOut, ShoppingCart, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { ThemeToggle } from './ThemeToggle';

const navItems = [
    { name: 'TIMELINE', icon: Calendar, href: '/' },
    {
        name: 'PROJEKTY',
        icon: Briefcase,
        href: '/projekty',
        submenu: [
            { name: 'CIVILNÍ', href: '/projekty?type=civil' },
            { name: 'ARMÁDNÍ', href: '/projekty?type=military' },
        ]
    },
    { name: 'SERVIS', icon: Wrench, href: '/servis' },
    { name: 'VÝROBA', icon: Factory, href: '/vyroba' },
    { name: 'NÁKUP', icon: ShoppingCart, href: '/nakup' },
];

const Navbar = () => {
    const pathname = usePathname();
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
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
            <div className="mx-auto max-w-5xl px-4">
                <div className="flex h-12 items-center justify-center gap-1 rounded-b-2xl px-4 shadow-xl" style={{ backgroundColor: '#1a1a1a', borderBottom: '1px solid #333' }}>

                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));

                        if (item.submenu) {
                            return (
                                <div
                                    key={item.name}
                                    className="relative group h-full flex items-center"
                                    onMouseEnter={() => setOpenSubmenu(item.name)}
                                    onMouseLeave={() => setOpenSubmenu(null)}
                                >
                                    <button
                                        className={cn(
                                            "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider transition-all duration-200 uppercase whitespace-nowrap",
                                            isActive
                                                ? "text-[#00aaff] bg-white/5"
                                                : "text-gray-400 hover:text-white"
                                        )}
                                    >
                                        <item.icon size={14} className="opacity-70 group-hover:opacity-100" />
                                        <span className="hidden sm:inline">{item.name}</span>
                                        <ChevronDown size={12} className={cn("transition-transform duration-200", openSubmenu === item.name && "rotate-180")} />
                                    </button>

                                    {/* Submenu Dropdown */}
                                    <div className={cn(
                                        "absolute top-full left-0 mt-0 pt-1 w-40 transition-all duration-200 origin-top transform",
                                        openSubmenu === item.name
                                            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                                            : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                                    )}>
                                        <div className="bg-[#1a1a1a] border border-[#333] rounded-xl shadow-2xl p-1.5 flex flex-col gap-0.5 overflow-hidden">
                                            {item.submenu.map((sub) => (
                                                <Link
                                                    key={sub.name}
                                                    href={sub.href}
                                                    className="px-3 py-2 rounded-lg text-[10px] font-black tracking-[0.15em] text-gray-400 hover:text-[#00aaff] hover:bg-[#00aaff]/10 transition-all uppercase"
                                                    onClick={() => setOpenSubmenu(null)}
                                                >
                                                    {sub.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider transition-all duration-200 uppercase whitespace-nowrap",
                                    isActive
                                        ? "text-[#00aaff] bg-white/5"
                                        : "text-gray-400 hover:text-white"
                                )}
                            >
                                <item.icon size={14} className="opacity-70" />
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
