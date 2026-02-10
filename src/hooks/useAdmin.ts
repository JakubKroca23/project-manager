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
}

export interface UserRequest {
    id: string;
    email: string;
    request_type: 'access' | 'password_reset';
    status: 'pending' | 'processed' | 'rejected';
    created_at: string;
    metadata?: any;
}

const ADMIN_EMAIL = 'jakub.kroca@contsystem.cz';

export function useAdmin() {
    const [profiles, setProfiles] = useState<UserProfile[]>([]);
    const [userRequests, setUserRequests] = useState<UserRequest[]>([]);
    const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

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

        // If admin, fetch all profiles and user_requests
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
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchProfiles();
    }, [fetchProfiles]);

    const updatePermission = async (userId: string, canImport: boolean) => {
        if (!isAdmin) return;

        try {
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
            } else {
                console.error('Failed to update permission:', error);
            }
        } catch (err) {
            console.error('Error updating permission:', err);
        }
    };

    const resetPasswordRequest = async (userId: string) => {
        if (!isAdmin) return;

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    password_reset_requested: false,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId);

            if (!error) {
                setProfiles(prev => prev.map(p => p.id === userId ? { ...p, password_reset_requested: false } : p));
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
            const { error } = await supabase
                .from('user_requests')
                .update({
                    status,
                    processed_at: new Date().toISOString()
                })
                .eq('id', requestId);

            if (!error) {
                setUserRequests(prev => prev.filter(r => r.id !== requestId));
            }
        } catch (err) {
            console.error('Error processing user request:', err);
        }
    };

    return {
        profiles,
        userRequests,
        currentUserProfile,
        isAdmin,
        isLoading,
        updatePermission,
        resetPasswordRequest,
        processUserRequest,
        refresh: fetchProfiles
    };
}
