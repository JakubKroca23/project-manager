'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { User, LogOut, Loader2, Shield, Moon, Sun, Monitor, Bell, BellOff, Globe, Palette } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const [notifications, setNotifications] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('notifications_enabled') !== 'false';
        }
        return true;
    });
    const [language, setLanguage] = useState('cs');

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }
            setUser(user);
            setLoading(false);
        };

        getUser();
    }, [router]);

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

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={32} />
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
                        <div>
                            <h2 className="text-lg font-bold text-foreground">
                                {user.email?.split('@')[0]}
                            </h2>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <div className="flex items-center gap-2 mt-1.5 text-[10px] font-semibold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded w-fit">
                                <Shield size={10} />
                                <span>Authenticated</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Vzhled */}
                <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Palette size={16} />
                        <span>Vzhled</span>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-foreground">Motiv</p>
                                <p className="text-xs text-muted-foreground">Vyberte barevný motiv rozhraní</p>
                            </div>
                            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                                <button
                                    onClick={() => setTheme('light')}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${theme === 'light' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    <Sun size={14} />
                                    <span>Světlý</span>
                                </button>
                                <button
                                    onClick={() => setTheme('dark')}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${theme === 'dark' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    <Moon size={14} />
                                    <span>Tmavý</span>
                                </button>
                                <button
                                    onClick={() => setTheme('system')}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${theme === 'system' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    <Monitor size={14} />
                                    <span>Systém</span>
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
                            <p className="text-sm font-medium text-foreground">Upozornění</p>
                            <p className="text-xs text-muted-foreground">Povolit oznámení o změnách projektů</p>
                        </div>
                        <button
                            onClick={toggleNotifications}
                            className={`relative w-11 h-6 rounded-full transition-colors ${notifications ? 'bg-primary' : 'bg-muted'}`}
                        >
                            <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${notifications ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </div>

                {/* Jazyk */}
                <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Globe size={16} />
                        <span>Jazyk a region</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-foreground">Jazyk aplikace</p>
                            <p className="text-xs text-muted-foreground">Jazyk rozhraní a formátování</p>
                        </div>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="bg-background border border-input rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="cs">Čeština</option>
                            <option value="en">English</option>
                            <option value="de">Deutsch</option>
                        </select>
                    </div>
                </div>

                {/* Info & Akce */}
                <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                    <div className="bg-muted/50 p-3 rounded-lg text-xs text-muted-foreground space-y-1">
                        <p>User ID: <span className="font-mono">{user.id}</span></p>
                        <p>Poslední přihlášení: {new Date(user.last_sign_in_at).toLocaleString('cs-CZ')}</p>
                        <p>Vytvořeno: {new Date(user.created_at).toLocaleString('cs-CZ')}</p>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors font-medium text-sm border border-red-200 dark:border-red-800"
                    >
                        <LogOut size={16} />
                        <span>Odhlásit se</span>
                    </button>
                </div>

            </div>
        </div>
    );
}
