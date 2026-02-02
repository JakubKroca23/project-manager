"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Database } from "@/lib/database.types"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Calendar, FileText, CheckCircle2, Clock, PlayCircle, AlertCircle } from "lucide-react"

type Order = Database['public']['Tables']['production_orders']['Row'] & {
    project?: { id: string, title: string } | null
}
type Task = Database['public']['Tables']['manufacturing_tasks']['Row']

const statusMap: Record<string, { label: string; color: string; icon: any }> = {
    queue: { label: "Ve frontě", color: "text-muted-foreground", icon: Clock },
    in_progress: { label: "Probíhá", color: "text-blue-500", icon: PlayCircle },
    done: { label: "Hotovo", color: "text-green-500", icon: CheckCircle2 },
    check: { label: "Kontrola", color: "text-orange-500", icon: AlertCircle },
}

export function ProductionOrderDetailClient({ order, tasks: initialTasks }: { order: Order, tasks: Task[] }) {
    const [tasks, setTasks] = useState<Task[]>(initialTasks)
    const router = useRouter()
    const supabase = createClient()

    const updateTaskStatus = async (taskId: string, newStatus: string) => {
        // Optimistic update
        setTasks(current => current.map(t => t.id === taskId ? { ...t, status: newStatus } : t))

        const { error } = await supabase
            .from("manufacturing_tasks")
            .update({ status: newStatus })
            .eq("id", taskId)

        if (error) {
            console.error("Failed to update status", error)
            // Revert on error could be implemented here
        }
    }

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

            {/* Manufacturing Tasks */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    Výrobní kroky
                    <span className="ml-2 text-xs font-normal text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                        {tasks.filter(t => t.status === 'done').length} / {tasks.length}
                    </span>
                </h2>

                <div className="grid gap-4">
                    {tasks.map((task) => {
                        const status = statusMap[task.status || 'queue'] || statusMap.queue
                        const StatusIcon = status.icon

                        return (
                            <div key={task.id} className="p-4 rounded-xl border border-border/50 bg-card hover:bg-secondary/10 transition-colors flex items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <h3 className="font-semibold">{task.title}</h3>
                                    <p className="text-sm text-muted-foreground">{task.description}</p>
                                    <div className="flex items-center gap-4 pt-1">
                                        <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${status.color}`}>
                                            <StatusIcon className="w-3.5 h-3.5" />
                                            {status.label}
                                        </div>
                                        <div className="text-xs text-muted-foreground font-mono">
                                            {task.estimated_hours}h
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {task.status !== 'in_progress' && task.status !== 'done' && (
                                        <Button size="sm" variant="outline" onClick={() => updateTaskStatus(task.id, 'in_progress')}>
                                            Začít
                                        </Button>
                                    )}
                                    {task.status === 'in_progress' && (
                                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => updateTaskStatus(task.id, 'done')}>
                                            Dokončit
                                        </Button>
                                    )}
                                    {task.status === 'done' && (
                                        <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => updateTaskStatus(task.id, 'queue')}>
                                            Reset
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
