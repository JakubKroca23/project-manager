import { TimelineView } from "@/components/timeline/timeline-view"

export default function TimelinePage() {
    return (
        <div className="flex flex-col gap-4 h-[calc(100vh-100px)]">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Project Timeline</h2>
            </div>
            <TimelineView />
        </div>
    )
}
