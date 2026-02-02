import { createClient } from "@/lib/supabase/server"
import { ProjectsClient } from "./projects-client"

export default async function ProjectsPage() {
    const supabase = await createClient()
    const { data: projects } = await supabase
        .from("projects")
        .select(`
            *,
            manager:profiles!projects_created_by_fkey(full_name)
        `)
        .order('created_at', { ascending: false })

    // Transform data
    const projectsWithDetails = projects?.map((p: any) => ({
        ...p,
        manager_name: p.manager?.full_name || 'Neznámý',
        progress: Math.floor(Math.random() * 100) // Mock progress for now
    })) || []

    return <ProjectsClient initialData={projectsWithDetails} />
}
