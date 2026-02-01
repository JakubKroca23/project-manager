"use client"

import * as React from "react"
import { addDays, format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Task = {
    id: string
    title: string
    start_date: string | null
    due_date: string | null
    status: string
}

export function TimelineView({ tasks }: { tasks: any[] }) {
    const [currentDate, setCurrentDate] = React.useState(new Date())

    // Use real tasks or fallback mock
    const displayTasks = tasks && tasks.length > 0 ? tasks : [
        { id: '1', title: 'Start your first project', start_date: new Date().toISOString(), due_date: addDays(new Date(), 3).toISOString(), status: 'todo' }
    ]

    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 })
    const endDate = endOfWeek(currentDate, { weekStartsOn: 1 })
    const days = eachDayOfInterval({ start: startDate, end: endDate })

    // Calculate grid columns
    const dayWidth = 60 // px per day

    const handlePrevWeek = () => {
        setCurrentDate(addDays(currentDate, -7))
    }

    const handleNextWeek = () => {
        setCurrentDate(addDays(currentDate, 7))
    }

    const handleToday = () => {
        setCurrentDate(new Date())
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">
                        {format(startDate, "MMM d")} - {format(endDate, "MMM d, yyyy")}
                    </h3>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" onClick={handlePrevWeek}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={handleToday}>
                        Today
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleNextWeek}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-auto border rounded-md relative bg-muted/20">
                {/* Header Row */}
                <div className="flex sticky top-0 z-30 bg-background border-b shadow-sm">
                    <div className="min-w-[200px] w-[200px] p-2 font-medium border-r sticky left-0 bg-background z-20">
                        Task Name
                    </div>
                    {days.map((day) => (
                        <div
                            key={day.toISOString()}
                            className={cn(
                                "min-w-[60px] w-[60px] p-2 text-center text-xs border-r flex flex-col justify-center",
                                isSameDay(day, new Date()) && "bg-blue-50/50 dark:bg-blue-950/20"
                            )}
                        >
                            <span className="font-medium">{format(day, "EEE")}</span>
                            <span className="text-muted-foreground">{format(day, "d")}</span>
                        </div>
                    ))}
                </div>

                {/* Task Rows */}
                <div className="relative min-w-fit">
                    {displayTasks.map((task, index) => {
                        const taskStart = task.start_date ? new Date(task.start_date) : new Date()
                        const taskEnd = task.due_date ? new Date(task.due_date) : addDays(taskStart, 1)

                        const startDiff = (taskStart.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
                        const duration = Math.max(1, (taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24))
                        const isVisible = (startDiff + duration) > 0 && startDiff < 7

                        return (
                            <div key={task.id} className="group flex relative border-b hover:bg-muted/50 transition-colors">
                                {/* Task Title Column */}
                                <div className="min-w-[200px] w-[200px] p-2 text-sm font-medium border-r sticky left-0 bg-background z-10 truncate h-[50px] flex items-center">
                                    {task.title}
                                </div>

                                {/* Grid Cells Background */}
                                {days.map((_, dayIndex) => (
                                    <div key={dayIndex} className="min-w-[60px] h-[50px] border-r" />
                                ))}

                                {/* Task Bar */}
                                {isVisible && (
                                    <div
                                        className={cn(
                                            "absolute h-8 rounded-md shadow-sm opacity-90 hover:opacity-100 cursor-pointer flex items-center px-2 text-xs text-white bg-primary truncate"
                                        )}
                                        style={{
                                            top: "9px", // (50 - 32) / 2
                                            left: `${200 + (Math.max(0, startDiff) * dayWidth)}px`,
                                            width: `${Math.min(duration, 7 - Math.max(0, startDiff)) * dayWidth}px`,
                                            zIndex: 5
                                        }}
                                        title={`${task.title} (${duration} days)`}
                                    >
                                        {task.title}
                                    </div>
                                )}
                            </div>
                        )
                    })}

                    {displayTasks.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground w-full">
                            No tasks found in this period.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
