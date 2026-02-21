'use client';

import React from 'react';
import { Project } from '@/types/project';
import { cn } from '@/lib/utils';
import {
    Calendar,
    Truck,
    Box,
    Handshake,
    CheckCircle2,
    Clock
} from 'lucide-react';

interface ProjectMiniTimelineProps {
    project: Project;
}

export function ProjectMiniTimeline({ project }: ProjectMiniTimelineProps) {
    const dates = [
        { label: 'Příjem', date: project.deadline, icon: <Calendar size={12} />, color: 'bg-blue-500' },
        { label: 'Podvozek', date: project.chassis_delivery, icon: <Truck size={12} />, color: 'bg-amber-500' },
        { label: 'Nástavba', date: project.body_delivery, icon: <Box size={12} />, color: 'bg-purple-500' },
        { label: 'Předání', date: project.customer_handover, icon: <Handshake size={12} />, color: 'bg-emerald-500' },
        { label: 'Uzavření', date: project.closed_at, icon: <CheckCircle2 size={12} />, color: 'bg-slate-500' },
    ].filter(d => d.date);

    if (dates.length < 2) {
        return (
            <div className="bg-muted/10 border border-border/50 rounded-xl p-4 flex items-center justify-center gap-3 text-muted-foreground italic text-xs">
                <Clock size={16} />
                Pro zobrazení časové osy zadejte alespoň 2 termíny.
            </div>
        );
    }

    const sortedDates = [...dates].sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());
    const minDate = new Date(sortedDates[0].date!).getTime();
    const maxDate = new Date(sortedDates[sortedDates.length - 1].date!).getTime();
    const range = maxDate - minDate || 1;

    const getPosition = (dateStr: string) => {
        const date = new Date(dateStr).getTime();
        return ((date - minDate) / range) * 100;
    };

    const today = new Date().getTime();
    const todayPos = today >= minDate && today <= maxDate ? ((today - minDate) / range) * 100 : null;

    return (
        <div className="bg-muted/10 border border-border/50 rounded-xl p-6 shadow-sm overflow-hidden">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-8 flex items-center gap-2">
                <Clock size={12} /> Průběh zakázky
            </h3>

            <div className="relative h-1.5 bg-muted rounded-full mb-12 mx-4">
                {/* Progress line */}
                <div
                    className="absolute h-full bg-primary/20 rounded-full"
                    style={{
                        left: '0%',
                        width: todayPos ? `${todayPos}%` : (today > maxDate ? '100%' : '0%')
                    }}
                />

                {/* Today indicator */}
                {todayPos !== null && (
                    <div
                        className="absolute top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary z-10"
                        style={{ left: `${todayPos}%` }}
                    >
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase text-primary whitespace-nowrap bg-background px-1 rounded border border-primary/20">
                            Dnes
                        </div>
                    </div>
                )}

                {/* Milestones */}
                {sortedDates.map((d, i) => {
                    const pos = getPosition(d.date!);
                    const isPast = new Date(d.date!).getTime() <= today;

                    return (
                        <div
                            key={i}
                            className="absolute top-1/2 -translate-y-1/2 group"
                            style={{ left: `${pos}%` }}
                        >
                            <div className={cn(
                                "w-4 h-4 rounded-full border-2 border-background flex items-center justify-center transition-all group-hover:scale-125 z-20 shadow-sm",
                                isPast ? d.color : "bg-muted text-muted-foreground"
                            )}>
                                <div className="text-white">
                                    {React.cloneElement(d.icon as React.ReactElement, { size: 8 })}
                                </div>
                            </div>

                            <div className={cn(
                                "absolute pt-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5",
                                i % 2 === 0 ? "top-full" : "bottom-full pb-4 top-auto"
                            )}>
                                <span className="text-[9px] font-black uppercase tracking-tight text-foreground whitespace-nowrap">
                                    {d.label}
                                </span>
                                <span className="text-[8px] font-bold text-muted-foreground whitespace-nowrap">
                                    {new Date(d.date!).toLocaleDateString('cs-CZ')}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
