import { useTimeline } from "./timeline-context"
import { addDays, eachDayOfInterval, eachMonthOfInterval, eachWeekOfInterval, endOfMonth, endOfWeek, format, startOfWeek } from "date-fns"
import { cs } from "date-fns/locale"
import { motion } from "framer-motion"

export function TimelineHeader() {
    const { startDate, pixelsPerDay, scrollX, headerHeight } = useTimeline()

    // 1. Extend Range to 365 Days
    const END_DATE = addDays(startDate, 365)

    // 2. Calculations
    const totalDays = eachDayOfInterval({ start: startDate, end: END_DATE }).length
    const totalWidth = totalDays * pixelsPerDay

    // 3. Logic: What to show?
    // User wants: "always visible" unless too small.
    // Pixel thresholds for readability:
    // Day label: needs ~20px to show number? ~40px for full?
    // Week label: needs ~30px?

    // We will stack them: Month (top), Week (middle), Day (bottom). 
    // Total header height needs to increase.

    const showMonths = true
    const showWeeks = pixelsPerDay >= 2 // Weeks visible almost always, unless extremely zoomed out (year view)
    const showDays = pixelsPerDay >= 10 // Days visible if day width > 10px

    // Height calculation
    // Height calculation - used from context now

    // Rows Data
    const months = eachMonthOfInterval({ start: startDate, end: END_DATE })
    const weeks = eachWeekOfInterval({ start: startDate, end: END_DATE }, { weekStartsOn: 1 })
    const days = eachDayOfInterval({ start: startDate, end: END_DATE })

    return (
        <div
            className="bg-background/95 backdrop-blur border-b border-border/50 sticky top-0 z-10 overflow-hidden transition-all duration-300"
            style={{ height: headerHeight }}
        >
            <motion.div
                className="h-full relative flex flex-col"
                style={{ x: -scrollX, width: totalWidth }}
            >
                {/* 1. TOP ROW: MONTHS */}
                {showMonths && (
                    <div className="flex h-[25px] border-b border-border">
                        {months.map(month => {
                            const start = month < startDate ? startDate : month
                            const end = endOfMonth(month) > END_DATE ? END_DATE : endOfMonth(month)
                            const daysInMonth = eachDayOfInterval({ start, end })

                            if (daysInMonth.length === 0) return null

                            const width = daysInMonth.length * pixelsPerDay

                            return (
                                <div
                                    key={month.toISOString()}
                                    className="flex items-center px-2 border-r border-border text-xs font-bold uppercase text-foreground/80 whitespace-nowrap overflow-hidden bg-secondary/30"
                                    style={{ width }}
                                >
                                    {format(month, 'MMMM yyyy', { locale: cs })}
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* 2. MIDDLE ROW: WEEKS */}
                {showWeeks && (
                    <div className="flex h-[25px] border-b border-border/50">
                        {weeks.map(week => {
                            const start = week < startDate ? startDate : week
                            const end = endOfWeek(week, { weekStartsOn: 1 }) > END_DATE ? END_DATE : endOfWeek(week, { weekStartsOn: 1 })
                            const daysInWeek = eachDayOfInterval({ start, end })

                            if (daysInWeek.length === 0) return null

                            const width = daysInWeek.length * pixelsPerDay

                            return (
                                <div
                                    key={week.toISOString()}
                                    className="flex items-center justify-center border-r border-border/30 text-[10px] text-muted-foreground font-medium select-none bg-background/50 overflow-hidden whitespace-nowrap"
                                    style={{ width }}
                                >
                                    {/* Show week number if width allows */}
                                    {width > 15 && `T${format(week, 'w')}`}
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* 3. BOTTOM ROW: DAYS */}
                {showDays && (
                    <div className="flex h-[25px] border-b border-border/20">
                        {days.map(day => {
                            const isToday = day.toDateString() === new Date().toDateString()
                            const isWeekend = day.getDay() === 0 || day.getDay() === 6
                            return (
                                <div
                                    key={day.toISOString()}
                                    className={`flex items-center justify-center border-r border-border/10 text-[9px] select-none overflow-hidden
                                        ${isToday ? 'bg-primary text-primary-foreground font-bold' : isWeekend ? 'bg-secondary/10 text-muted-foreground' : 'text-muted-foreground'}
                                    `}
                                    style={{ width: pixelsPerDay }}
                                >
                                    {pixelsPerDay > 30 ? format(day, 'd. E', { locale: cs }) : format(day, 'd')}
                                </div>
                            )
                        })}
                    </div>
                )}
            </motion.div>
        </div>
    )
}
