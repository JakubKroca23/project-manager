import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"

export default async function ProjectsPage() {
    const supabase = await createClient()
    const { data: projects, error } = await supabase.from('projects').select('*')

    // If error (e.g. no connection), show empty state or error
    // For demo purposes, if no connection, we might show a message

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" /> New Project
                </Button>
            </div>

            {!projects || projects.length === 0 ? (
                <Card className="border-dashed">
                    <CardHeader className="text-center py-12">
                        <CardTitle>No projects found</CardTitle>
                        <CardDescription>
                            You haven&apos;t created any projects yet. Start by creating your first one.
                        </CardDescription>
                    </CardHeader>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project: any) => (
                        <Card key={project.id} className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardHeader>
                                <CardTitle>{project.name}</CardTitle>
                                <CardDescription>Status: {project.status}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full bg-primary w-[30%]" /> {/* Mock Progress */}
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">30% Complete</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
