"use client"

import { Plus, AlertOctagon } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { productionOrders, type ProductionOrder } from "@/lib/data"

const statusMap = {
    new: { label: "Nová", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
    fabrication: { label: "Výroba", color: "bg-orange-500/10 text-orange-600 dark:text-orange-400" },
    assembly: { label: "Montáž", color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" },
    testing: { label: "Testování", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
    done: { label: "Hotovo", color: "bg-green-500/10 text-green-600 dark:text-green-400" },
}

const priorityMap = {
    low: { label: "Nízká", color: "text-muted-foreground" },
    medium: { label: "Střední", color: "text-foreground" },
    high: { label: "Vysoká", color: "text-orange-500 font-medium" },
    critical: { label: "Kritická", color: "text-red-500 font-bold" },
}

export default function ProductionPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Výroba</h1>
                <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                    <Plus className="w-4 h-4" />
                    Nová Zakázka
                </button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {/* Mini stats could go here */}
            </div>

            <DataTable<ProductionOrder>
                data={productionOrders}
                onRowClick={(p) => console.log("Clicked", p.title)}
                columns={[
                    {
                        header: "Název Zakázky",
                        accessorKey: "title",
                        cell: (p) => (
                            <div>
                                <span className="font-medium text-foreground block">{p.title}</span>
                                <span className="text-xs text-muted-foreground">{p.project || "Bez projektu"}</span>
                            </div>
                        )
                    },
                    {
                        header: "Množství",
                        accessorKey: "quantity",
                        cell: (p) => <span className="font-mono">{p.quantity} ks</span>
                    },
                    {
                        header: "Priorita",
                        accessorKey: "priority",
                        cell: (p) => (
                            <span className={`flex items-center gap-2 ${priorityMap[p.priority].color}`}>
                                {p.priority === 'critical' && <AlertOctagon className="w-3 h-3" />}
                                {priorityMap[p.priority].label}
                            </span>
                        )
                    },
                    {
                        header: "Stav",
                        accessorKey: "status",
                        cell: (p) => (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusMap[p.status].color}`}>
                                {statusMap[p.status].label}
                            </span>
                        )
                    },
                    { header: "Termín", accessorKey: "deadline" },
                ]}
            />
        </div>
    )
}
