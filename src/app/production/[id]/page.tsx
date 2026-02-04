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

    return (
        <div className="container mx-auto py-8">
            <ProductionOrderDetailClient order={order} />
        </div>
    )
}
