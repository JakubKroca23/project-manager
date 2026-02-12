'use client';

import React from 'react';
import { useActivityLog, ActivityItem } from '@/hooks/useActivityLog';
import { UserProfile } from '@/hooks/useAdmin';
import {
    Clock,
    Download,
    Settings,
    UserCog,
    ChevronRight,
    Loader2,
    AlertCircle,
    User,
    Package,
    ChevronDown,
    Database,
    Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityLogSectionProps {
    isAdmin: boolean;
    profiles?: UserProfile[];
}

/**
 * Component to display user activity history.
 */
export const ActivityLogSection: React.FC<ActivityLogSectionProps> = ({ isAdmin, profiles }) => {
    const { activities, isLoading, error } = useActivityLog(isAdmin);
    const [expandedId, setExpandedId] = React.useState<string | null>(null);
    const [userFilter, setUserFilter] = React.useState<string>('all');

    const getIcon = (type: ActivityItem['type']) => {
        switch (type) {
            case 'import': return <Download size={14} className="text-blue-500" />;
            case 'settings': return <Settings size={14} className="text-amber-500" />;
            case 'user_management': return <UserCog size={14} className="text-purple-500" />;
            case 'project': return <Package size={14} className="text-emerald-500" />;
            default: return <Clock size={14} className="text-muted-foreground" />;
        }
    };

    /**
     * Resolves a user ID or email to a displayable name/email.
     */
    const resolveUser = (idOrEmail: string) => {
        if (!idOrEmail) return 'Systém';
        if (idOrEmail.includes('@')) return idOrEmail;

        const profile = profiles?.find((p: any) => p.id === idOrEmail);
        return profile?.email || idOrEmail;
    };

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const filteredActivities = activities.filter(activity => {
        if (userFilter === 'all') return true;
        // Check both performedBy (ID or Email)
        return activity.performedBy === userFilter;
    });

    if (isLoading && activities.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 space-y-3">
                <Loader2 size={24} className="animate-spin text-primary/50" />
                <p className="text-xs text-muted-foreground animate-pulse">Načítání historie...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center gap-3 p-4 bg-red-500/5 text-red-500 rounded-2xl border border-red-500/20">
                <AlertCircle size={18} />
                <p className="text-xs font-medium">{error}</p>
            </div>
        );
    }

    if (activities.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-3 bg-muted/20 rounded-2xl border border-dashed border-border">
                <div className="p-3 bg-muted rounded-full">
                    <Clock size={24} className="text-muted-foreground/50" />
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-bold text-foreground">Žádná aktivita</p>
                    <p className="text-xs text-muted-foreground">Zatím nebyly zaznamenány žádné akce.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-lg">
                        <Clock size={16} className="text-primary" />
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-wider">
                        {isAdmin ? 'Systémová aktivita' : 'Moje aktivita'}
                    </h3>
                </div>

                <div className="flex items-center gap-3">
                    {isAdmin && profiles && (
                        <div className="flex items-center gap-2">
                            <User size={12} className="text-muted-foreground" />
                            <select
                                value={userFilter}
                                onChange={(e) => setUserFilter(e.target.value)}
                                className="text-[10px] font-bold bg-muted border-none rounded-md px-2 py-1 outline-none focus:ring-1 ring-primary/20 transition-all cursor-pointer"
                            >
                                <option value="all">Všichni uživatelé</option>
                                {profiles.map(p => (
                                    <option key={p.id} value={p.id}>{p.email}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-1 rounded-md shadow-sm">
                        {filteredActivities.length} akcí
                    </span>
                </div>
            </div>

            <div className="relative space-y-3 before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-[1px] before:bg-border/50">
                {filteredActivities.map((activity, index) => {
                    const isExpanded = expandedId === activity.id;
                    return (
                        <div
                            key={activity.id}
                            className="relative pl-10 group animate-in slide-in-from-left-2 duration-300 fill-mode-both"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            {/* Timeline Dot */}
                            <div className="absolute left-[13px] top-1 w-2.5 h-2.5 rounded-full border-2 border-background bg-border group-hover:bg-primary transition-colors z-10" />

                            <div
                                className={cn(
                                    "bg-card hover:bg-muted/30 border border-border rounded-xl p-3 transition-all cursor-pointer shadow-sm hover:shadow-md",
                                    isExpanded && "ring-1 ring-primary/20 bg-muted/20"
                                )}
                                onClick={() => toggleExpand(activity.id)}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="space-y-1 flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1 bg-muted rounded-md group-hover:bg-background transition-colors">
                                                {getIcon(activity.type)}
                                            </div>
                                            <p className="text-xs font-bold text-foreground truncate">{activity.description}</p>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                            <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1.5">
                                                <Clock size={8} />
                                                {(() => {
                                                    const d = new Date(activity.timestamp);
                                                    return `${d.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' })} v ${d.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}`;
                                                })()}
                                            </p>
                                            {isAdmin && activity.performedBy && (
                                                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-primary/5 rounded-md border border-primary/10">
                                                    <User size={8} className="text-primary/60" />
                                                    <span className="text-[9px] text-primary/80 font-semibold truncate max-w-[150px]">
                                                        {resolveUser(activity.performedBy)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center gap-1 mt-1">
                                        {isExpanded ? <ChevronDown size={14} className="text-primary" /> : <ChevronRight size={14} className="text-muted-foreground/30 transition-transform group-hover:translate-x-0.5" />}
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {isExpanded && activity.details && (
                                    <div className="mt-3 pt-3 border-t border-border/50 animate-in fade-in slide-in-from-top-2 duration-200">
                                        {activity.type === 'project' && activity.details.action === 'update' && (
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                                                    <Database size={10} /> Přehled změn
                                                </div>
                                                <div className="grid grid-cols-1 gap-1">
                                                    {Object.entries(activity.details.new || {}).map(([key, newVal]: [string, any]) => {
                                                        const oldVal = activity.details.old?.[key];
                                                        if (JSON.stringify(oldVal) === JSON.stringify(newVal)) return null;
                                                        if (['updated_at', 'last_modified_by'].includes(key)) return null;

                                                        return (
                                                            <div key={key} className="flex flex-col p-1.5 bg-background/50 rounded border border-border/30">
                                                                <span className="text-[8px] font-black uppercase text-muted-foreground/50">{key}</span>
                                                                <div className="flex items-center gap-2 text-[10px]">
                                                                    <span className="text-red-500/70 line-through truncate max-w-[100px]">{String(oldVal || '-')}</span>
                                                                    <ChevronRight size={8} className="text-muted-foreground" />
                                                                    <span className="text-emerald-600 font-bold truncate">{String(newVal || '-')}</span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                        {activity.type === 'import' && (
                                            <div className="p-2 bg-blue-500/5 rounded border border-blue-500/10 text-[10px] text-blue-700/80 italic">
                                                {String(activity.details)}
                                            </div>
                                        )}
                                        {activity.type === 'settings' && (
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 text-[9px] font-bold text-amber-600 uppercase tracking-widest">
                                                    <Zap size={10} /> Konfigurace systému
                                                </div>
                                                <pre className="text-[9px] bg-muted/50 p-2 rounded overflow-x-auto font-mono text-muted-foreground">
                                                    {JSON.stringify(activity.details.new || activity.details, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
