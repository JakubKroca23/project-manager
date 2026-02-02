import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ProductionOrderDetailClient } from "./production-order-detail-client"

export default async function ProductionDetailPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()

    // Fetch order with project details
    const { data: order } = await supabase
        .from("production_orders")
        .select(`
            *,
            project:projects(id, title)
        `)
        .eq("id", params.id)
        .single()

    if (!order) {
        notFound()
    }

    // Fetch tasks for this order
    const { data: tasks } = await supabase
        .from("manufacturing_tasks")
        .select("*")
        .eq("order_id", params.id)
        .order("created_at")

    return (
        <div className="container mx-auto py-8">
            <ProductionOrderDetailClient order={order} tasks={tasks || []} />
        </div>
    )
}
