'use client';

import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { User, LogOut, Loader2, Shield, Moon, Sun, Monitor, Bell, Palette, Settings, Users, Key, AlertTriangle, Clock, KeyRound, CheckCircle, X, UserPlus } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const { profiles, userRequests, currentUserProfile, isAdmin, isLoading, updatePermission, resetPasswordRequest, processUserRequest } = useAdmin();
    const [showSettings, setShowSettings] = useState(false);
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
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0 border-2 border-primary/20">
                            <User size={40} />
                        </div>
                        <div className="flex-1 text-center sm:text-left space-y-1">
                            <h2 className="text-2xl font-bold text-foreground">
                                {currentUserProfile.email.split('@')[0]}
                            </h2>
                            <p className="text-sm font-medium text-muted-foreground">{currentUserProfile.email}</p>
                            <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                                <span className="text-[10px] font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded border border-border/50">
                                    ID: {currentUserProfile.id}
                                </span>
                            </div>
                            <div className="flex flex-wrap justify-center sm:justify-start gap-3 pt-3">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-white bg-emerald-600 px-2.5 py-1 rounded-md w-fit uppercase tracking-widest shadow-sm">
                                    <Shield size={10} />
                                    <span>Authenticated</span>
                                </div>
                                {isAdmin && (
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-white bg-indigo-600 px-2.5 py-1 rounded-md w-fit uppercase tracking-widest shadow-sm">
                                        <Key size={10} />
                                        <span>Admin</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5 shrink-0">
                            <button
                                onClick={handleLogout}
                                className="flex items-center justify-center gap-2 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all font-bold text-[11px] shadow-md shadow-red-600/20 active:scale-[0.98] uppercase tracking-wider"
                            >
                                <LogOut size={14} />
                                <span>Odhlásit se</span>
                            </button>
                            <button
                                onClick={() => setShowSettings(true)}
                                className="flex items-center justify-center gap-2 px-4 py-1.5 bg-muted/60 hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-lg transition-all font-bold text-[11px] border border-border/40 active:scale-[0.98] uppercase tracking-wider backdrop-blur-sm"
                            >
                                <Settings size={14} />
                                <span>Nastavení</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Settings Popup Modal */}
                {showSettings && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
                        <div
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                            onClick={() => setShowSettings(false)}
                        />
                        <div className="relative w-full max-w-2xl bg-card border border-border rounded-3xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 fade-in duration-300">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-6 border-b border-border bg-muted/5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-primary/10 rounded-2xl text-primary">
                                        <Settings size={22} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-foreground">Nastavení systému</h3>
                                        <p className="text-xs text-muted-foreground">Správa uživatelů a přizpůsobení rozhraní</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowSettings(false)}
                                    className="p-2 hover:bg-muted rounded-full transition-colors group"
                                >
                                    <X size={20} className="text-muted-foreground group-hover:text-foreground" />
                                </button>
                            </div>

                            {/* Modal Body - Scrollable */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                                {/* --- ADMIN SECTION --- */}
                                {isAdmin && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-sm font-bold text-foreground uppercase tracking-widest">
                                                <Users size={16} className="text-primary" />
                                                <span>Správa registrovaných uživatelů</span>
                                            </div>
                                            <span className="text-[10px] font-bold text-indigo-500 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">ADMIN PANEL</span>
                                        </div>

                                        {/* --- GUEST REQUESTS (NEW) --- */}
                                        {userRequests.length > 0 && (
                                            <div className="space-y-4 pb-4">
                                                <div className="flex items-center gap-2 text-[11px] font-bold text-amber-500 uppercase tracking-widest animate-pulse">
                                                    <UserPlus size={14} />
                                                    <span>Nové žádosti (Hosté)</span>
                                                </div>

                                                <div className="divide-y divide-border border rounded-2xl overflow-hidden bg-amber-500/5 backdrop-blur-md border-amber-500/20">
                                                    {userRequests.map((request) => (
                                                        <div key={request.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-amber-500/10 transition-colors">
                                                            <div className="flex flex-col gap-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm font-bold text-foreground">{request.email}</span>
                                                                    <span className={cn(
                                                                        "text-[9px] font-bold px-2 py-0.5 rounded-full uppercase",
                                                                        request.request_type === 'access' ? "bg-amber-500 text-white" : "bg-blue-500 text-white"
                                                                    )}>
                                                                        {request.request_type === 'access' ? 'Žádost o přístup' : 'Zapomenuté heslo'}
                                                                    </span>
                                                                </div>
                                                                <span className="text-[9px] text-muted-foreground flex items-center gap-1 font-medium">
                                                                    <Clock size={10} />
                                                                    {new Date(request.created_at).toLocaleString('cs-CZ')}
                                                                </span>
                                                            </div>

                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => processUserRequest(request.id, 'processed')}
                                                                    className="text-[10px] font-bold text-emerald-500 hover:text-white bg-emerald-500/10 hover:bg-emerald-500 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 border border-emerald-500/20"
                                                                >
                                                                    <CheckCircle size={10} />
                                                                    Vyřízeno
                                                                </button>
                                                                <button
                                                                    onClick={() => processUserRequest(request.id, 'rejected')}
                                                                    className="text-[10px] font-bold text-red-500 hover:text-white bg-red-500/10 hover:bg-red-500 px-3 py-1.5 rounded-xl transition-all"
                                                                >
                                                                    Smazat
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="divide-y divide-border border rounded-2xl overflow-hidden bg-muted/10 backdrop-blur-md">
                                            {profiles.length > 0 ? (
                                                profiles.map((profile) => (
                                                    <div key={profile.id} className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors ${(profile.access_requested || profile.password_reset_requested) ? 'bg-amber-500/5 border-l-4 border-l-amber-500' : ''}`}>
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <span className="text-sm font-bold text-foreground truncate max-w-[250px]">
                                                                    {profile.email}
                                                                </span>
                                                                <div className="flex items-center gap-1.5">
                                                                    {profile.access_requested && (
                                                                        <span className="flex items-center gap-1 text-[9px] font-bold text-white bg-amber-600 px-2 py-0.5 rounded-full uppercase animate-pulse shadow-sm">
                                                                            <AlertTriangle size={10} />
                                                                            <span>Žádá o přístup</span>
                                                                        </span>
                                                                    )}
                                                                    {profile.password_reset_requested && (
                                                                        <span className="flex items-center gap-1 text-[9px] font-bold text-white bg-blue-600 px-2 py-0.5 rounded-full uppercase animate-pulse shadow-sm">
                                                                            <KeyRound size={10} />
                                                                            <span>Reset hesla</span>
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {profile.email === 'jakub.kroca@contsystem.cz' && (
                                                                <span className="text-[10px] text-primary font-bold bg-primary/10 w-fit px-1.5 py-0.5 rounded">HLAVNÍ ADMIN</span>
                                                            )}
                                                            {(profile.access_requested || profile.password_reset_requested) && profile.last_request_at && (
                                                                <span className="text-[9px] text-muted-foreground flex items-center gap-1 font-medium">
                                                                    <Clock size={10} />
                                                                    {new Date(profile.last_request_at).toLocaleString('cs-CZ')}
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center gap-6 justify-between sm:justify-end">
                                                            {profile.password_reset_requested && (
                                                                <button
                                                                    onClick={() => resetPasswordRequest(profile.id)}
                                                                    className="text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-600/10 hover:bg-blue-600/20 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 border border-blue-600/20"
                                                                >
                                                                    <CheckCircle size={10} />
                                                                    Odbavit reset
                                                                </button>
                                                            )}

                                                            <div className="flex items-center gap-3 bg-muted/50 px-3 py-1.5 rounded-xl border border-border/50">
                                                                <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-tighter">Povolit import</span>
                                                                <button
                                                                    onClick={() => updatePermission(profile.id, !profile.can_import)}
                                                                    disabled={profile.email === 'jakub.kroca@contsystem.cz'}
                                                                    className={`relative w-9 h-5 rounded-full transition-all duration-300 ${profile.can_import ? 'bg-emerald-500' : 'bg-gray-400'} ${profile.email === 'jakub.kroca@contsystem.cz' ? 'opacity-30 cursor-not-allowed' : 'hover:scale-105'}`}
                                                                >
                                                                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-300 ${profile.can_import ? 'translate-x-4' : 'translate-x-0'}`} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-8 text-center text-sm text-muted-foreground italic">Žádní uživatelé k zobrazení.</div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {/* Vzhled */}
                                    <div className="bg-muted/10 border border-border rounded-2xl p-5 space-y-5">
                                        <div className="flex items-center gap-2 text-sm font-bold text-foreground uppercase tracking-widest">
                                            <Palette size={16} className="text-primary" />
                                            <span>Vzhled</span>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex flex-col gap-3">
                                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">Barevný motiv</p>
                                                <div className="grid grid-cols-3 gap-2 bg-muted/50 rounded-xl p-1.5 border border-border/40">
                                                    <button
                                                        onClick={() => setTheme('light')}
                                                        className={`flex flex-col items-center gap-1.5 py-2.5 rounded-lg text-[10px] font-bold transition-all ${theme === 'light' ? 'bg-background shadow-lg text-primary scale-[1.02] ring-1 ring-primary/20' : 'text-muted-foreground hover:text-foreground'}`}
                                                    >
                                                        <Sun size={14} />
                                                        <span>SVĚTLÝ</span>
                                                    </button>
                                                    <button
                                                        onClick={() => setTheme('dark')}
                                                        className={`flex flex-col items-center gap-1.5 py-2.5 rounded-lg text-[10px] font-bold transition-all ${theme === 'dark' ? 'bg-background shadow-lg text-primary scale-[1.02] ring-1 ring-primary/20' : 'text-muted-foreground hover:text-foreground'}`}
                                                    >
                                                        <Moon size={14} />
                                                        <span>TMAVÝ</span>
                                                    </button>
                                                    <button
                                                        onClick={() => setTheme('system')}
                                                        className={`flex flex-col items-center gap-1.5 py-2.5 rounded-lg text-[10px] font-bold transition-all ${theme === 'system' ? 'bg-background shadow-lg text-primary scale-[1.02] ring-1 ring-primary/20' : 'text-muted-foreground hover:text-foreground'}`}
                                                    >
                                                        <Monitor size={14} />
                                                        <span>SYSTÉM</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Notifikace */}
                                    <div className="bg-muted/10 border border-border rounded-2xl p-5 space-y-5">
                                        <div className="flex items-center gap-2 text-sm font-bold text-foreground uppercase tracking-widest">
                                            <Bell size={16} className="text-primary" />
                                            <span>Notifikace</span>
                                        </div>

                                        <div className="flex items-center justify-between bg-muted/50 px-4 py-3 rounded-xl border border-border/40">
                                            <div className="space-y-0.5">
                                                <p className="text-[11px] font-bold text-foreground">Aktivovat</p>
                                                <p className="text-[10px] text-muted-foreground">Informační zprávy</p>
                                            </div>
                                            <button
                                                onClick={toggleNotifications}
                                                className={`relative w-11 h-6 rounded-full transition-all duration-300 ${notifications ? 'bg-primary' : 'bg-gray-400'}`}
                                            >
                                                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-300 ${notifications ? 'translate-x-5' : 'translate-x-0'}`} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 border-t border-border bg-muted/5 flex justify-end">
                                <button
                                    onClick={() => setShowSettings(false)}
                                    className="px-8 py-2.5 bg-primary text-primary-foreground font-bold rounded-2xl shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all text-sm uppercase tracking-widest"
                                >
                                    Hotovo
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content Area - Future Tasks overview */}
                <div className="flex-1 flex flex-col items-center justify-center p-20 bg-muted/5 rounded-3xl border border-dashed border-border/60 text-center space-y-4">
                    <div className="p-4 bg-muted/20 rounded-full text-muted-foreground/40">
                        <Clock size={48} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-foreground/80">Přehled úkolů</h3>
                        <p className="text-sm text-muted-foreground italic max-w-xs mx-auto">
                            Zde se v budoucnu zobrazí detailní přehled vašich přiřazených úkolů a aktivit.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
