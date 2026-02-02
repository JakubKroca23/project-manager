"use client"

import { useRef, useEffect } from "react"
import { useTimeline } from "./timeline-context"
import { ROW_HEIGHT } from "./timeline-sidebar"
import { differenceInDays, addDays, eachDayOfInterval } from "date-fns"

import { updateTimelineItemDate } from "@/app/timeline/actions"
import { useRouter } from "next/navigation"
import { TimelineBar } from "./timeline-bar"

export function TimelineGrid() {
    const { visibleItems, startDate, pixelsPerDay, setScrollX, updateItemDates } = useTimeline()
    const containerRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

    // Pan state
    const isDragging = useRef(false)
    const startX = useRef(0)
    const scrollLeft = useRef(0)

    // Sync X and Y scroll
    const handleScroll = () => {
        if (!containerRef.current) return
        setScrollX(containerRef.current.scrollLeft)

        const sidebar = document.getElementById("sidebar-scroll")
        if (sidebar) {
            sidebar.scrollTop = containerRef.current.scrollTop
        }
    }

    // Pan Event Handlers
    const onMouseDown = (e: React.MouseEvent) => {
        if (!containerRef.current) return
        isDragging.current = true
        containerRef.current.style.cursor = 'grabbing'
        startX.current = e.pageX - containerRef.current.offsetLeft
        scrollLeft.current = containerRef.current.scrollLeft
    }

    const onMouseLeave = () => {
        isDragging.current = false
        if (containerRef.current) containerRef.current.style.cursor = 'auto'
    }

    const onMouseUp = () => {
        isDragging.current = false
        if (containerRef.current) containerRef.current.style.cursor = 'auto'
    }

    const onMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current || !containerRef.current) return
        e.preventDefault()
        const x = e.pageX - containerRef.current.offsetLeft
        const walk = (x - startX.current) * 1.5 // Scroll speed
        containerRef.current.scrollLeft = scrollLeft.current - walk
    }

    const END_DATE = addDays(startDate, 365)
    const totalDays = differenceInDays(END_DATE, startDate)
    const totalWidth = totalDays * pixelsPerDay

    return (
        <div
            ref={containerRef}
            onScroll={handleScroll}
            onMouseDown={onMouseDown}
            onMouseLeave={onMouseLeave}
            onMouseUp={onMouseUp}
            onMouseMove={onMouseMove}
            className="flex-1 overflow-auto relative custom-scrollbar bg-transparent select-none cursor-grab"
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

                    // Safe check for invalid dates
                    if (isNaN(new Date(item.start_date).getTime()) || isNaN(new Date(item.end_date).getTime())) return null

                    return (
                        <TimelineBar
                            key={item.id}
                            item={item}
                            startDate={startDate}
                            pixelsPerDay={pixelsPerDay}
                            height={ROW_HEIGHT}
                            top={top}
                            onUpdate={async (id, start, end) => {
                                // 1. Optimistic
                                updateItemDates(id, start, end)

                                // 2. Server
                                const res = await updateTimelineItemDate(id, item.type, start, end)
                                if (!res.success) {
                                    console.error("Timeline update failed", res.error)
                                    alert("Chyba při ukládání změny.")
                                }
                            }}
                        />
                    )
                })}
            </div>
        </div>
    )
}
