'use client';

import React, { useMemo } from 'react';
import { Project } from '@/types/project';

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
    isCollapsed = false
}: ITimelineBarProps) => {
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

            // Zajištění minimálního trvání pro viditelnost (pokud jsou data stejná nebo chybí)
            if (start.getTime() === end.getTime()) {
                end = new Date(start);
                end.setDate(end.getDate() + 1);
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
            opacity: 0.2, // Hot zones effect
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

                return (
                    <div
                        key={`${id}-${p.key}`}
                        className={`timeline-phase ${p.class} flex items-center px-2 overflow-hidden`}
                        style={{ left, width }}
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
                            width: dayWidth
                        }}
                    >
                        {ms.map((m: IMilestone) => (
                            <div
                                key={m.key}
                                className={`milestone-part ${m.class}`}
                                title={`${m.label}: ${m.date.toLocaleDateString('cs-CZ')}`}
                            />
                        ))}
                    </div>
                );
            })}
        </div>
    );
};

export default TimelineBar;
