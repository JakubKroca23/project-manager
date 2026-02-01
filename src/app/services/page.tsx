import { createClient } from "@/lib/supabase/server"
import { ServicesClient } from "./services-client"

export default async function ServicesPage() {
    const supabase = await createClient()

    const { data: services } = await supabase
        .from("services")
        .select("*")
        .order('service_date', { ascending: true })

    return <ServicesClient initialData={services || []} />
}
