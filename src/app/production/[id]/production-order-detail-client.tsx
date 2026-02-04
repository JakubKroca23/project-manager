"use client"

import { useRouter } from "next/navigation"
import { Database } from "@/lib/database.types"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Calendar, FileText } from "lucide-react"

type Order = Database['public']['Tables']['production_orders']['Row'] & {
    project?: { id: string, title: string } | null
}

const statusMap: Record<string, { label: string; color: string }> = {
    new: { label: "Nová", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
    fabrication: { label: "Výroba", color: "bg-orange-500/10 text-orange-600 dark:text-orange-400" },
    assembly: { label: "Montáž", color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" },
    testing: { label: "Testování", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
    done: { label: "Hotovo", color: "bg-green-500/10 text-green-600 dark:text-green-400" },
    planned: { label: "Naplánováno", color: "bg-gray-500/10 text-gray-600" },
}

export function ProductionOrderDetailClient({ order }: { order: Order }) {
    const router = useRouter()

    const status = statusMap[order.status || 'new'] || { label: order.status, color: "bg-secondary" }

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push("/production")}>
                    <ChevronLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{order.title}</h1>
                    <div className="flex items-center gap-4 text-muted-foreground mt-1">
                        <span className="flex items-center gap-1.5 text-sm font-medium bg-secondary/50 px-2 py-0.5 rounded-md">
                            <FileText className="w-3.5 h-3.5" />
                            {order.project?.title || "Bez projektu"}
                        </span>
                        <span className="flex items-center gap-1.5 text-sm">
                            <Calendar className="w-3.5 h-3.5" />
                            {order.start_date ? new Date(order.start_date).toLocaleDateString() : "-"}
                            {' -> '}
                            {order.end_date ? new Date(order.end_date).toLocaleDateString() : "-"}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-panel p-6 space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Detaily zakázky</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Stav</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${status.color}`}>
                                {status.label}
                            </span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Množství</span>
                            <span className="font-bold">{order.quantity} ks</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Priorita</span>
                            <span className="font-bold uppercase text-xs">{order.priority}</span>
                        </div>
                    </div>
                </div>

                <div className="glass-panel p-6 space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Poznámky</h3>
                    <p className="text-sm text-foreground/80 whitespace-pre-wrap">
                        {order.notes || "Žádné poznámky."}
                    </p>
                </div>
            </div>
        </div>
    )
}
