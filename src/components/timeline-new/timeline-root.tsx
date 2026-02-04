"use client"

import { TimelineProvider } from "./timeline-provider"
import { TimelineSidebar } from "./timeline-sidebar"
import { TimelineHeader } from "./timeline-header"
import { TimelineGrid } from "./timeline-grid"

interface TimelineRootProps {
    items: any[]
}

export function TimelineRoot({ items }: TimelineRootProps) {
    return (
        <TimelineProvider items={items}>
            <div className="flex h-full border border-border/50 rounded-xl overflow-hidden shadow-2xl bg-background">
                <TimelineSidebar />
                <div className="flex-1 flex flex-col min-w-0">
                    <TimelineHeader />
                    <TimelineGrid />
                </div>
            </div>
        </TimelineProvider>
    )
}
