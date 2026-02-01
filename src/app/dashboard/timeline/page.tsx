import { createClient } from "@/lib/supabase/server"
import { TimelineView } from "@/components/timeline/timeline-view"

export default async function TimelinePage() {
    const supabase = await createClient()
    const { data: tasks } = await supabase.from('tasks').select('*')

    return (
        <div className="flex flex-col gap-6 h-full">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Timeline</h2>
            </div>
            <div className="flex-1 border rounded-lg p-4 bg-background">
                <TimelineView tasks={tasks || []} />
            </div>
        </div>
    )
}
