import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ProductionOrderDetailClient } from "./production-order-detail-client"

export default async function ProductionDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params
    const id = resolvedParams.id
    const supabase = await createClient()

    // Fetch order with project details
    const { data: order } = await supabase
        .from("production_orders")
        .select(`
            *,
            project:projects(id, title)
        `)
        .eq("id", id)
        .single()

    if (!order) {
        notFound()
    }

    // Fetch tasks for this order
    const { data: tasks } = await supabase
        .from("manufacturing_tasks")
        .select("*")
        .eq("order_id", id)
        .order("created_at")

    // Fetch BOM items if project exists
    let bomItems: any[] = []
    const orderData = order as any

    if (orderData?.project?.id) {
        const { data: bom } = await supabase
            .from("bom_items")
            .select("*")
            .eq("project_id", orderData.project.id)

        if (bom) bomItems = bom
    }

    return (
        <div className="container mx-auto py-8">
            <ProductionOrderDetailClient order={orderData} tasks={tasks || []} bomItems={bomItems} />
        </div>
    )
}


