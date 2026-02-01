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
                                "sticky top-0 z-10 bg-background border-b border-l flex flex-col items-center justify-center text-xs h-[50px]",
                                isSameDay(day, new Date()) && "bg-primary/5 font-bold text-primary"
                            )}
                        >
                            <span className="opacity-50">{format(day, "EEE")}</span>
                            <span>{format(day, "d")}</span>
                        </div>
                    ))}

                    {/* Rows */}
                    {mockTasks.map((task, index) => {
                        // Calculate Position
                        const startDiff = Math.floor((task.startDate.getTime() - startOfCurrentWeek.getTime()) / (1000 * 60 * 60 * 24))
                        const duration = Math.floor((task.endDate.getTime() - task.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

                        // Ensure bar is within view logic (simplified)
                        // We need to map grid columns. first column is index 1.
                        // Task Name is col 1. Days start at col 2.

                        const gridColumnStart = Math.max(2, 2 + startDiff)
                        const gridColumnEnd = 2 + startDiff + duration

                        const isVisible = gridColumnEnd > 2 && (2 + startDiff) < (2 + daysToShow)

                        return (
                            <React.Fragment key={task.id}>
                                <div className="border-b px-4 flex items-center text-sm font-medium bg-background z-20 sticky left-0 border-r h-[50px]">
                                </div>
                                )}
                            </React.Fragment>
                        )
                    })}

                    {/* Helper lines/grid background is done by map above */}
                </div>
            </div>
        </div>
    )
}
