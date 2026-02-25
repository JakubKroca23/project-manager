'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

const PUBLIC_ROUTES = ['/login', '/auth'];

import MaintenanceScreen from './MaintenanceScreen';
import { ADMIN_EMAIL } from '@/hooks/useAdmin';

// ... existing code ...

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isMaintenance, setIsMaintenance] = useState(false);
    const [estimatedEnd, setEstimatedEnd] = useState<string | undefined>(undefined);
    const [isBypassUser, setIsBypassUser] = useState(false);

    // Public routes should be rendered immediately to avoid the "Ověřování přístupu..." flicker
    const isPublicRoute = PUBLIC_ROUTES.some(route => pathname?.startsWith(route));

    useEffect(() => {
        const checkAuth = async () => {
            // Check Maintenance Mode First
            try {
                const { data: maintenanceData } = await supabase
                    .from('app_settings')
                    .select('settings')
                    .eq('id', 'maintenance_mode')
                    .maybeSingle();

                const settings = maintenanceData?.settings as any;
                if (settings?.value === true) {
                    setIsMaintenance(true);
                    setEstimatedEnd(settings?.estimated_end);
                }
            } catch (err) {

            }

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

            // Check if user is the specific admin allowed to bypass maintenance
            if (session.user.email === ADMIN_EMAIL) {
                setIsBypassUser(true);
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

    // Maintenance Screen logic (only if not bypass user)
    if (isMaintenance && !isBypassUser) {
        return <MaintenanceScreen estimatedEnd={estimatedEnd} />;
    }

    if (!isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}
