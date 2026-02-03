import { createClient } from "@/lib/supabase/server"
import { TimelineView } from "@/components/timeline/timeline-view"
import { addHours, format } from "date-fns"

export default async function TimelinePage() {
    const supabase = await createClient()

    // 1. Get standard timeline items (Projects + Production Orders)
    const { data: viewItems } = await supabase.from("timeline_items").select("*")

    // 2. Get Services explicitly (since they seem missing potentialy from the view)
    const { data: services } = await supabase.from("services").select("*")

    // 3. Format services as timeline items
    const serviceItems = (services || []).map((s: any) => {
        const start = s.service_date ? new Date(s.service_date) : new Date()
        const end = s.duration_hours
            ? addHours(start, s.duration_hours)
            : addHours(start, 2) // Default duration if missing

        return {
            id: s.id,
            title: s.title,
            type: "service",
            status: s.status,
            start_date: s.service_date,
            end_date: format(end, 'yyyy-MM-dd'), // Timeline expects YYYY-MM-DD
            owner_id: s.assigned_to,
            // Services usually don't have a parent item in this context, or maybe client_name is useful?
            // For now, mapping strictly to timeline_items interface
        }
    })

    // 4. Merge
    // Note: If the view 'timeline_items' ALREADY includes services, we might have duplicates.
    // However, the user says "services not showing", so likely the view is empty for services.
    // If the view DOES include services, we should filter them out from 'viewItems' or deduplicate.
    // Let's assume the view does NOT include them properly or at all.
    // To be safe, filter out type='service' from viewItems to avoid dupes if the view IS fixed later.

    const otherItems = (viewItems || []).filter((i: any) => i.type !== 'service')
    const allItems = [...otherItems, ...serviceItems]

    return (
        <div className="flex-1 flex flex-col">
            <TimelineView items={allItems} />
        </div>
    )
}
