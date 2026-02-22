'use client';

import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Project, Milestone } from '@/types/project';
import '../Timeline/Timeline.css';
import { cn } from '@/lib/utils';
import {
    Truck, Hammer, ThumbsUp, AlertTriangle, Play, Check, Milestone as MilestoneIcon,
    Wrench, Package, Box, Factory, ShieldCheck, Drill, Settings,
    Zap, Clock, ChevronLeft, ChevronRight
} from 'lucide-react';

// --- CUSTOM ICONS (reused from main timeline) ---
const Hiab = ({ size = 20 }: { size?: number }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
        <svg version="1.1" viewBox="0 0 756 719" width={size} height={size} xmlSpace="preserve">
            <path fill="currentColor" fillRule="evenodd" d="M239.325577,244.186447 C203.676422,260.819580 181.076263,297.162354 182.767044,334.754974 C184.659683,376.835571 214.633133,412.044403 255.930511,420.166931 C290.925354,427.049896 321.923950,419.072845 348.072388,394.205811 C348.646942,393.659393 349.350281,393.248383 350.698639,392.254486 C350.876465,394.253387 351.104340,395.619995 351.103790,396.986572 C351.103790,420.319366 350.979187,443.652557 351.102631,466.984528 C351.123352,470.902740 349.982635,472.827637 346.087982,474.136627 C314.852814,484.634644 282.792542,488.090546 250.473999,482.307434 C176.538651,469.077393 127.043213,426.617065 103.475761,355.035187 C90.394173,315.302216 90.995651,275.095520 104.500275,235.729980 C124.083107,178.646637 162.374619,139.218216 219.688461,118.965439 C265.006805,102.951469 309.664490,106.366371 353.827484,123.622246 C379.737000,133.745926 403.279755,147.750900 425.192444,164.987671 C442.542694,178.635559 460.278503,192.182083 479.337524,203.185028 C515.062378,223.809326 554.102417,231.555420 595.280273,226.561981 C615.185608,224.148117 633.773682,217.584396 650.923706,207.098816 C652.627502,206.057114 654.341736,205.031387 656.075623,204.041153 C656.311707,203.906326 656.691223,204.022583 657.474792,204.022583 C657.474792,343.750275 657.474792,483.451508 657.474792,623.471130 C592.401489,623.471130 527.332031,623.471130 461.703094,623.471130 C465.198578,598.751526 472.556335,575.556274 481.364807,553.438538 C470.681000,543.735840 459.901154,534.822144 450.133575,524.910889 C420.921997,495.269623 402.146088,459.562714 389.878693,420.032654 C380.711121,390.491394 375.579071,360.200592 371.022034,329.723511 C367.572266,306.651764 359.240570,285.458252 344.542786,267.071228 C332.136230,251.550446 315.365082,243.249496 296.460724,238.938934 C277.059540,234.515060 258.087372,236.593246 239.325577,244.186447 z M405.066071,356.463867 C410.432312,383.842468 418.457458,410.395691 430.494324,435.600952 C445.061768,466.105164 463.614624,493.674988 490.639832,514.752502 C492.789459,516.429016 495.057343,517.953857 496.417114,518.934143 C513.274902,494.606476 529.752014,470.828064 546.346313,446.880646 C544.305969,446.365356 542.040405,445.919800 539.855347,445.221893 C516.372620,437.721619 498.028503,423.066315 483.016296,403.948822 C457.174347,371.040009 444.689209,332.920502 439.677368,291.924713 C438.283508,280.522980 437.043335,269.093719 435.263367,257.750763 C433.873779,248.895523 427.581482,243.368057 419.133240,242.589844 C411.363129,241.874100 404.838959,245.662964 401.942169,253.419128 C400.451782,257.409546 399.397797,266.087616 399.397797,266.087616 C397.282166,296.164215 399.298950,326.010345 405.066071,356.463867 z M526.730957,299.152283 C524.841736,300.771179 522.798889,302.243286 521.088745,304.033264 C511.238831,314.342743 509.870361,330.107635 517.726929,341.649139 C526.089478,353.933990 540.631409,358.646790 554.090332,352.992706 C565.409607,348.237457 572.231384,339.693481 573.135559,327.223969 C574.031616,314.867828 568.991577,305.131012 558.450073,298.728607 C548.244873,292.530487 537.709229,292.676788 526.730957,299.152283 z" />
        </svg>
    </div>
);

const wrapLucide = (Icon: any) => ({ size = 20, ...props }: any) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
        <Icon size={size - 4} strokeWidth={3} {...props} />
    </div>
);

const ICON_OPTIONS: Record<string, React.FC<any>> = {
    Truck: wrapLucide(Truck),
    Hammer: wrapLucide(Hammer),
    ThumbsUp: wrapLucide(ThumbsUp),
    AlertTriangle: wrapLucide(AlertTriangle),
    Play: wrapLucide(Play),
    Check: wrapLucide(Check),
    Milestone: wrapLucide(MilestoneIcon),
    Wrench: wrapLucide(Wrench),
    Package: wrapLucide(Package),
    Factory: wrapLucide(Factory),
    ShieldCheck: wrapLucide(ShieldCheck),
    Box: wrapLucide(Box),
    Drill: wrapLucide(Drill),
    Settings: wrapLucide(Settings),
    Hiab: Hiab,
    Zap: wrapLucide(Zap)
};

interface ProjectDetailTimelineProps {
    project: Project;
    milestones: Milestone[];
}

const parseDate = (d: string | undefined): Date | null => {
    if (!d) return null;
    const date = new Date(d);
    date.setHours(0, 0, 0, 0);
    return isNaN(date.getTime()) ? null : date;
};

export function ProjectDetailTimeline({ project, milestones }: ProjectDetailTimelineProps) {
    const dayWidth = 40;
    const rowHeight = 60;
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // 1. Calculate timeframe
    const timelineData = useMemo(() => {
        const dates = [
            parseDate(project.deadline),
            parseDate(project.chassis_delivery),
            parseDate(project.body_delivery),
            parseDate(project.customer_handover),
            parseDate(project.closed_at),
            parseDate(project.created_at),
            ...milestones.map(m => parseDate(m.date))
        ].filter((d): d is Date => d !== null);

        if (dates.length === 0) return null;

        const earliest = new Date(Math.min(...dates.map(d => d.getTime())));
        const latest = new Date(Math.max(...dates.map(d => d.getTime())));

        // Padding
        const start = new Date(earliest);
        start.setDate(start.getDate() - 7);
        const end = new Date(latest);
        end.setDate(end.getDate() + 14);

        const days: Date[] = [];
        let curr = new Date(start);
        while (curr <= end) {
            days.push(new Date(curr));
            curr.setDate(curr.setDate(curr.getDate() + 1));
        }

        return { start, end, days };
    }, [project, milestones]);

    useEffect(() => {
        if (scrollContainerRef.current && timelineData) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (today >= timelineData.start && today <= timelineData.end) {
                const diff = Math.floor((today.getTime() - timelineData.start.getTime()) / (1000 * 60 * 60 * 24));
                const offset = scrollContainerRef.current.clientWidth / 2;
                scrollContainerRef.current.scrollLeft = diff * dayWidth - offset;
            }
        }
    }, [timelineData]);

    if (!timelineData) return null;

    const { start, end, days } = timelineData;

    const getDatePos = (date: Date): number => {
        const utc1 = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
        const utc2 = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
        return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24)) * dayWidth;
    };

    // --- MILESTONES & PHASES LOGIC ---
    const t_start = parseDate(project.closed_at) || parseDate(project.created_at);
    const t_chassis = parseDate(project.chassis_delivery);
    const t_body = parseDate(project.body_delivery);
    const t_handover = parseDate(project.customer_handover);
    const t_deadline = parseDate(project.deadline);

    const mDates = [t_chassis, t_body, t_handover, t_deadline].filter((d): d is Date => d !== null);

    const phases = [];
    if (t_start && mDates.length > 0) {
        const firstM = new Date(Math.min(...mDates.map(d => d.getTime())));
        if (t_start < firstM) phases.push({ key: 'init', start: t_start, end: firstM, class: 'phase-initial' });
    }
    if (t_chassis && t_body) {
        const s = new Date(Math.min(t_chassis.getTime(), t_body.getTime()));
        const e = new Date(Math.max(t_chassis.getTime(), t_body.getTime()));
        if (s < e) phases.push({ key: 'prep', start: s, end: e, class: 'phase-mounting' });
    }
    const lastMainM = [t_chassis, t_body].filter((d): d is Date => d !== null);
    if (lastMainM.length > 0) {
        const mStart = new Date(Math.max(...lastMainM.map(d => d.getTime())));
        const mEnd = project.custom_fields?.mounting_end_date ? new Date(project.custom_fields.mounting_end_date) : new Date(mStart.getTime() + 14 * 86400000);
        phases.push({ key: 'assembly', start: mStart, end: mEnd, class: 'phase-buffer-yellow' });
    }

    const allMs = [
        ...(t_chassis ? [{ key: 'chassis', date: t_chassis, icon: 'Truck', color: '#000' }] : []),
        ...(t_body ? [{ key: 'body', date: t_body, icon: 'Hiab', color: '#000' }] : []),
        ...(t_handover ? [{ key: 'handover', date: t_handover, icon: 'ThumbsUp', color: '#000' }] : []),
        ...(t_deadline ? [{ key: 'deadline', date: t_deadline, icon: 'AlertTriangle', color: '#000' }] : []),
        ...milestones.map(m => ({ key: m.id, date: parseDate(m.date)!, icon: m.icon || 'Milestone', color: m.status === 'completed' ? '#22c55e' : '#000' }))
    ];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
        <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 overflow-hidden mb-12 group/timeline">
            {/* Header */}
            <div className="px-8 py-5 border-b border-slate-200/50 bg-white/40 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 text-primary rounded-2xl border border-primary/10 shadow-inner">
                        <Clock size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Časová osa projektu</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Interaktivní Ganttův diagram</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => scrollContainerRef.current?.scrollBy({ left: -300, behavior: 'smooth' })}
                        className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <button
                        onClick={() => scrollContainerRef.current?.scrollBy({ left: 300, behavior: 'smooth' })}
                        className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            {/* Scroll Container */}
            <div
                ref={scrollContainerRef}
                className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent custom-scrollbar"
                style={{ cursor: 'grab' }}
            >
                <div
                    className="relative min-w-full"
                    style={{
                        width: days.length * dayWidth,
                        height: 180, // Grid header + row + buffer
                        '--day-width': `${dayWidth}px`,
                        '--timeline-grid-line': 'rgba(0,0,0,0.05)',
                        '--bar-radius': '8px',
                        '--bar-height': '60%',
                        '--bar-opacity': 1,
                    } as any}
                >
                    {/* Time Header */}
                    <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-slate-200 flex flex-col">
                        {/* Months */}
                        <div className="flex h-6">
                            {Array.from(new Set(days.map(d => `${d.getFullYear()}-${d.getMonth()}`))).map(mKey => {
                                const [y, m] = mKey.split('-').map(Number);
                                const mDays = days.filter(d => d.getFullYear() === y && d.getMonth() === m);
                                return (
                                    <div
                                        key={mKey}
                                        className="h-full border-r border-slate-100 flex items-center justify-center text-[9px] font-black uppercase tracking-widest text-slate-500 bg-slate-50/50"
                                        style={{ width: mDays.length * dayWidth }}
                                    >
                                        {new Date(y, m).toLocaleDateString('cs-CZ', { month: 'long', year: 'numeric' })}
                                    </div>
                                );
                            })}
                        </div>
                        {/* Days */}
                        <div className="flex h-8 bg-white/40">
                            {days.map((day, idx) => {
                                const isW = day.getDay() === 0 || day.getDay() === 6;
                                const isT = day.getTime() === today.getTime();
                                return (
                                    <div
                                        key={idx}
                                        className={cn(
                                            "flex flex-col items-center justify-center border-r border-slate-50 text-[10px] font-bold",
                                            isW ? "bg-slate-100/50 text-slate-400" : "text-slate-600",
                                            isT && "text-primary border-primary/30 bg-primary/5"
                                        )}
                                        style={{ width: dayWidth }}
                                    >
                                        <span className="text-[7px] uppercase tracking-tighter opacity-50">{day.toLocaleDateString('cs-CZ', { weekday: 'short' })}</span>
                                        <span>{day.getDate()}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Grid Body */}
                    <div className="absolute top-14 left-0 right-0 bottom-0 pointer-events-none flex">
                        {days.map((day, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    "border-r border-slate-50 h-full",
                                    (day.getDay() === 0 || day.getDay() === 6) && "bg-slate-50/30"
                                )}
                                style={{ width: dayWidth }}
                            />
                        ))}
                    </div>

                    {/* Today Line */}
                    {today >= start && today <= end && (
                        <div
                            className="absolute top-14 bottom-0 w-0.5 bg-primary/40 z-10"
                            style={{ left: getDatePos(today) + dayWidth / 2 }}
                        >
                            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary shadow-lg shadow-primary/50" />
                        </div>
                    )}

                    {/* Content Area */}
                    <div className="absolute top-20 left-0 right-0 h-20">
                        {/* Phases */}
                        {phases.map(p => {
                            const l = getDatePos(p.start);
                            const r = getDatePos(p.end);
                            return (
                                <div
                                    key={p.key}
                                    className={cn("absolute top-2 h-10 rounded-xl border border-white/20 shadow-sm", p.class)}
                                    style={{ left: l, width: r - l }}
                                />
                            );
                        })}

                        {/* Milestones */}
                        {allMs.map((m, idx) => {
                            const Icon = ICON_OPTIONS[m.icon] || ICON_OPTIONS['Milestone'];
                            const isCompleted = project.custom_fields?.completed_milestones?.includes(m.key) ||
                                (milestones.find(cm => cm.id === m.key)?.status === 'completed');
                            const isPast = m.date < today;

                            return (
                                <div
                                    key={idx}
                                    className="absolute top-0 flex flex-col items-center pointer-events-auto group"
                                    style={{ left: getDatePos(m.date), width: dayWidth }}
                                >
                                    <div className="h-14 flex items-center justify-center">
                                        <div className={cn(
                                            "w-9 h-9 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-125 group-hover:z-50 shadow-lg",
                                            isCompleted ? "bg-emerald-500 shadow-emerald-500/20" :
                                                isPast ? "bg-rose-500 shadow-rose-500/20" :
                                                    "bg-white border-2 border-slate-200"
                                        )}>
                                            <Icon size={20} color="#000000" />
                                        </div>
                                    </div>
                                    {/* Tooltip on hover */}
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-14 bg-slate-900 text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg whitespace-nowrap z-[100] shadow-2xl pointer-events-none">
                                        {m.key === 'chassis' ? 'Podvozek' :
                                            m.key === 'body' ? 'Nástavba' :
                                                m.key === 'handover' ? 'Předání' :
                                                    m.key === 'deadline' ? 'Deadline' :
                                                        milestones.find(cm => cm.id === m.key)?.name || 'Milník'}
                                        <div className="text-[7px] opacity-70 mt-0.5">{m.date.toLocaleDateString('cs-CZ')}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-200/50 flex flex-wrap gap-6 items-center justify-center">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Hotovo
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Po termínu
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <div className="w-2.5 h-2.5 rounded-full bg-white border border-slate-200" /> Čeká
                </div>
                <div className="h-4 w-px bg-slate-200 mx-2" />
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase">
                        <div className="w-3 h-2 rounded-sm phase-initial opacity-60" /> Zahájení
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase">
                        <div className="w-3 h-2 rounded-sm phase-mounting opacity-60" /> Příprava
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase">
                        <div className="w-3 h-2 rounded-sm phase-buffer-yellow opacity-60" /> Montáž
                    </div>
                </div>
            </div>
        </div>
    );
}
