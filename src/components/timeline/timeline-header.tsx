import { useTimeline } from "./timeline-context"
import { addDays, eachDayOfInterval, eachMonthOfInterval, eachWeekOfInterval, endOfMonth, endOfWeek, format, startOfWeek } from "date-fns"
import { cs } from "date-fns/locale"
import { motion } from "framer-motion"

export function TimelineHeader() {
    const { startDate, pixelsPerDay, scrollX } = useTimeline()

    // 1. Extend Range to 365 Days
    const END_DATE = addDays(startDate, 365)

    // 2. Calculations
    const totalDays = eachDayOfInterval({ start: startDate, end: END_DATE }).length
    const totalWidth = totalDays * pixelsPerDay

    // 3. Logic: What to show?
    const showDays = pixelsPerDay >= 40
    const showWeeks = pixelsPerDay >= 10 && pixelsPerDay < 40
    // If < 10 (Month view), we might hide bottom row or show very simplified weeks
    const showTimelineBottom = pixelsPerDay >= 4

    // Rows Data
    const months = eachMonthOfInterval({ start: startDate, end: END_DATE })
    const weeks = eachWeekOfInterval({ start: startDate, end: END_DATE }, { weekStartsOn: 1 })
    const days = eachDayOfInterval({ start: startDate, end: END_DATE })

    return (
        <div className="h-[50px] bg-background/95 backdrop-blur border-b border-border/50 sticky top-0 z-10 overflow-hidden">
            <motion.div
                className="h-full relative"
                style={{ x: -scrollX, width: totalWidth }}
            >
                {/* TOP ROW: MONTHS */}
                <div className="flex h-1/2 border-b border-border/10">
                    {months.map(month => {
                        const start = month < startDate ? startDate : month
                        const end = endOfMonth(month) > END_DATE ? END_DATE : endOfMonth(month)
                        const daysInMonth = eachDayOfInterval({ start, end })

                        if (daysInMonth.length === 0) return null

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

                {/* BOTTOM ROW: DAYS or WEEKS */}
                {showTimelineBottom && (
                    <div className="flex h-1/2">
                        {showDays ? (
                            days.map(day => {
                                const isToday = day.toDateString() === new Date().toDateString()
                                return (
                                    <div
                                        key={day.toISOString()}
                                        className={`flex items-center justify-center border-r border-border/5 text-[10px] select-none overflow-hidden
                                        ${isToday ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground'}
                                    `}
                                        style={{ width: pixelsPerDay }}
                                    >
                                        {pixelsPerDay > 45 ? format(day, 'd. E', { locale: cs }) : format(day, 'd')}
                                    </div>
                                )
                            })
                        ) : (
                            weeks.map(week => {
                                const start = week < startDate ? startDate : week
                                const end = endOfWeek(week, { weekStartsOn: 1 }) > END_DATE ? END_DATE : endOfWeek(week, { weekStartsOn: 1 })
                                const daysInWeek = eachDayOfInterval({ start, end })

                                if (daysInWeek.length === 0) return null

                                const width = daysInWeek.length * pixelsPerDay

                                return (
                                    <div
                                        key={week.toISOString()}
                                        className="flex items-center justify-center border-r border-border/10 text-[10px] text-muted-foreground select-none bg-black/5"
                                        style={{ width }}
                                    >
                                        {/* Only show label if wide enough */}
                                        {width > 20 && `T${format(week, 'w')}`}
                                    </div>
                                )
                            })
                        )}
                    </div>
                )}
            </motion.div>
        </div>
    )
}
