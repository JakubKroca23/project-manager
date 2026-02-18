'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Factory, Wrench, Calendar, Briefcase, User, LogOut, ShoppingCart, ChevronDown, Search, X, Maximize2, FileUp } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { usePermissions } from '@/hooks/usePermissions';
import { useSearch } from '@/providers/SearchProvider';
import { useActions } from '@/providers/ActionProvider';

const navItems = [
    {
        name: 'ZAKÁZKY',
        icon: Briefcase,
        href: '/projekty',
        color: '#2563eb', // Blue-600 for better contrast
        militaryColor: '#059669', // Emerald-600
        serviceColor: '#9333ea', // Purple-600
        submenu: [
            { name: 'CIVILNÍ', href: '/projekty?type=civil' },
            { name: 'VOJENSKÉ', href: '/projekty?type=military' },
            { name: 'SERVIS', href: '/projekty?type=service' },
        ]
    },
    { name: 'HARMONOGRAM', icon: Calendar, href: '/', color: '#2563eb' },
];
export function Navbar() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter(); // Use this if router is needed, otherwise remove. Added for safety based on import.
    const activeTypeFromParams = searchParams.get('type');
    const activeType = activeTypeFromParams || (pathname?.startsWith('/servis') ? 'service' : null);
    const { checkPerm, canImport } = usePermissions();
    const { searchTerm, setSearchTerm } = useSearch();
    const { onFit, setIsImportWizardOpen } = useActions();
    const filteredNavItems = navItems.filter(item => {
        switch (item.name) {
            case 'HARMONOGRAM': return checkPerm('timeline');
            case 'ZAKÁZKY':
                const hasMainAccess = checkPerm('projects');
                const hasAnySubAccess = checkPerm('projects_civil') || checkPerm('projects_military') || checkPerm('service');
                return hasMainAccess && hasAnySubAccess;
            default: return true;
        }
    });

    const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string>('');
    const [systemVersion, setSystemVersion] = useState<string>('v1.0.0-alpha');

    // Active Category Label
    const activeCategory = activeType === 'military' ? 'VOJENSKÉ' : activeType === 'civil' ? 'CIVIL' : activeType === 'service' ? 'SERVIS' : null;



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
        window.location.href = '/login';
    };

    const activeColor = activeType === 'military' ? '#059669' : activeType === 'civil' ? '#2563eb' : activeType === 'service' ? '#9333ea' : null;

    return (
        <nav
            className="sticky top-0 z-50 w-full backdrop-blur-md border-b shadow-xl transition-all duration-500"
            style={{
                backgroundColor: activeColor ? `${activeColor}10` : 'hsl(var(--background) / 0.95)',
                borderColor: activeColor ? `${activeColor}20` : 'hsl(var(--border))'
            }}
        >
            <div className="w-full px-4">
                <div
                    className="flex h-12 items-center justify-between gap-1"
                >
                    {/* Navigation Items - Left Aligned Menu */}
                    {/* Left: Zakázky */}
                    <div className="flex-1 flex items-center justify-start gap-1">
                        {filteredNavItems.filter(i => i.name === 'ZAKÁZKY').map((item) => {
                            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href)) || (item.name === 'ZAKÁZKY' && pathname?.startsWith('/projekty/'));
                            const isMilitary = item.name === 'ZAKÁZKY' && activeType === 'military';
                            const isService = item.name === 'ZAKÁZKY' && activeType === 'service';

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
                                                "relative flex flex-col items-center justify-center px-4 py-1.5 rounded-lg transition-all duration-200 uppercase whitespace-nowrap border-2",
                                                isActive ? "bg-primary/[0.08] shadow-sm" : "hover:bg-primary/5 border-transparent"
                                            )}
                                            style={{
                                                color: isActive ? activeColor : 'hsl(var(--foreground))',
                                                borderColor: isActive ? `${activeColor}44` : 'transparent',
                                            }}
                                        >
                                            <div className="flex items-center gap-2">
                                                <item.icon size={19} style={{ color: isActive ? activeColor : 'hsl(var(--foreground))' }} className="group-hover:opacity-100" />
                                                <span className="text-[13px] font-black tracking-tight hidden sm:inline">{item.name}</span>
                                                <ChevronDown size={12} className={cn("transition-transform duration-200", openSubmenu === item.name && "rotate-180")} style={{ color: isActive ? activeColor : 'hsl(var(--foreground) / 0.7)' }} />
                                            </div>
                                            {activeCategory && isActive && (
                                                <div className="absolute top-[110%] left-1/2 -translate-x-1/2 z-10 flex justify-center pointer-events-none">
                                                    <span
                                                        className="text-[9px] font-black tracking-widest uppercase animate-in fade-in slide-in-from-top-1 px-3 py-1 rounded-lg bg-background border shadow-xl shadow-black/10 whitespace-nowrap"
                                                        style={{
                                                            color: activeColor,
                                                            borderColor: activeColor,
                                                            backgroundColor: 'white' // Force white background for maximum opacity
                                                        }}
                                                    >
                                                        {activeCategory}
                                                    </span>
                                                </div>
                                            )}
                                        </button>

                                        <div
                                            className={cn(
                                                "absolute top-full left-0 pt-2 z-50 transition-all duration-300 ease-out",
                                                openSubmenu === item.name
                                                    ? "opacity-100 translate-y-0 pointer-events-auto"
                                                    : "opacity-0 -translate-y-2 pointer-events-none"
                                            )}
                                        >
                                            <div
                                                className="bg-background rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.15)] p-1.5 flex flex-row items-center gap-1.5 whitespace-nowrap min-w-max border border-border/60 backdrop-blur-md"
                                            >
                                                {item.submenu.map((sub) => {
                                                    const isSubMilitary = sub.name === 'VOJENSKÉ';
                                                    const isSubService = sub.name === 'SERVIS';
                                                    let subActiveColor = item.color;
                                                    if (isSubMilitary && item.militaryColor) subActiveColor = item.militaryColor;
                                                    if (isSubService && item.serviceColor) subActiveColor = item.serviceColor;

                                                    const isSubActive =
                                                        (sub.href.includes('type=military') && activeType === 'military') ||
                                                        (sub.href.includes('type=civil') && activeType === 'civil') ||
                                                        (sub.href.includes('type=service') && activeType === 'service');

                                                    return (
                                                        <Link
                                                            key={sub.name}
                                                            href={sub.href}
                                                            className={cn(
                                                                "text-[10px] font-black tracking-[0.2em] transition-all uppercase px-4 py-2 rounded-md flex items-center justify-center border",
                                                                isSubActive
                                                                    ? "shadow-sm border-current bg-background"
                                                                    : "text-foreground border-transparent hover:bg-foreground/[0.08]"
                                                            )}
                                                            style={{
                                                                backgroundColor: isSubActive ? `${subActiveColor}20` : undefined,
                                                                color: isSubActive ? subActiveColor : undefined,
                                                                borderColor: isSubActive ? `${subActiveColor}40` : undefined,
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                if (!isSubActive) {
                                                                    e.currentTarget.style.color = subActiveColor!;
                                                                    e.currentTarget.style.backgroundColor = `${subActiveColor}15`;
                                                                    e.currentTarget.style.borderColor = `${subActiveColor}40`;
                                                                }
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                if (!isSubActive) {
                                                                    e.currentTarget.style.color = 'hsl(var(--foreground))';
                                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                                    e.currentTarget.style.borderColor = 'transparent';
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
                            return null;
                        })}
                    </div>

                    {/* Center: Harmonogram */}
                    <div className="flex-none flex items-center justify-center gap-1">
                        {filteredNavItems.filter(i => i.name === 'HARMONOGRAM').map((item) => {
                            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                            let activeColor = item.color;

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-1.5 px-6 py-1.5 rounded-md text-xs font-bold tracking-wider transition-all duration-200 uppercase whitespace-nowrap border",
                                        isActive ? "bg-primary/10 border-primary/30" : "border-transparent text-foreground hover:bg-primary/5 hover:border-primary/20"
                                    )}
                                    style={{
                                        color: isActive ? activeColor : undefined,
                                    }}
                                >
                                    <item.icon size={18} style={{ color: isActive ? activeColor : 'hsl(var(--foreground))' }} />
                                    <span className="hidden sm:inline">{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Right: Search & Tools */}
                    <div className="flex-1 flex items-center justify-end gap-3">
                        {/* Search Field */}
                        <div className="max-w-xs w-full px-2">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40 group-focus-within:text-blue-600 transition-all duration-300" size={14} />
                                <input
                                    type="text"
                                    placeholder="Hledat..."
                                    className="w-full bg-foreground/[0.03] border border-foreground/15 rounded-full py-1.5 pl-9 pr-9 text-[11px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-background focus:border-blue-500 transition-all duration-300 placeholder:text-foreground/40"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-blue-600 transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Fit Button */}
                        {onFit && (
                            <button
                                onClick={onFit}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/40 border border-border/40 text-muted-foreground text-[10px] font-bold uppercase tracking-wider hover:bg-muted hover:text-foreground transition-all active:scale-95 group"
                                title="Přizpůsobit zobrazení"
                            >
                                <Maximize2 size={14} className="group-hover:scale-110 transition-transform" />
                                <span className="hidden sm:inline">Přizpůsobit</span>
                            </button>
                        )}

                        {/* Import Button */}
                        {canImport && (
                            <button
                                onClick={() => setIsImportWizardOpen(true)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/40 border border-border/40 text-muted-foreground text-[10px] font-bold uppercase tracking-wider hover:bg-muted hover:text-foreground transition-all active:scale-95 group"
                                title="Importní Průvodce (Excel)"
                            >
                                <FileUp size={14} className="group-hover:scale-110 transition-transform" />
                                <span className="hidden sm:inline">Import</span>
                            </button>
                        )}

                        <div className="flex flex-col items-center justify-center">
                            <span className="text-[10px] font-black text-emerald-500 tracking-tighter leading-none">{systemVersion}</span>
                        </div>

                        <Link href="/profile" className="no-underline">
                            <div className="flex items-center px-4 py-1 rounded-md bg-[#0099ee] hover:bg-[#00aaff] transition-colors whitespace-nowrap">
                                <span className="text-white text-xs font-bold tracking-wider uppercase">
                                    {userEmail ? userEmail.split('@')[0] : 'ContSystem'}
                                </span>
                            </div>
                        </Link>

                        <div className="flex items-center gap-2 pl-3 border-l border-border">
                            <IconButton
                                onClick={handleLogout}
                                title="Odhlásit se"
                                className="bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20 text-rose-600 hover:text-rose-700"
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
