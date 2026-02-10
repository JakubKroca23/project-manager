'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Factory, Wrench, Calendar, Briefcase, User, LogOut, ShoppingCart, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { ThemeToggle } from './ThemeToggle';

const navItems = [
    { name: 'TIMELINE', icon: Calendar, href: '/', color: '#ffcc80' },
    {
        name: 'PROJEKTY',
        icon: Briefcase,
        href: '/projekty',
        color: '#90caf9',
        militaryColor: '#a5d6a7',
        submenu: [
            { name: 'CIVILNÍ', href: '/projekty?type=civil' },
            { name: 'ARMÁDNÍ', href: '/projekty?type=military' },
        ]
    },
    { name: 'SERVIS', icon: Wrench, href: '/servis', color: '#ce93d8' },
    { name: 'VÝROBA', icon: Factory, href: '/vyroba', color: '#ef9a9a' },
    { name: 'NÁKUP', icon: ShoppingCart, href: '/nakup', color: '#80cbc4' },
];

const Navbar = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const typeParam = searchParams.get('type');
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
    const router = useRouter();

    // Determine current active category label
    const activeCategory = typeParam === 'military' ? 'ARMÁDNÍ' : (typeParam === 'civil' ? 'CIVILNÍ' : null);

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
        // Force a hard redirect to login and clear router cache
        window.location.href = '/login';
    };

    return (
        <nav className="sticky top-0 z-50 w-full">
            <div className="mx-auto max-w-5xl px-4">
                <div className="flex h-12 items-center justify-center gap-1 rounded-b-2xl px-4 shadow-xl" style={{ backgroundColor: '#1a1a1a', borderBottom: '1px solid #333' }}>

                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                        const isMilitary = item.name === 'PROJEKTY' && typeParam === 'military';
                        const activeColor = (isMilitary && item.militaryColor) ? item.militaryColor : item.color;

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
                                            "flex flex-col items-center justify-center px-3 py-1 rounded-lg transition-all duration-200 uppercase whitespace-nowrap",
                                            isActive ? "bg-white/5" : "hover:bg-white/[0.02]"
                                        )}
                                        style={{
                                            color: isActive ? activeColor : 'rgb(156 163 175)',
                                            backgroundColor: isActive ? `${activeColor}15` : undefined
                                        }}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            <item.icon size={14} style={{ color: activeColor }} className={cn(!isActive && "opacity-70 group-hover:opacity-100")} />
                                            <span className="text-xs font-bold tracking-wider hidden sm:inline" style={{ color: isActive ? activeColor : undefined }}>{item.name}</span>
                                            <ChevronDown size={12} className={cn("transition-transform duration-200", openSubmenu === item.name && "rotate-180")} style={{ color: isActive ? activeColor : undefined }} />
                                        </div>
                                        {activeCategory && isActive && (
                                            <span
                                                className={cn(
                                                    "text-[8px] font-black tracking-[0.1em] mt-0.5 animate-in fade-in slide-in-from-top-1"
                                                )}
                                                style={{ color: activeColor }}
                                            >
                                                {activeCategory}
                                            </span>
                                        )}
                                    </button>

                                    {/* Submenu Dropdown */}
                                    <div className={cn(
                                        "absolute top-full left-0 mt-0 pt-1 w-40 transition-all duration-200 origin-top transform",
                                        openSubmenu === item.name
                                            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                                            : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                                    )}>
                                        <div className="bg-[#1a1a1a] border border-[#333] rounded-xl shadow-2xl p-1.5 flex flex-col gap-0.5 overflow-hidden text-center">
                                            {item.submenu.map((sub) => {
                                                const isSubMilitary = sub.name === 'ARMÁDNÍ';
                                                const subActiveColor = isSubMilitary ? item.militaryColor : item.color;
                                                return (
                                                    <Link
                                                        key={sub.name}
                                                        href={sub.href}
                                                        className="px-3 py-2 rounded-lg text-[10px] font-black tracking-[0.15em] transition-all uppercase text-gray-400"
                                                        style={{
                                                            '--hover-color': subActiveColor,
                                                            '--hover-bg': `${subActiveColor}1a`
                                                        } as any}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.color = subActiveColor!;
                                                            e.currentTarget.style.backgroundColor = `${subActiveColor}1a`;
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.color = 'rgb(156 163 175)';
                                                            e.currentTarget.style.backgroundColor = 'transparent';
                                                        }}
                                                        onClick={() => setOpenSubmenu(null)}
                                                    >
                                                        {sub.name}
                                                    </Link>
                                                );
                                            })}
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
                                    isActive ? "bg-white/5" : "hover:bg-white/[0.02]"
                                )}
                                style={{
                                    color: isActive ? activeColor : 'rgb(156 163 175)',
                                    backgroundColor: isActive ? `${activeColor}15` : undefined
                                }}
                            >
                                <item.icon size={14} style={{ color: activeColor }} className={cn(!isActive && "opacity-70")} />
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
