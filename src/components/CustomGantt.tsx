'use client';

import React, { useMemo, useRef, useEffect } from 'react';
import { GanttTask } from '@/types/gantt';

type ZoomLevel = 'day' | 'week' | 'month';

interface CustomGanttProps {
    tasks: GanttTask[];
    zoomLevel: ZoomLevel;
    startDate?: Date;
    endDate?: Date;
}

export const CustomGantt: React.FC<CustomGanttProps> = ({
    tasks,
    zoomLevel,
    startDate,
    endDate
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [localTasks, setLocalTasks] = React.useState<GanttTask[]>(tasks);

    // Sync props to local state
    useEffect(() => {
        setLocalTasks(tasks);
    }, [tasks]);

    // 1. Determine timeline range
    const { start, end, days } = useMemo(() => {
        let minDate = startDate ? new Date(startDate) : new Date();
        let maxDate = endDate ? new Date(endDate) : new Date();

        if (!startDate || !endDate) {
            if (localTasks.length > 0) {
                const starts = localTasks.map(t => t.start.getTime());
                const ends = localTasks.map(t => t.end.getTime());
                minDate = new Date(Math.min(...starts));
                maxDate = new Date(Math.max(...ends));
            } else {
                minDate = new Date(new Date().getFullYear(), 0, 1);
                maxDate = new Date(new Date().getFullYear(), 11, 31);
            }
        }

        minDate.setDate(minDate.getDate() - 7);
        maxDate.setDate(maxDate.getDate() + 30);
        minDate.setHours(0, 0, 0, 0);
        maxDate.setHours(0, 0, 0, 0);

        const dayArray = [];
        const curr = new Date(minDate);
        while (curr <= maxDate) {
            dayArray.push(new Date(curr));
            curr.setDate(curr.getDate() + 1);
        }

        return { start: minDate, end: maxDate, days: dayArray };
    }, [localTasks, startDate, endDate]);

    // 2. Configuration
    const config = useMemo(() => {
        switch (zoomLevel) {
            case 'day': return { cellWidth: 40 };
            case 'week': return { cellWidth: 30 };
            case 'month': return { cellWidth: 10 };
        }
    }, [zoomLevel]);

    // 3. Position Helpers
    const getLeftPos = (date: Date) => {
        const diffTime = date.getTime() - start.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        return diffDays * config.cellWidth;
    };

    const getWidth = (startDate: Date, endDate: Date) => {
        const diffTime = endDate.getTime() - startDate.getTime();
        const diffDays = Math.max(1, diffTime / (1000 * 60 * 60 * 24));
        return diffDays * config.cellWidth;
    };

    const getDateFromLeft = (left: number) => {
        const days = left / config.cellWidth;
        const date = new Date(start);
        date.setDate(date.getDate() + days);
        date.setHours(0, 0, 0, 0);
        return date;
    };

    // 4. Drag and Drop Logic
    const [draggingId, setDraggingId] = React.useState<string | number | null>(null);
    const dragStartX = useRef<number>(0);
    const dragTaskStart = useRef<Date | null>(null);
    const dragTaskEnd = useRef<Date | null>(null);

    const handleMouseDown = (e: React.MouseEvent, task: GanttTask) => {
        e.preventDefault();
        setDraggingId(task.id);
        dragStartX.current = e.clientX;
        dragTaskStart.current = new Date(task.start);
        dragTaskEnd.current = new Date(task.end);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!draggingId || !dragTaskStart.current || !dragTaskEnd.current) return;

        const deltaX = e.clientX - dragStartX.current;
        const deltaDays = Math.round(deltaX / config.cellWidth);

        if (deltaDays !== 0) {
            const newStart = new Date(dragTaskStart.current);
            newStart.setDate(newStart.getDate() + deltaDays);

            const duration = dragTaskEnd.current.getTime() - dragTaskStart.current.getTime();
            const newEnd = new Date(newStart.getTime() + duration);

            setLocalTasks(prev => prev.map(t =>
                t.id === draggingId ? { ...t, start: newStart, end: newEnd } : t
            ));
        }
    };

    const handleMouseUp = () => {
        setDraggingId(null);
        dragTaskStart.current = null;
        dragTaskEnd.current = null;
    };

    useEffect(() => {
        if (draggingId) {
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('mouseup', handleMouseUp);
        }
        return () => window.removeEventListener('mouseup', handleMouseUp);
    }, [draggingId]);


    // Scroll to today
    useEffect(() => {
        if (containerRef.current) {
            const today = new Date();
            const pos = getLeftPos(today);
            const containerWidth = containerRef.current.clientWidth;
            containerRef.current.scrollLeft = pos - (containerWidth / 2);
        }
    }, [start, config.cellWidth]);

    const getPhaseColorHex = (phase?: string) => {
        switch (phase) {
            case 'preparation': return '#22c55e'; // green-500
            case 'assembly': return '#eab308'; // yellow-500
            case 'final': return '#f97316'; // orange-500
            case 'delayed': return '#ef4444'; // red-500
            case 'completed': return '#a855f7'; // purple-500
            default: return '#9ca3af'; // gray-400
        }
    };

    // Group tasks by project
    const projectRows = useMemo(() => {
        const groups: Record<string, typeof localTasks> = {};
        localTasks.forEach(t => {
            const key = t.projectId || t.text; // Fallback to text if projectId missing
            if (!groups[key]) groups[key] = [];
            groups[key].push(t);
        });
        return Object.entries(groups).map(([projectId, tasks]) => ({
            id: projectId,
            name: tasks[0]?.text || 'Unknown Project', // Use first task text as project name
            tasks
        }));
    }, [localTasks]);

    return (
        <div
            className="h-full border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm flex flex-col w-full selection:bg-blue-100"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
            <div
                ref={containerRef}
                className="overflow-auto flex-1 relative custom-scrollbar w-full"
                style={{ maxHeight: 'calc(100vh - 280px)' }}
            >
                <table style={{ borderCollapse: 'separate', borderSpacing: 0, tableLayout: 'fixed', width: 'max-content' }}>
                    <thead className="sticky top-0 z-20 bg-gray-50 text-[11px]">
                        <tr>
                            <th className="sticky left-0 z-30 bg-gray-50 border-b border-r border-gray-200 h-9 px-4 font-bold text-gray-500 uppercase tracking-wider shadow-sm w-[250px] min-w-[250px] text-left">
                                Projekt
                            </th>
                            {days.map((d, i) => {
                                const isFirstOfMonth = d.getDate() === 1;
                                const isMonday = d.getDay() === 1;
                                const showLabel = (zoomLevel === 'day') || (zoomLevel === 'week' && isMonday) || (zoomLevel === 'month' && isFirstOfMonth);
                                const isToday = new Date().toDateString() === d.toDateString();
                                const isWeekend = d.getDay() === 0 || d.getDay() === 6;

                                return (
                                    <th
                                        key={i}
                                        className={`h-9 border-b border-r border-gray-100 relative p-0 font-normal box-border
                                            ${isFirstOfMonth ? 'border-l-[2px] border-l-gray-300' : ''}
                                            ${isToday ? 'bg-blue-50' : isWeekend ? 'bg-gray-50/50' : 'bg-white'}
                                        `}
                                        style={{ width: config.cellWidth, minWidth: config.cellWidth }}
                                    >
                                        {showLabel && (
                                            <span className={`absolute top-2 text-[10px] text-gray-500 whitespace-nowrap overflow-visible z-10 ${isFirstOfMonth ? 'left-1 font-bold text-gray-700' : 'left-1/2 -translate-x-1/2'}`}>
                                                {isFirstOfMonth ? d.toLocaleDateString('cs-CZ', { month: 'short' }) : d.getDate()}
                                            </span>
                                        )}
                                        {isToday && <div className="absolute top-0 bottom-0 left-0 right-0 border-l border-r border-blue-400 opacity-20 pointer-events-none"></div>}
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {projectRows.map((project) => (
                            <tr key={project.id} className="hover:bg-gray-50/40 group h-8 transition-colors">
                                {/* Project Name */}
                                <td className="sticky left-0 z-10 bg-white border-b border-r border-gray-200 px-4 h-8 group-hover:bg-gray-50/40 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] overflow-hidden">
                                    <div className="truncate text-[11px] font-semibold text-slate-700 w-[230px]" title={project.name}>
                                        {project.name}
                                    </div>
                                </td>

                                <td colSpan={days.length} className="relative p-0 h-8 border-b border-gray-50 align-top">
                                    {/* Grid Background */}
                                    <div className="absolute inset-0 flex pointer-events-none">
                                        {days.map((d, i) => {
                                            const isFirstOfMonth = d.getDate() === 1;
                                            const isToday = new Date().toDateString() === d.toDateString();
                                            const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                                            return (
                                                <div
                                                    key={i}
                                                    style={{ width: config.cellWidth, minWidth: config.cellWidth }}
                                                    className={`h-full border-r border-gray-50 
                                                        ${isFirstOfMonth ? 'border-l border-l-gray-300' : ''}
                                                        ${isToday ? 'bg-blue-50/20' : isWeekend ? 'bg-gray-50/30' : ''}
                                                    `}
                                                />
                                            );
                                        })}
                                    </div>

                                    {/* The Bars for this Project */}
                                    {project.tasks.map(task => (
                                        <div
                                            key={task.id}
                                            onMouseDown={(e) => handleMouseDown(e, task)}
                                            className={`absolute top-1.5 h-5 rounded-[4px] shadow-sm border border-white/20 hover:opacity-90 transition-opacity cursor-pointer z-10 group/bar
                                                ${draggingId === task.id ? 'opacity-80 scale-105 shadow-md ring-2 ring-blue-400 z-50' : ''}
                                            `}
                                            style={{
                                                left: getLeftPos(task.start),
                                                width: getWidth(task.start, task.end),
                                                minWidth: '10px',
                                                backgroundColor: getPhaseColorHex(task.phase),
                                                cursor: 'grab'
                                            }}
                                            title={`${task.text} (${getPhaseColorHex(task.phase)})`}
                                        >
                                            {/* Progress indicator */}
                                            {task.progress !== undefined && task.progress > 0 && (
                                                <div
                                                    className="h-full bg-white/20 rounded-l-[4px]"
                                                    style={{ width: `${task.progress}%` }}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
