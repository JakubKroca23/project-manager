"use client"

import { motion } from "framer-motion"
import { getPositionFromDate, getWidthFromDuration } from "@/lib/timeline-utils"
import { useTimeline } from "./timeline-context"

interface TimelineItemProps {
    id: string
    title: string
    startDate: string
    endDate: string
    color?: string
}

export function TimelineItem({ title, startDate, endDate, color = "bg-primary" }: TimelineItemProps) {
    const { startDate: timelineStart, columnWidth } = useTimeline()

    const start = new Date(startDate)
    const end = new Date(endDate)

    const x = getPositionFromDate(start, timelineStart, columnWidth)
    const width = getWidthFromDuration(start, end, columnWidth)

    // Ensure minimal visibility or tooltip
    return (
        <motion.div
            drag="x"
            dragMomentum={false}
            dragElastic={0}
            whileHover={{ scale: 1.02, zIndex: 10 }}
            whileTap={{ scale: 0.98, cursor: "grabbing" }}
            title={`${title} (${start.toLocaleDateString()} - ${end.toLocaleDateString()})`}
            className={`absolute top-1 bottom-1 rounded-lg ${color} shadow-sm flex items-center px-2 cursor-grab overflow-hidden border border-white/20 group`}
            style={{
                left: x,
                width,
            }}
        >
            <span className="text-xs font-semibold text-white whitespace-nowrap truncate drop-shadow-md">{title}</span>
        </motion.div>
    )
}
