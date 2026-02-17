'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Clock, Info, ShieldCheck, X } from 'lucide-react';
import { LAST_DEPLOY_DATE } from '@/constants/buildInfo';

export default function SystemStatusBar() {
    const [systemInfo, setSystemInfo] = useState<{ lastUpdate: string, version: string }>({
        lastUpdate: LAST_DEPLOY_DATE,
        version: 'v1.0.0-alpha'
    });
    const [showReleaseNotes, setShowReleaseNotes] = useState(false);

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
                <button
                    onClick={() => setShowReleaseNotes(true)}
                    className="hover:text-primary transition-colors flex items-center gap-1"
                >
                    <Info size={12} />
                    <span>Release Notes</span>
                </button>
            </div>

            {/* Release Notes Modal */}
            {showReleaseNotes && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="bg-background border border-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
                            <div className="flex items-center gap-2">
                                <Info className="text-primary" size={18} />
                                <h2 className="text-sm font-bold tracking-tight uppercase">Release Notes - {systemInfo.version}</h2>
                            </div>
                            <button onClick={() => setShowReleaseNotes(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-2">
                                <p className="text-[11px] font-bold text-primary uppercase tracking-widest">Nové funkce</p>
                                <ul className="text-xs space-y-1.5 list-disc list-inside text-muted-foreground font-medium">
                                    <li>Sekce pro správu servisů</li>
                                    <li>Manuální vytváření zakázek a servisů</li>
                                    <li>Režim údržby s odpočítáváním</li>
                                    <li>Minihra pro zkrácení čekání při údržbě</li>
                                </ul>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest">Opravy a vylepšení</p>
                                <ul className="text-xs space-y-1.5 list-disc list-inside text-muted-foreground font-medium">
                                    <li>Optimalizace načítání dat ze Supabase</li>
                                    <li>Vylepšená validace formulářů</li>
                                    <li>Oprava zalamování textu v tabulkách</li>
                                </ul>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-muted/30 border-t border-border flex justify-end">
                            <button
                                onClick={() => setShowReleaseNotes(false)}
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-[10px] font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all"
                            >
                                Rozumím
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
