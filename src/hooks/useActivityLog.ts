import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';

export interface ActivityItem {
    id: string;
    type: 'import' | 'settings' | 'user_management' | 'project';
    description: string;
    timestamp: string;
    performedBy?: string;
    details?: any;
}

/**
 * Hook to fetch activity logs.
 * If isAdmin is true, it fetches logs for all users.
 * Otherwise, it fetches only for the current user.
 */
export function useActivityLog(isAdmin: boolean) {
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchActivities = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Fetch import logs
            let importQuery = supabase
                .from('import_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(10);

            if (!isAdmin) {
                importQuery = importQuery.eq('performed_by', user.email);
            }
            const { data: imports, error: importError } = await importQuery;
            if (importError) throw importError;

            // 2. Fetch settings logs
            let settingsQuery = supabase
                .from('app_settings_logs')
                .select('*')
                .order('changed_at', { ascending: false })
                .limit(10);

            if (!isAdmin) {
                settingsQuery = settingsQuery.eq('changed_by', user.id);
            }
            const { data: settingsLogs, error: settingsError } = await settingsQuery;
            if (settingsError && settingsError.code !== 'PGRST116') {
                console.warn('Settings logs fetch error:', settingsError);
            }

            // 3. Fetch user action logs
            let actionQuery = supabase
                .from('user_action_logs')
                .select('*')
                .order('performed_at', { ascending: false })
                .limit(10);

            if (!isAdmin) {
                actionQuery = actionQuery.eq('performed_by', user.id);
            }
            const { data: actionLogs, error: actionError } = await actionQuery;
            if (actionError && actionError.code !== 'PGRST116') {
                console.warn('Action logs fetch error:', actionError);
            }

            // 4. Fetch project action logs
            let projectLogQuery = supabase
                .from('project_action_logs')
                .select('*')
                .order('performed_at', { ascending: false })
                .limit(20);

            if (!isAdmin) {
                projectLogQuery = projectLogQuery.eq('performed_by', user.id);
            }
            const { data: projectLogs, error: projectLogError } = await projectLogQuery;
            if (projectLogError && projectLogError.code !== 'PGRST116') {
                console.warn('Project logs fetch error:', projectLogError);
            }

            // Consolidate logs
            const combined: ActivityItem[] = [
                ...(imports || []).map((log: any) => ({
                    id: log.id,
                    type: 'import' as const,
                    description: `Import dat (${log.project_type}) - ${log.row_count} řádků`,
                    timestamp: log.created_at,
                    performedBy: log.performed_by,
                    details: log.changes_summary
                })),
                ...(settingsLogs || []).map((log: any) => ({
                    id: log.id,
                    type: 'settings' as const,
                    description: `Změna systémového nastavení: ${log.settings_id}`,
                    timestamp: log.changed_at,
                    performedBy: log.changed_by,
                    details: { old: log.old_settings, new: log.new_settings }
                })),
                ...(actionLogs || []).map((log: any) => ({
                    id: log.id,
                    type: 'user_management' as const,
                    description: `Změna oprávnění/role u uživatele`,
                    timestamp: log.performed_at,
                    performedBy: log.performed_by,
                    details: { action: log.action_type, target: log.target_user_id, old: log.old_value, new: log.new_value }
                })),
                ...(projectLogs || []).map((log: any) => {
                    let desc = 'Úprava projektu';
                    const projectName = log.new_value?.name || log.old_value?.name || log.project_id;

                    if (log.action_type === 'create') desc = `Nový projekt: ${projectName}`;
                    else if (log.action_type === 'delete') desc = `Smazání projektu: ${projectName}`;
                    else desc = `Úprava projektu: ${projectName}`;

                    return {
                        id: log.id,
                        type: 'project' as const,
                        description: desc,
                        timestamp: log.performed_at,
                        performedBy: log.performed_by,
                        details: { old: log.old_value, new: log.new_value, action: log.action_type }
                    };
                })
            ];

            // Sort by time descending
            combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

            // Support scrolling or just show more for admins
            setActivities(combined.slice(0, isAdmin ? 50 : 20));
        } catch (err: any) {
            setError(err.message || 'Chyba při načítání aktivit');
        } finally {
            setIsLoading(false);
        }
    }, [isAdmin]);

    useEffect(() => {
        fetchActivities();
    }, [fetchActivities]);

    return { activities, isLoading, error, refetch: fetchActivities };
}
