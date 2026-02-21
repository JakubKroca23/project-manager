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
    Clock,
    Zap
} from 'lucide-react';

interface ProjectMiniTimelineProps {
    project: Project;
}

export function ProjectMiniTimeline({ project }: ProjectMiniTimelineProps) {
    const dates = [
        { label: 'Příjem', date: project.deadline, icon: <Zap size={10} />, color: 'bg-indigo-500', shadow: 'shadow-indigo-500/20' },
        { label: 'Podvozek', date: project.chassis_delivery, icon: <Truck size={10} />, color: 'bg-amber-500', shadow: 'shadow-amber-500/20' },
        { label: 'Nástavba', date: project.body_delivery, icon: <Box size={10} />, color: 'bg-purple-500', shadow: 'shadow-purple-500/20' },
        { label: 'Předání', date: project.customer_handover, icon: <Handshake size={10} />, color: 'bg-emerald-500', shadow: 'shadow-emerald-500/20' },
        { label: 'Uzavření', date: project.closed_at, icon: <CheckCircle2 size={10} />, color: 'bg-rose-500', shadow: 'shadow-rose-500/20' },
    ].filter(d => d.date);

    if (dates.length < 2) {
        return (
            <div className="bg-white/40 backdrop-blur-md border border-white/40 rounded-3xl p-8 flex flex-col items-center justify-center gap-3 text-slate-400 italic text-xs shadow-sm">
                <Clock size={24} className="text-slate-300" />
                <p>Zadejte alespoň 2 termíny pro zobrazení časové osy.</p>
            </div>
        );
    }

    const sortedDates = [...dates].sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());
    const minDate = new Date(sortedDates[0].date!);
    minDate.setDate(minDate.getDate() - 7);
    const maxDate = new Date(sortedDates[sortedDates.length - 1].date!);
    maxDate.setDate(maxDate.getDate() + 7);

    const range = maxDate.getTime() - minDate.getTime();

    const getPosition = (dateStr: string) => {
        const date = new Date(dateStr).getTime();
        return ((date - minDate.getTime()) / range) * 100;
    };

    const today = new Date();
    const todayPos = today.getTime() >= minDate.getTime() && today.getTime() <= maxDate.getTime()
        ? ((today.getTime() - minDate.getTime()) / range) * 100
        : null;

    return (
        <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-0 shadow-xl shadow-slate-200/50 overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-slate-200/50 bg-white/40 flex items-center justify-between">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-800 flex items-center gap-2">
                    <Clock size={16} className="text-primary" /> Časová osa zakázky
                </h3>
                {todayPos !== null && (
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Dnes
                    </div>
                )}
            </div>

            <div className="relative p-12 py-20">
                {/* Main Timeline Line */}
                <div className="relative h-1.5 bg-slate-100 rounded-full w-full">

                    {/* Progress Bar */}
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
                            className="absolute top-1/2 -translate-y-1/2 w-0.5 h-24 bg-primary/40 z-10"
                            style={{ left: `${todayPos}%` }}
                        >
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                        </div>
                    )}

                    {/* Milestones */}
                    {sortedDates.map((d, i) => {
                        const pos = getPosition(d.date!);
                        const isPast = new Date(d.date!).getTime() <= today.getTime();

                        return (
                            <div
                                key={i}
                                className="absolute top-1/2 -translate-y-1/2 group"
                                style={{ left: `${pos}%` }}
                            >
                                {/* Marker Circle */}
                                <div className={cn(
                                    "w-5 h-5 rounded-full border-4 border-white flex items-center justify-center transition-all group-hover:scale-125 z-20 shadow-lg",
                                    isPast ? d.color : "bg-slate-200 text-slate-400",
                                    isPast && d.shadow
                                )}>
                                    <div className="text-white">
                                        {React.cloneElement(d.icon as React.ReactElement, { size: 10, strokeWidth: 3 })}
                                    </div>
                                </div>

                                {/* Label */}
                                <div className={cn(
                                    "absolute pt-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 pointer-events-none",
                                    i % 2 === 0 ? "top-full" : "bottom-full pb-6 top-auto"
                                )}>
                                    <span className={cn(
                                        "text-[10px] font-bold uppercase tracking-tight whitespace-nowrap px-2 py-0.5 rounded-lg border",
                                        isPast ? "bg-white text-slate-900 border-slate-200 shadow-sm" : "bg-slate-50 text-slate-400 border-slate-100"
                                    )}>
                                        {d.label}
                                    </span>
                                    <span className="text-[9px] font-medium text-slate-400 whitespace-nowrap">
                                        {new Date(d.date!).toLocaleDateString('cs-CZ')}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
