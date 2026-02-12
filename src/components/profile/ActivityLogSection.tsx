'use client';

import React from 'react';
import { useActivityLog, ActivityItem } from '@/hooks/useActivityLog';
import {
    Clock,
    Download,
    Settings,
    UserCog,
    ChevronRight,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Component to display user activity history.
 */
export const ActivityLogSection: React.FC = () => {
    const { activities, isLoading, error } = useActivityLog();

    const getIcon = (type: ActivityItem['type']) => {
        switch (type) {
            case 'import': return <Download size={14} className="text-blue-500" />;
            case 'settings': return <Settings size={14} className="text-amber-500" />;
            case 'user_management': return <UserCog size={14} className="text-purple-500" />;
            default: return <Clock size={14} className="text-muted-foreground" />;
        }
    };

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
                    <p className="text-xs text-muted-foreground">Zatím jste neprovedli žádné zaznamenané akce.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-lg">
                        <Clock size={16} className="text-primary" />
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-wider">Historie aktivit</h3>
                </div>
                <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    Posledních {activities.length} akcí
                </span>
            </div>

            <div className="relative space-y-3 before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-[1px] before:bg-border/50">
                {activities.map((activity, index) => (
                    <div
                        key={activity.id}
                        className="relative pl-10 group animate-in slide-in-from-left-2 duration-300 fill-mode-both"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        {/* Dot */}
                        <div className="absolute left-[13px] top-1 w-2.5 h-2.5 rounded-full border-2 border-background bg-border group-hover:bg-primary transition-colors z-10" />

                        <div className="bg-card hover:bg-muted/30 border border-border rounded-xl p-3 transition-all hover:translate-x-1 cursor-default">
                            <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1 bg-muted rounded-md">
                                            {getIcon(activity.type)}
                                        </div>
                                        <p className="text-xs font-bold text-foreground line-clamp-1">{activity.description}</p>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground font-medium">
                                        {(() => {
                                            const d = new Date(activity.timestamp);
                                            return `${d.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' })} v ${d.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}`;
                                        })()}
                                    </p>
                                </div>
                                <ChevronRight size={14} className="text-muted-foreground/30 mt-1" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
