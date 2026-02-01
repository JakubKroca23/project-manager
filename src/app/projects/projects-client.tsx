"use client"

import { Plus } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { Database } from "@/lib/database.types"

type Project = Database['public']['Tables']['projects']['Row'] & {
    progress?: number // Optional since not in DB yet
}

const statusMap: Record<string, { label: string; color: string }> = {
    planning: { label: "Plánování", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
    in_progress: { label: "V řešení", color: "bg-orange-500/10 text-orange-600 dark:text-orange-400" },
    completed: { label: "Dokončeno", color: "bg-green-500/10 text-green-600 dark:text-green-400" },
    paused: { label: "Pozastaveno", color: "bg-gray-500/10 text-gray-600 dark:text-gray-400" },
}

export function ProjectsClient({ initialData }: { initialData: Project[] }) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Projekty</h1>
                <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                    <Plus className="w-4 h-4" />
                    Nový Projekt
                </button>
            </div>

            <DataTable<Project>
                data={initialData}
                onRowClick={(p) => console.log("Clicked", p.title)}
                columns={[
                    {
                        header: "Název Projektu",
                        accessorKey: "title",
                        cell: (p) => <span className="font-medium text-foreground">{p.title}</span>
                    },
                    { header: "Klient", accessorKey: "client_name" },
                    {
                        header: "Stav",
                        accessorKey: "status",
                        cell: (p) => {
                            const status = statusMap[p.status] || { label: p.status, color: "bg-secondary text-secondary-foreground" }
                            return (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                    {status.label}
                                </span>
                            )
                        }
                    },
                    {
                        header: "Termín",
                        accessorKey: "end_date",
                        cell: (p) => p.end_date ? new Date(p.end_date).toLocaleDateString('cs-CZ') : '-'
                    },
                    {
                        header: "Progres",
                        accessorKey: "progress",
                        cell: (p) => (
                            <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary rounded-full transition-all"
                                    style={{ width: `${p.progress ?? 0}%` }}
                                />
                            </div>
                        )
                    },
                ]}
            />
        </div>
    )
}
