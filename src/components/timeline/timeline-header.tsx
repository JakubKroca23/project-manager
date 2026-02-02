"use client"

import { useTimeline } from "./timeline-context"
import { getDaysInRange, formatDateCS, HEADER_HEIGHT } from "@/lib/timeline-utils"
import { addDays } from "date-fns"
import { motion } from "framer-motion"

export function TimelineHeader() {
    const { startDate, scrollX, columnWidth } = useTimeline()

    // Render 30 days for now
    const days = getDaysInRange(startDate, addDays(startDate, 30))

    return (
        <div
            className="glass-heavy sticky top-0 z-20 overflow-hidden border-b border-white/10"
            style={{ height: HEADER_HEIGHT }}
        >
            <motion.div
                className="flex h-full"
                style={{ x: -scrollX }}
            >
                {days.map((day, i) => (
                    <div
                        key={i}
                        className="flex-shrink-0 flex items-center justify-center border-r border-border/20 text-xs font-medium text-muted-foreground select-none hover:bg-white/5 transition-colors"
                        style={{ width: columnWidth }}
                    >
                        <div className="text-center">
                            <div className="opacity-50 text-[10px] uppercase">{formatDateCS(day, "EEE")}</div>
                            <div className="font-bold text-foreground">{formatDateCS(day, "d")}</div>
                        </div>
                    </div>
                ))}
            </motion.div>
        </div>
    )
}
