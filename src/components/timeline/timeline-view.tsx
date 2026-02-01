"use client"

import * as React from "react"
import { addDays, addMonths, addWeeks, format, startOfWeek, startOfMonth, startOfYear, endOfWeek, endOfMonth, endOfYear, eachDayOfInterval, eachMonthOfInterval, isSameDay, isSameMonth, subDays } from "date-fns"
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Calendar as CalendarIcon, MoveHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

type Task = {
    id: string
    title: string
    start_date: string | null
    due_date: string | null
    status: string
}

type ZoomLevel = 'week' | 'month' | 'year'

export function TimelineView({ tasks: initialTasks }: { tasks: any[] }) {
    const [tasks, setTasks] = React.useState(initialTasks)
    const [currentDate, setCurrentDate] = React.useState(new Date())
    const [zoomLevel, setZoomLevel] = React.useState<ZoomLevel>('month')
    const supabase = createClient()

    // Zoom configurations
    const config = {
        week: { colWidth: 100, headerFormat: "EEE d", intervalStr: "day", modifier: 7 },
        month: { colWidth: 40, headerFormat: "d", intervalStr: "day", modifier: 1 },
        year: { colWidth: 100, headerFormat: "MMM", intervalStr: "month", modifier: 12 }
    }

    const colWidth = config[zoomLevel].colWidth

    // Date Calculations
    const startDate = React.useMemo(() => {
        if (zoomLevel === 'week') return startOfWeek(currentDate, { weekStartsOn: 1 })
        if (zoomLevel === 'year') return startOfYear(currentDate)
        return startOfMonth(currentDate)
    }, [currentDate, zoomLevel])

    const endDate = React.useMemo(() => {
        if (zoomLevel === 'week') return endOfWeek(currentDate, { weekStartsOn: 1 })
        if (zoomLevel === 'year') return endOfYear(currentDate)
        return endOfMonth(currentDate)
    }, [currentDate, zoomLevel])

    const columns = React.useMemo(() => {
        if (zoomLevel === 'year') {
            return eachMonthOfInterval({ start: startDate, end: endDate })
        }
        return eachDayOfInterval({ start: startDate, end: endDate })
    }, [startDate, endDate, zoomLevel])

    // Handlers
    const handlePrev = () => {
        if (zoomLevel === 'week') setCurrentDate(subDays(currentDate, 7))
        if (zoomLevel === 'month') setCurrentDate(addMonths(currentDate, -1))
        if (zoomLevel === 'year') setCurrentDate(addMonths(currentDate, -12))
    }

    const handleNext = () => {
        if (zoomLevel === 'week') setCurrentDate(addDays(currentDate, 7))
        if (zoomLevel === 'month') setCurrentDate(addMonths(currentDate, 1))
        if (zoomLevel === 'year') setCurrentDate(addMonths(currentDate, 12))
    }

    // Drag Logic
    const [draggingId, setDraggingId] = React.useState<string | null>(null)
    const [dragStartX, setDragStartX] = React.useState<number>(0)
    const [dragOriginalStart, setDragOriginalStart] = React.useState<Date | null>(null)

    const handleMouseDown = (e: React.MouseEvent, task: Task) => {
        e.stopPropagation() // Prevent other clicks
        setDraggingId(task.id)
        setDragStartX(e.clientX)
        setDragOriginalStart(task.start_date ? new Date(task.start_date) : new Date())
    }

    // Global Mouse Move for dragging
    React.useEffect(() => {
        if (!draggingId) return

        const handleMouseMove = (e: MouseEvent) => {
            // Visual update logic or just update state on MouseUp to save DB writes
            // For smoothness, we might want local state update, let's stick to update on release for MVP stability
        }

        const handleMouseUp = async (e: MouseEvent) => {
            if (!draggingId || !dragOriginalStart) return

            const diffX = e.clientX - dragStartX
            // Calculate day difference based on zoom (simplifying to days for now)
            // Ideally should depend on column width
            const daysDiff = Math.round(diffX / colWidth)

            if (daysDiff !== 0) {
                // Determine scale (days or months)
                const newStart = zoomLevel === 'year'
                    ? addMonths(dragOriginalStart, daysDiff) // in year view, col is month
                    : addDays(dragOriginalStart, daysDiff)

                // Optimistic Update
                const task = tasks.find(t => t.id === draggingId)
                if (task) {
                    const duration = task.due_date
                        ? (new Date(task.due_date).getTime() - new Date(task.start_date!).getTime())
                        : (24 * 60 * 60 * 1000)

                    const newEnd = new Date(newStart.getTime() + duration)

                    const updatedTasks = tasks.map(t =>
                        t.id === draggingId
                            ? { ...t, start_date: newStart.toISOString(), due_date: newEnd.toISOString() }
                            : t
                    )
                    setTasks(updatedTasks)

                    toast.success(`Rescheduled to ${format(newStart, 'MMM d')}`)

                    // DB Update
                    const { error } = await supabase.from('tasks').update({
                        start_date: newStart.toISOString(),
                        due_date: newEnd.toISOString()
                    }).eq('id', draggingId)

                    if (error) toast.error("Failed to save changes")
                }
            }

            setDraggingId(null)
            setDragOriginalStart(null)
        }

        window.addEventListener('mouseup', handleMouseUp)
        return () => {
            window.removeEventListener('mouseup', handleMouseUp)
        }
    }, [draggingId, dragStartX, dragOriginalStart, tasks, colWidth, zoomLevel, supabase])


    return (
        <div className="flex flex-col h-full overflow-hidden select-none">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-primary" />
                        {zoomLevel === 'year'
                            ? format(currentDate, "yyyy")
                            : format(currentDate, "MMMM yyyy")}
                    </h3>
                    <div className="flex items-center border rounded-md bg-background ml-4">
                        <Button variant="ghost" size="icon" onClick={handlePrev} className="h-8 w-8 rounded-none border-r">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date())} className="h-8 rounded-none text-xs font-medium">
                            Today
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleNext} className="h-8 w-8 rounded-none border-l">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="text-sm text-muted-foreground mr-2 hidden md:block">Zoom:</div>
                    <Select value={zoomLevel} onValueChange={(v: any) => setZoomLevel(v)}>
                        <SelectTrigger className="w-[120px] h-8">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="week">Week</SelectItem>
                            <SelectItem value="month">Month</SelectItem>
                            <SelectItem value="year">Year</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Timeline Grid */}
            <div className="flex-1 overflow-auto border rounded-xl shadow-sm bg-card relative">
                {/* Header */}
                <div className="flex sticky top-0 z-30 bg-muted/50 backdrop-blur-sm border-b">
                    <div className="min-w-[200px] w-[200px] p-3 text-sm font-semibold border-r sticky left-0 bg-background z-20 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                        Task Name
                    </div>
                    {columns.map((col, i) => (
                        <div
                            key={i}
                            className={cn(
                                "flex-shrink-0 border-r flex flex-col justify-center items-center text-xs p-1 h-[50px] transition-colors",
                                isSameDay(col, new Date()) && zoomLevel !== 'year' && "bg-primary/10 text-primary font-bold"
                            )}
                            style={{ width: colWidth }}
                        >
                            <span className="opacity-70">{format(col, zoomLevel === 'year' ? "MMM" : "EEE")}</span>
                            {zoomLevel !== 'year' && <span>{format(col, "d")}</span>}
                        </div>
                    ))}
                </div>

                {/* Body */}
                <div className="relative">
                    {tasks && tasks.length > 0 ? tasks.map((task) => {
                        const taskStart = task.start_date ? new Date(task.start_date) : new Date()
                        const taskEnd = task.due_date ? new Date(task.due_date) : addDays(taskStart, 1) // Default duration 1 day

                        let startDiff = 0
                        let durationUnits = 0

                        if (zoomLevel === 'year') {
                            // Difference in months
                            const startMonth = startOfYear(currentDate)
                            startDiff = (taskStart.getFullYear() - startMonth.getFullYear()) * 12 + (taskStart.getMonth() - startMonth.getMonth())
                            // Approximation for duration in months
                            durationUnits = Math.max(1, (taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24 * 30))
                        } else {
                            // Difference in days
                            startDiff = (taskStart.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
                            durationUnits = Math.max(1, (taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24))
                        }

                        const isVisible = (startDiff + durationUnits) > 0 && startDiff < columns.length

                        return (
                            <div key={task.id} className="flex border-b relative hover:bg-muted/30 transition-colors group">
                                <div className="min-w-[200px] w-[200px] p-3 text-sm font-medium border-r sticky left-0 bg-background z-10 truncate h-[50px] flex items-center shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                                    <div className="truncate">{task.title}</div>
                                </div>

                                {/* Grid lines background */}
                                {columns.map((_, i) => (
                                    <div key={i} className="flex-shrink-0 border-r h-[50px]" style={{ width: colWidth }} />
                                ))}

                                {/* The Bar */}
                                {isVisible && (
                                    <div
                                        onMouseDown={(e) => handleMouseDown(e, task)}
                                        className={cn(
                                            "absolute h-7 rounded-sm shadow-sm cursor-grab active:cursor-grabbing flex items-center px-2 text-xs text-white truncate z-10 hover:brightness-110 transition-all",
                                            draggingId === task.id ? "ring-2 ring-primary ring-offset-2 opacity-80" : "opacity-90",
                                            getStatusColor(task.status)
                                        )}
                                        style={{
                                            top: "11px",
                                            left: `${200 + (Math.max(0, startDiff) * colWidth)}px`,
                                            width: `${Math.min(durationUnits, columns.length - Math.max(0, startDiff)) * colWidth}px`,
                                        }}
                                    >
                                        <MoveHorizontal className="h-3 w-3 mr-1 opacity-50" />
                                        {task.title}
                                    </div>
                                )}
                            </div>
                        )
                    }) : (
                        <div className="p-8 text-center text-muted-foreground">
                            No tasks found. Create one to get started!
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function getStatusColor(status: string) {
    switch (status) {
        case 'done': return 'bg-emerald-600'
        case 'in_progress': return 'bg-blue-600'
        case 'review': return 'bg-amber-600'
        default: return 'bg-slate-500'
    }
}
