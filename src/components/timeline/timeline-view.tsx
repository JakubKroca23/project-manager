"use client"

import { useEffect, useRef } from "react"
import { TimelineProvider, useTimeline } from "@/components/timeline/timeline-context"
import { TimelineLayout } from "@/components/timeline/timeline-layout"
import { Plus, Minus, Search, ZoomIn } from "lucide-react"

function TimelineControls() {
    const { pixelsPerDay, setPixelsPerDay, setStartDate, startDate } = useTimeline()

    return (
        <div className="flex items-center gap-2 bg-background/50 p-1 rounded-xl border border-border/50">
            <div className="flex bg-secondary/50 rounded-lg p-1 text-xs font-medium">
                <button
                    onClick={() => setPixelsPerDay(50)}
                    className={`px-3 py-1.5 rounded-md transition-all ${pixelsPerDay >= 40 ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    Den
                </button>
                <button
                    onClick={() => setPixelsPerDay(12)}
                    className={`px-3 py-1.5 rounded-md transition-all ${pixelsPerDay >= 10 && pixelsPerDay < 40 ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    Týden
                </button>
                <button
                    onClick={() => setPixelsPerDay(4)}
                    className={`px-3 py-1.5 rounded-md transition-all ${pixelsPerDay < 10 ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    Měsíc
                </button>
            </div>
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
