"use client"

import * as React from "react"
import { addDays, format, startOfWeek, eachDayOfInterval, isSameDay } from "date-fns"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

// Mock Data Type
type Task = {
    id: string
    title: string
    startDate: Date
    endDate: Date
    color?: string
    assignee?: string
}

const mockTasks: Task[] = [
    {
        id: "1",
        title: "Design System Implementation",
        startDate: new Date(),
        endDate: addDays(new Date(), 5),
        color: "bg-blue-500",
    },
    {
        id: "2",
        title: "Database Migration",
        startDate: addDays(new Date(), 2),
        endDate: addDays(new Date(), 4),
        color: "bg-red-500",
    },
    {
        id: "3",
        title: "Frontend Development",
        startDate: addDays(new Date(), 5),
        endDate: addDays(new Date(), 10),
        color: "bg-green-500",
    },
]

export function TimelineView() {
    const [currentDate, setCurrentDate] = React.useState(new Date())
    const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 1 }) // Monday start
    const daysToShow = 14
    const days = eachDayOfInterval({
        start: startOfCurrentWeek,
        end: addDays(startOfCurrentWeek, daysToShow - 1),
    })

    // Calculate grid columns
    const dayWidth = 60 // px per day
    const headerHeight = 50
    const rowHeight = 48

    const handlePrev = () => setCurrentDate(addDays(currentDate, -7))
    const handleNext = () => setCurrentDate(addDays(currentDate, 7))

    return (
        <div className="flex flex-col h-full border rounded-lg bg-background overflow-hidden relative">
            {/* Controls */}
            <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold text-lg">Timeline</h3>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>Today</Button>
                    <div className="flex items-center rounded-md border">
                        <Button variant="ghost" size="icon" onClick={handlePrev}><ChevronLeft className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={handleNext}><ChevronRight className="h-4 w-4" /></Button>
                    </div>
                    <span className="text-sm font-medium w-32 text-center">
                        {format(currentDate, "MMMM yyyy")}
                    </span>
                </div>
            </div>

            {/* Gantt Area */}
            <div className="flex-1 overflow-auto relative">
                <div
                    className="grid relative"
                    style={{
                        gridTemplateColumns: `200px repeat(${daysToShow}, ${dayWidth}px)`,
                        minWidth: 200 + (daysToShow * dayWidth)
                    }}
                >
                    {/* Header Row */}
                    <div className="sticky top-0 z-10 bg-muted/90 backdrop-blur border-b flex items-center px-4 font-semibold text-sm h-[50px]">
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
                                    {task.title}
                                </div>
                                {days.map((_, dayIndex) => (
                                    <div key={dayIndex} className="border-b border-l h-[50px]" />
                                ))}

                                {/* Task Bar */}
                                {isVisible && (
                                    <div
                                        className={cn(
                                            "absolute h-8 rounded-md shadow-sm opacity-90 hover:opacity-100 cursor-pointer flex items-center px-2 text-xs text-white",
                                            task.color || "bg-primary"
                                        )}
                                        style={{
                                            top: 50 + (index * 50) + 6, // Header + (Row * Height) + Padding
                                            left: 200 + (Math.max(0, startDiff) * dayWidth),
                                            width: duration * dayWidth,
                                            zIndex: 5
                                        }}
                                    >
                                        {task.title}
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
