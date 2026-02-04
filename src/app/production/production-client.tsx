"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, AlertOctagon } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { Database } from "@/lib/database.types"


type ProductionOrder = Database['public']['Tables']['production_orders']['Row'] & {
    project?: { title: string } | null
}

const statusMap: Record<string, { label: string; color: string }> = {
    new: { label: "Nová", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
    fabrication: { label: "Výroba", color: "bg-orange-500/10 text-orange-600 dark:text-orange-400" },
    assembly: { label: "Montáž", color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" },
    testing: { label: "Testování", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
    done: { label: "Hotovo", color: "bg-green-500/10 text-green-600 dark:text-green-400" },
    planned: { label: "Naplánováno", color: "bg-gray-500/10 text-gray-600" },
}

const priorityMap: Record<string, { label: string; color: string }> = {
    low: { label: "Nízká", color: "text-muted-foreground" },
    medium: { label: "Střední", color: "text-foreground" },
    high: { label: "Vysoká", color: "text-orange-500 font-medium" },
    critical: { label: "Kritická", color: "text-red-500 font-bold" },
}

export function ProductionClient({ initialData }: { initialData: ProductionOrder[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const router = useRouter()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Výroba</h1>
                <button
                    onClick={() => { }} // Disabled for now
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 opacity-50 cursor-not-allowed"
                >
                    <Plus className="w-4 h-4" />
                    Nová Zakázka
                </button>
            </div>



            <div className="grid gap-4 md:grid-cols-3">
                {/* Mini stats could go here */}
            </div>

            <DataTable<ProductionOrder>
                data={initialData}
                onRowClick={(p) => router.push(`/production/${p.id}`)}
                columns={[
                    {
                        header: "Název Zakázky",
                        accessorKey: "title",
                        cell: (p) => (
                            <div>
                                <span className="font-medium text-foreground block">{p.title}</span>
                                <span className="text-xs text-muted-foreground">{p.project?.title || "Bez projektu"}</span>
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
                        cell: (p) => {
                            const priority = priorityMap[p.priority] || { label: p.priority, color: "" }
                            return (
                                <span className={`flex items-center gap-2 ${priority.color}`}>
                                    {p.priority === 'critical' && <AlertOctagon className="w-3 h-3" />}
                                    {priority.label}
                                </span>
                            )
                        }
                    },
                    {
                        header: "Stav",
                        accessorKey: "status",
                        cell: (p) => {
                            const status = statusMap[p.status] || { label: p.status, color: "bg-secondary" }
                            return (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                    {status.label}
                                </span>
                            )
                        }
                    },
                    {
                        header: "Termín",
                        accessorKey: "end_date", // Mapped from deadline/end_date in DB
                        cell: (p) => p.end_date ? new Date(p.end_date).toLocaleDateString('cs-CZ') : '-'
                    },
                ]}
            />
        </div>
    )
}
