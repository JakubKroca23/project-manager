'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';

export interface UserPermissions {
    id: string;
    email: string;
    can_import: boolean;
    role: string;
    permissions?: {
        timeline?: boolean;
        projects?: boolean;
        projects_civil?: boolean;
        projects_military?: boolean;
        service?: boolean;
        production?: boolean;
        purchasing?: boolean;
    };
}

export function usePermissions() {
    const [permissions, setPermissions] = useState<UserPermissions | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchPermissions = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setIsLoading(false);
            return;
        }

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (data && !error) {
            setPermissions(data as UserPermissions);
        }
        setIsLoading(false);

        // Real-time synchronization
        const channel = supabase
            .channel(`profile-${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'profiles',
                    filter: `id=eq.${user.id}`
                },
                (payload) => {
                    console.log('Real-time permission update:', payload.new);
                    setPermissions(payload.new as UserPermissions);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    useEffect(() => {
        let cleanup: (() => void) | undefined;
        fetchPermissions().then(cb => cleanup = cb);
        return () => cleanup?.();
    }, [fetchPermissions]);

    const checkPerm = useCallback((key: string) => {
        if (!permissions) return true;
        if (permissions.role === 'admin' || permissions.email === 'jakub.kroca@contsystem.cz') return true;

        const perms = permissions.permissions || {};
        return perms[key as keyof typeof perms] !== false;
    }, [permissions]);

    return {
        permissions,
        isLoading,
        canImport: permissions?.can_import || false,
        canEdit: permissions?.can_import || permissions?.role === 'admin' || permissions?.email === 'jakub.kroca@contsystem.cz',
        isAdmin: permissions?.role === 'admin' || permissions?.email === 'jakub.kroca@contsystem.cz',
        checkPerm
    };
}
