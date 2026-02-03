"use client"

import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"

interface StatCardProps {
    title: string
    value: string | number
    icon: LucideIcon
    change?: string
    trend?: "up" | "down" | "neutral"
    delay?: number
}

export function StatCard({ title, value, icon: Icon, change, trend = "neutral", delay = 0 }: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className="glass-panel relative overflow-hidden group"
        >
            <div className="absolute -top-2 -right-2 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity rotate-12">
                <Icon className="w-24 h-24" />
            </div>

            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <h3 className="text-3xl font-bold mt-2 tracking-tight">{value}</h3>

                    {change && (
                        <div className="flex items-center mt-1">
                            <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${trend === "up" ? "bg-green-500/10 text-green-600 dark:text-green-400" :
                                trend === "down" ? "bg-red-500/10 text-red-600 dark:text-red-400" :
                                    "bg-secondary text-secondary-foreground"
                                }`}>
                                {change}
                            </span>
                            <span className="text-xs text-muted-foreground ml-2">oproti minulému měsíci</span>
                        </div>
                    )}
                </div>
                <div className="p-3 bg-primary/10 rounded-xl text-primary ring-1 ring-inset ring-primary/20">
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </motion.div>
    )
}
