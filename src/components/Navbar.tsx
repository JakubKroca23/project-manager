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
    { name: 'TIMELINE', icon: Calendar, href: '/', color: '#bae6fd' },
    {
        name: 'ZAKÁZKY',
        icon: Briefcase,
        href: '/projekty',
        color: '#0277bd', // Saturated Civil Blue
        militaryColor: '#2e7d32', // Deep Military Green
        serviceColor: '#8e24aa', // Saturated Service Purple
        submenu: [
            { name: 'SERVIS', href: '/servis' },
            { name: 'CIVILNÍ', href: '/projekty?type=civil' },
            { name: 'ARMÁDNÍ', href: '/projekty?type=military' },
        ]
    },
    { name: 'VÝROBA', icon: Factory, href: '/vyroba', color: '#ef9a9a' },
    { name: 'NÁKUP', icon: ShoppingCart, href: '/nakup', color: '#80cbc4' },
];

const IconButton = ({ children, onClick, title, className }: { children: React.ReactNode, onClick?: () => void, title?: string, className?: string }) => (
    <button
        onClick={onClick}
        className={cn(
            "w-7 h-7 flex items-center justify-center rounded-md transition-all duration-200 bg-white/5 hover:bg-white/10 active:scale-95 text-gray-400 hover:text-white border border-white/10",
            className
        )}
        title={title}
    >
        {children}
    </button>
);

const Navbar = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const typeParam = searchParams.get('type');
    const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
    const router = useRouter();

    const [currentTime, setCurrentTime] = useState('');
    const [currentDate, setCurrentDate] = useState('');

    const [inferredType, setInferredType] = useState<string | null>(null);
    const { permissions, checkPerm } = usePermissions();

    const userEmail = permissions?.email || null;

    // Determine current active category label
    const activeType = typeParam || inferredType;
    const activeCategory =
        activeType === 'military' ? 'ARMÁDNÍ' :
            (activeType === 'civil' ? 'CIVILNÍ' :
                (activeType === 'service' || pathname === '/servis' ? 'SERVIS' : null));

    useEffect(() => {
        const fetchInferredType = async () => {
            const projectDetailMatch = pathname?.match(/^\/projekty\/([^\/?]+)/);
            const isProjectDetail = !!projectDetailMatch && pathname !== '/projekty';

            if (isProjectDetail) {
                const projectId = projectDetailMatch[1];
                const { data } = await supabase
                    .from('projects')
                    .select('project_type')
                    .eq('id', projectId)
                    .single();

                if (data?.project_type) {
                    setInferredType(data.project_type);
                }
            } else {
                setInferredType(null);
            }
        };

        fetchInferredType();
    }, [pathname]);

    useEffect(() => {
        // Update time and date
        const updateDateTime = () => {
            const now = new Date();
            setCurrentDate(now.toLocaleDateString('cs-CZ', {
                day: 'numeric',
                month: 'numeric',
                year: 'numeric'
            }));
            setCurrentTime(
                now.getHours().toString().padStart(2, '0') + ':' +
                now.getMinutes().toString().padStart(2, '0')
            );
        };

        updateDateTime();
        const interval = setInterval(updateDateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        // Force a hard redirect to login and clear router cache
        window.location.href = '/login';
    };

    // Filter nav items based on permissions
    const filteredNavItems = navItems.filter(item => {
        switch (item.name) {
            case 'TIMELINE': return checkPerm('timeline');
            case 'ZAKÁZKY':
                const hasMainAccess = checkPerm('projects');
                const hasAnySubAccess = checkPerm('projects_civil') || checkPerm('projects_military') || checkPerm('service');
                return hasMainAccess && hasAnySubAccess;
            case 'VÝROBA': return checkPerm('production');
            case 'NÁKUP': return checkPerm('purchasing');
            default: return true;
        }
    });

    return (
        <nav className="sticky top-0 z-50 w-full">
            <div className="mx-auto max-w-5xl px-4">
                <div
                    className="flex h-12 items-center justify-between gap-1 rounded-b-xl px-4 shadow-xl bg-[#1a1a1a] border-b border-[#333]"
                >
                    {/* Navigation Items - Left/Center */}
                    <div className="flex h-full items-center mr-auto">
                        {navItems.filter(item => {
                            if (item.name === 'TIMELINE') return checkPerm('timeline') !== false;
                            if (item.name === 'ZAKÁZKY') return checkPerm('projects') !== false || checkPerm('service') !== false;
                            if (item.name === 'VÝROBA') return checkPerm('production') !== false;
                            if (item.name === 'NÁKUP') return checkPerm('nakup') !== false;
                            return true;
                        }).map((item) => {
                            const isActive = pathname === item.href || (item.submenu && item.submenu.some(sub => pathname === sub.href || (searchParams.get('type') && sub.href.includes(searchParams.get('type')!)))) || (item.name === 'ZAKÁZKY' && inferredType);
                            const isMilitary = item.name === 'ZAKÁZKY' && activeType === 'military';
                            const isService = item.name === 'ZAKÁZKY' && (pathname === '/servis' || activeType === 'service');

                            // Determine active color based on type
                            let activeColor = item.color;
                            if (isMilitary && item.militaryColor) activeColor = item.militaryColor;
                            if (isService && item.serviceColor) activeColor = item.serviceColor;

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
                                                color: isActive ? activeColor : 'rgb(156 163 175)',
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
                                                        className="text-[9px] font-bold tracking-[0.15em] uppercase animate-in fade-in slide-in-from-top-1 px-3 py-1 rounded-full bg-[#1a1a1a] border shadow-xl whitespace-nowrap"
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
                                                className="bg-[#1a1a1a] rounded-md shadow-2xl px-1.5 py-1 flex flex-row items-center gap-0.5 whitespace-nowrap min-w-max border border-[#333] mt-[-1px]"
                                            >
                                                {item.submenu.map((sub) => {
                                                    const isSubMilitary = sub.name === 'ARMÁDNÍ';
                                                    const isSubService = sub.name === 'SERVIS';
                                                    const isSubCivil = sub.name === 'CIVILNÍ';

                                                    // Logic to hide specific submenu items based on permissions
                                                    if (isSubService && checkPerm('service') === false) return null;
                                                    if (isSubMilitary && checkPerm('projects_military') === false) return null;
                                                    if (isSubCivil && checkPerm('projects_civil') === false) return null;

                                                    let subActiveColor = item.color;
                                                    if (isSubMilitary && item.militaryColor) subActiveColor = item.militaryColor;
                                                    if (isSubService && item.serviceColor) subActiveColor = item.serviceColor;

                                                    const isSubActive =
                                                        (sub.href === '/servis' && (pathname === '/servis' || activeType === 'service')) ||
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
                                        color: isActive ? activeColor : 'rgb(156 163 175)',
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
                        <div className="h-6 w-px bg-white/10" />
                        <div className="flex flex-col items-end justify-center pr-3 border-r border-white/10">
                            <span className="text-[12px] font-black text-[#0099ee] tracking-[0.35em] mr-[-0.35em] tabular-nums leading-none mb-1">
                                {currentTime}
                            </span>
                            <span className="text-[12px] font-black text-gray-400 tracking-[0.05em] tabular-nums leading-none">
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

                        <div className="flex items-center gap-2 pl-3 border-l border-white/10">
                            <Link href="/profile" title="Nastavení profilu">
                                <IconButton className="bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20 text-blue-400 hover:text-blue-300">
                                    <Settings size={15} />
                                </IconButton>
                            </Link>

                            <ThemeToggle className="bg-white/10 hover:bg-white/20 border-white/20 text-white hover:text-white" />

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
            </div>
        </nav>
    );
};

export default Navbar;
