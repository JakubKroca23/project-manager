import { createClient } from "@/lib/supabase/server"
import { TimelineView } from "@/components/timeline/timeline-view"
import { addHours, format } from "date-fns"

export default async function TimelinePage() {
    const supabase = await createClient()

    let allItems: any[] = []

    // 1. Try to get data from the VIEW first (Fastest)
    const { data: viewItems, error: viewError } = await supabase.from("timeline_items").select("*")

    if (!viewError && viewItems) {
        // VIEW WORKS
        allItems = viewItems
    } else {
        // VIEW BROKEN/MISSING -> MANUAL FETCH (Robust Fallback)
        console.warn("Timeline View missing or broken, fetching tables manually:", viewError?.message)

        const [projectsRes, ordersRes, servicesRes] = await Promise.all([
            supabase.from("projects").select("*"),
            supabase.from("production_orders").select("*"),
            supabase.from("services").select("*")
        ])

        const projects = (projectsRes.data || []).map((p: any) => ({
            id: p.id,
            title: p.title,
            type: 'project',
            status: p.status,
            start_date: p.start_date,
            end_date: p.end_date,
            owner_id: p.created_by,
            parent_id: null
        }))

        const orders = (ordersRes.data || []).map((o: any) => ({
            id: o.id,
            title: o.title,
            type: 'production',
            status: o.status,
            start_date: o.start_date,
            end_date: o.end_date,
            owner_id: o.assigned_to,
            parent_id: o.project_id
        }))

        const services = (servicesRes.data || []).map((s: any) => {
            const start = s.service_date ? new Date(s.service_date) : new Date()
            const end = s.duration_hours
                ? addHours(start, Number(s.duration_hours) || 1)
                : addHours(start, 2)

            return {
                id: s.id,
                title: s.title,
                type: 'service',
                status: s.status,
                start_date: s.service_date,
                end_date: end.toISOString(),
                owner_id: s.assigned_to,
                parent_id: null
            }
        })

        allItems = [...projects, ...orders, ...services]
    }

    // Data normalization (ensure valid dates or defaults)
    const validItems = allItems.map(item => ({
        ...item,
        // If dates are missing (e.g. Planning status), default to Today to ensure visibility on Timeline
        start_date: item.start_date || new Date().toISOString(),
        end_date: item.end_date || addHours(new Date(), 24).toISOString()
    }))

    return (
        <div className="flex-1 flex flex-col">
            <TimelineView items={validItems} />
        </div>
    )
}
