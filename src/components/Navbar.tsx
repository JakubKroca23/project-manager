'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Factory, Wrench, Calendar, Briefcase, User, LogOut, ShoppingCart, ChevronDown, Search, X, Maximize2, FileUp, ZoomIn, ZoomOut, Settings2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { usePermissions } from '@/hooks/usePermissions';
import { useAdmin } from '@/hooks/useAdmin';
import { useSearch } from '@/providers/SearchProvider';
import { useActions } from '@/providers/ActionProvider';
import { Project } from '@/types/project';

import { ThemeToggle } from './ThemeToggle';

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
    const router = useRouter();
    const activeTypeFromParams = searchParams.get('type');
    const activeType = activeTypeFromParams || (pathname?.startsWith('/servis') ? 'service' : null);
    const { checkPerm, canImport } = usePermissions();
    const { isAdmin } = useAdmin();
    const { searchTerm, setSearchTerm } = useSearch();
    const { onFit, onJumpToToday, onZoomIn, onZoomOut, onToggleDesign, dayWidth, setIsImportWizardOpen, customToolbar, customLeftContent, detailInfo, detailActions } = useActions();

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
    const [searchResults, setSearchResults] = useState<Project[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    // Active Category Label
    const activeCategory = activeType === 'military' ? 'VOJENSKÉ' : activeType === 'civil' ? 'CIVIL' : activeType === 'service' ? 'SERVIS' : null;

    const isProjectsActive = pathname === '/projekty' || pathname?.startsWith('/projekty/');

    useEffect(() => {
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

    // Global Search Logic
    useEffect(() => {
        if (!searchTerm || searchTerm.length < 2) {
            setSearchResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const { data, error } = await supabase
                    .from('projects')
                    .select('id, name, customer, abra_project, serial_number, project_type, status, production_status')
                    .or(`id.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%,customer.ilike.%${searchTerm}%,abra_project.ilike.%${searchTerm}%,serial_number.ilike.%${searchTerm}%`)
                    .limit(8);

                if (!error && data) {
                    setSearchResults(data as Project[]);
                }
            } catch (err) {
                console.error('Search error:', err);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const activeColor = activeType === 'military' ? '#059669' : activeType === 'civil' ? '#2563eb' : activeType === 'service' ? '#9333ea' : null;

    return (
        <nav
            className="sticky top-0 z-[20000] w-full backdrop-blur-md border-b shadow-xl transition-all duration-500"
            style={{
                backgroundColor: activeColor ? `${activeColor}10` : 'hsl(var(--background) / 0.95)',
                borderColor: activeColor ? `${activeColor}20` : 'hsl(var(--border))'
            }}
        >
            <div className="w-full px-4">
                <div className="flex h-12 items-center justify-between gap-1">

                    {/* Left: Navigation + Page Tools */}
                    <div className="flex-1 flex items-center justify-start gap-1">
                        <div className="flex items-center mr-4 shrink-0 select-none">
                            <span className="text-[10px] font-black tracking-widest text-muted-foreground/80 uppercase italic">{systemVersion}</span>
                        </div>

                        {(() => {
                            const zakazkyItem = filteredNavItems.find(i => i.name === 'ZAKÁZKY');
                            const harmonogramItem = filteredNavItems.find(i => i.name === 'HARMONOGRAM');

                            const renderZakazky = () => {
                                if (!zakazkyItem) return null;
                                const item = zakazkyItem;
                                const isActive = isProjectsActive;
                                const isMilitary = activeType === 'military';
                                const isService = activeType === 'service';

                                let activeColor = item.color;
                                if (isMilitary && item.militaryColor) activeColor = item.militaryColor;
                                if (isService && item.serviceColor) activeColor = item.serviceColor;

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
                                                {activeCategory && isActive && (
                                                    <span
                                                        className="ml-1 text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-md border shadow-sm whitespace-nowrap bg-background"
                                                        style={{
                                                            color: activeColor,
                                                            borderColor: `${activeColor}44`,
                                                        }}
                                                    >
                                                        {activeCategory}
                                                    </span>
                                                )}
                                                <ChevronDown size={12} className={cn("transition-transform duration-200", openSubmenu === item.name && "rotate-180")} style={{ color: isActive ? activeColor : 'hsl(var(--foreground) / 0.7)' }} />
                                            </div>
                                        </button>

                                        <div
                                            className={cn(
                                                "absolute top-full left-0 pt-2 z-[20100] transition-all duration-300 ease-out",
                                                openSubmenu === item.name
                                                    ? "opacity-100 translate-y-0 pointer-events-auto"
                                                    : "opacity-0 -translate-y-2 pointer-events-none"
                                            )}
                                        >
                                            <div className="bg-background rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.15)] p-1.5 flex flex-row items-center gap-1.5 whitespace-nowrap min-w-max border border-border/60 backdrop-blur-md">
                                                {item.submenu!.map((sub) => {
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
                                                                    e.currentTarget.style.borderColor = `${subActiveColor}44`;
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
                            };

                            const renderHarmonogram = () => {
                                if (!harmonogramItem) return null;
                                const item = harmonogramItem;
                                const isActive = !isProjectsActive;

                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-1.5 px-6 py-1.5 rounded-lg text-xs font-black tracking-wider transition-all duration-200 uppercase whitespace-nowrap border-2",
                                            isActive ? "bg-primary/[0.08] shadow-sm border-primary/30" : "border-transparent text-foreground hover:bg-primary/5 hover:border-primary/20"
                                        )}
                                        style={{ color: isActive ? item.color : undefined }}
                                    >
                                        <item.icon size={19} style={{ color: isActive ? item.color : 'hsl(var(--foreground))' }} />
                                        <span className="hidden sm:inline">{item.name}</span>
                                    </Link>
                                );
                            };

                            return [renderHarmonogram(), renderZakazky()];
                        })()}

                        {/* Detail Info (Back Button) */}
                        {detailInfo && (
                            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-border/30 animate-in fade-in slide-in-from-left-2 duration-300">
                                {detailInfo}
                            </div>
                        )}

                        {/* Page specific tools */}
                        {!detailInfo && customLeftContent && (
                            <div className="flex items-center gap-1.5 ml-4 pl-4 border-l border-border/30 animate-in fade-in slide-in-from-left-1 duration-300">
                                {customLeftContent}
                            </div>
                        )}

                        {/* Auto-Fit Button (Moved from Center) */}
                        {onFit && !detailInfo && (
                            <button
                                onClick={onFit}
                                className="flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all active:scale-95 group shadow-sm flex-shrink-0 ml-4 animate-in fade-in"
                                title="Přizpůsobit zobrazení"
                            >
                                <Maximize2 size={14} className="group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap hidden sm:inline">PŘIZPŮSOBIT</span>
                            </button>
                        )}
                    </div>

                    {/* Center: Detail Actions Only */}
                    <div className="flex-shrink-0 flex items-center justify-center gap-4 min-w-0 px-2">
                        {detailActions && (
                            <div className="animate-in fade-in zoom-in-95 duration-300">
                                {detailActions}
                            </div>
                        )}
                    </div>

                    {/* Right: Global Tools & Profile */}
                    <div className="flex-1 flex items-center justify-end gap-3">

                        {/* Global Search (Always Visible) */}
                        <div className="hidden md:block w-full max-w-[200px] relative">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30 group-focus-within:text-primary transition-all duration-300" size={13} />
                                <input
                                    type="text"
                                    placeholder="VYHLEDAT..."
                                    className="w-full bg-foreground/[0.04] border border-foreground/10 rounded-xl py-1.5 pl-8 pr-8 text-[10px] font-black tracking-widest focus:outline-none focus:ring-4 focus:ring-primary/10 focus:bg-background focus:border-primary/40 transition-all duration-300 placeholder:text-foreground/20"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onFocus={() => setIsSearchFocused(true)}
                                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-primary transition-colors"
                                    >
                                        <X size={13} />
                                    </button>
                                )}
                            </div>

                            {/* Dropdown Results */}
                            {isSearchFocused && (searchTerm.length >= 2) && (
                                <div className="absolute top-full right-0 mt-2 w-[300px] bg-background border border-border/60 rounded-2xl shadow-2xl overflow-hidden z-[21000] animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-xl">
                                    <div className="p-2 border-b border-border/40 bg-muted/30">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Výsledky hledání</span>
                                    </div>
                                    <div className="max-h-[400px] overflow-y-auto p-1.5 space-y-1">
                                        {isSearching ? (
                                            <div className="flex items-center justify-center py-8">
                                                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                            </div>
                                        ) : searchResults.length > 0 ? (
                                            searchResults.map(result => (
                                                <button
                                                    key={result.id}
                                                    onClick={() => {
                                                        const path = result.project_type === 'service' ? `/servis/${result.id}` : `/projekty/${result.id}?type=${result.project_type || 'civil'}`;
                                                        router.push(path);
                                                        setSearchTerm('');
                                                        setIsSearchFocused(false);
                                                    }}
                                                    className="w-full flex flex-col gap-0.5 p-2.5 rounded-xl hover:bg-primary/5 transition-all text-left group border border-transparent hover:border-primary/10"
                                                >
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="text-xs font-black text-foreground group-hover:text-primary transition-colors line-clamp-1">{result.name}</span>
                                                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all">{result.id}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-bold text-muted-foreground/60 line-clamp-1">{result.customer || 'Bez klienta'}</span>
                                                        <div className="flex items-center gap-1.5 ml-auto">
                                                            <span className={cn(
                                                                "text-[8px] font-black uppercase tracking-widest px-1.5 py-0.25 rounded",
                                                                result.project_type === 'service' ? "bg-purple-500/10 text-purple-600" :
                                                                    result.project_type === 'military' ? "bg-emerald-500/10 text-emerald-600" :
                                                                        "bg-blue-500/10 text-blue-600"
                                                            )}>
                                                                {result.project_type || 'Civil'}
                                                            </span>
                                                            {(result.production_status || result.status) && (
                                                                <span className={cn(
                                                                    "text-[8px] font-bold uppercase tracking-tight px-1.5 py-0.25 rounded-full border",
                                                                    result.production_status === 'Dokončeno' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                                                                        result.production_status === 'V procesu' ? "bg-blue-500/10 text-blue-600 border-blue-500/20" :
                                                                            result.production_status === 'Čeká na díly' ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                                                                                "bg-muted text-muted-foreground border-border/40"
                                                                )}>
                                                                    {result.production_status || result.status}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="py-8 text-center">
                                                <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Nebylo nic nalezeno</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {customToolbar && (
                            <div className="flex items-center gap-2 pr-4 border-r border-border/30 animate-in fade-in slide-in-from-right-1 duration-300">
                                {customToolbar}
                            </div>
                        )}

                        <ThemeToggle className="hover:bg-primary/10 border-border/40" />

                        <div className="flex items-center gap-1.5">
                            {onJumpToToday && (
                                <button
                                    onClick={onJumpToToday}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-sm"
                                    title="Skočit na dnešek"
                                >
                                    <Calendar size={13} />
                                    <span className="hidden xl:inline">Dnes</span>
                                </button>
                            )}

                            {canImport && isAdmin && !detailInfo && (
                                <button
                                    onClick={() => setIsImportWizardOpen(true)}
                                    className={cn(
                                        "p-2 rounded-md transition-all active:scale-95",
                                        "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border border-emerald-500/20"
                                    )}
                                    title="Importní Průvodce (Excel)"
                                >
                                    <FileUp size={16} />
                                </button>
                            )}

                            {onToggleDesign && isAdmin && !detailInfo && (
                                <button
                                    onClick={onToggleDesign}
                                    className={cn(
                                        "p-2 rounded-md transition-all active:scale-95",
                                        "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border border-emerald-500/20"
                                    )}
                                    title="Nastavení vzhledu"
                                >
                                    <Settings2 size={16} />
                                </button>
                            )}

                            <Link href="/profile" className="no-underline ml-2">
                                <div className="flex items-center px-4 py-1.5 rounded-xl bg-primary text-primary-foreground hover:opacity-95 transition-all whitespace-nowrap shadow-lg shadow-primary/20">
                                    <span className="text-white text-[10px] font-black tracking-widest uppercase">
                                        {userEmail ? userEmail.split('@')[0] : 'Uživatel'}
                                    </span>
                                </div>
                            </Link>
                        </div>

                        <div className="flex items-center gap-2 pl-3 border-l border-border/50">
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
