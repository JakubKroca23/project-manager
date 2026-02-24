import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import { cn } from '@/lib/utils';

export function ProjectHistory({ projectId }: { projectId: string }) {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { profiles } = useAdmin();

    useEffect(() => {
        async function fetchLogs() {
            setLoading(true);
            const { data, error } = await supabase
                .from('project_action_logs')
                .select('*')
                .eq('project_id', projectId)
                .order('performed_at', { ascending: false });

            if (error) {
                console.error('Error fetching logs:', error);
            } else {
                setLogs(data || []);
            }
            setLoading(false);
        }
        if (projectId) fetchLogs();
    }, [projectId]);

    const resolveUser = (id: string) => {
        if (!id) return 'Systém';
        const profile = profiles.find((p: any) => p.id === id);
        return profile?.email || id;
    };

    if (loading) return <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse px-4 py-3">Načítám historii změn...</div>;
    if (logs.length === 0) return <div className="text-[10px] font-bold text-muted-foreground/60 px-4 py-4 italic">Žádné záznamy o změnách v této zakázce.</div>;

    return (
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar p-1">
            {logs.map((log) => (
                <div key={log.id} className="p-3.5 bg-background/50 rounded-xl border border-border/50 text-[10px] hover:bg-background/80 hover:border-border transition-all duration-200 group/log">
                    <div className="flex justify-between items-center mb-2">
                        <span className={cn(
                            "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border",
                            log.action_type === 'create' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                                log.action_type === 'delete' ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' :
                                    'bg-blue-500/10 text-blue-600 border-blue-500/20'
                        )}>
                            {log.action_type === 'create' ? 'Vytvoření' : log.action_type === 'delete' ? 'Smazání' : 'Úprava dat'}
                        </span>
                        <span className="text-[9px] text-muted-foreground font-black opacity-50">
                            {new Date(log.performed_at).toLocaleString('cs-CZ')}
                        </span>
                    </div>
                    <div className="text-foreground/70 mb-3 flex items-center gap-1.5 italic font-medium">
                        <span className="opacity-50">Změnu uložil:</span>
                        <span className="font-bold underline decoration-primary/30 underline-offset-4 text-foreground">
                            {resolveUser(log.performed_by)}
                        </span>
                    </div>
                    {log.action_type === 'update' && log.old_value && log.new_value && (
                        <div className="mt-3 space-y-2.5 border-t border-border/30 pt-3">
                            {Object.keys(log.new_value).map(key => {
                                const oldVal = log.old_value[key];
                                const newVal = log.new_value[key];
                                if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
                                    if (['updated_at', 'last_modified_by', 'id', 'created_at'].includes(key)) return null;
                                    return (
                                        <div key={key} className="flex flex-col gap-1 pb-1 border-b border-border/5 last:border-0 hover:bg-primary/[0.02] px-1.5 rounded-lg transition-colors">
                                            <span className="font-black text-muted-foreground/60 uppercase text-[8px] tracking-widest">{key}</span>
                                            <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto,1fr] items-center gap-2">
                                                <span className="text-rose-500/70 line-through truncate italic font-medium" title={String(oldVal)}>
                                                    {String(oldVal === null || oldVal === undefined ? '—' : (typeof oldVal === 'object' ? JSON.stringify(oldVal) : oldVal))}
                                                </span>
                                                <div className="hidden sm:block text-muted-foreground/30">→</div>
                                                <span className="text-emerald-600 font-bold bg-emerald-500/5 px-2 py-0.5 rounded-md truncate" title={String(newVal)}>
                                                    {String(newVal === null || newVal === undefined ? '—' : (typeof newVal === 'object' ? JSON.stringify(newVal) : newVal))}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            })}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
