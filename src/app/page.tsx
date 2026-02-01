"use client"

import { Briefcase, Factory, Wrench, AlertCircle } from "lucide-react"
import { StatCard } from "@/components/dashboard/stat-card"
import { ActivityStream } from "@/components/dashboard/activity-stream"

export default function Home() {
    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight">Vítejte zpět, Jakube 👋</h1>
                <p className="text-muted-foreground">Tady je přehled toho, co se děje ve vašich projektech.</p>
            </div>

            {/* KPI Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Aktivní Projekty"
                    value={12}
                    icon={Briefcase}
                    change="+2"
                    trend="up"
                    delay={0.1}
                />
                <StatCard
                    title="Zakázky ve Výrobě"
                    value={8}
                    icon={Factory}
                    change="+4"
                    trend="up"
                    delay={0.2}
                />
                <StatCard
                    title="Naplánované Servisy"
                    value={5}
                    icon={Wrench}
                    change="-1"
                    trend="down"
                    delay={0.3}
                />
                <StatCard
                    title="Kritické Úkoly"
                    value={3}
                    icon={AlertCircle}
                    change="0"
                    delay={0.4}
                />
            </div>

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
