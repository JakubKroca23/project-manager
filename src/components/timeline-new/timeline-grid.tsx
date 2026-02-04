"use client"

import { useRef, useEffect } from "react"
import { useTimeline } from "./timeline-provider"
import { ROW_HEIGHT } from "./timeline-sidebar"
import { addDays, differenceInDays } from "date-fns"

export function TimelineGrid() {
    const { visibleItems, startDate, pixelsPerDay } = useTimeline()
    const containerRef = useRef<HTMLDivElement>(null)

    // Sync Scroll Logic
    useEffect(() => {
        const el = containerRef.current
        if (!el) return

        const handleScroll = () => {
            const header = document.getElementById("timeline-header-scroll")
            const sidebar = document.getElementById("timeline-sidebar-scroll")

            if (header) header.scrollLeft = el.scrollLeft
            if (sidebar) sidebar.scrollTop = el.scrollTop
        }

        el.addEventListener("scroll", handleScroll)
        return () => el.removeEventListener("scroll", handleScroll)
    }, [])

    const END_DATE = addDays(startDate, 365)
    const totalDays = 366
    const totalWidth = totalDays * pixelsPerDay

    return (
        <div
            ref={containerRef}
            className="flex-1 overflow-auto custom-scrollbar relative bg-secondary/5"
        >
            <div
                style={{
                    width: totalWidth,
                    height: visibleItems.length * ROW_HEIGHT,
                    minHeight: '100%',
                    // CSS Grid Pattern - The core optimization
                    backgroundImage: `
                        linear-gradient(to right, hsl(var(--border) / 0.1) 1px, transparent 1px),
                        linear-gradient(to bottom, transparent 41px, hsl(var(--border) / 0.1) 41px)
                    `,
                    backgroundSize: `${pixelsPerDay}px 100%, 100% ${ROW_HEIGHT}px`,
                    backgroundAttachment: 'local'
                }}
                className="relative"
            >
                {visibleItems.map((item, index) => {
                    const startRaw = new Date(item.start_date)
                    const endRaw = new Date(item.end_date)

                    if (isNaN(startRaw.getTime()) || isNaN(endRaw.getTime())) return null

                    const startOffset = differenceInDays(startRaw, startDate) * pixelsPerDay
                    const durationDays = differenceInDays(endRaw, startRaw) + 1
                    const width = durationDays * pixelsPerDay

                    // Clip out of bounds (simple)
                    if (startOffset + width < 0) return null

                    return (
                        <div
                            key={item.id}
                            className={`absolute h-[26px] rounded-md shadow-sm border border-white/10 flex items-center px-2 text-xs font-medium text-white truncate
                                ${item.type === 'project' ? 'bg-blue-600' : item.type === 'service' ? 'bg-purple-600' : 'bg-orange-600'}
                            `}
                            style={{
                                top: (index * ROW_HEIGHT) + 8, // Center in 42px row
                                left: startOffset,
                                width: Math.max(width, 10)
                            }}
                            title={`${item.title} (${item.status})`}
                        >
                            {item.title}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
