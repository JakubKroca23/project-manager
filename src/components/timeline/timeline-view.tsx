"use client"

import { useEffect, useRef } from "react"
import { TimelineProvider, useTimeline } from "@/components/timeline/timeline-context"
import { TimelineLayout } from "@/components/timeline/timeline-layout"
import { Plus, Minus, Search, ZoomIn } from "lucide-react"

function TimelineControls() {
    const { pixelsPerDay, setPixelsPerDay } = useTimeline()

    return (
        <div className="flex items-center gap-1 bg-background/40 backdrop-blur-md p-1 rounded-xl border border-white/10 shadow-xl">
            <button
                onClick={() => setPixelsPerDay(Math.min(100, pixelsPerDay + 5))}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-foreground"
                title="Zoom In"
            >
                <Plus className="w-4 h-4" />
            </button>

            <div className="w-px h-4 bg-white/10 mx-0.5" />

            <button
                onClick={() => setPixelsPerDay(Math.max(2, pixelsPerDay - 5))}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-foreground"
                title="Zoom Out"
            >
                <Minus className="w-4 h-4" />
            </button>
        </div>
    )
}

function TimelineWrapper({ items }: { items: any[] }) {
    const { setPixelsPerDay, pixelsPerDay } = useTimeline()
    const containerRef = useRef<HTMLDivElement>(null)

    // Wheel Zoom Handler
    useEffect(() => {
        const el = containerRef.current
        if (!el) return

        const handleWheel = (e: WheelEvent) => {
            if (e.ctrlKey) {
                e.preventDefault()
                const delta = e.deltaY > 0 ? -5 : 5
                setPixelsPerDay(Math.max(2, Math.min(100, pixelsPerDay + delta)))
            }
        }

        el.addEventListener("wheel", handleWheel, { passive: false })
        return () => el.removeEventListener("wheel", handleWheel)
    }, [pixelsPerDay, setPixelsPerDay])

    return (
        <div ref={containerRef} className="h-full relative overflow-hidden">
            <TimelineLayout items={items} />

            {/* Zoom Controls Overlay */}
            <div className="absolute bottom-6 right-6 z-50">
                <TimelineControls />
            </div>
        </div>
    )
}

export function TimelineView({ items }: { items: any[] }) {
    return (
        <TimelineProvider items={items}>
            <TimelineWrapper items={items} />
        </TimelineProvider>
    )
}
