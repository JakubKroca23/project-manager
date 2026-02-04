"use client"

import { useState } from "react"
import { Plus, MapPin, CalendarClock } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { Database } from "@/lib/database.types"
import { CreateServiceModal } from "@/components/services/create-service-modal"

type Service = Database['public']['Tables']['services']['Row']

const statusMap: Record<string, { label: string; color: string }> = {
    scheduled: { label: "Naplánováno", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
    in_progress: { label: "Probíhá", color: "bg-orange-500/10 text-orange-600 dark:text-orange-400" },
    waiting_parts: { label: "Čeká na díly", color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" },
    done: { label: "Hotovo", color: "bg-green-500/10 text-green-600 dark:text-green-400" },
}

export function ServicesClient({ initialData }: { initialData: Service[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Servis</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                >
                    <Plus className="w-4 h-4" />
                    Naplánovat Servis
                </button>
            </div>

            <CreateServiceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />

            <DataTable<Service>
                data={initialData}
                columns={[
                    {
                        header: "Servisní úkon",
                        accessorKey: "title",
                        cell: (s) => (
                            <div className="flex flex-col text-left">
                                <span className="font-medium text-foreground">{s.title}</span>
                                {s.is_recurring && (
                                    <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">Opakovaný</span>
                                )}
                            </div>
                        )
                    },
                    { header: "Klient", accessorKey: "client_name" },
                    {
                        header: "Lokace",
                        accessorKey: "location",
                        cell: (s) => (
                            <div className="flex items-center gap-1 text-muted-foreground">
                                <MapPin className="w-3 h-3" />
                                {s.location || "-"}
                            </div>
                        )
                    },
                    {
                        header: "Stav",
                        accessorKey: "status",
                        cell: (s) => {
                            const status = statusMap[s.status] || { label: s.status, color: "bg-secondary" }
                            return (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                    {status.label}
                                </span>
                            )
                        }
                    },
                    {
                        header: "Datum a čas",
                        accessorKey: "service_date",
                        cell: (s) => (
                            <div className="flex items-center gap-1">
                                <CalendarClock className="w-3 h-3 text-muted-foreground" />
                                {s.service_date ? new Date(s.service_date).toLocaleString('cs-CZ') : "-"}
                            </div>
                        )
                    },
                ]}
            />
        </div>
    )
}
