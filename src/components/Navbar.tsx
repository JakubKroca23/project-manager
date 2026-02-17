'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Factory, Wrench, Calendar, Briefcase, User, LogOut, ShoppingCart, ChevronDown, Settings } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { ThemeToggle } from './ThemeToggle';
import { usePermissions } from '@/hooks/usePermissions';

const navItems = [
    { name: 'TIMELINE', icon: Calendar, href: '/', color: '#3b82f6' },
    {
        name: 'ZAKÁZKY',
        icon: Briefcase,
        href: '/projekty',
        color: '#3b82f6',
        militaryColor: '#10b981',
        submenu: [
            { name: 'CIVILNÍ', href: '/projekty?type=civil' },
            { name: 'ARMÁDNÍ', href: '/projekty?type=military' },
        ]
    },
    { name: 'SERVIS', icon: Wrench, href: '/servis', color: '#f59e0b' },
    { name: 'NÁKUP', icon: ShoppingCart, href: '/nakup', color: '#8d6e63' },
];
export function Navbar() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter(); // Use this if router is needed, otherwise remove. Added for safety based on import.
    const activeType = searchParams.get('type');
    const { checkPerm } = usePermissions();
    const filteredNavItems = navItems.filter(item => {
        switch (item.name) {
            case 'TIMELINE': return checkPerm('timeline');
            case 'ZAKÁZKY':
                const hasMainAccess = checkPerm('projects');
                const hasAnySubAccess = checkPerm('projects_civil') || checkPerm('projects_military');
                return hasMainAccess && hasAnySubAccess;
            case 'SERVIS': return checkPerm('service');
            case 'NÁKUP': return checkPerm('purchasing');
            default: return true;
        }
    });

    const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState<string>('');
    const [currentDate, setCurrentDate] = useState<string>('');
    const [userEmail, setUserEmail] = useState<string>('');
    const [systemVersion, setSystemVersion] = useState<string>('v1.0.0-alpha');

    // Active Category Label
    const activeCategory = activeType === 'military' ? 'ARMÁDA' : activeType === 'civil' ? 'CIVIL' : null;

    useEffect(() => {
        // Time/Date logic
        const updateTime = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' }));
            setCurrentDate(now.toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long' }));
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // User email logic
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.email) setUserEmail(user.email);
        };
        getUser();
    }, []);

    useEffect(() => {
        const fetchSystemInfo = async () => {
            const { data } = await supabase
                .from('app_settings')
                .select('settings')
                .eq('id', 'system_info')
                .maybeSingle();

            if (data) {
                const settings = data.settings as any;
                setSystemVersion(settings?.version || 'v1.0.0-alpha');
            }
        };
        fetchSystemInfo();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    return (
        <nav className="sticky top-0 z-50 w-full">
            <div className="mx-auto max-w-5xl px-4">
                <div
                    className="flex h-12 items-center justify-between gap-1 rounded-b-xl px-4 shadow-xl border-x border-b bg-background/95 backdrop-blur-sm"
                >
                    {/* Navigation Items - Left/Center */}
                    <div className="flex items-center gap-1">
                        {filteredNavItems.map((item) => {
                            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href)) || (item.name === 'ZAKÁZKY' && pathname?.startsWith('/projekty/'));
                            const isMilitary = item.name === 'ZAKÁZKY' && activeType === 'military';

                            // Determine active Color
                            let activeColor = item.color;
                            if (isMilitary && item.militaryColor) activeColor = item.militaryColor;

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
                                                "flex flex-col items-center justify-center px-3 py-1 rounded-md transition-all duration-200 uppercase whitespace-nowrap",
                                                isActive ? "bg-white/5" : "hover:bg-white/[0.02]"
                                            )}
                                            style={{
                                                color: isActive ? activeColor : undefined,
                                                backgroundColor: isActive ? `${activeColor}15` : undefined
                                            }}
                                        >
                                            <div className="flex items-center gap-2">
                                                <item.icon size={18} style={{ color: activeColor }} className="group-hover:opacity-100" />
                                                <span className="text-xs font-bold tracking-wider hidden sm:inline" style={{ color: isActive ? activeColor : undefined }}>{item.name}</span>
                                                <ChevronDown size={12} className={cn("transition-transform duration-200", openSubmenu === item.name && "rotate-180")} style={{ color: isActive ? activeColor : undefined }} />
                                            </div>
                                            {activeCategory && isActive && (
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-[-4px] z-10 flex justify-center pointer-events-none">
                                                    <span
                                                        className="text-[9px] font-bold tracking-[0.15em] uppercase animate-in fade-in slide-in-from-top-1 px-3 py-1 rounded-full bg-background border shadow-xl whitespace-nowrap"
                                                        style={{
                                                            color: activeColor,
                                                            borderColor: `${activeColor}33`,
                                                            boxShadow: `0 4px 12px ${activeColor}20`
                                                        }}
                                                    >
                                                        {activeCategory}
                                                    </span>
                                                </div>
                                            )}
                                        </button>

                                        <div
                                            className={cn(
                                                "absolute top-full left-1/2 -translate-x-1/2 pt-1 z-50 transition-all duration-300 ease-out",
                                                openSubmenu === item.name
                                                    ? "opacity-100 translate-y-0 pointer-events-auto"
                                                    : "opacity-0 -translate-y-2 pointer-events-none"
                                            )}
                                        >
                                            <div
                                                className="bg-background rounded-md shadow-2xl px-1.5 py-1 flex flex-row items-center gap-0.5 whitespace-nowrap min-w-max border mt-[-1px]"
                                            >
                                                {item.submenu.map((sub) => {
                                                    // Check submenu permissions if needed. 
                                                    // For now, if user has access to Parent 'ZAKÁZKY' (projects), they see the submenu.
                                                    // But we might want granular control: 'service' inside submenu might link to permission 'service'.

                                                    // Service logic removed

                                                    const isSubMilitary = sub.name === 'ARMÁDNÍ';
                                                    let subActiveColor = item.color;
                                                    if (isSubMilitary && item.militaryColor) subActiveColor = item.militaryColor;

                                                    const isSubActive =
                                                        (sub.href.includes('type=military') && activeType === 'military') ||
                                                        (sub.href.includes('type=civil') && activeType === 'civil');

                                                    return (
                                                        <Link
                                                            key={sub.name}
                                                            href={sub.href}
                                                            className={cn(
                                                                "text-[9px] font-bold tracking-[0.15em] transition-all uppercase px-2 py-1 rounded-md flex items-center justify-center border border-transparent",
                                                                isSubActive ? "text-white" : "text-gray-400"
                                                            )}
                                                            style={{
                                                                backgroundColor: isSubActive ? `${subActiveColor}33` : undefined,
                                                                color: isSubActive ? subActiveColor : undefined,
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                if (!isSubActive) {
                                                                    e.currentTarget.style.color = subActiveColor!;
                                                                    e.currentTarget.style.backgroundColor = `${subActiveColor}1a`;
                                                                    e.currentTarget.style.borderColor = `${subActiveColor}33`;
                                                                    e.currentTarget.style.boxShadow = `0 0 10px ${subActiveColor}33`;
                                                                }
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                if (!isSubActive) {
                                                                    e.currentTarget.style.color = 'rgb(156 163 175)';
                                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                                    e.currentTarget.style.borderColor = 'transparent';
                                                                    e.currentTarget.style.boxShadow = 'none';
                                                                }
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
                                        "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold tracking-wider transition-all duration-200 uppercase whitespace-nowrap border border-transparent",
                                        isActive ? "bg-white/5" : ""
                                    )}
                                    style={{
                                        color: isActive ? activeColor : undefined,
                                        backgroundColor: isActive ? `${activeColor}15` : undefined,
                                        borderColor: isActive ? `${activeColor}22` : 'transparent',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.backgroundColor = `${activeColor}10`;
                                            e.currentTarget.style.color = activeColor!;
                                            e.currentTarget.style.borderColor = `${activeColor}22`;
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                            e.currentTarget.style.color = 'rgb(156 163 175)';
                                            e.currentTarget.style.borderColor = 'transparent';
                                        }
                                    }}
                                >
                                    <item.icon size={18} style={{ color: activeColor }} />
                                    <span className="hidden sm:inline">{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Right Side Tools & Profile */}
                    <div className="flex items-center gap-3">
                        <div className="h-6 w-px bg-border/40" />
                        <div className="flex flex-col items-center justify-center">
                            <span className="text-[8px] font-bold text-muted-foreground tracking-[0.2em] leading-none uppercase mb-0.5">Vers</span>
                            <span className="text-[10px] font-black text-emerald-500 tracking-tighter leading-none">{systemVersion}</span>
                        </div>
                    </div>
                    <div className="h-6 w-px bg-border/40" />
                    <div className="flex flex-col items-end justify-center pr-3 border-r border-border/40">
                        <span className="text-[12px] font-black text-primary tracking-[0.35em] mr-[-0.35em] tabular-nums leading-none mb-1">
                            {currentTime}
                        </span>
                        <span className="text-[12px] font-black text-muted-foreground tracking-[0.05em] tabular-nums leading-none">
                            {currentDate}
                        </span>
                    </div>

                    <Link href="/profile" className="no-underline">
                        <div className="flex items-center px-4 py-1 rounded-md bg-[#0099ee] hover:bg-[#00aaff] transition-colors whitespace-nowrap">
                            <span className="text-white text-xs font-bold tracking-wider uppercase">
                                {userEmail ? userEmail.split('@')[0] : 'ContSystem'}
                            </span>
                        </div>
                    </Link>

                    <div className="flex items-center gap-2 pl-3 border-l border-border/40">
                        <Link href="/profile" title="Nastavení profilu">
                            <IconButton className="bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20 text-blue-400 hover:text-blue-300">
                                <Settings size={15} />
                            </IconButton>
                        </Link>

                        <ThemeToggle className="bg-muted hover:bg-muted/80 border-border text-foreground hover:text-foreground" />

                        <IconButton
                            onClick={handleLogout}
                            title="Odhlásit se"
                            className="bg-red-500/10 hover:bg-red-500/20 border-red-500/20 text-red-400 hover:text-red-300"
                        >
                            <LogOut size={15} />
                        </IconButton>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
}

function IconButton({ className, children, ...props }: IconButtonProps) {
    return (
        <button
            className={cn(
                "flex items-center justify-center w-6 h-6 rounded-md transition-all duration-200",
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}
