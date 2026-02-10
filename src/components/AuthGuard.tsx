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

    // Public routes should be rendered immediately to avoid the "Ověřování přístupu..." flicker
    const isPublicRoute = PUBLIC_ROUTES.some(route => pathname?.startsWith(route));

    useEffect(() => {
        const checkAuth = async () => {
            // If it's a public route, we don't need to block rendering for the session check
            if (isPublicRoute) {
                setIsLoading(false);
                return;
            }

            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                router.push('/login');
                return;
            }

            setIsAuthenticated(true);
            setIsLoading(false);
        };

        checkAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session && !isPublicRoute) {
                router.push('/login');
            } else if (session && pathname === '/login') {
                router.push('/');
            }
        });

        return () => subscription.unsubscribe();
    }, [pathname, router, isPublicRoute]);

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
