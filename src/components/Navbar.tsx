'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Factory, Wrench, Calendar, Briefcase, User, LogOut, ShoppingCart, ChevronDown, Settings } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { ThemeToggle } from './ThemeToggle';

const navItems = [
    { name: 'TIMELINE', icon: Calendar, href: '/', color: '#ffcc80' },
    {
        name: 'ZAKÁZKY',
        icon: Briefcase,
        href: '/projekty',
        color: '#90caf9',
        militaryColor: '#a5d6a7',
        serviceColor: '#ce93d8', // Added specific color for service submenu
        submenu: [
            { name: 'SERVIS', href: '/servis' }, // Moved here
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
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
    const router = useRouter();

    const [currentTime, setCurrentTime] = useState('');
    const [currentDate, setCurrentDate] = useState('');

    // Determine current active category label
    const activeCategory =
        typeParam === 'military' ? 'ARMÁDNÍ' :
            (typeParam === 'civil' ? 'CIVILNÍ' :
                (pathname === '/servis' ? 'SERVIS' : null));

    const [userProfile, setUserProfile] = useState<any>(null);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.email) {
                setUserEmail(user.email);

                // Fetch full profile for permissions
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    setUserProfile(profile);
                }
            }
        };
        getUser();

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

    // Helper function to check permissions
    const checkPerm = (key: string) => {
        // Always allow if no profile loaded yet (prevent flickering) or if admin
        if (!userProfile) return true;
        if (userEmail === 'jakub.kroca@contsystem.cz') return true;

        const perms = userProfile.permissions || {};
        // Default to true if permissions column doesn't exist yet/is null, 
        // essentially allow everything unless explicitly set to false
        return perms[key] !== false;
    };

    // Filter nav items based on permissions
    const filteredNavItems = navItems.filter(item => {
        switch (item.name) {
            case 'TIMELINE': return checkPerm('timeline');
            case 'ZAKÁZKY': return checkPerm('projects');
            case 'VÝROBA': return checkPerm('production');
            case 'NÁKUP': return checkPerm('purchasing');
            default: return true;
        }
    });

    return (
        <nav className="sticky top-0 z-50 w-full">
            <div className="mx-auto max-w-5xl px-4">
                <div
                    className="flex h-12 items-center justify-between gap-1 rounded-b-xl px-4 shadow-xl"
                    style={{ backgroundColor: '#1a1a1a', borderBottom: '1px solid #333' }}
                >
                    {/* Navigation Items - Left/Center */}
                    <div className="flex items-center gap-1">
                        {filteredNavItems.map((item) => {
                            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href)) || (item.name === 'ZAKÁZKY' && pathname === '/servis');
                            const isMilitary = item.name === 'ZAKÁZKY' && typeParam === 'military';
                            const isService = item.name === 'ZAKÁZKY' && pathname === '/servis';

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
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-10 flex justify-center pointer-events-none">
                                                    <span
                                                        className="text-[9px] font-bold tracking-[0.15em] uppercase animate-in fade-in slide-in-from-top-1 px-2 py-1 rounded-md bg-[#1a1a1a] border shadow-xl whitespace-nowrap"
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
                                                    // Check submenu permissions if needed. 
                                                    // For now, if user has access to Parent 'ZAKÁZKY' (projects), they see the submenu.
                                                    // But we might want granular control: 'service' inside submenu might link to permission 'service'.

                                                    const isSubMilitary = sub.name === 'ARMÁDNÍ';
                                                    const isSubService = sub.name === 'SERVIS';

                                                    // Logic to hide specific submenu items based on permissions
                                                    if (isSubService && checkPerm('service') === false) return null;
                                                    // We could add 'military' / 'civil' permissions later if needed

                                                    let subActiveColor = item.color;
                                                    if (isSubMilitary && item.militaryColor) subActiveColor = item.militaryColor;
                                                    if (isSubService && item.serviceColor) subActiveColor = item.serviceColor;

                                                    const isSubActive =
                                                        (sub.href === '/servis' && pathname === '/servis') ||
                                                        (sub.href.includes('type=military') && typeParam === 'military') ||
                                                        (sub.href.includes('type=civil') && typeParam === 'civil');

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
