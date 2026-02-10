'use client';

import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { User, LogOut, Loader2, Shield, Moon, Sun, Monitor, Bell, Palette, Settings, Users, Key, AlertTriangle, Clock } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';

export default function ProfilePage() {
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const { profiles, currentUserProfile, isAdmin, isLoading, updatePermission } = useAdmin();
    const [notifications, setNotifications] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('notifications_enabled') !== 'false';
        }
        return true;
    });

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    const toggleNotifications = () => {
        const newVal = !notifications;
        setNotifications(newVal);
        localStorage.setItem('notifications_enabled', String(newVal));
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    if (!currentUserProfile) {
        return (
            <div className="flex flex-col h-screen items-center justify-center gap-4">
                <p className="text-muted-foreground">Profil nebyl nalezen. Zkuste se přihlásit znovu.</p>
                <button onClick={handleLogout} className="text-primary hover:underline flex items-center gap-2">
                    <LogOut size={16} /> Odhlásit se
                </button>
            </div>
        );
    }

    return (
        <div className="h-full overflow-auto">
            <div className="max-w-2xl mx-auto w-full py-4 space-y-6">

                {/* User Card */}
                <div className="bg-card border border-border rounded-xl p-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                            <User size={32} />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-bold text-foreground">
                                {currentUserProfile.email.split('@')[0]}
                            </h2>
                            <p className="text-sm text-muted-foreground">{currentUserProfile.email}</p>
                            <div className="flex flex-wrap gap-2 mt-1.5">
                                <div className="flex items-center gap-2 text-[10px] font-semibold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded w-fit uppercase tracking-tight">
                                    <Shield size={10} />
                                    <span>Authenticated</span>
                                </div>
                                {isAdmin && (
                                    <div className="flex items-center gap-2 text-[10px] font-semibold text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 rounded w-fit uppercase tracking-tight">
                                        <Key size={10} />
                                        <span>System Admin</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- ADMIN SECTION --- */}
                {isAdmin && (
                    <div className="bg-card border border-primary/20 rounded-xl p-6 space-y-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                <Users size={16} className="text-primary" />
                                <span>Správa uživatelských práv</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded text-uppercase">Admin panel</span>
                        </div>

                        <div className="divide-y divide-border border rounded-lg overflow-hidden bg-background/50">
                            {profiles.length > 0 ? (
                                profiles.map((profile) => (
                                    <div key={profile.id} className={`p-3 flex items-center justify-between hover:bg-muted/30 transition-colors ${profile.access_requested ? 'bg-amber-500/5 border-l-4 border-l-amber-500' : ''}`}>
                                        <div className="flex flex-col gap-0.5">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-foreground truncate max-w-[200px] sm:max-w-none">
                                                    {profile.email}
                                                </span>
                                                {profile.access_requested && (
                                                    <span className="flex items-center gap-1 text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 rounded uppercase animate-pulse">
                                                        <AlertTriangle size={10} />
                                                        <span>Žádá o přístup</span>
                                                    </span>
                                                )}
                                            </div>
                                            {profile.email === 'jakub.kroca@contsystem.cz' && (
                                                <span className="text-[10px] text-primary font-bold">Hlavní Admin</span>
                                            )}
                                            {profile.access_requested && profile.last_request_at && (
                                                <span className="text-[9px] text-muted-foreground flex items-center gap-1">
                                                    <Clock size={10} />
                                                    {new Date(profile.last_request_at).toLocaleString('cs-CZ')}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col items-end gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] text-muted-foreground font-medium">Povolit import</span>
                                                    <button
                                                        onClick={() => updatePermission(profile.id, !profile.can_import)}
                                                        disabled={profile.email === 'jakub.kroca@contsystem.cz'}
                                                        className={`relative w-8 h-4.5 rounded-full transition-colors ${profile.can_import ? 'bg-primary' : 'bg-muted'} ${profile.email === 'jakub.kroca@contsystem.cz' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        <div className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform ${profile.can_import ? 'translate-x-3.5' : 'translate-x-0'}`} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 text-center text-sm text-muted-foreground">Žádní uživatelé k zobrazení.</div>
                            )}
                        </div>
                    </div>
                )}

                {/* Vzhled */}
                <div className="bg-card border border-border rounded-xl p-6 space-y-5">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Palette size={16} />
                        <span>Vzhled systému</span>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-foreground">Barevný motiv</p>
                                <p className="text-xs text-muted-foreground">Přizpůsobení barvy rozhraní</p>
                            </div>
                            <div className="flex items-center gap-1 bg-muted/80 backdrop-blur-sm rounded-lg p-1">
                                <button
                                    onClick={() => setTheme('light')}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${theme === 'light' ? 'bg-background shadow-md text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    <Sun size={14} />
                                    <span className="hidden sm:inline">Světlý</span>
                                </button>
                                <button
                                    onClick={() => setTheme('dark')}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${theme === 'dark' ? 'bg-background shadow-md text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    <Moon size={14} />
                                    <span className="hidden sm:inline">Tmavý</span>
                                </button>
                                <button
                                    onClick={() => setTheme('system')}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${theme === 'system' ? 'bg-background shadow-md text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    <Monitor size={14} />
                                    <span className="hidden sm:inline">Systém</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notifikace */}
                <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Bell size={16} />
                        <span>Notifikace</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-foreground">Upozornění v aplikaci</p>
                            <p className="text-xs text-muted-foreground">Povolit informační zprávy o projektech</p>
                        </div>
                        <button
                            onClick={toggleNotifications}
                            className={`relative w-10 h-5.5 rounded-full transition-colors ${notifications ? 'bg-primary' : 'bg-muted'}`}
                        >
                            <div className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-transform ${notifications ? 'translate-x-4.5' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </div>

                {/* Account Actions */}
                <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Settings size={16} />
                        <span>Účet a bezpečnost</span>
                    </div>

                    <div className="bg-muted/50 p-3 rounded-lg text-[11px] text-muted-foreground space-y-1.5">
                        <div className="flex justify-between border-b border-border/50 pb-1.5 last:border-0 last:pb-0">
                            <span>User ID</span>
                            <span className="font-mono">{currentUserProfile.id}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors font-medium text-sm border border-red-200 dark:border-red-900"
                    >
                        <LogOut size={16} />
                        <span>Odhlásit se</span>
                    </button>
                </div>

            </div>
        </div>
    );
}
