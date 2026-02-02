"use client"

import { useTimeline } from "./timeline-context"
import { addDays, eachDayOfInterval, eachMonthOfInterval, endOfMonth, format, isSameDay, startOfMonth } from "date-fns"
import { cs } from "date-fns/locale"
import { motion } from "framer-motion"

export function TimelineHeader() {
    const { startDate, pixelsPerDay, scrollX } = useTimeline()

    // Generate range (e.g. 60 days buffer)
    const END_DATE = addDays(startDate, 60)
    const months = eachMonthOfInterval({ start: startDate, end: END_DATE })

    // Calculate total width based on render range
    const totalDays = eachDayOfInterval({ start: startDate, end: END_DATE }).length
    const totalWidth = totalDays * pixelsPerDay

    return (
        <div className="h-[50px] bg-background/95 backdrop-blur border-b border-border/50 sticky top-0 z-10 overflow-hidden">
            <motion.div
                className="h-full relative"
                style={{ x: -scrollX, width: totalWidth }}
            >
                {/* Month Row */}
                <div className="flex h-1/2 border-b border-border/10">
                    {months.map(month => {
                        const start = month < startDate ? startDate : month
                        const end = endOfMonth(month) > END_DATE ? END_DATE : endOfMonth(month)
                        const daysInMonth = eachDayOfInterval({ start, end })
                        const width = daysInMonth.length * pixelsPerDay

                        return (
                            <div
                                key={month.toISOString()}
                                className="flex items-center px-2 border-r border-border/20 text-xs font-bold uppercase text-muted-foreground whitespace-nowrap overflow-hidden bg-secondary/5"
                                style={{ width }}
                            >
                                {format(month, 'MMMM yyyy', { locale: cs })}
                            </div>
                        )
                    })}
                </div>

                {/* Days Row */}
                <div className="flex h-1/2">
                    {eachDayOfInterval({ start: startDate, end: END_DATE }).map(day => (
                        <div
                            key={day.toISOString()}
                            className="flex items-center justify-center border-r border-border/10 text-[10px] text-muted-foreground select-none"
                            style={{ width: pixelsPerDay }}
                        >
                            {pixelsPerDay > 30 ? format(day, 'd. E', { locale: cs }) : format(day, 'd')}
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    )
}
