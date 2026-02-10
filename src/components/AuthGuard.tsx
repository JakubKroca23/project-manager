'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

const PUBLIC_ROUTES = ['/login', '/auth'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            const isPublicRoute = PUBLIC_ROUTES.some(route => pathname?.startsWith(route));

            if (!session && !isPublicRoute) {
                router.push('/login');
                return;
            }

            if (session && pathname === '/login') {
                router.push('/');
                return;
            }

            setIsAuthenticated(true);
            setIsLoading(false);
        };

        checkAuth();

        // Listen for auth state changes (login/logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const isPublicRoute = PUBLIC_ROUTES.some(route => pathname?.startsWith(route));

            if (!session && !isPublicRoute) {
                router.push('/login');
            } else if (session && pathname === '/login') {
                router.push('/');
            }
        });

        return () => subscription.unsubscribe();
    }, [pathname, router]);

    // Public routes don't need the loading spinner
    const isPublicRoute = PUBLIC_ROUTES.some(route => pathname?.startsWith(route));
    if (isPublicRoute) {
        return <>{children}</>;
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 size={32} className="animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Ověřování přístupu...</span>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}
