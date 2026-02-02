"use client"

import { Briefcase, Factory, Wrench, AlertCircle } from "lucide-react"
import { StatCard } from "@/components/dashboard/stat-card"

interface DashboardStatsProps {
    activeProjects: number
    activeOrders: number
    scheduledServices: number
    criticalOrders: number
}

export function DashboardStats({ activeProjects, activeOrders, scheduledServices, criticalOrders }: DashboardStatsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
                title="Aktivní Projekty"
                value={activeProjects}
                icon={Briefcase}
                trend="neutral"
                delay={0.1}
            />
            <StatCard
                title="Zakázky ve Výrobě"
                value={activeOrders}
                icon={Factory}
                trend="neutral"
                delay={0.2}
            />
            <StatCard
                title="Naplánované Servisy"
                value={scheduledServices}
                icon={Wrench}
                trend="neutral"
                delay={0.3}
            />
            <StatCard
                title="Kritické Úkoly"
                value={criticalOrders}
                icon={AlertCircle}
                delay={0.4}
            />
        </div>
    )
}
