'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { User, LogOut, Loader2, Shield } from 'lucide-react';

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

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

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <header className="mb-8">
                <h1>Uživatelský profil</h1>
                <p>Správa vašeho účtu a nastavení</p>
            </header>

            <div className="max-w-2xl mx-auto w-full">
                <div className="card-glass p-8 space-y-8">

                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                            <User size={40} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                {user.email?.split('@')[0]}
                            </h2>
                            <p className="text-gray-500">{user.email}</p>
                            <div className="flex items-center gap-2 mt-2 text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded w-fit">
                                <Shield size={12} />
                                <span>Authenticated via Supabase</span>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-8">
                        <h3 className="text-lg font-semibold mb-4">Akce</h3>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors font-medium border border-red-100"
                        >
                            <LogOut size={18} />
                            <span>Odhlásit se</span>
                        </button>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg border border-border text-sm text-muted-foreground">
                        <p>User ID: <span className="font-mono text-xs">{user.id}</span></p>
                        <p>Last Sign In: {new Date(user.last_sign_in_at).toLocaleString('cs-CZ')}</p>
                    </div>

                </div>
            </div>
        </div>
    );
}
