"use client"

import { useRef, useEffect } from "react"
import { useTimeline } from "./timeline-context"
import { ROW_HEIGHT } from "./timeline-sidebar"
import { differenceInDays, addDays, eachDayOfInterval } from "date-fns"
import { motion } from "framer-motion"

export function TimelineGrid() {
    const { visibleItems, startDate, pixelsPerDay, setScrollX } = useTimeline()
    const containerRef = useRef<HTMLDivElement>(null)

    // Sync X and Y scroll
    const handleScroll = () => {
        if (!containerRef.current) return
        setScrollX(containerRef.current.scrollLeft)

        // Sync Sidebar Y scroll manually for performance
        const sidebar = document.getElementById("sidebar-scroll")
        if (sidebar) {
            sidebar.scrollTop = containerRef.current.scrollTop
        }
    }

    const END_DATE = addDays(startDate, 365)
    const totalDays = differenceInDays(END_DATE, startDate)
    const totalWidth = totalDays * pixelsPerDay

    return (
        <div
            ref={containerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-auto relative custom-scrollbar bg-transparent" // Transparent BG
        >
            <div className="relative min-h-full" style={{ width: totalWidth, height: visibleItems.length * ROW_HEIGHT }}>

                {/* Background Grid - Subtler */}
                <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none flex">
                    {eachDayOfInterval({ start: startDate, end: END_DATE }).map((day, i) => {
                        const isWeekend = day.getDay() === 0 || day.getDay() === 6
                        const isToday = day.toDateString() === new Date().toDateString()
                        const isMonthStart = day.getDate() === 1

                        return (
                            <div
                                key={i}
                                className={`h-full border-r border-border/10 
                                    ${isWeekend ? 'bg-secondary/20' : ''} 
                                    ${isToday ? 'bg-primary/5 border-l border-l-primary/30 border-r-primary/30' : ''}
                                    ${isMonthStart ? 'border-l border-l-border/50' : ''}
                                `}
                                style={{ width: pixelsPerDay }}
                            />
                        )
                    })}
                </div>

                {/* Rows & Bars */}
                {visibleItems.map((item, index) => {
                    const top = index * ROW_HEIGHT
                    const start = new Date(item.start_date)
                    const end = new Date(item.end_date)

                    // Safe check for invalid dates
                    if (isNaN(start.getTime()) || isNaN(end.getTime())) return null

                    const offsetDays = differenceInDays(start, startDate)
                    const durationDays = differenceInDays(end, start) + 1

                    const left = offsetDays * pixelsPerDay
                    const width = Math.max(durationDays * pixelsPerDay, 4) // Min width

                    const color = item.type === 'project' ? 'bg-blue-500'
                        : item.type === 'service' ? 'bg-purple-500'
                            : 'bg-orange-400'

                    return (
                        <div
                            key={item.id}
                            className="absolute w-full border-b border-border/5 hover:bg-white/5 transition-colors group"
                            style={{ height: ROW_HEIGHT, top }}
                        >
                            {/* Bar */}
                            <motion.div
                                initial={{ opacity: 0, scaleX: 0 }}
                                animate={{ opacity: 1, scaleX: 1 }}
                                className={`absolute h-6 top-2 rounded-md shadow-sm ${color} border border-white/20 cursor-pointer hover:brightness-110 active:scale-95 transition-all z-10`}
                                style={{ left, width, minWidth: 4 }}
                                onClick={() => alert(`Edit ${item.title} (ID: ${item.id})`)} // Placeholder for interaction
                            >
                                {/* Label inside bar */}
                                {width > 60 && (
                                    <span className="absolute inset-0 flex items-center px-2 text-[10px] font-bold text-white truncate drop-shadow-md pointer-events-none">
                                        {item.title}
                                    </span>
                                )}
                            </motion.div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
