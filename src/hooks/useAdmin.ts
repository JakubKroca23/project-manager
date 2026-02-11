'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';

export interface UserProfile {
    id: string;
    email: string;
    can_import: boolean;
    access_requested?: boolean;
    password_reset_requested?: boolean;
    last_request_at?: string;
    permissions?: {
        timeline?: boolean;
        projects?: boolean;
        service?: boolean;
        production?: boolean;
        purchasing?: boolean;
    };
}

export interface UserRequest {
    id: string;
    email: string;
    request_type: 'access' | 'password_reset';
    status: 'pending' | 'processed' | 'rejected';
    created_at: string;
    metadata?: any;
}

export interface AdminLog {
    id: string;
    admin_id: string;
    admin_email: string;
    action: string;
    target_user_id?: string;
    target_user_email?: string;
    details?: string;
    created_at: string;
}

const ADMIN_EMAIL = 'jakub.kroca@contsystem.cz';

export function useAdmin() {
    const [profiles, setProfiles] = useState<UserProfile[]>([]);
    const [userRequests, setUserRequests] = useState<UserRequest[]>([]);
    const [adminLogs, setAdminLogs] = useState<AdminLog[]>([]);
    const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    const logAdminAction = useCallback(async (action: string, targetUser?: { id: string, email: string }, details?: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase.from('admin_logs').insert({
            admin_id: user.id,
            admin_email: user.email,
            action,
            target_user_id: targetUser?.id,
            target_user_email: targetUser?.email,
            details: details || ''
        });
    }, []);

    const fetchProfiles = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setIsLoading(false);
            return;
        }

        const email = user.email || '';
        const isUserAdmin = email === ADMIN_EMAIL;
        setIsAdmin(isUserAdmin);

        // Fetch current user's profile
        const { data: currentProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (currentProfile) {
            setCurrentUserProfile(currentProfile);
        }

        // If admin, fetch all profiles, user_requests, and logs
        if (isUserAdmin) {
            // Profiles
            const { data: allProfiles, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .order('email');

            if (allProfiles && !profileError) {
                setProfiles(allProfiles);
            }

            // Guest Requests
            const { data: requests, error: requestError } = await supabase
                .from('user_requests')
                .select('*')
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            if (requests && !requestError) {
                setUserRequests(requests);
            }

            // Admin Logs Initial Load
            const { data: logs, error: logError } = await supabase
                .from('admin_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);

            if (logs && !logError) {
                setAdminLogs(logs);
            }

            // Set up Realtime Subscription for Logs
            const subscription = supabase
                .channel('admin_logs_changes')
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'admin_logs' }, (payload) => {
                    const newLog = payload.new as AdminLog;
                    setAdminLogs(prev => [newLog, ...prev].slice(0, 50));
                })
                .subscribe();

            return () => {
                supabase.removeChannel(subscription);
            };
        }
        setIsLoading(false);
    }, [isAdmin]); // Added isAdmin as dependency or check how it's used

    useEffect(() => {
        fetchProfiles();
    }, [fetchProfiles]);

    const updatePermission = async (userId: string, canImport: boolean) => {
        if (!isAdmin) return;

        try {
            const targetUser = profiles.find(p => p.id === userId);
            const { error } = await supabase
                .from('profiles')
                .update({
                    can_import: canImport,
                    access_requested: false,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId);

            if (!error) {
                setProfiles(prev => prev.map(p => p.id === userId ? { ...p, can_import: canImport, access_requested: false } : p));
                await logAdminAction(
                    'Změna import oprávnění',
                    targetUser ? { id: targetUser.id, email: targetUser.email } : undefined,
                    `Nový stav: ${canImport ? 'Povoleno' : 'Zakázáno'}`
                );
            } else {
                console.error('Failed to update permission:', error);
            }
        } catch (err) {
            console.error('Error updating permission:', err);
        }
    };

    const updateUserPermissions = async (userId: string, newPermissions: UserProfile['permissions']) => {
        if (!isAdmin) return;

        try {
            const targetUser = profiles.find(p => p.id === userId);
            const { error } = await supabase
                .from('profiles')
                .update({
                    permissions: newPermissions,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId);

            if (!error) {
                setProfiles(prev => prev.map(p => p.id === userId ? { ...p, permissions: newPermissions } : p));
                await logAdminAction(
                    'Změna systémových oprávnění',
                    targetUser ? { id: targetUser.id, email: targetUser.email } : undefined,
                    `Změněna práva v modulu Oprávnění`
                );
                return true;
            } else {
                console.error('Failed to update user permissions:', error);
                return false;
            }
        } catch (err) {
            console.error('Error updating user permissions:', err);
            return false;
        }
    };

    const resetPasswordRequest = async (userId: string) => {
        if (!isAdmin) return;

        try {
            const targetUser = profiles.find(p => p.id === userId);
            const { error } = await supabase
                .from('profiles')
                .update({
                    password_reset_requested: false,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId);

            if (!error) {
                setProfiles(prev => prev.map(p => p.id === userId ? { ...p, password_reset_requested: false } : p));
                await logAdminAction(
                    'Resetování hesla hotovo',
                    targetUser ? { id: targetUser.id, email: targetUser.email } : undefined
                );
            } else {
                console.error('Failed to reset password request:', error);
            }
        } catch (err) {
            console.error('Error reset password request:', err);
        }
    };

    const processUserRequest = async (requestId: string, status: 'processed' | 'rejected') => {
        if (!isAdmin) return;

        try {
            const request = userRequests.find(r => r.id === requestId);
            const { error } = await supabase
                .from('user_requests')
                .update({
                    status,
                    processed_at: new Date().toISOString()
                })
                .eq('id', requestId);

            if (!error) {
                setUserRequests(prev => prev.filter(r => r.id !== requestId));
                await logAdminAction(
                    status === 'processed' ? 'Schválení žádosti' : 'Zamítnutí žádosti',
                    request ? { id: request.id, email: request.email } : undefined
                );
            }
        } catch (err) {
            console.error('Error processing user request:', err);
        }
    };

    return {
        profiles,
        userRequests,
        adminLogs,
        currentUserProfile,
        isAdmin,
        isLoading,
        updatePermission,
        updateUserPermissions,
        resetPasswordRequest,
        processUserRequest,
        fetchProfiles, // Export fetchProfiles directly
        refresh: fetchProfiles
    };
}
