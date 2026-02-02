import { createClient } from "@/lib/supabase/server"
import { ProductionClient } from "./production-client"

export default async function ProductionPage() {
  const supabase = await createClient()

  // Select all production orders and join with projects to get title
  const { data: productionOrders } = await supabase
    .from("production_orders")
    .select(`
      *,
      project:projects (
        title
      )
    `)
    .order('created_at', { ascending: false })

  return <ProductionClient initialData={productionOrders || []} />
}
