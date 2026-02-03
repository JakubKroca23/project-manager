import { createClient } from "@/lib/supabase/server"
import { ActivityStream } from "@/components/dashboard/activity-stream"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RecentProjects } from "@/components/dashboard/recent-projects"

export const dynamic = 'force-dynamic'

export default async function Home() {
    let activeProjects = 0
    let activeOrders = 0
    let scheduledServices = 0
    let deadlinesCount = 0

    let recentProjects: any[] = []
    let recentActivities: any[] = []
    let userId = ""

    let userName = "Uživateli"

    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            userId = user.id
            userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Uživateli"

            // Parallel fetching of counts and lists
            const [
                projectsRes,
                ordersRes,
                servicesRes,
                deadlinesRes,
                recentProjectsRes,
                activitiesRes
            ] = await Promise.all([
                // 1. Active Projects (Manager is user)
                supabase.from('projects')
                    .select('*', { count: 'exact', head: true })
                    .eq('manager_id', user.id)
                    .neq('status', 'completed')
                    .neq('status', 'draft'), // Assuming 'draft' exists or just 'planning'

                // 2. Orders (Assigned to user)
                supabase.from('production_orders')
                    .select('*', { count: 'exact', head: true })
                    .eq('assigned_to', user.id)
                    .neq('status', 'done'),

                // 3. Services (Assigned to user)
                supabase.from('services')
                    .select('*', { count: 'exact', head: true })
                    .eq('assigned_to', user.id)
                    .eq('status', 'scheduled'),

                // 4. Deadlines (Projects ending in next 7 days)
                supabase.from('projects')
                    .select('*', { count: 'exact', head: true })
                    .eq('manager_id', user.id)
                    .gte('end_date', new Date().toISOString())
                    .lte('end_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()),

                // 5. Recent Projects List
                supabase.from('projects')
                    .select('id, title, client_name, status, end_date, updated_at')
                    .eq('manager_id', user.id)
                    .order('updated_at', { ascending: false })
                    .limit(5),

                // 6. Recent Activities (Major Milestones, globally or just relative to user items? Let's show global major milestones for context)
                supabase.from('project_history')
                    .select('id, user_id, project_id, action_type, details, created_at')
                    .in('action_type', ['created', 'status_updated', 'completed', 'production_orders_generated'])
                    .order('created_at', { ascending: false })
                    .limit(10)
            ])


            activeProjects = projectsRes.count || 0
            activeOrders = ordersRes.count || 0
            scheduledServices = servicesRes.count || 0
            deadlinesCount = deadlinesRes.count || 0
            recentProjects = recentProjectsRes.data || []

            // Enrich activities with names (manual join since Supabase simple client doesn't deep join easily in one go without predefined Views/Foreign Tables setup sometimes)
            // Or better: use a View. But manual join for 10 items is fast.
            const activitiesData: any[] = activitiesRes.data || []

            if (activitiesData.length > 0) {
                // Fetch profiles and projects for these activities
                const userIds = [...new Set(activitiesData.map(a => a.user_id).filter(Boolean))] as string[]
                const projectIds = [...new Set(activitiesData.map(a => a.project_id))] as string[]

                const [usersMapRes, projectsMapRes] = await Promise.all([
                    supabase.from('profiles').select('id, full_name').in('id', userIds),
                    supabase.from('projects').select('id, title').in('id', projectIds)
                ])

                const usersMap = new Map(usersMapRes.data?.map(u => [u.id, u.full_name]) || [])
                const projectsMap = new Map(projectsMapRes.data?.map(p => [p.id, p.title]) || [])

                recentActivities = activitiesData.map(a => ({
                    ...a,
                    user_name: usersMap.get(a.user_id!) || 'Neznámý',
                    project_title: projectsMap.get(a.project_id) || 'Neznámý projekt'
                }))
            }
        }

    } catch (err) {
        console.error("Critical error loading dashboard data:", err)
    }

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight">Vítejte zpět, {userName} 👋</h1>
                <p className="text-muted-foreground">Aktuální přehled vašich projektů a termínů.</p>
            </div>

            {/* KPI Stats Grid - Client Component */}
            <DashboardStats
                activeProjects={activeProjects}
                activeOrders={activeOrders}
                scheduledServices={scheduledServices}
                deadlinesCount={deadlinesCount}
                userId={userId}
            />

            {/* Main Content Grid */}
            <div className="grid gap-6 md:grid-cols-7 h-[500px]">
                {/* Left Column (Recent Projects) - Replaces previous Activity Stream position or swaps? 
                    User wanted "Recent Projects" table. Usually tables take more width.
                    Let's put Recent Projects on the LEFT (col-span-4) and Activity Stream on the RIGHT (col-span-3)
                */}
                <div className="md:col-span-4 lg:col-span-5 h-full">
                    <RecentProjects initialProjects={recentProjects} userId={userId} />
                </div>

                {/* Right Column (Activity Stream) */}
                <div className="md:col-span-3 lg:col-span-2 h-full">
                    <ActivityStream initialActivities={recentActivities} />
                </div>
            </div>
        </div>
    )
}
