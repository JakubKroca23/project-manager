'use client';

import React, { useMemo } from 'react';
import { Project, Milestone } from '@/types/project';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import {
    Truck, Factory, Wrench, Shield, Check, Flag,
    Calendar, Play, Info
} from 'lucide-react';

interface ProjectTimelineFlatProps {
    project: Project;
    milestones: Milestone[];
}

const ICON_MAP: Record<string, React.ReactNode> = {
    start: <Play size={10} />,
    chassis: <Truck size={10} />,
    body: <Factory size={10} />,
    mounting_end: <Wrench size={10} />,
    revision_end: <Shield size={10} />,
    handover: <Check size={10} />,
};

const LABEL_MAP: Record<string, string> = {
    start: 'Zahájení',
    chassis: 'Podvozek',
    body: 'Nástavba',
    mounting_end: 'Montáž',
    revision_end: 'Revize',
    handover: 'Předání',
};

export function ProjectTimelineFlat({ project, milestones }: ProjectTimelineFlatProps) {
    const timelineData = useMemo(() => {
        // Sesbírat standardní data
        const standardDates = [
            { id: 'start', date: project.start_at || project.created_at, color: 'bg-slate-400', label: 'Zahájení' },
            { id: 'chassis', date: project.chassis_delivery, color: 'bg-blue-400', label: 'Podvozek' },
            { id: 'body', date: project.body_delivery, color: 'bg-indigo-400', label: 'Nástavba' },
            { id: 'mounting_end', date: project.custom_fields?.mounting_end_date, color: 'bg-emerald-400', label: 'Montáž' },
            { id: 'revision_end', date: project.custom_fields?.revision_end_date, color: 'bg-teal-400', label: 'Revize' },
            { id: 'handover', date: project.customer_handover || project.deadline, color: 'bg-amber-500', label: 'Předání' },
        ];

        // Přidat milníky z projektu, které mají datum
        const projectMilestones = milestones
            .filter(m => m.date)
            .map(m => ({
                id: m.id,
                date: m.date,
                color: m.status === 'completed' ? 'bg-emerald-500' : 'bg-slate-300',
                label: m.name,
                isCustom: true,
                iconKey: m.icon
            }));

        const allDates = [...standardDates, ...projectMilestones]
            .filter(d => Boolean(d.date))
            .map(d => ({
                ...d,
                dateObj: new Date(d.date!)
            }))
            .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

        if (allDates.length < 2) return null;

        const startTime = allDates[0].dateObj.getTime();
        const endTime = allDates[allDates.length - 1].dateObj.getTime();
        const duration = endTime - startTime || 1;

        // Vypočítat procenta se zajištěním minimálního rozestupu pro čitelnost
        const MIN_GAP = 12; // minimálně 12% rozestup
        let finalDates = allDates.map(d => ({
            ...d,
            percent: ((d.dateObj.getTime() - startTime) / duration) * 100
        }));

        // Upravit pozice tak, aby se nepřekrývaly
        for (let i = 1; i < finalDates.length; i++) {
            if (finalDates[i].percent - finalDates[i - 1].percent < MIN_GAP) {
                finalDates[i].percent = finalDates[i - 1].percent + MIN_GAP;
            }
        }

        // Znovu normalizovat, pokud jsme přelezli 100%
        const maxPercent = finalDates[finalDates.length - 1].percent;
        if (maxPercent > 100) {
            finalDates = finalDates.map(d => ({
                ...d,
                percent: (d.percent / maxPercent) * 100
            }));
        }

        return {
            dates: finalDates,
            durationDays: Math.ceil(duration / (1000 * 60 * 60 * 24))
        };
    }, [project, milestones]);

    if (!timelineData) return null;

    return (
        <div className="w-full py-12 selective-none px-8">
            <div className="relative h-1 bg-slate-200 rounded-full w-full">
                {/* Spojovací čáry mezi body */}
                <div className="absolute inset-0 flex items-center">
                    <div
                        className="h-full bg-amber-500/10 rounded-full"
                        style={{ width: '100%' }}
                    />
                </div>

                {/* Body v čase */}
                {timelineData.dates.map((item, idx) => {
                    const isEven = idx % 2 === 0;
                    return (
                        <div
                            key={item.id}
                            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center group"
                            style={{ left: `${item.percent}%` }}
                        >
                            {/* Tečka s ikonou */}
                            <div className={cn(
                                "w-7 h-7 rounded-full border-4 border-white shadow-md flex items-center justify-center text-white transition-all duration-300 hover:scale-125 z-10",
                                item.color
                            )}>
                                {ICON_MAP[item.id] || <Flag size={10} />}
                            </div>

                            {/* Label - střídání nahoru/dolů */}
                            <div className={cn(
                                "absolute flex flex-col items-center whitespace-nowrap",
                                isEven ? "bottom-8" : "top-8"
                            )}>
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-900">
                                    {item.label}
                                </span>
                                <span className="text-[9px] font-bold text-black font-mono">
                                    {formatDate(item.date)}
                                </span>
                                {isEven && <div className="w-px h-1.5 bg-slate-200 mt-1" />}
                                {!isEven && <div className="w-px h-1.5 bg-slate-200 mb-1 order-first" />}
                            </div>

                            {/* Tooltip při hoveru */}
                            <div className="absolute opacity-0 group-hover:opacity-100 transition-all bg-slate-900 text-white text-[9px] px-2 py-1 rounded bottom-14 pointer-events-none z-50 shadow-xl font-bold">
                                {formatDate(item.date)}: {item.label}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Info o délce trvání */}
            <div className="flex justify-center mt-20">
                <div className="px-4 py-1.5 bg-amber-500/5 border border-amber-500/20 rounded-full flex items-center gap-2 shadow-sm">
                    <Calendar size={11} className="text-amber-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600/80">
                        Realizace: {timelineData.durationDays} dní
                    </span>
                </div>
            </div>
        </div>
    );
}
