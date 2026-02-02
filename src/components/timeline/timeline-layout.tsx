"use client"

import { TimelineSidebar } from "./timeline-sidebar"
import { TimelineHeader } from "./timeline-header"
import { TimelineGrid } from "./timeline-grid"
import { TimelineItemType } from "./timeline-context"

interface TimelineLayoutProps {
    items: any[]
}

export function TimelineLayout({ items }: TimelineLayoutProps) {
    return (
        <div className="flex h-full overflow-hidden">
            {/* Left Sidebar */}
            <TimelineSidebar />

            {/* Right Main Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <TimelineHeader />
                <TimelineGrid />
            </div>
        </div>
    )
}
