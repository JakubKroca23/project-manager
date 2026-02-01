import { createClient } from "@/lib/supabase/server"
import { ProjectsClient } from "./projects-client"

export default async function ProjectsPage() {
    const supabase = await createClient()
    const { data: projects } = await supabase.from("projects").select("*").order('created_at', { ascending: false })

    // Transform data if needed, or pass as is. 
    // We'll mock progress for now as it's not in DB
    const projectsWithProgress = projects?.map((p: any) => ({
        ...p,
        progress: Math.floor(Math.random() * 100) // Mock progress
    })) || []

    return <ProjectsClient initialData={projectsWithProgress} />
}
