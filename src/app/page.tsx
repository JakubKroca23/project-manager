import { createClient } from "@/lib/supabase/server"
import { ActivityStream } from "@/components/dashboard/activity-stream"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"

export const dynamic = 'force-dynamic'

export default async function Home() {
    let activeProjects = 0
    let activeOrders = 0
    let scheduledServices = 0
    let criticalOrders = 0

    let userName = "Uživateli"

    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Uživateli"
        }

        // Parallel fetching of counts
        const results = await Promise.all([
            supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'in_progress'),
            supabase.from('production_orders').select('*', { count: 'exact', head: true }).neq('status', 'done'),
            supabase.from('services').select('*', { count: 'exact', head: true }).eq('status', 'scheduled'),
            supabase.from('production_orders').select('*', { count: 'exact', head: true }).eq('priority', 'critical').neq('status', 'done')
        ])

        // Check for errors in individual results
        results.forEach((res, index) => {
            if (res.error) {
                console.error(`Error fetching data for index ${index}:`, res.error)
            }
        })

        activeProjects = results[0].count || 0
        activeOrders = results[1].count || 0
        scheduledServices = results[2].count || 0
        criticalOrders = results[3].count || 0

    } catch (err) {
        console.error("Critical error loading dashboard data:", err)
        // We process gracefully with 0 values
    }

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight">Vítejte zpět, {userName} 👋</h1>
                <p className="text-muted-foreground">Tady je přehled toho, co se děje ve vašich projektech.</p>
            </div>

            {/* KPI Stats Grid - Client Component */}
            <DashboardStats
                activeProjects={activeProjects}
                activeOrders={activeOrders}
                scheduledServices={scheduledServices}
                criticalOrders={criticalOrders}
            />

            {/* Main Content Grid */}
            <div className="grid gap-6 md:grid-cols-7">
                {/* Left Column (Activity Stream) */}
                <div className="md:col-span-3 lg:col-span-3">
                    <ActivityStream />
                </div>

                {/* Right Column (Placeholder for Quick Tasks / Timeline Preview) */}
                <div className="md:col-span-4 lg:col-span-4 space-y-6">
                    <div className="glass-panel min-h-[400px] flex items-center justify-center border-dashed border-2 border-primary/20 bg-background/50">
                        <div className="text-center">
                            <p className="text-muted-foreground mb-4">Náhled Timeline (Coming Soon)</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
