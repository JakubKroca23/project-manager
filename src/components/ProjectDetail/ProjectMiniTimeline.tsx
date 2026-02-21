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
    Zap,
    AlertTriangle,
    Milestone
} from 'lucide-react';

interface ProjectMiniTimelineProps {
    project: Project;
}

export function ProjectMiniTimeline({ project }: ProjectMiniTimelineProps) {
    const dates = [
        { label: 'Příjem', date: project.deadline, icon: <Zap size={10} />, color: 'bg-indigo-600', textColor: 'text-indigo-600' },
        { label: 'Podvozek', date: project.chassis_delivery, icon: <Truck size={10} />, color: 'bg-amber-600', textColor: 'text-amber-600' },
        { label: 'Nástavba', date: project.body_delivery, icon: <Box size={10} />, color: 'bg-purple-600', textColor: 'text-purple-600' },
        { label: 'Předání', date: project.customer_handover, icon: <Handshake size={10} />, color: 'bg-emerald-600', textColor: 'text-emerald-600' },
        { label: 'Uzavření', date: project.closed_at, icon: <CheckCircle2 size={10} />, color: 'bg-rose-600', textColor: 'text-rose-600' },
    ].filter(d => d.date);

    if (dates.length < 2) {
        return (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col items-center justify-center gap-3 text-zinc-500 italic text-xs shadow-xl">
                <Clock size={20} className="text-zinc-700" />
                <p>Zadejte alespoň 2 termíny pro zobrazení časové osy.</p>
            </div>
        );
    }

    const sortedDates = [...dates].sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());
    const minDate = new Date(sortedDates[0].date!);
    minDate.setDate(minDate.getDate() - 7); // Padding
    const maxDate = new Date(sortedDates[sortedDates.length - 1].date!);
    maxDate.setDate(maxDate.getDate() + 7); // Padding

    const range = maxDate.getTime() - minDate.getTime();

    const getPosition = (dateStr: string) => {
        const date = new Date(dateStr).getTime();
        return ((date - minDate.getTime()) / range) * 100;
    };

    const today = new Date();
    const todayPos = today.getTime() >= minDate.getTime() && today.getTime() <= maxDate.getTime()
        ? ((today.getTime() - minDate.getTime()) / range) * 100
        : null;

    // Generate month markers
    const monthMarkers = [];
    let current = new Date(minDate);
    current.setDate(1);
    while (current <= maxDate) {
        monthMarkers.push(new Date(current));
        current.setMonth(current.getMonth() + 1);
    }

    return (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-0 shadow-2xl overflow-hidden mb-6">
            <div className="px-5 py-3 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
                    <Clock size={14} className="text-primary" /> Časová osa zakázky
                </h3>
                <div className="text-[10px] font-bold text-zinc-500 flex gap-4">
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-zinc-700" /> Plán</span>
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Dnes</span>
                </div>
            </div>

            <div className="relative p-10 py-16 bg-[radial-gradient(circle_at_50%_50%,rgba(24,24,27,1)_0%,rgba(9,9,11,1)_100%)]">
                {/* Background Grid Lines */}
                <div className="absolute inset-0 flex justify-between pointer-events-none opacity-5">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="w-px h-full bg-white" />
                    ))}
                </div>

                {/* Main Timeline Line */}
                <div className="relative h-[2px] bg-zinc-800 rounded-full w-full">
                    {/* Month Markers */}
                    {monthMarkers.map((m, i) => {
                        const pos = getPosition(m.toISOString());
                        if (pos < 0 || pos > 100) return null;
                        return (
                            <div key={i} className="absolute top-1/2 -translate-y-1/2" style={{ left: `${pos}%` }}>
                                <div className="h-4 w-px bg-zinc-800" />
                                <div className="absolute top-6 left-1/2 -translate-x-1/2 text-[8px] font-bold text-zinc-600 uppercase">
                                    {m.toLocaleDateString('cs-CZ', { month: 'short' })}
                                </div>
                            </div>
                        );
                    })}

                    {/* Progress Bar */}
                    <div
                        className="absolute h-full bg-primary shadow-[0_0_15px_rgba(59,130,246,0.5)] rounded-full transition-all duration-1000"
                        style={{
                            left: '0%',
                            width: todayPos ? `${todayPos}%` : (today > maxDate ? '100%' : '0%')
                        }}
                    />

                    {/* Today indicator */}
                    {todayPos !== null && (
                        <div
                            className="absolute top-1/2 -translate-y-1/2 w-0.5 h-20 bg-primary/40 z-10"
                            style={{ left: `${todayPos}%` }}
                        >
                            <div className="absolute -top-1 w-2 h-2 rounded-full bg-primary left-1/2 -translate-x-1/2" />
                        </div>
                    )}

                    {/* Milestones Indicators */}
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
                                    "w-3 h-3 rounded-full border-2 border-zinc-950 flex items-center justify-center transition-all group-hover:scale-150 z-20 shadow-xl cursor-help",
                                    isPast ? d.color : "bg-zinc-800"
                                )}>
                                    {/* Tooltip or Label anchor point */}
                                </div>

                                {/* Label (Alternate top/bottom) */}
                                <div className={cn(
                                    "absolute flex flex-col items-center gap-1 transition-all group-hover:px-2 group-hover:py-1 group-hover:bg-zinc-900 group-hover:rounded group-hover:z-50",
                                    i % 2 === 0 ? "top-4" : "bottom-4 top-auto mb-1"
                                )}>
                                    <span className={cn(
                                        "text-[10px] font-black uppercase tracking-tighter whitespace-nowrap",
                                        isPast ? "text-zinc-200" : "text-zinc-500"
                                    )}>
                                        {d.label}
                                    </span>
                                    <span className={cn(
                                        "text-[9px] font-bold whitespace-nowrap px-1.5 py-0.5 rounded",
                                        isPast ? `${d.color} text-white` : "bg-zinc-800 text-zinc-500"
                                    )}>
                                        {new Date(d.date!).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' })}
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
