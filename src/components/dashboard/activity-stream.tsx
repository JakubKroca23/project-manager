"use client"

import { motion } from "framer-motion"
import { CheckCircle2, Clock, FileEdit, Plus, User } from "lucide-react"

const activities = [
    {
        id: 1,
        user: "Jan Novák",
        action: "vytvořil novou zakázku",
        target: "Vozidlo X5 - Doplnění výbavy",
        time: "před 2 hodinami",
        icon: Plus,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
    },
    {
        id: 2,
        user: "Petr Svoboda",
        action: "aktualizoval stav projektu",
        target: "Redesign E-shopu",
        time: "před 4 hodinami",
        icon: FileEdit,
        color: "text-orange-500",
        bg: "bg-orange-500/10",
    },
    {
        id: 3,
        user: "Eva Černá",
        action: "dokončila úkol",
        target: "Příprava podkladů",
        time: "před 5 hodinami",
        icon: CheckCircle2,
        color: "text-green-500",
        bg: "bg-green-500/10",
    },
    {
        id: 4,
        user: "Systém",
        action: "naplánoval servis",
        target: "Klíma servis - Contsystem",
        time: "včera",
        icon: Clock,
        color: "text-purple-500",
        bg: "bg-purple-500/10",
    },
]

export function ActivityStream() {
    return (
        <div className="glass-panel h-full">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Nedávná Aktivita</h3>
                <button className="text-sm text-primary hover:underline">Zobrazit vše</button>
            </div>

            <div className="space-y-6">
                {activities.map((item, index) => {
                    const Icon = item.icon
                    return (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex gap-4 relative"
                        >
                            {/* Connector Line */}
                            {index !== activities.length - 1 && (
                                <div className="absolute left-5 top-10 bottom-[-24px] w-px bg-border/50" />
                            )}

                            <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.bg} ${item.color}`}>
                                <Icon className="w-5 h-5" />
                            </div>

                            <div className="flex-1 pt-1">
                                <div className="flex justify-between items-start">
                                    <p className="text-sm font-medium text-foreground">
                                        {item.user} <span className="text-muted-foreground font-normal">{item.action}</span>
                                    </p>
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">{item.time}</span>
                                </div>
                                <p className="text-sm font-medium text-primary mt-0.5">{item.target}</p>
                            </div>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}
