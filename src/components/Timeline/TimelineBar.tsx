'use client';

import React, { useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Project } from '@/types/project';
import {
    Truck, Hammer, ThumbsUp, AlertTriangle, Play, Check, Milestone,
    Cog, Wrench, Zap, Cpu, Activity, Package, Box, HardHat,
    Construction, Factory, Pickaxe, Settings2, ShieldCheck,
    Container, Anchor, Component, Drill, Settings, Plus, X
} from 'lucide-react';

// ─── CUSTOM ICONS ────────────────────────────────────────────────
const HookLoader = ({ size = 24, ...props }: any) => (
    <svg width={size} height={size} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 17h18" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="17" cy="18" r="2" />
        <path d="M2 17h2v-4h4v4h2" />
        <path d="M18 17h4v-6h-4z" />
        <path d="M13 14l5-5h3" />
    </svg>
);

const HydraulicCrane = ({ size = 24, ...props }: any) => (
    <svg width={size} height={size} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 17h18" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="17" cy="18" r="2" />
        <path d="M2 17h2v-4h4v4h2" />
        <path d="M12 13l4-7 5 1" />
    </svg>
);

const HydraulicPlatform = ({ size = 24, ...props }: any) => (
    <svg width={size} height={size} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 17h18" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="17" cy="18" r="2" />
        <path d="M3 17v-3h4v3" />
        <path d="M10 17l3-6 3 6" />
        <path d="M11 11l2-4 2 4" />
        <path d="M11 7h4" />
    </svg>
);

const TruckCrane = ({ size = 24, ...props }: any) => (
    <svg width={size} height={size} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 17h20" />
        <circle cx="6" cy="18" r="2" />
        <circle cx="14" cy="18" r="2" />
        <circle cx="18" cy="18" r="2" />
        <path d="M2 17v-4h4l3 3h5v-3l7-5" />
    </svg>
);




const Crane = ({ size = 24, ...props }: any) => (
    <svg width={size} height={size} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 21h16" />
        <path d="M12 21V3" />
        <path d="M12 3l8 4" />
        <path d="M12 3H4" />
        <path d="M4 3v4" />
        <path d="M12 7H8" />
        <path d="M8 3v4" />
    </svg>
);

const Superstructure = ({ size = 24, ...props }: any) => (
    <svg width={size} height={size} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* Hook */}
        <path d="M12 2v2" />
        <circle cx="12" cy="5" r="1.5" />
        <path d="M12 6.5v2" />
        <path d="M12 8.5a2.5 2.5 0 0 0 2.5 2.5" />

        {/* Cables */}
        <path d="M12 11l-7 5" />
        <path d="M12 11l7 5" />

        {/* Load Block (Box) */}
        <path d="M5 16h14v6H5z" />
        <path d="M5 16l2-2h10l2 2" /> {/* Top/Perspective of box */}
        <path d="M12 16v6" /> {/* Center line */}
    </svg>
);

const ICON_OPTIONS = {
    Truck: Truck,
    Hammer: Hammer,
    ThumbsUp: ThumbsUp,
    AlertTriangle: AlertTriangle,
    Check: Check,
    Wrench: Wrench,
    Zap: Zap,
    Package: Package,
    Factory: Factory,
    ShieldCheck: ShieldCheck,
    Box: Box,
    Drill: Drill,
    Settings: Settings,
    HookLoader: HookLoader,
    HydraulicCrane: HydraulicCrane,
    HydraulicPlatform: HydraulicPlatform,
    TruckCrane: TruckCrane,
    Crane: Crane,
    Superstructure: Superstructure,
    Play: Play,
    Milestone: Milestone
};

interface IPhase {
    key: string;
    start: Date;
    end: Date;
    class: string;
}

interface IMilestone {
    key: string;
    date: Date;
    label: string;
    class: string;
}

interface ITimelineBarProps {
    id: string;
    name: string;
    project: Project;
    status: string | undefined;
    startDate: Date;
    endDate: Date;
    timelineStart: Date;
    dayWidth: number;
    topOffset?: number;
    isCollapsed?: boolean;
    config?: any;
}

const parseDate = (dateStr: string | undefined): Date | null => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    return isNaN(d.getTime()) ? null : d;
};

/**
 * Komponenta pro vykreslení jednoho řádku (projektu/servisu) v časové ose.
 * Zobrazuje fáze jako barevné plochy a milníky jako body.
 */
const TimelineBar: React.FC<ITimelineBarProps> = ({
    id,
    name,
    project,
    startDate,
    endDate,
    timelineStart,
    dayWidth,
    topOffset = 0,
    isCollapsed = false,
    config
}: ITimelineBarProps) => {
    const [activeCell, setActiveCell] = useState<string | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState<'top' | 'bottom'>('bottom');
    const [isUpdating, setIsUpdating] = useState(false);
    const [addMilestoneDate, setAddMilestoneDate] = useState<Date | null>(null);
    const [addMilestonePos, setAddMilestonePos] = useState<{ x: number, placement: 'top' | 'bottom' } | null>(null);
    // Parsujeme všechna data
    const t_closed = parseDate(project.closed_at) || parseDate(project.created_at);
    const t_chassis = parseDate(project.chassis_delivery);
    const t_body = parseDate(project.body_delivery);
    const t_handover = parseDate(project.customer_handover);
    const t_deadline = parseDate(project.deadline);

    // 1. Milníky (body v čase)
    const groupedMilestones = useMemo((): Record<string, IMilestone[]> => {
        const raw: IMilestone[] = [
            { key: 'chassis', date: t_chassis!, label: 'Podvozek', class: 'chassis' },
            { key: 'body', date: t_body!, label: 'Nástavba', class: 'body' },
            { key: 'handover', date: t_handover!, label: 'Předání', class: 'handover' },
            { key: 'deadline', date: t_deadline!, label: 'Deadline', class: 'deadline' },
        ].filter(m => m.date !== null);

        const groups: Record<string, IMilestone[]> = {};
        raw.forEach(m => {
            const d = m.date;
            const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(m);
        });
        return groups;
    }, [t_chassis, t_body, t_handover, t_deadline, project.project_type]);

    const handleDateUpdate = async (milestoneClass: string, newDateStr: string) => {
        setIsUpdating(true);
        try {
            const fieldMap: Record<string, string> = {
                'chassis': 'chassis_delivery',
                'body': 'body_delivery',
                'handover': 'customer_handover',
                'deadline': 'deadline'
            };

            const field = fieldMap[milestoneClass];
            if (!field) return;

            const { error } = await supabase
                .from('projects')
                .update({ [field]: newDateStr })
                .eq('id', id);

            if (error) throw error;

            // Refresh page to see changes
            setAddMilestoneDate(null); // Close popup
            window.location.reload();
        } catch (err) {
            console.error('Error updating milestone date:', err);
            alert('Chyba při ukládání data.');
        } finally {
            setIsUpdating(false);
        }
    };

    // 2. Fáze (plochy v čase)
    const phases = useMemo((): IPhase[] => {
        const list: IPhase[] = [];
        const mDates = [t_chassis, t_body, t_handover, t_deadline].filter((d): d is Date => d !== null);

        // Fáze 1: Zahájení (vlastní start -> první milník)
        if (t_closed && mDates.length > 0) {
            const firstM = new Date(Math.min(...mDates.map(d => d.getTime())));
            if (t_closed < firstM) {
                list.push({ key: 'p1', start: t_closed, end: firstM, class: 'phase-initial' });
            }
        }

        // Fáze 2: Příprava (mezi podvozkem a nástavbou)
        if (t_chassis && t_body) {
            const start = new Date(Math.min(t_chassis.getTime(), t_body.getTime()));
            const end = new Date(Math.max(t_chassis.getTime(), t_body.getTime()));
            if (start < end) {
                list.push({ key: 'p2', start, end, class: 'phase-mounting' });
            }
        }

        // Fáze 3 & 4: Dojezd po posledním milníku (podvozek nebo nástavba)
        const lastMainM = [t_chassis, t_body].filter((d): d is Date => d !== null);
        if (lastMainM.length > 0) {
            const maxMain = new Date(Math.max(...lastMainM.map(d => d.getTime())));

            // Fáze 3: Montáž (14 dní)
            const yellowEnd = new Date(maxMain);
            yellowEnd.setDate(yellowEnd.getDate() + 14);
            list.push({ key: 'p3', start: maxMain, end: yellowEnd, class: 'phase-buffer-yellow' });

            // Fáze 4: Revize (7 dní)
            const orangeEnd = new Date(yellowEnd);
            orangeEnd.setDate(orangeEnd.getDate() + 7);
            list.push({ key: 'p4', start: yellowEnd, end: orangeEnd, class: 'phase-buffer-orange' });
        }


        return list;
    }, [t_closed, t_chassis, t_body, t_handover, t_deadline, project.project_type]);

    /**
     * Vypočítá vodorovnou pozici data v pixelech vzhledem k začátku časové osy.
     * DST-safe calculation by counting days.
     */
    const getDatePos = (date: Date): number => {
        const d1 = new Date(timelineStart.getFullYear(), timelineStart.getMonth(), timelineStart.getDate());
        const d2 = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
        const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());

        const diffDays = Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
        return diffDays * dayWidth;
    };

    /**
     * Formátuje datum pro <input type="date"> v lokálním čase.
     */
    const formatLocalDate = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const containerStyle: React.CSSProperties = {
        ...(isCollapsed ? {
            pointerEvents: 'auto', // Enable hover for stacked rows
            zIndex: activeCell ? 10002 : 30, // Stacked rows on top, much higher on active tooltip
            background: 'transparent', // Was var(--background)
            boxShadow: 'none'
        } : {})
    };

    const handleDoubleClick = (e: React.MouseEvent) => {
        if (isCollapsed) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const days = Math.floor(x / dayWidth);
        const clickedDate = new Date(timelineStart);
        clickedDate.setDate(clickedDate.getDate() + days);
        clickedDate.setHours(0, 0, 0, 0);

        const screenHeight = window.innerHeight;
        const clickY = e.clientY;
        const isNearBottom = screenHeight - clickY < 300; // threshold for popup height

        setAddMilestoneDate(clickedDate);
        setAddMilestonePos({ x: x, placement: isNearBottom ? 'top' : 'bottom' });
    };

    return (
        <div
            className={`milestones-container ${isCollapsed ? 'is-collapsed-bar' : ''}`}
            style={containerStyle}
            onDoubleClick={handleDoubleClick}
        >
            {addMilestoneDate && !isCollapsed && (
                <div
                    className="absolute bg-background border border-border shadow-lg rounded-md p-2 z-[99999]"
                    style={{
                        left: addMilestonePos?.x || 0,
                        top: addMilestonePos?.placement === 'bottom' ? 30 : 'auto',
                        bottom: addMilestonePos?.placement === 'top' ? 40 : 'auto',
                        width: 200
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex justify-between items-center mb-2 pb-1 border-b border-border">
                        <span className="text-xs font-bold">{formatLocalDate(addMilestoneDate)}</span>
                        <button
                            onClick={() => setAddMilestoneDate(null)}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <X size={14} />
                        </button>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Přidat milník</span>
                        {[
                            { id: 'chassis', label: 'Podvozek' },
                            { id: 'body', label: 'Nástavba' },
                            { id: 'handover', label: 'Předání' },
                            { id: 'deadline', label: 'Deadline' },
                        ].map(type => (
                            <button
                                key={type.id}
                                className="text-xs text-left px-2 py-1.5 hover:bg-muted rounded flex items-center gap-2"
                                onClick={() => handleDateUpdate(type.id, formatLocalDate(addMilestoneDate))}
                            >
                                <Plus size={12} />
                                {type.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            {/* Vykreslení fází (podklad) */}
            {phases.map((p: IPhase) => {
                const left = getDatePos(p.start);
                const right = getDatePos(p.end);
                const width = right - left;
                if (width <= 0) return null;
                if (isCollapsed) {
                    // Check stack visibility setting
                    let configKey = '';
                    if (p.class === 'phase-initial') configKey = 'phaseInitial';
                    if (p.class === 'phase-mounting') configKey = 'phaseMounting';
                    if (p.class === 'phase-buffer-yellow') configKey = 'phaseBufferYellow';
                    if (p.class === 'phase-buffer-orange') configKey = 'phaseBufferOrange';

                    const phaseConfig = config?.colors?.[configKey] || config?.[configKey];
                    if (phaseConfig?.showInStack === false) return null;
                }

                // Specific opacity for stacked view
                let opacityStyle: React.CSSProperties = {};
                if (isCollapsed) {
                    if (p.class === 'phase-mounting') opacityStyle = { opacity: 0.2, zIndex: 1 }; // Příprava: 20%, vespod
                    if (p.class === 'phase-buffer-yellow') opacityStyle = { opacity: 0.5, zIndex: 2 }; // Montáž: 50%, střední vrstva
                    if (p.class === 'phase-buffer-orange') {
                        opacityStyle = {
                            opacity: 0.5,
                            zIndex: 3, // Revize: 50%, nejvyšší vrstva fází
                            background: 'linear-gradient(to right, #facc15, #fb923c)' // Gradient Yellow -> Orange
                        };
                    }
                }

                return (
                    <div
                        key={`${id}-${p.key}`}
                        className={`timeline-phase ${p.class} flex items-center px-2 overflow-hidden`}
                        style={{ left, width, ...opacityStyle }}
                        title={`${name}`}
                    >
                    </div>
                );
            })}

            {/* Vykreslení milníků (body) */}
            {(Object.entries(groupedMilestones) as [string, IMilestone[]][]).map(([dateKey, ms]) => {
                const [y, m_idx, d] = dateKey.split('-').map(Number);
                const date = new Date(y, m_idx - 1, d);
                const mLeft = getDatePos(date);
                const isHovered = activeCell === dateKey;

                // Dynamic icon size: adjust more reasonably at extreme zoom
                const baseSize = 26;
                let iconSize = baseSize;

                if (dayWidth < 5) {
                    iconSize = 14; // Much smaller at max zoom out
                } else if (dayWidth < 10) {
                    iconSize = 18;
                } else if (dayWidth < 20) {
                    iconSize = 24;
                }

                return (
                    <div
                        key={`${id}-${dateKey}`}
                        className={`milestone-cell ${isHovered ? 'is-active' : ''}`}
                        style={{
                            left: mLeft,
                            width: dayWidth,
                            zIndex: isHovered ? 1000 : (isCollapsed ? 30 : 20),
                            pointerEvents: 'auto'
                        }}
                        onMouseEnter={(e) => {
                            setActiveCell(dateKey);
                            const rect = e.currentTarget.getBoundingClientRect();
                            const spaceBelow = window.innerHeight - rect.bottom;
                            setTooltipPosition(spaceBelow < 250 ? 'top' : 'bottom');
                        }}
                        onMouseLeave={() => setActiveCell(null)}
                    >
                        <div className="milestone-icons-stack flex items-center justify-center relative w-full h-full">
                            {ms.map((m: IMilestone, idx) => {
                                const configMap: Record<string, string> = {
                                    'chassis': 'milestoneChassis',
                                    'body': 'milestoneBody',
                                    'handover': 'milestoneHandover',
                                    'deadline': 'milestoneDeadline'
                                };

                                const configKey = configMap[m.class];
                                const milestoneConfig = config?.colors?.[configKey] || config?.[configKey];

                                // Check stack visibility
                                if (isCollapsed && milestoneConfig?.showInStack === false) return null;

                                const IconKey = milestoneConfig?.icon as keyof typeof ICON_OPTIONS;
                                const Icon = ICON_OPTIONS[IconKey] || ICON_OPTIONS['Milestone'];
                                const milestoneColor = milestoneConfig?.color || '#888';

                                return (
                                    <div
                                        key={m.key}
                                        className="milestone-icon"
                                        style={{
                                            color: milestoneColor,
                                            transform: `scale(${isHovered ? 1.6 : 1.1})`,
                                            zIndex: idx
                                        }}
                                    >
                                        <Icon
                                            size={iconSize}
                                            color={milestoneColor}
                                            fill={IconKey === 'Play' ? milestoneColor : 'none'}
                                            strokeWidth={isHovered ? 3 : 2.5}
                                            className="milestone-svg"
                                        />
                                    </div>
                                );
                            })}
                        </div>

                        {isHovered && (
                            <div className={`milestone-tooltip-container ${tooltipPosition === 'top' ? 'tooltip-top' : ''}`}>
                                {ms.map((m: IMilestone) => {
                                    const configMap: Record<string, string> = {
                                        'chassis': 'milestoneChassis',
                                        'body': 'milestoneBody',
                                        'handover': 'milestoneHandover',
                                        'deadline': 'milestoneDeadline'
                                    };
                                    const configKey = configMap[m.class];
                                    const milestoneConfig = config?.colors?.[configKey] || config?.[configKey];
                                    const IconKey = milestoneConfig?.icon as keyof typeof ICON_OPTIONS;
                                    const Icon = ICON_OPTIONS[IconKey] || ICON_OPTIONS['Milestone'];
                                    const milestoneColor = milestoneConfig?.color || '#888';

                                    return (
                                        <div key={m.key} className="milestone-tooltip">
                                            <div className="tooltip-header" style={{ color: milestoneColor }}>
                                                <Icon size={12} className="mr-2" />
                                                <strong>{m.label}</strong>
                                            </div>
                                            <div className="tooltip-body">
                                                <input
                                                    type="date"
                                                    className="tooltip-date-input"
                                                    defaultValue={formatLocalDate(m.date)}
                                                    onChange={(e) => handleDateUpdate(m.class, e.target.value)}
                                                    disabled={isUpdating}
                                                />
                                                <div className="tooltip-project">{name}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default TimelineBar;
