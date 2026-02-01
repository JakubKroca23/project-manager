"use client"

import React, { useState } from "react"
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, DragStartEvent, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove } from '@dnd-kit/sortable'
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge" // Need to create Badge
import { toast } from "sonner"
import { CreateTaskDialog } from "./create-task-dialog"
import { format } from "date-fns"

// Types
type Task = {
    id: string
    title: string
    status: string
    priority: string
    project_id: string
}

const COLUMNS = [
    { id: 'todo', title: 'To Do' },
    { id: 'in_progress', title: 'In Progress' },
    { id: 'review', title: 'Review' },
    { id: 'done', title: 'Done' }
]

export function KanbanBoard({ initialTasks }: { initialTasks: Task[] }) {
    const [tasks, setTasks] = useState<Task[]>(initialTasks)
    const supabase = createClient()

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    )

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event

        if (!over) return

        const taskId = active.id as string
        const newStatus = over.id as string

        // Optimistic UI update
        const updatedTasks = tasks.map(t =>
            t.id === taskId ? { ...t, status: newStatus } : t
        )

        setTasks(updatedTasks)

        // DB Update
        const { error } = await supabase
            .from('tasks')
            .update({ status: newStatus })
            .eq('id', taskId)

        if (error) {
            toast.error("Failed to update status")
            // Rollback (could re-fetch)
        }
    }

    return (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div className="flex gap-4 h-full overflow-x-auto pb-4">
                {COLUMNS.map(col => (
                    <KanbanColumn key={col.id} id={col.id} title={col.title} tasks={tasks.filter(t => t.status === col.id)} />
                ))}
            </div>
        </DndContext>
    )
}

import { useDroppable } from '@dnd-kit/core'
import { useDraggable } from '@dnd-kit/core'

function KanbanColumn({ id, title, tasks }: { id: string, title: string, tasks: Task[] }) {
    const { setNodeRef } = useDroppable({
        id: id,
    })

    return (
        <div ref={setNodeRef} className="flex-1 min-w-[250px] bg-muted/30 rounded-lg p-3 flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase">{title}</h3>
                <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{tasks.length}</span>
            </div>
            <div className="flex flex-col gap-2 min-h-[500px]">
                {tasks.map(task => (
                    <KanbanCard key={task.id} task={task} />
                ))}
                {tasks.length === 0 && (
                    <div className="h-20 border-2 border-dashed border-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">
                        Empty
                    </div>
                )}
            </div>
        </div>
    )
}

function KanbanCard({ task }: { task: Task }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: task.id,
    })

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className="bg-card border rounded-md p-3 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing"
        >
            <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium leading-tight">{task.title}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
                <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold border ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                </span>
            </div>
        </div>
    )
}

function getPriorityColor(priority: string) {
    switch (priority) {
        case 'urgent': return 'bg-red-100 text-red-800 border-red-200'
        case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
        case 'medium': return 'bg-yellow-50 text-yellow-800 border-yellow-200'
        case 'low': return 'bg-green-50 text-green-800 border-green-200'
        default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
}
