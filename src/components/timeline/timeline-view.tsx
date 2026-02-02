"use client"

import { useEffect, useRef } from "react"
import { TimelineProvider, useTimeline } from "@/components/timeline/timeline-context"
import { TimelineLayout } from "@/components/timeline/timeline-layout"
import { Plus, Minus, Search, ZoomIn } from "lucide-react"

function TimelineControls() {
    const { pixelsPerDay, setPixelsPerDay, setStartDate, startDate } = useTimeline()

    return (
        <div className="flex items-center gap-4 bg-background/50 p-2 rounded-xl border border-border/50">
            {/* Zoom Slider */}
            <div className="flex items-center gap-2">
                <ZoomIn className="w-4 h-4 text-muted-foreground" />
                <input
                    type="range"
                    min="2"
                    max="100"
                    value={pixelsPerDay}
                    onChange={(e) => setPixelsPerDay(Number(e.target.value))}
                    className="w-32 h-1 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <span className="text-xs font-mono text-muted-foreground w-8 text-right">{pixelsPerDay}px</span>
            </div>

            <button
                onClick={() => setPixelsPerDay(40)}
                className="text-xs text-primary font-medium hover:underline"
            >
                Reset
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
                setPixelsPerDay(Math.max(10, Math.min(200, pixelsPerDay + delta)))
            }
        }

        el.addEventListener("wheel", handleWheel, { passive: false })
        return () => el.removeEventListener("wheel", handleWheel)
    }, [pixelsPerDay, setPixelsPerDay])

    return (
        <div ref={containerRef} className="h-full flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                        Timeline 2.0 <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider">Beta</span>
                    </h1>
                    <p className="text-sm text-muted-foreground">Podržte CTRL + Kolečko pro zoom, nebo použijte slider.</p>
                </div>
                <TimelineControls />
            </div>

            <TimelineLayout items={items} />
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
