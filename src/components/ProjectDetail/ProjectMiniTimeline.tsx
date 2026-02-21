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
        { label: 'Příjem', date: project.deadline, icon: <Zap size={10} />, color: 'bg-indigo-600', textColor: 'text-indigo-600', dot: 'border-indigo-600' },
        { label: 'Podvozek', date: project.chassis_delivery, icon: <Truck size={10} />, color: 'bg-amber-600', textColor: 'text-amber-600', dot: 'border-amber-600' },
        { label: 'Nástavba', date: project.body_delivery, icon: <Box size={10} />, color: 'bg-purple-600', textColor: 'text-purple-600', dot: 'border-purple-600' },
        { label: 'Předání', date: project.customer_handover, icon: <Handshake size={10} />, color: 'bg-emerald-600', textColor: 'text-emerald-600', dot: 'border-emerald-600' },
        { label: 'Uzavření', date: project.closed_at, icon: <CheckCircle2 size={10} />, color: 'bg-rose-600', textColor: 'text-rose-600', dot: 'border-rose-600' },
    ].filter(d => d.date);

    if (dates.length < 2) {
        return (
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 text-slate-400 italic text-xs shadow-sm">
                <Clock size={24} className="text-slate-200" />
                <p>Zadejte alespoň 2 termíny pro zobrazení časové osy.</p>
            </div>
        );
    }

    const sortedDates = [...dates].sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());
    const minDate = new Date(sortedDates[0].date!);
    minDate.setDate(minDate.getDate() - 5);
    const maxDate = new Date(sortedDates[sortedDates.length - 1].date!);
    maxDate.setDate(maxDate.getDate() + 5);

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
        <div className="bg-white border-2 border-slate-950 rounded-2xl p-0 shadow-[8px_8px_0px_rgba(0,0,0,1)] overflow-hidden mb-8">
            <div className="px-6 py-4 border-b-2 border-slate-950 bg-slate-50 flex items-center justify-between">
                <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-950 flex items-center gap-2">
                    <Clock size={16} strokeWidth={3} /> Časová osa zakázky
                </h3>
                <div className="flex gap-4">
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-950">
                        <div className="w-2 h-2 rounded-full bg-primary" /> Dnes
                    </div>
                </div>
            </div>

            <div className="relative p-12 py-20 bg-white">
                {/* Background Grid Lines - Contrast */}
                <div className="absolute inset-0 flex justify-between pointer-events-none px-12">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="w-px h-full bg-slate-100" />
                    ))}
                </div>

                {/* Main Timeline Line */}
                <div className="relative h-1 bg-slate-200 rounded-full w-full">

                    {/* Progress Bar */}
                    <div
                        className="absolute h-full bg-slate-950 rounded-full transition-all duration-1000"
                        style={{
                            left: '0%',
                            width: todayPos ? `${todayPos}%` : (today > maxDate ? '100%' : '0%')
                        }}
                    />

                    {/* Today indicator */}
                    {todayPos !== null && (
                        <div
                            className="absolute top-1/2 -translate-y-1/2 w-[3px] h-24 bg-primary z-10 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                            style={{ left: `${todayPos}%` }}
                        >
                            <div className="absolute -top-1 w-3 h-3 rounded-full bg-primary left-1/2 -translate-x-1/2 border-2 border-white" />
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
                                    "w-4 h-4 rounded-full border-[3px] border-white flex items-center justify-center transition-all group-hover:scale-125 z-20 shadow-[0_0_0_2px_black]",
                                    isPast ? d.color : "bg-white border-slate-300 shadow-[0_0_0_2px_#cbd5e1]"
                                )}>
                                    <div className="text-white">
                                        {React.cloneElement(d.icon as React.ReactElement, { size: 8, strokeWidth: 4 })}
                                    </div>
                                </div>

                                {/* Label */}
                                <div className={cn(
                                    "absolute pt-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1",
                                    i % 2 === 0 ? "top-full" : "bottom-full pb-6 top-auto"
                                )}>
                                    <span className="text-[10px] font-black uppercase tracking-tight text-slate-950 whitespace-nowrap bg-white px-2 py-0.5 border-2 border-slate-950 shadow-[2px_2px_0px_black]">
                                        {d.label}
                                    </span>
                                    <span className={cn(
                                        "text-[9px] font-black whitespace-nowrap px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50",
                                        isPast ? d.textColor : "text-slate-400"
                                    )}>
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
