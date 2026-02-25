'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Project, Milestone } from '@/types/project';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase/client';
import {
    Truck, Factory, Wrench, Shield, Check, Flag,
    Calendar, Play, Info, Zap, ThumbsUp, Package, AlertTriangle, X,
    LucideIcon
} from 'lucide-react';

interface ProjectTimelineFlatProps {
    project: Project;
    milestones: Milestone[];
    isEditing?: boolean;
    onCustomFieldChange?: (field: string, value: any) => void;
}

// ─── CUSTOM ICONS ────────────────────────────────────────────────

const Hiab = ({ size = 24 }: { size?: number }) => (
    <svg version="1.1" viewBox="0 0 756 719" width={size} height={size} style={{ display: 'block' }}>
        <path fill="currentColor" fillRule="evenodd" d="M239.325577,244.186447 C203.676422,260.819580 181.076263,297.162354 182.767044,334.754974 C184.659683,376.835571 214.633133,412.044403 255.930511,420.166931 C290.925354,427.049896 321.923950,419.072845 348.072388,394.205811 C348.646942,393.659393 349.350281,393.248383 350.698639,392.254486 C350.876465,394.253387 351.104340,395.619995 351.103790,396.986572 C351.103790,420.319366 350.979187,443.652557 351.102631,466.984528 C351.123352,470.902740 349.982635,472.827637 346.087982,474.136627 C314.852814,484.634644 282.792542,488.090546 250.473999,482.307434 C176.538651,469.077393 127.043213,426.617065 103.475761,355.035187 C90.394173,315.302216 90.995651,275.095520 104.500275,235.729980 C124.083107,178.646637 162.374619,139.218216 219.688461,118.965439 C265.006805,102.951469 309.664490,106.366371 353.827484,123.622246 C379.737000,133.745926 403.279755,147.750900 425.192444,164.987671 C442.542694,178.635559 460.278503,192.182083 479.337524,203.185028 C515.062378,223.809326 554.102417,231.555420 595.280273,226.561981 C615.185608,224.148117 633.773682,217.584396 650.923706,207.098816 C652.627502,206.057114 654.341736,205.031387 656.075623,204.041153 C656.311707,203.906326 656.691223,204.022583 657.474792,204.022583 C657.474792,343.750275 657.474792,483.451508 657.474792,623.471130 C592.401489,623.471130 527.332031,623.471130 461.703094,623.471130 C465.198578,598.751526 472.556335,575.556274 481.364807,553.438538 C470.681000,543.735840 459.901154,534.822144 450.133575,524.910889 C420.921997,495.269623 402.146088,459.562714 389.878693,420.032654 C380.711121,390.491394 375.579071,360.200592 371.022034,329.723511 C367.572266,306.651764 359.240570,285.458252 344.542786,267.071228 C332.136230,251.550446 315.365082,243.249496 296.460724,238.938934 C277.059540,234.515060 258.087372,236.593246 239.325577,244.186447 z M405.066071,356.463867 C410.432312,383.842468 418.457458,410.395691 430.494324,435.600952 C445.061768,466.105164 463.614624,493.674988 490.639832,514.752502 C492.789459,516.429016 495.057343,517.953857 496.417114,518.934143 C513.274902,494.606476 529.752014,470.828064 546.346313,446.880646 C544.305969,446.365356 542.040405,445.919800 539.855347,445.221893 C516.372620,437.721619 498.028503,423.066315 483.016296,403.948822 C457.174347,371.040009 444.689209,332.920502 439.677368,291.924713 C438.283508,280.522980 437.043335,269.093719 435.263367,257.750763 C433.873779,248.895523 427.581482,243.368057 419.133240,242.589844 C411.363129,241.874100 404.838959,245.662964 401.942169,253.419128 C400.451782,257.409546 399.397797,266.087616 399.397797,266.087616 C397.282166,296.164215 399.298950,326.010345 405.066071,356.463867 z M526.730957,299.152283 C524.841736,300.771179 522.798889,302.243286 521.088745,304.033264 C511.238831,314.342743 509.870361,330.107635 517.726929,341.649139 C526.089478,353.933990 540.631409,358.646790 554.090332,352.992706 C565.409607,348.237457 572.231384,339.693481 573.135559,327.223969 C574.031616,314.867828 568.991577,305.131012 558.450073,298.728607 C548.244873,292.530487 537.709229,292.676788 526.730957,299.152283 z" />
    </svg>
);

const ICON_MAP: Record<string, LucideIcon | any> = {
    Truck: Truck,
    Hammer: Factory, // Use Factory for Hammer if needed
    ThumbsUp: ThumbsUp,
    AlertTriangle: AlertTriangle,
    Play: Play,
    Check: Check,
    Wrench: Wrench,
    Package: Package,
    Factory: Factory,
    Zap: Zap,
    Hiab: Hiab
};

export function ProjectTimelineFlat({ project, milestones, isEditing, onCustomFieldChange }: ProjectTimelineFlatProps) {
    const [config, setConfig] = useState<any>(null);
    const [activePopover, setActivePopover] = useState<string | null>(null);

    // Fetch global timeline configuration
    useEffect(() => {
        async function fetchConfig() {
            const { data } = await supabase
                .from('app_settings')
                .select('settings')
                .eq('id', 'timeline_config')
                .maybeSingle();

            if (data?.settings) {
                setConfig(data.settings);
            }
        }
        fetchConfig();
    }, []);

    const timelineData = useMemo(() => {
        const completedMilestones = project.custom_fields?.completed_milestones || [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Map settings keys to our internal IDs (database fields)
        const settingsMap: Record<string, string> = {
            start_at: 'milestoneStart',
            chassis_delivery: 'milestoneChassis',
            body_delivery: 'milestoneBody',
            mounting_end_date: 'milestoneMountingEnd',
            revision_end_date: 'milestoneRevisionEnd',
            customer_handover: 'milestoneHandover'
        };

        // Sesbírat standardní data (ID musí odpovídat názvům polí v Project)
        const standardDates = [
            { id: 'start_at', date: project.start_at || project.created_at, label: 'Zahájení', defaultColor: '#94a3b8' },
            { id: 'chassis_delivery', date: project.chassis_delivery, label: 'Podvozek', defaultColor: '#3b82f6' },
            { id: 'body_delivery', date: project.body_delivery, label: 'Nástavba', defaultColor: '#6366f1' },
            { id: 'mounting_end_date', date: project.custom_fields?.mounting_end_date, label: 'Montáž', defaultColor: '#10b981' },
            { id: 'revision_end_date', date: project.custom_fields?.revision_end_date, label: 'Revize', defaultColor: '#14b8a6' },
            { id: 'customer_handover', date: project.customer_handover || project.deadline, label: 'Předání', defaultColor: '#f59e0b' },
        ];

        // Přidat milníky z projektu, které mají datum
        const projectMilestones = milestones
            .filter(m => m.date)
            .map(m => ({
                id: m.id,
                date: m.date,
                label: m.name,
                isCustom: true,
                iconKey: m.icon,
                status: m.status,
                defaultColor: '#94a3b8'
            }));

        const allDates = [...standardDates, ...projectMilestones]
            .filter(d => Boolean(d.date))
            .map(d => {
                const dateObj = new Date(d.date!);
                dateObj.setHours(0, 0, 0, 0);

                // Determine confirmation from custom_fields
                const confirmedDate = config?.settingsMap?.[d.id]
                    ? project.custom_fields?.[`${d.id}_confirmed`]
                    : (d.id.length < 20 ? project.custom_fields?.[`${d.id}_confirmed`] : null);

                const isCompleted = d.id === 'start_at'
                    ? true
                    : (d.id.length > 20
                        ? (d as any).status === 'completed'
                        : (completedMilestones.includes(d.id) || !!confirmedDate));

                // Determine if overdue
                const isOverdue = !isCompleted && dateObj < today;

                // Apply dynamic settings if available
                const settingKey = settingsMap[d.id];
                const setting = config?.colors?.[settingKey];

                // Final color logic: Completed/Confirmed > Overdue > Dynamic > Default
                let finalColor = (d as any).defaultColor;
                if (isCompleted) {
                    finalColor = '#22c55e'; // Green
                } else if (isOverdue) {
                    finalColor = '#ef4444'; // Red
                } else if (setting?.color && setting.color !== '#000000') {
                    finalColor = setting.color;
                }

                return {
                    ...d,
                    dateObj,
                    confirmedDate,
                    isCompleted,
                    finalColor,
                    dynamicIcon: setting?.icon ? setting.icon : null
                };
            })
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

        const todayPercent = ((today.getTime() - startTime) / duration) * 100;

        return {
            dates: finalDates,
            durationDays: Math.ceil(duration / (1000 * 60 * 60 * 24)),
            todayPercent
        };
    }, [project, milestones, config]);

    const handleIconClick = (item: any) => {
        if (!isEditing || !onCustomFieldChange || item.id === 'start_at') return;
        setActivePopover(activePopover === item.id ? null : item.id);
    };

    const confirmMilestone = (item: any, type: 'original' | 'today' | 'clear') => {
        if (!onCustomFieldChange) return;

        const fieldName = `${item.id}_confirmed`;
        let dateVal = null;

        if (type === 'original') {
            dateVal = item.date ? new Date(item.date).toISOString().split('T')[0] : null;
        } else if (type === 'today') {
            dateVal = new Date().toISOString().split('T')[0];
        }

        onCustomFieldChange(fieldName, dateVal);
        setActivePopover(null);
    };

    if (!timelineData) return null;

    // Helper for icon rendering
    const renderIcon = (item: any) => {
        // Prioritize dynamic icon from settings
        const iconKey = item.dynamicIcon || (item.id === 'start_at' ? 'Zap' :
            item.id === 'chassis_delivery' ? 'Truck' :
                item.id === 'body_delivery' ? 'Hiab' :
                    item.id === 'mounting_end_date' ? 'Package' :
                        item.id === 'revision_end_date' ? 'Factory' :
                            item.id === 'customer_handover' ? 'ThumbsUp' :
                                item.iconKey);

        const IconComp = ICON_MAP[iconKey] || Flag;
        return <IconComp size={iconKey === 'Hiab' ? 14 : 10} />;
    };

    return (
        <div className="w-full py-12 select-none px-8">
            <div className="relative h-1 bg-slate-200 rounded-full w-full">
                {/* Spojovací čáry mezi body */}
                <div className="absolute inset-0 flex items-center">
                    <div
                        className="h-full bg-amber-500/10 rounded-full"
                        style={{ width: '100%' }}
                    />
                </div>

                {/* Linka "Dnes" */}
                {timelineData.todayPercent >= 0 && timelineData.todayPercent <= 100 && (
                    <div
                        className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center z-20 pointer-events-none"
                        style={{ left: `${timelineData.todayPercent}%` }}
                    >
                        {/* Vertikální čárka přes osu */}
                        <div className="w-[2px] h-6 bg-primary/40 rounded-full" />

                        {/* Pulzující kroužek */}
                        <div className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.5)]">
                            <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-40" />
                        </div>

                        {/* Štítek "Dnes" */}
                        <span className="absolute -top-6 text-[9px] font-black uppercase tracking-widest text-primary/80 bg-white/80 px-1.5 py-0.5 rounded-md backdrop-blur-sm border border-primary/10">
                            Dnes
                        </span>
                    </div>
                )}

                {/* Body v čase */}
                {timelineData.dates.map((item, idx) => {
                    const isEven = idx % 2 === 0;
                    const isPopping = activePopover === item.id;

                    return (
                        <div
                            key={item.id}
                            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center group"
                            style={{ left: `${item.percent}%`, zIndex: isPopping ? 50 : 10 }}
                        >
                            {/* Kontexní menu pro potvrzení - SVĚTLÝ ALE VÝRAZNÝ STYL */}
                            {isPopping && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40 bg-white/40 backdrop-blur-[2px]"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActivePopover(null);
                                        }}
                                    />
                                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-white border-2 border-amber-500 rounded-2xl shadow-[0_20px_40px_-5px_rgba(0,0,0,0.2)] p-2 z-50 flex flex-col gap-1.5 min-w-[210px] animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200 origin-bottom">
                                        <div className="flex items-center justify-between px-2 py-1.5 mb-1 border-b border-slate-100">
                                            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Zadat skutečnost</span>
                                            <button onClick={() => setActivePopover(null)} className="p-1 hover:bg-slate-100 rounded-lg transition-colors group">
                                                <X size={12} className="text-slate-400 group-hover:text-slate-900" />
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => confirmMilestone(item, 'original')}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 bg-slate-50 hover:bg-amber-500 rounded-xl transition-all text-left group/btn border border-slate-200 hover:border-amber-600 shadow-sm hover:shadow-md"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center group-hover/btn:border-transparent transition-colors">
                                                <Calendar size={14} className="text-amber-600 group-hover/btn:text-amber-900" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight group-hover/btn:text-white">Plánované datum</span>
                                                <span className="text-[10px] font-bold text-amber-700 group-hover/btn:text-amber-100">{formatDate(item.date)}</span>
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => confirmMilestone(item, 'today')}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 bg-slate-50 hover:bg-emerald-600 rounded-xl transition-all text-left group/btn border border-slate-200 hover:border-emerald-700 shadow-sm hover:shadow-md"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center group-hover/btn:border-transparent transition-colors">
                                                <div className="relative">
                                                    <Calendar size={14} className="text-emerald-600 group-hover/btn:text-emerald-900" />
                                                    <div className="absolute -right-1 -bottom-1 w-2.5 h-2.5 bg-emerald-600 rounded-full border-2 border-white flex items-center justify-center group-hover/btn:bg-white">
                                                        <Check size={6} className="text-white group-hover/btn:text-emerald-900" strokeWidth={5} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight group-hover/btn:text-white">Uděláno dnes</span>
                                                <span className="text-[10px] font-bold text-emerald-700 group-hover/btn:text-emerald-100">{formatDate(new Date())}</span>
                                            </div>
                                        </button>

                                        {item.confirmedDate && (
                                            <button
                                                onClick={() => confirmMilestone(item, 'clear')}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 bg-rose-50 hover:bg-rose-600 rounded-xl transition-all text-left mt-1 group/btn border border-rose-100 hover:border-rose-700"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-white border border-rose-200 flex items-center justify-center group-hover/btn:border-transparent transition-colors">
                                                    <X size={14} className="text-rose-600 group-hover/btn:text-rose-900" />
                                                </div>
                                                <span className="text-[11px] font-black text-rose-700 group-hover/btn:text-white uppercase tracking-tight">Zrušit potvrzení</span>
                                            </button>
                                        )}

                                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r-2 border-b-2 border-amber-500 rotate-45" />
                                    </div>
                                </>
                            )}
                            {/* Tečka s ikonou */}
                            <div
                                onClick={() => handleIconClick(item)}
                                className={cn(
                                    "w-7 h-7 rounded-full border-4 border-white shadow-md flex items-center justify-center text-white transition-all duration-300 z-10",
                                    isEditing && item.id !== 'start_at' ? "cursor-pointer hover:scale-125 hover:shadow-lg active:scale-95" : "hover:scale-110",
                                    item.isCompleted && isEditing && item.id !== 'start_at' ? "ring-2 ring-emerald-500/20 ring-offset-2" : ""
                                )}
                                style={{ backgroundColor: item.finalColor }}
                            >
                                {renderIcon(item)}
                            </div>

                            {/* Label - vše pod ikonami */}
                            <div className="absolute flex flex-col items-center whitespace-nowrap top-8">
                                <div className="w-px h-1.5 bg-slate-200 mb-1 order-first" />
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-900">
                                    {item.label}
                                </span>
                                <span className={cn(
                                    "text-[9px] font-bold font-mono",
                                    item.isCompleted ? "text-emerald-600" : "text-black"
                                )}>
                                    {item.confirmedDate ? formatDate(item.confirmedDate) : formatDate(item.date)}
                                    {item.confirmedDate && <Check size={8} className="inline ml-0.5 mb-0.5" strokeWidth={4} />}
                                </span>
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
