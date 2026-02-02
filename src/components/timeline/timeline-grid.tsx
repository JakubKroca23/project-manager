"use client"

import { useRef, useEffect } from "react"
import { useTimeline } from "./timeline-context"
import { ROW_HEIGHT } from "./timeline-sidebar"
import { differenceInDays, addDays, eachDayOfInterval } from "date-fns"
import { motion } from "framer-motion"

import { updateTimelineItemDate } from "@/app/timeline/actions"
import { useRouter } from "next/navigation"

export function TimelineGrid() {
    const { visibleItems, startDate, pixelsPerDay, setScrollX, updateItemDates } = useTimeline()
    const containerRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

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

    // Drag Handler
    const handleDragEnd = async (item: any, info: any) => {
        const movePixels = info.offset.x
        const daysDelta = Math.round(movePixels / pixelsPerDay)

        if (daysDelta === 0) return

        const currentStart = new Date(item.start_date)
        const currentEnd = new Date(item.end_date)

        const newStart = addDays(currentStart, daysDelta)
        const newEnd = addDays(currentEnd, daysDelta)

        const newStartStr = newStart.toISOString()
        const newEndStr = newEnd.toISOString()

        // 1. Optimistic Update
        updateItemDates(item.id, newStartStr, newEndStr)

        // 2. Server Update
        const res = await updateTimelineItemDate(item.id, item.type, newStartStr, newEndStr)
        if (!res.success) {
            console.error("Failed to persist timeline drag", res.error)
            // Revert (could be implemented by reloading data or undo logic)
            alert("Chyba při ukládání změny termínu.")
        }
    }

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
                        const isWeekStart = day.getDay() === 1

                        return (
                            <div
                                key={i}
                                className={`h-full border-r border-border/10 
                                    ${isWeekend ? 'bg-secondary/30' : ''} 
                                    ${isToday ? 'bg-primary/10 border-l border-l-primary/50 border-r-primary/50' : ''}
                                    ${isMonthStart ? 'border-l-2 border-l-primary/30' : isWeekStart ? 'border-l border-l-border/30' : ''}
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
                                drag="x"
                                dragMomentum={false}
                                dragElastic={0}
                                onDragEnd={(_, info) => handleDragEnd(item, info)}
                                whileDrag={{ cursor: "grabbing", scale: 1.02, zIndex: 50, opacity: 0.8 }}
                                initial={{ opacity: 0, scaleX: 0 }}
                                animate={{ opacity: 1, scaleX: 1, x: 0 }} // x: 0 ensures it resets visually after drag (since we update left/width via state)
                                className={`absolute h-6 top-2 rounded-md shadow-sm ${color} border border-white/20 cursor-grab hover:brightness-110 active:scale-95 transition-all z-10`}
                                style={{ left, width, minWidth: 4 }}
                                onClick={() => {
                                    if (item.type === 'project') {
                                        router.push(`/projects/${item.id}`)
                                    }
                                }}
                            >
                                {/* Label inside bar */}
                                {width > 20 && (
                                    <span className="absolute inset-0 flex items-center px-2 text-[9px] text-white truncate drop-shadow-md pointer-events-none">
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
