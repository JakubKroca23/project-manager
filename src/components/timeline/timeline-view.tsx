"use client"

import { TimelineProvider, useTimeline } from "@/components/timeline/timeline-context"
import { TimelineLayout } from "@/components/timeline/timeline-layout"
import { Plus } from "lucide-react"

function TimelineControls() {
    const { zoom, setZoom } = useTimeline()

    return (
        <div className="flex items-center gap-2">
            <div className="bg-background/50 p-1 rounded-lg border border-border/50 flex text-xs font-semibold">
                <button
                    onClick={() => setZoom("day")}
                    className={`px-3 py-1.5 rounded-md transition-all ${zoom === 'day' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}
                >
                    Den
                </button>
                <button
                    onClick={() => setZoom("week")}
                    className={`px-3 py-1.5 rounded-md transition-all ${zoom === 'week' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}
                >
                    Týden
                </button>
                <button
                    onClick={() => setZoom("month")}
                    className={`px-3 py-1.5 rounded-md transition-all ${zoom === 'month' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}
                >
                    Měsíc
                </button>
            </div>
            <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4" />
                Naplánovat
            </button>
        </div>
    )
}

export function TimelineView({ items }: { items: any[] }) {
    return (
        <TimelineProvider>
            <div className="h-full flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Timeline</h1>
                        <p className="text-muted-foreground">Interaktivní plánování projektů a kapacity.</p>
                    </div>
                    <TimelineControls />
                </div>
                <TimelineLayout items={items} />
            </div>
        </TimelineProvider>
    )
}
