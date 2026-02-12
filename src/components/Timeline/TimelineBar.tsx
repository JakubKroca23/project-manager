'use client';

import React, { useMemo } from 'react';
import { Project } from '@/types/project';
import {
    Truck, Hammer, ThumbsUp, AlertTriangle, Play, Check, Milestone,
    Cog, Wrench, Zap, Cpu, Activity, Package, Box, HardHat,
    Construction, Factory, Pickaxe, Settings2, ShieldCheck,
    Container, Anchor, Component, Drill, Settings
} from 'lucide-react';

const ICON_OPTIONS = {
    Truck, Hammer, ThumbsUp, AlertTriangle, Play, Check, Milestone,
    Cog, Wrench, Zap, Cpu, Activity, Package, Box, HardHat,
    Construction, Factory, Pickaxe, Settings2, ShieldCheck,
    Container, Anchor, Component, Drill, Settings
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
    isService?: boolean;
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
    isService = false,
    isCollapsed = false,
    config
}: ITimelineBarProps) => {
    const [activeTooltip, setActiveTooltip] = React.useState<string | null>(null);
    // Parsujeme všechna data
    const t_closed = parseDate(project.closed_at) || parseDate(project.created_at);
    const t_chassis = parseDate(project.chassis_delivery);
    const t_body = parseDate(project.body_delivery);
    const t_handover = parseDate(project.customer_handover);
    const t_deadline = parseDate(project.deadline);

    // 1. Milníky (body v čase)
    const groupedMilestones = useMemo((): Record<string, IMilestone[]> => {
        if (project.project_type === 'service') {
            const raw: IMilestone[] = [
                { key: 'service_start', date: t_deadline!, label: 'Zahájení servisu', class: 'service-start' },
                { key: 'service_end', date: t_handover!, label: 'Ukončení servisu', class: 'service-end' },
            ].filter(m => m.date !== null);

            const groups: Record<string, IMilestone[]> = {};
            raw.forEach(m => {
                const dateKey = m.date.toISOString().split('T')[0];
                if (!groups[dateKey]) groups[dateKey] = [];
                groups[dateKey].push(m);
            });
            return groups;
        }

        const raw: IMilestone[] = [
            { key: 'chassis', date: t_chassis!, label: 'Podvozek', class: 'chassis' },
            { key: 'body', date: t_body!, label: 'Nástavba', class: 'body' },
            { key: 'handover', date: t_handover!, label: 'Předání', class: 'handover' },
            { key: 'deadline', date: t_deadline!, label: 'Deadline', class: 'deadline' },
        ].filter(m => m.date !== null);

        const groups: Record<string, IMilestone[]> = {};
        raw.forEach(m => {
            const dateKey = m.date.toISOString().split('T')[0];
            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(m);
        });
        return groups;
    }, [t_chassis, t_body, t_handover, t_deadline, project.project_type]);

    // 2. Fáze (plochy v čase)
    const phases = useMemo((): IPhase[] => {
        if (project.project_type === 'service') {
            const start = startDate;
            let end = endDate;

            // Pokud máme start, vypočteme konec podle délky trvání (pokud není zadán handover)
            if (start && (!end || start.getTime() === end.getTime())) {
                const duration = project.service_duration ? parseInt(project.service_duration) : 1;
                end = new Date(start);
                end.setDate(end.getDate() + duration);
            }

            if (start && end && start <= end) {
                return [{ key: 'service-main', start, end, class: 'phase-service' }];
            }
            return [];
        }

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
    }, [t_closed, t_chassis, t_body, t_handover, t_deadline, project.project_type, t_deadline, t_handover]);

    /**
     * Vypočítá vodorovnou pozici data v pixelech vzhledem k začátku časové osy.
     */
    const getDatePos = (date: Date): number => {
        const diff = (date.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24);
        return diff * dayWidth;
    };

    const containerStyle: React.CSSProperties = {
        ...(isService ? {
            top: topOffset || 0,
            height: 'var(--timeline-row-height)',
            padding: '2px 0'
        } : {}),
        ...(isCollapsed ? {
            // opacity: 0.2, // Removed global opacity
            pointerEvents: 'none',
            zIndex: 1
        } : {})
    };

    return (
        <div className={`milestones-container ${isCollapsed ? 'is-collapsed-bar' : ''}`} style={containerStyle}>
            {/* Vykreslení fází (podklad) */}
            {phases.map((p: IPhase) => {
                const left = getDatePos(p.start);
                const right = getDatePos(p.end);
                const width = right - left;
                if (width <= 0) return null;
                if (isCollapsed && p.class === 'phase-initial') return null; // Hide initial phase in hot zones

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
                    if (p.class === 'phase-service') opacityStyle = { opacity: 0.5, zIndex: 2 }; // Servis: 50%
                }

                return (
                    <div
                        key={`${id}-${p.key}`}
                        className={`timeline-phase ${p.class} flex items-center px-2 overflow-hidden`}
                        style={{ left, width, ...opacityStyle }}
                        title={`${name}${p.key === 'service-main' ? ' (Servis)' : ''}`}
                    >
                        {p.key === 'service-main' && width > 40 && (
                            <span className="text-[9px] font-bold text-indigo-700 truncate drop-shadow-sm whitespace-nowrap">
                                {name}
                            </span>
                        )}
                    </div>
                );
            })}

            {/* Vykreslení milníků (body) */}
            {(Object.entries(groupedMilestones) as [string, IMilestone[]][]).map(([dateKey, ms]) => {
                const date = new Date(dateKey);
                const mLeft = getDatePos(date);

                return (
                    <div
                        key={`${id}-${dateKey}`}
                        className="milestone-cell"
                        style={{
                            left: mLeft,
                            width: dayWidth,
                            opacity: isCollapsed ? 1 : 1 // Milníky: 100%
                        }}
                    >
                        {ms.map((m: IMilestone) => {
                            const configMap: Record<string, string> = {
                                'chassis': 'milestoneChassis',
                                'body': 'milestoneBody',
                                'handover': 'milestoneHandover',
                                'deadline': 'milestoneDeadline',
                                'service-start': 'milestoneServiceStart',
                                'service-end': 'milestoneServiceEnd'
                            };

                            const configKey = configMap[m.class];
                            const milestoneConfig = config?.colors?.[configKey] || config?.[configKey];
                            const IconKey = milestoneConfig?.icon as keyof typeof ICON_OPTIONS;
                            const Icon = ICON_OPTIONS[IconKey] || ICON_OPTIONS['Milestone'];

                            // Fixed larger icon size
                            const iconSize = 22;
                            const milestoneColor = milestoneConfig?.color || '#888';
                            const milestoneId = `${id}-${m.key}-${dateKey}`;
                            const isHovered = activeTooltip === milestoneId;

                            return (
                                <div
                                    key={m.key}
                                    className={`milestone-icon flex items-center justify-center transition-transform ${isHovered ? 'is-hovering' : ''}`}
                                    style={{ width: '100%', height: '100%', pointerEvents: 'auto', cursor: 'pointer' }}
                                    onMouseEnter={() => setActiveTooltip(milestoneId)}
                                    onMouseLeave={() => setActiveTooltip(null)}
                                >
                                    <Icon
                                        size={iconSize}
                                        color={milestoneColor}
                                        fill={IconKey === 'Play' ? milestoneColor : 'none'}
                                        strokeWidth={isHovered ? 3 : 2.5}
                                        className="milestone-svg"
                                    />

                                    {isHovered && (
                                        <div className="milestone-tooltip">
                                            <div className="tooltip-header" style={{ color: milestoneColor }}>
                                                <Icon size={12} className="mr-2" />
                                                <strong>{m.label}</strong>
                                            </div>
                                            <div className="tooltip-body">
                                                <div className="tooltip-date">{m.date.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                                                <div className="tooltip-project">{name}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                );
            })}
        </div>
    );
};

export default TimelineBar;
