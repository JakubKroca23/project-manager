"use client"

import { useRef, useEffect } from "react"
import { useTimeline } from "./timeline-context"
import { TimelineHeader } from "./timeline-header"
import { TimelineItem } from "./timeline-item"
import { motion } from "framer-motion"
import { getDaysInRange } from "@/lib/timeline-utils"
import { addDays } from "date-fns"

import { Database } from "@/lib/database.types"

type TimelineItemData = Database['public']['Views']['timeline_items']['Row']

const typeColors = {
    project: "bg-blue-500",
    production: "bg-orange-500",
    service: "bg-purple-500",
}

export function TimelineLayout({ items }: { items: TimelineItemData[] }) {
    const { setScrollX, startDate, scrollX, columnWidth } = useTimeline()
    const listRef = useRef<HTMLDivElement>(null)

    // Sync scroll
    useEffect(() => {
        const el = listRef.current
        if (!el) return

        const handleScroll = () => {
            setScrollX(el.scrollLeft)
        }

        el.addEventListener("scroll", handleScroll)
        return () => el.removeEventListener("scroll", handleScroll)
    }, [setScrollX])

    const days = getDaysInRange(startDate, addDays(startDate, 30))
    const totalWidth = days.length * columnWidth

    return (
        <div className="flex flex-col h-full border border-border/50 rounded-xl overflow-hidden bg-background/50 backdrop-blur-sm shadow-inner">
            <TimelineHeader />

            <div
                ref={listRef}
                className="flex-1 overflow-x-auto overflow-y-auto relative custom-scrollbar active:cursor-grabbing cursor-grab"
            >
                <div
                    className="relative min-h-[500px]"
                    style={{ width: totalWidth }}
                >
                    {/* Background Grid */}
                    <div className="absolute inset-0 flex pointer-events-none">
                        {days.map((_, i) => (
                            <div
                                key={i}
                                className="h-full border-r border-border/10 border-dashed"
                                style={{ width: columnWidth }}
                            />
                        ))}
                    </div>

                    {/* Rows Layer */}
                    <div className="relative pt-4 space-y-2">
                        {items.map((item) => (
                            <div key={item.id} className="relative h-10 w-full hover:bg-white/5 transition-colors">
                                <TimelineItem
                                    id={item.id!}
                                    title={item.title!}
                                    startDate={item.start_date || new Date().toISOString()} // Fallback if local mock data missing date
                                    endDate={item.end_date || new Date().toISOString()}
                                    color={typeColors[item.type as keyof typeof typeColors] || "bg-primary"}
                                />
                            </div>
                        ))}

                        {items.length === 0 && (
                            <div className="p-8 text-center text-muted-foreground w-full absolute">
                                Žádné položky k zobrazení.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
