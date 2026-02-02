import { createClient } from "@/lib/supabase/server"
import { ProjectsClient } from "./projects-client"
import { PageContainer } from "@/components/layout/PageContainer"

export default async function ProjectsPage() {
    const supabase = await createClient()
    const { data: projects } = await supabase
        .from("projects")
        .select(`
            *,
            created_by_user:profiles!projects_created_by_fkey(full_name),
            assigned_manager:profiles!manager_id(full_name)
        `)
        .order('created_at', { ascending: false })

    // Transform data
    const projectsWithDetails = projects?.map((p: any) => ({
        ...p,
        manager_name: p.assigned_manager?.full_name || p.created_by_user?.full_name || 'Neznámý',
        progress: Math.floor(Math.random() * 100) // Mock progress for now
    })) || []

    return (
        <PageContainer>
            <ProjectsClient initialData={projectsWithDetails} />
        </PageContainer>
    )
}
