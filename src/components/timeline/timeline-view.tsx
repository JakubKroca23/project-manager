"use client"

import { useEffect, useRef } from "react"
import { TimelineProvider, useTimeline } from "@/components/timeline/timeline-context"
import { TimelineLayout } from "@/components/timeline/timeline-layout"
import { Plus, Minus, Maximize2, Minimize2 } from "lucide-react"

function TimelineControls() {
    const { pixelsPerDay, setPixelsPerDay, isFullscreen, setIsFullscreen } = useTimeline()

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

            <div className="w-px h-4 bg-white/10 mx-0.5" />

            <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-primary"
                title={isFullscreen ? "Ukončit celou obrazovku" : "Celá obrazovka"}
            >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
        </div>
    )
}

function TimelineWrapper({ items }: { items: any[] }) {
    const { setPixelsPerDay, pixelsPerDay, isFullscreen } = useTimeline()
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
        <div
            ref={containerRef}
            className={`
                ${isFullscreen
                    ? 'fixed inset-0 z-[100001] bg-background p-0'
                    : 'flex-1 flex flex-col gap-4'
                }
                relative overflow-hidden
            `}
        >
            {isFullscreen && (
                <style dangerouslySetInnerHTML={{
                    __html: `
                    header { display: none !important; }
                    main { max-width: none !important; padding: 0 !important; margin: 0 !important; }
                ` }} />
            )}

            {!isFullscreen && (
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                            Timeline 2.0 <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider">Beta</span>
                        </h1>
                        <p className="text-sm text-muted-foreground">Podržte CTRL + Kolečko pro zoom, nebo použijte slider.</p>
                    </div>
                </div>
            )}

            <div className={`flex-1 min-h-0 ${!isFullscreen ? 'border border-border/50 rounded-xl shadow-2xl overflow-hidden' : ''}`}>
                <TimelineLayout items={items} />
            </div>

            {/* Zoom Controls Overlay */}
            <div className={`absolute ${isFullscreen ? 'bottom-8 right-8' : 'bottom-6 right-6'} z-[100002]`}>
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
