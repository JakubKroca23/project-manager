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

    // 1. Determine timeline range
    const { start, end, days } = useMemo(() => {
        let minDate = startDate ? new Date(startDate) : new Date();
        let maxDate = endDate ? new Date(endDate) : new Date();

        if (!startDate || !endDate) {
            if (tasks.length > 0) {
                const starts = tasks.map(t => t.start.getTime());
                const ends = tasks.map(t => t.end.getTime());
                minDate = new Date(Math.min(...starts));
                maxDate = new Date(Math.max(...ends));
            } else {
                // Default range if no tasks: current year
                minDate = new Date(new Date().getFullYear(), 0, 1);
                maxDate = new Date(new Date().getFullYear(), 11, 31);
            }
        }

        // Add padding
        minDate.setDate(minDate.getDate() - 7);
        maxDate.setDate(maxDate.getDate() + 30);

        // Normalize to start of day
        minDate.setHours(0, 0, 0, 0);
        maxDate.setHours(0, 0, 0, 0);

        const dayArray = [];
        const curr = new Date(minDate);
        while (curr <= maxDate) {
            dayArray.push(new Date(curr));
            curr.setDate(curr.getDate() + 1);
        }

        return { start: minDate, end: maxDate, days: dayArray };
    }, [tasks, startDate, endDate]);

    // 2. Configuration based on zoom
    const config = useMemo(() => {
        switch (zoomLevel) {
            case 'day': return { cellWidth: 40, headerFormat: 'd' };
            case 'week': return { cellWidth: 15, headerFormat: 'd' }; // Condensed days
            case 'month': return { cellWidth: 5, headerFormat: '' }; // Very condensed
        }
    }, [zoomLevel]);

    // 3. Helper to calculate position
    const getPosition = (date: Date) => {
        const diffTime = date.getTime() - start.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        return diffDays * config.cellWidth;
    };

    const getWidth = (startDate: Date, endDate: Date) => {
        const diffTime = endDate.getTime() - startDate.getTime();
        // Min width 1 day roughly
        const diffDays = Math.max(1, diffTime / (1000 * 60 * 60 * 24));
        return diffDays * config.cellWidth;
    };

    // 4. Scroll to today on mount
    useEffect(() => {
        if (containerRef.current) {
            const today = new Date();
            const pos = getPosition(today);
            const containerWidth = containerRef.current.clientWidth;
            containerRef.current.scrollLeft = pos - (containerWidth / 2);
        }
    }, [start, config.cellWidth]);

    const getPhaseColor = (phase?: string) => {
        switch (phase) {
            case 'preparation': return 'bg-green-500';
            case 'assembly': return 'bg-yellow-500';
            case 'final': return 'bg-orange-500';
            case 'delayed': return 'bg-red-500';
            case 'completed': return 'bg-purple-500';
            default: return 'bg-gray-400';
        }
    };

    return (
        <div className="flex flex-col h-full border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
            {/* Header / Timeline */}
            <div className="overflow-x-auto overflow-y-hidden" ref={containerRef} style={{ scrollBehavior: 'smooth' }}>
                <div style={{ width: days.length * config.cellWidth + 250, minWidth: '100%' }} className="relative">

                    {/* Header Row */}
                    <div className="flex h-10 border-b border-gray-100 items-center bg-gray-50/80 sticky top-0 z-10 backdrop-blur-sm">
                        {/* Sticky Project Column Placeholder */}
                        <div className="sticky left-0 w-[250px] bg-white border-r border-gray-200 h-full flex items-center px-4 font-bold text-xs text-gray-500 uppercase tracking-wider z-20 shadow-sm">
                            Projekt
                        </div>

                        {/* Calendar Header */}
                        <div className="flex h-full relative">
                            {days.map((d, i) => {
                                const isFirstOfMonth = d.getDate() === 1;
                                const isMonday = d.getDay() === 1;
                                const showLabel = (zoomLevel === 'day') || (zoomLevel === 'week' && isMonday) || (zoomLevel === 'month' && isFirstOfMonth);
                                const isToday = new Date().toDateString() === d.toDateString();

                                return (
                                    <div
                                        key={i}
                                        style={{ width: config.cellWidth }}
                                        className={`flex-shrink-0 h-full border-r border-gray-50 flex items-center justify-center text-[10px] text-gray-400 relative group
                                            ${isFirstOfMonth ? 'border-l-2 border-l-gray-300' : ''}
                                            ${isToday ? 'bg-blue-50/50' : ''}
                                        `}
                                    >
                                        {showLabel && (
                                            <span className={`absolute ${isFirstOfMonth ? 'left-1 font-bold text-gray-700' : ''}`}>
                                                {isFirstOfMonth
                                                    ? d.toLocaleDateString('cs-CZ', { month: 'short' })
                                                    : d.getDate()}
                                            </span>
                                        )}
                                        {isToday && <div className="absolute top-0 bottom-0 w-px bg-blue-500 z-0 opacity-30"></div>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Task Rows */}
                    <div className="flex flex-col">
                        {tasks.map((task) => (
                            <div key={task.id} className="flex h-10 border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                                {/* Fixed Project Name */}
                                <div className="sticky left-0 w-[250px] bg-white border-r border-gray-200 h-full flex items-center px-4 z-10 group-hover:bg-gray-50/50 transition-colors shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                    <div className="truncate text-xs font-semibold text-slate-700 w-full" title={task.text}>
                                        {task.text}
                                    </div>
                                </div>

                                {/* Gantt Bar Area */}
                                <div className="relative flex-1 h-full">
                                    <div
                                        className={`absolute top-2 h-6 rounded-md shadow-sm border border-white/20 hover:opacity-90 hover:scale-[1.01] transition-all cursor-pointer ${getPhaseColor(task.phase)}`}
                                        style={{
                                            left: getPosition(task.start),
                                            width: getWidth(task.start, task.end),
                                        }}
                                        title={`${task.text} (${task.start.toLocaleDateString()} - ${task.end.toLocaleDateString()})`}
                                    >
                                        {/* Progress Bar (Optional) */}
                                        {task.progress !== undefined && task.progress > 0 && (
                                            <div
                                                className="h-full bg-white/20 rounded-l-md"
                                                style={{ width: `${task.progress}%` }}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Today Line (Vertical overlay) */}
                    <div
                        className="absolute top-10 bottom-0 w-0.5 bg-red-500 z-0 pointer-events-none opacity-50"
                        style={{ left: getPosition(new Date()) + 250 + (config.cellWidth / 2) }}
                    ></div>

                </div>
            </div>
        </div>
    );
};
