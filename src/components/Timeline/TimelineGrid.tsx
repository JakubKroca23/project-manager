'use client';

import React, { useMemo } from 'react';

interface TimelineGridProps {
    startDate: Date;
    endDate: Date;
    dayWidth: number;
    children?: React.ReactNode;
}

const getWeekNumber = (d: Date) => {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

const TimelineGrid: React.FC<TimelineGridProps> = ({ startDate, endDate, dayWidth, children }) => {
    const days = useMemo(() => {
        const result: Date[] = [];
        const current = new Date(startDate);
        while (current <= endDate) {
            result.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }
        return result;
    }, [startDate, endDate]);

    const months = useMemo(() => {
        const groups: { month: string; year: number; width: number; startDay: number }[] = [];
        let currentMonth = -1;
        let currentGroup: any = null;

        days.forEach((day, index) => {
            if (day.getMonth() !== currentMonth) {
                currentMonth = day.getMonth();
                currentGroup = {
                    month: day.toLocaleDateString('cs-CZ', { month: 'long' }),
                    year: day.getFullYear(),
                    width: 0,
                    startDay: index
                };
                groups.push(currentGroup);
            }
            currentGroup.width += dayWidth;
        });
        return groups;
    }, [days, dayWidth]);

    const weeks = useMemo(() => {
        const groups: { weekNum: number; width: number; startDay: number }[] = [];
        let currentWeek = -1;
        let currentGroup: any = null;

        days.forEach((day, index) => {
            const w = getWeekNumber(day);
            if (w !== currentWeek) {
                currentWeek = w;
                currentGroup = {
                    weekNum: w,
                    width: 0,
                    startDay: index
                };
                groups.push(currentGroup);
            }
            currentGroup.width += dayWidth;
        });
        return groups;
    }, [days, dayWidth]);

    const isToday = (date: Date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    const isWeekend = (date: Date) => {
        const day = date.getDay();
        return day === 0 || day === 6;
    };

    return (
        <div className="timeline-grid">
            <div className="timeline-grid-header-multi">
                {/* Úroveň 1: Měsíce */}
                <div className="timeline-header-row months">
                    {months.map((m, i) => (
                        <div
                            key={`m-${i}`}
                            className="header-cell month"
                            style={{ width: m.width }}
                        >
                            {m.month} {m.year}
                        </div>
                    ))}
                </div>

                {/* Úroveň 2: Týdny */}
                <div className="timeline-header-row weeks">
                    {weeks.map((w, i) => (
                        <div
                            key={`w-${i}`}
                            className="header-cell week"
                            style={{ width: w.width }}
                        >
                            {dayWidth > 15 ? `Týden ${w.weekNum}` : w.weekNum}
                        </div>
                    ))}
                </div>

                {/* Úroveň 3: Dny - Skrýt při velmi malém zoomu */}
                {dayWidth > 12 && (
                    <div className="timeline-header-row days">
                        {days.map((day, idx) => {
                            const showDayName = dayWidth > 35;
                            const showNumber = dayWidth > 10;

                            return (
                                <div
                                    key={`d-${idx}`}
                                    className={`header-cell day ${isToday(day) ? 'is-today' : ''} ${isWeekend(day) ? 'is-weekend' : ''}`}
                                    style={{
                                        width: dayWidth,
                                        fontSize: dayWidth < 20 ? '0.55rem' : '0.65rem'
                                    }}
                                >
                                    {showDayName && <span className="day-name">{day.toLocaleDateString('cs-CZ', { weekday: 'short' })}</span>}
                                    {showNumber && <span className="day-number">{day.getDate()}</span>}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="timeline-grid-content">
                <div className="timeline-grid-body">
                    {days.map((day, idx) => (
                        <div
                            key={idx}
                            className={`timeline-grid-column ${isToday(day) ? 'is-today' : ''} ${isWeekend(day) ? 'is-weekend' : ''}`}
                            style={{ width: dayWidth }}
                        />
                    ))}
                </div>
                {children}
            </div>
        </div>
    );
};

export default TimelineGrid;
