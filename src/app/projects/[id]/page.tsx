import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ProjectDetailClient } from "./project-detail-client"

interface ProjectPageProps {
    params: Promise<{ id: string }>
}

export default async function ProjectPage({ params }: ProjectPageProps) {
    const { id } = await params
    const supabase = await createClient()

    const { data: project } = await supabase
        .from("projects")
        .select(`
            *,
            manager:profiles!manager_id(full_name),
            production_orders(*)
        `)
        .eq("id", id)
        .single()

    if (!project) {
        notFound()
    }

    return <ProjectDetailClient project={project} />
}
