"use client"

import { motion } from "framer-motion"
import { Calendar, User, Briefcase, Layout, Settings, Factory, CheckCircle2, Octagon, Box } from "lucide-react"
import { format } from "date-fns"
import { cs } from "date-fns/locale"

const statusMap: Record<string, { label: string; color: string; icon: any; bg: string }> = {
    planning: { label: "Nový projekt", color: "text-blue-500", icon: Layout, bg: "bg-blue-500/10 border-blue-500/20" },
    development: { label: "Vývoj", color: "text-indigo-500", icon: Settings, bg: "bg-indigo-500/10 border-indigo-500/20" },
    production: { label: "Výroba", color: "text-orange-500", icon: Factory, bg: "bg-orange-500/10 border-orange-500/20" },
    completed: { label: "Dokončeno", color: "text-green-500", icon: CheckCircle2, bg: "bg-green-500/10 border-green-500/20" },
    stopped: { label: "Zastaveno", color: "text-red-500", icon: Octagon, bg: "bg-red-500/10 border-red-500/20" },
}

interface ProjectCardProps {
    project: {
        id: string
        title: string
        client_name?: string | null
        manager_name?: string
        status: string
        end_date?: string | null
        quantity?: number | null
    }
    onClick?: () => void
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
    const status = statusMap[project.status] || { label: project.status, color: "text-muted-foreground", icon: Layout, bg: "bg-muted" }
    const Icon = status.icon

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, scale: 1.01 }}
            onClick={onClick}
            className="group cursor-pointer relative overflow-hidden glass-panel p-6 border border-border/50 hover:border-primary/30 transition-all duration-300"
        >
            {/* Background Gradient Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative space-y-5">
                {/* Header: Status & Quantity */}
                <div className="flex items-center justify-between gap-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${status.color} ${status.bg}`}>
                        <Icon className="w-3.5 h-3.5" />
                        {status.label}
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground bg-secondary/30 px-2 py-1 rounded-md border border-border/50">
                        <Box className="w-3.5 h-3.5" />
                        {project.quantity || 1} ks
                    </span>
                </div>

                {/* Title & Client */}
                <div className="space-y-1">
                    <h3 className="text-xl font-black tracking-tight group-hover:text-primary transition-colors line-clamp-1">
                        {project.title}
                    </h3>
                    <p className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-indigo-500/70" />
                        {project.client_name || "Bez klienta"}
                    </p>
                </div>

                {/* Footer: Manager & Date */}
                <div className="pt-4 flex items-center justify-between border-t border-border/20">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center">
                            <User className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <span className="text-xs font-bold text-foreground/80">
                            {project.manager_name || "Nepřiřazeno"}
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5 text-orange-500/70" />
                        {project.end_date ? format(new Date(project.end_date), "d. MMMM yyyy", { locale: cs }) : "Bez termínu"}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
