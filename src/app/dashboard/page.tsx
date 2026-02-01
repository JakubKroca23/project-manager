import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { Activity, CreditCard, DollarSign, Download, Users, FolderKanban, CheckSquare, Clock } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function DashboardPage() {
    const supabase = await createClient()

    // Parallel fetch for stats
    const { count: projectCount } = await supabase.from('projects').select('*', { count: 'exact', head: true })
    const { count: taskCount } = await supabase.from('tasks').select('*', { count: 'exact', head: true })

    // Fetch recent projects
    const { data: recentProjects } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

    // Fetch my urgent tasks
    const { data: { user } } = await supabase.auth.getUser()
    const { data: myTasks } = await supabase
        .from('tasks')
        .select('*')
        // .eq('assignee_id', user?.id) // If assignees implemented
        .eq('priority', 'urgent')
        .limit(5)

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <div className="flex items-center space-x-2">
                    {/* <Button>Download Report</Button> */}
                </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                        <FolderKanban className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{projectCount || 0}</div>
                        <p className="text-xs text-muted-foreground">+2 from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
                        <CheckSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{taskCount || 0}</div>
                        <p className="text-xs text-muted-foreground">+12% faster completion</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">3</div>
                        <p className="text-xs text-muted-foreground">Requires attention</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1</div>
                        <p className="text-xs text-muted-foreground">Active in workspace</p>
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Projects</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentProjects?.map((project) => (
                                <div key={project.id} className="flex items-center">
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">{project.name}</p>
                                        <p className="text-xs text-muted-foreground">{project.description?.substring(0, 50)}</p>
                                    </div>
                                    <div className="ml-auto font-medium">
                                        <span className={`text-xs px-2 py-1 rounded-full border ${project.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {project.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {(recentProjects?.length === 0) && <p className="text-sm text-muted-foreground">No projects yet.</p>}
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Urgent Tasks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {myTasks?.map((task) => (
                                <div key={task.id} className="flex items-center">
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">{task.title}</p>
                                        <p className="text-xs text-muted-foreground">{task.status}</p>
                                    </div>
                                </div>
                            ))}
                            {(myTasks?.length === 0) && <p className="text-sm text-muted-foreground">No urgent tasks.</p>}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
