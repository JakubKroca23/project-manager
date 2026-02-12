import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';

export interface ActivityItem {
    id: string;
    type: 'import' | 'settings' | 'user_management';
    description: string;
    timestamp: string;
    details?: any;
}

/**
 * Hook to fetch activity logs for the current user.
 */
export function useActivityLog() {
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchActivities = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch import logs
            // Note: import_logs.performed_by is text (email), so we match by user email
            const { data: imports, error: importError } = await supabase
                .from('import_logs')
                .select('*')
                .eq('performed_by', user.email)
                .order('created_at', { ascending: false })
                .limit(10);

            if (importError) throw importError;

            // Fetch settings logs
            const { data: settingsLogs, error: settingsError } = await supabase
                .from('app_settings_logs')
                .select('*')
                .eq('changed_by', user.id)
                .order('changed_at', { ascending: false })
                .limit(10);

            if (settingsError && settingsError.code !== 'PGRST116') {
                // Silently ignore if table doesn't exist or RLS denies
                console.warn('Settings logs fetch error:', settingsError);
            }

            // Fetch user action logs (actions performed BY this user)
            const { data: actionLogs, error: actionError } = await supabase
                .from('user_action_logs')
                .select('*')
                .eq('performed_by', user.id)
                .order('performed_at', { ascending: false })
                .limit(10);

            if (actionError && actionError.code !== 'PGRST116') {
                console.warn('Action logs fetch error:', actionError);
            }

            // Consolidate logs
            const combined: ActivityItem[] = [
                ...(imports || []).map((log: any) => ({
                    id: log.id,
                    type: 'import' as const,
                    description: `Import dat (${log.project_type}) - ${log.row_count} řádků`,
                    timestamp: log.created_at,
                    details: log.changes_summary
                })),
                ...(settingsLogs || []).map((log: any) => ({
                    id: log.id,
                    type: 'settings' as const,
                    description: `Změna systémového nastavení: ${log.settings_id}`,
                    timestamp: log.changed_at,
                    details: { old: log.old_settings, new: log.new_settings }
                })),
                ...(actionLogs || []).map((log: any) => ({
                    id: log.id,
                    type: 'user_management' as const,
                    description: `Změna oprávnění/role u uživatele`,
                    timestamp: log.performed_at,
                    details: { action: log.action_type, target: log.target_user_id }
                }))
            ];

            // Sort by time descending
            combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

            setActivities(combined.slice(0, 15));
        } catch (err: any) {
            setError(err.message || 'Chyba při načítání aktivit');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchActivities();
    }, [fetchActivities]);

    return { activities, isLoading, error, refetch: fetchActivities };
}
