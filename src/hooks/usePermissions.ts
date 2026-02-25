'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { ADMIN_EMAIL } from './useAdmin';

export interface UserPermissions {
    id: string;
    email: string;
    can_import: boolean;
    role: string;
    permissions?: {
        timeline?: boolean;
        projects_civil?: boolean;
        projects_military?: boolean;
        service?: boolean;
        can_bulk_delete?: boolean;
        is_manager?: boolean;
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
        if (permissions.role === 'admin' || permissions.email === ADMIN_EMAIL) return true;

        const perms = permissions.permissions || {};
        return perms[key as keyof typeof perms] !== false;
    }, [permissions]);

    const isOrderManager = permissions?.permissions?.is_manager === true;
    const isAdmin = permissions?.role === 'admin' || permissions?.email === ADMIN_EMAIL;

    const canEditProject = useCallback((project: any) => {
        if (!permissions) return false;
        if (isAdmin) return true;

        if (isOrderManager) {
            if (!project) return false;
            const userName = permissions.email.split('@')[0].toLowerCase();
            const projectManager = project.manager?.toLowerCase() || '';
            // Allow if user is explicitly mentioned in manager field or has import rights
            return projectManager.includes(userName) || permissions.can_import;
        }

        return permissions.can_import || false;
    }, [permissions, isAdmin, isOrderManager]);

    return {
        permissions,
        isLoading,
        canImport: permissions?.can_import || false,
        canEdit: isAdmin || isOrderManager || permissions?.can_import,
        canBulkDelete: isAdmin,
        isAdmin,
        isOrderManager,
        canEditProject,
        checkPerm
    };
}
