import { createClient } from "@/lib/supabase/server"
import { TimelineView } from "@/components/timeline/timeline-view"

export default async function TimelinePage() {
    const supabase = await createClient()
    const { data: items } = await supabase.from("timeline_items").select("*")

    return (
        <div className="h-full">
            <TimelineView items={items || []} />
        </div>
    )
}
