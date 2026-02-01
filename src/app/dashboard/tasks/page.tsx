import { createClient } from "@/lib/supabase/server"
import { KanbanBoard } from "@/components/tasks/kanban-board"
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog"

export default async function TasksPage() {
    const supabase = await createClient()
    // Fetch all tasks for the user (via workspace policies in real app)
    // For MVP we just fetch all tasks, policies limit visibility
    const { data: tasks } = await supabase.from('tasks').select('*')

    return (
        <div className="flex flex-col gap-6 h-[calc(100vh-100px)]">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">My Tasks</h2>
                <CreateTaskDialog />
            </div>

            <div className="flex-1 overflow-x-auto">
                <KanbanBoard initialTasks={tasks || []} />
            </div>
        </div>
    )
}
