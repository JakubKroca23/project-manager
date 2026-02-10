'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';

export interface UserPermissions {
    id: string;
    email: string;
    can_import: boolean;
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
    }, []);

    useEffect(() => {
        fetchPermissions();
    }, [fetchPermissions]);

    return {
        permissions,
        isLoading,
        canImport: permissions?.can_import || false,
        canEdit: permissions?.can_import || (permissions?.email === 'jakub.kroca@contsystem.cz'),
        isAdmin: permissions?.email === 'jakub.kroca@contsystem.cz'
    };
}
