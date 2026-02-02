import { createClient } from "@/lib/supabase/server"
import { TimelineView } from "@/components/timeline/timeline-view"

export default async function TimelinePage() {
    const supabase = await createClient()
    const { data: items } = await supabase.from("timeline_items").select("*")

    return (
        <div className="flex-1 flex flex-col -mb-12">
            <TimelineView items={items || []} />
        </div>
    )
}
