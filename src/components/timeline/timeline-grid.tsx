"use client"

import { useRef, useEffect } from "react"
import { useTimeline } from "./timeline-context"
import { ROW_HEIGHT } from "./timeline-sidebar"
import { differenceInDays, addDays, eachDayOfInterval } from "date-fns"

import { updateTimelineItemDate } from "@/app/timeline/actions"
import { useRouter } from "next/navigation"
import { TimelineBar } from "./timeline-bar"

export function TimelineGrid() {
    const { visibleItems, startDate, pixelsPerDay, updateItemDates } = useTimeline()
    const containerRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

    // Pan state
    const isDragging = useRef(false)
    const startX = useRef(0)
    const scrollLeft = useRef(0)

    // Sync X and Y scroll
    const handleScroll = () => {
        if (!containerRef.current) return

        // 1. Sync Header (X-axis)
        const header = document.getElementById("timeline-header-container")
        if (header) {
            header.scrollLeft = containerRef.current.scrollLeft
        }

        // 2. Sync Sidebar (Y-axis)
        const sidebar = document.getElementById("sidebar-scroll")
        if (sidebar) {
            sidebar.scrollTop = containerRef.current.scrollTop
        }
    }

    // Pan Event Handlers
    const onMouseDown = (e: React.MouseEvent) => {
        if (!containerRef.current) return
        // Only trigger drag if clicking directly on background, likely
        // But we want drag everywhere except bars?
        // For now keep as is.
        isDragging.current = true
        containerRef.current.style.cursor = 'grabbing'
        startX.current = e.pageX - containerRef.current.offsetLeft
        scrollLeft.current = containerRef.current.scrollLeft
    }

    const onMouseLeave = () => {
        isDragging.current = false
        if (containerRef.current) containerRef.current.style.cursor = 'grab'
    }

    const onMouseUp = () => {
        isDragging.current = false
        if (containerRef.current) containerRef.current.style.cursor = 'grab'
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
            <div
                className="relative min-h-full"
                style={{
                    width: totalWidth,
                    minHeight: '100%',
                    // CSS Grid Pattern to replace hundreds of DIVs
                    backgroundImage: `
                        linear-gradient(to right, hsl(var(--border) / 0.1) 1px, transparent 1px),
                        linear-gradient(to bottom, transparent 41px, hsl(var(--border) / 0.1) 41px)
                    `,
                    backgroundSize: `${pixelsPerDay}px 100%, 100% ${ROW_HEIGHT}px`
                }}
            >
                {/* Background Grid - Render Weekend Highlights only if zoomed in? 
                    Actually, rendering 100 weekend divs is better than 365 divs.
                    But let's skip it for now to be purely CSS efficient as requested "extreme lines fix".
                    If we want weekends, we can mask or use another repeating gradient if it's regular.
                    Weekends are 2 days every 7 days. Hard to do with simple repeating gradient.
                    Let's KEEP IT CLEAN for now.
                */}

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
