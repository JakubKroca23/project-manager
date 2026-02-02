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
            created_by_user:profiles!projects_created_by_fkey(full_name),
            assigned_manager:profiles!manager_id(full_name),
            superstructures(*),
            project_accessories(*)
        `)
        .eq("id", id)
        .single()

    if (!project) {
        notFound()
    }

    return <ProjectDetailClient project={project} />
}
