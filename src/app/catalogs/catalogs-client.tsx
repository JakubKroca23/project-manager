"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { ClientsList } from "./clients-list"
import { SuperstructuresList } from "./superstructures-list"
import { AccessoriesList } from "./accessories-list"

export function CatalogsClient() {
    const [activeTab, setActiveTab] = useState<"clients" | "superstructures" | "accessories">("clients")

    const tabs = [
        { id: "clients", label: "Klienti" },
        { id: "superstructures", label: "Nástavby" },
        { id: "accessories", label: "Příslušenství" },
    ] as const

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex p-1 bg-secondary/30 rounded-xl w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "relative px-4 py-2 rounded-lg text-sm font-medium transition-colors date-range-picker-trigger",
                            activeTab === tab.id
                                ? "text-primary"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="catalog-tab"
                                className="absolute inset-0 bg-background shadow-sm rounded-lg border border-border/50"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <span className="relative z-10">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Content Preview */}
            <div className="glass-panel p-6 rounded-xl min-h-[400px]">
                {activeTab === "clients" && <ClientsList />}
                {activeTab === "superstructures" && <SuperstructuresList />}
                {activeTab === "accessories" && <AccessoriesList />}
            </div>
        </div>
    )
}
