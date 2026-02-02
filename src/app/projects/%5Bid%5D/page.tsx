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
            manager:profiles!projects_created_by_fkey(full_name)
        `)
        .eq("id", id)
        .single()

    if (!project) {
        notFound()
    }

    return <ProjectDetailClient project={project} />
}
