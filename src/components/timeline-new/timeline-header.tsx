"use client"

import { useTimeline } from "./timeline-provider"
import { addDays, eachDayOfInterval, eachMonthOfInterval, endOfMonth, format, startOfWeek, endOfWeek } from "date-fns"
import { cs } from "date-fns/locale"

export function TimelineHeader() {
    const { startDate, pixelsPerDay } = useTimeline()

    const END_DATE = addDays(startDate, 365)
    // Optimisation: Calculate only basic dimensions here
    const totalDays = 366 // Fixed year roughly
    const totalWidth = totalDays * pixelsPerDay

    // Rows Data
    const months = eachMonthOfInterval({ start: startDate, end: END_DATE })
    const days = eachDayOfInterval({ start: startDate, end: END_DATE })

    const showDays = pixelsPerDay >= 15

    return (
        <div className="h-[50px] bg-background/95 backdrop-blur border-b border-border/50 flex flex-col">
            <div
                id="timeline-header-scroll"
                className="flex-1 overflow-hidden relative"
            >
                <div style={{ width: totalWidth, height: '100%' }}>
                    {/* Top Row: Months */}
                    <div className="flex h-[25px] border-b border-border/50">
                        {months.map(month => {
                            const start = month < startDate ? startDate : month
                            const end = endOfMonth(month) > END_DATE ? END_DATE : endOfMonth(month)
                            const daysInMonth = eachDayOfInterval({ start, end }).length
                            const width = daysInMonth * pixelsPerDay

                            return (
                                <div
                                    key={month.toISOString()}
                                    className="flex items-center px-2 border-r border-border/50 text-xs font-bold uppercase text-muted-foreground whitespace-nowrap overflow-hidden"
                                    style={{ width }}
                                >
                                    {format(month, 'MMMM yyyy', { locale: cs })}
                                </div>
                            )
                        })}
                    </div>

                    {/* Bottom Row: Days */}
                    <div className="flex h-[25px]">
                        {days.map(day => {
                            const isWeekend = day.getDay() === 0 || day.getDay() === 6
                            return (
                                <div
                                    key={day.toISOString()}
                                    className={`flex items-center justify-center border-r border-border/10 text-[10px] select-none
                                        ${isWeekend ? 'bg-secondary/10' : ''}
                                    `}
                                    style={{ width: pixelsPerDay }}
                                >
                                    {showDays && format(day, 'd')}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
