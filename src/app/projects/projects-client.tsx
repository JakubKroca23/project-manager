"use client"

import { useState } from "react"
import { Plus, Layout, Settings, Factory, CheckCircle2, Octagon } from "lucide-react"
import { useRouter } from "next/navigation"
import { DataTable } from "@/components/ui/data-table"
import { Database } from "@/lib/database.types"


type Project = Database['public']['Tables']['projects']['Row'] & {
    progress?: number
    manager_name?: string
    completion_percentage?: number | null
}

const statusMap: Record<string, { label: string; color: string; icon: any }> = {
    planning: { label: "Plánování", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20", icon: Layout },
    development: { label: "Vývoj", color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20", icon: Settings },
    production: { label: "Výroba", color: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20", icon: Factory },
    completed: { label: "Dokončeno", color: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20", icon: CheckCircle2 },
    stopped: { label: "Zastaveno", color: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20", icon: Octagon },
}

export function ProjectsClient({ initialData }: { initialData: Project[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const router = useRouter()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Projekty</h1>
                <button
                    onClick={() => { }} // Disabled for now
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 opacity-50 cursor-not-allowed"
                >
                    <Plus className="w-4 h-4" />
                    Nový Projekt
                </button>
            </div>



            <DataTable<Project>
                data={initialData}
                onRowClick={(p: Project) => router.push(`/projects/${p.id}`)}
                storageKey="projects-list-columns"
                searchPlaceholder="Hledat projekty..."
                columns={[
                    {
                        id: "title",
                        header: "Název Projektu",
                        accessorKey: "title",
                        cell: (p: Project) => <span className="font-medium text-foreground">{p.title}</span>,
                        enableHiding: false
                    },
                    {
                        id: "client",
                        header: "Klient",
                        accessorKey: "client_name"
                    },
                    {
                        id: "manager",
                        header: "Vedoucí",
                        accessorKey: "manager_name"
                    },
                    {
                        id: "status",
                        header: "Stav",
                        accessorKey: "status",
                        cell: (p: Project) => {
                            const status = statusMap[p.status] || { label: p.status, color: "bg-secondary text-secondary-foreground", icon: Layout }
                            const Icon = status.icon
                            return (
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${status.color}`}>
                                    <Icon className="w-3.5 h-3.5" />
                                    {status.label}
                                </span>
                            )
                        }
                    },
                    {
                        id: "end_date",
                        header: "Termín",
                        accessorKey: "end_date",
                        cell: (p: Project) => p.end_date ? new Date(p.end_date).toLocaleDateString('cs-CZ') : '-'
                    },
                    {
                        id: "quantity",
                        header: "Počet",
                        accessorKey: "quantity",
                        cell: (p: Project) => p.quantity ? `${p.quantity} ks` : '1 ks'
                    },
                    {
                        id: "progress",
                        header: "Progres",
                        accessorKey: "progress",
                        cell: (p: Project) => (
                            <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary rounded-full transition-all"
                                    style={{ width: `${p.completion_percentage ?? p.progress ?? 0}%` }}
                                />
                            </div>
                        )
                    },
                ]}
            />
        </div>
    )
}
