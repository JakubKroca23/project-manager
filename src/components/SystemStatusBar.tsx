'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Clock, ShieldCheck } from 'lucide-react';
import { LAST_DEPLOY_DATE } from '@/constants/buildInfo';

export default function SystemStatusBar() {
    const [systemInfo, setSystemInfo] = useState<{ lastUpdate: string, version: string }>({
        lastUpdate: LAST_DEPLOY_DATE,
        version: 'v1.0.0-alpha'
    });

    useEffect(() => {
        const fetchSystemInfo = async () => {
            const { data } = await supabase
                .from('app_settings')
                .select('settings, updated_at')
                .eq('id', 'system_info')
                .maybeSingle();

            if (data) {
                const settings = data.settings as any;
                setSystemInfo(prev => ({
                    ...prev,
                    version: settings?.version || 'v1.0.0-alpha'
                }));
            } else {
                // Set default if not exists
                setSystemInfo(prev => ({
                    ...prev,
                    version: 'v1.0.0-alpha'
                }));
            }
        };
        fetchSystemInfo();
    }, []);

    return (
        <div className="bg-muted/30 border-b border-border px-6 py-1.5 flex items-center justify-between text-[10px] font-medium text-muted-foreground backdrop-blur-sm">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                    <Clock size={12} className="text-primary/60" />
                    <span>Poslední aktualizace: <span className="text-foreground">{systemInfo.lastUpdate}</span></span>
                </div>
                <div className="w-px h-3 bg-border" />
                <div className="flex items-center gap-1.5">
                    <ShieldCheck size={12} className="text-emerald-500/60" />
                    <span>Verze: <span className="text-foreground font-bold tracking-wider">{systemInfo.version}</span></span>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="uppercase tracking-tighter opacity-70">System Online</span>
                </div>
            </div>
        </div>
    );
}
