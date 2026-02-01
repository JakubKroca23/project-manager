"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"
import { addDays, startOfWeek } from "date-fns"

interface TimelineContextType {
    startDate: Date
    setStartDate: (date: Date) => void
    zoom: "day" | "week" | "month"
    setZoom: (zoom: "day" | "week" | "month") => void
    scrollX: number
    setScrollX: (x: number) => void
}

const TimelineContext = createContext<TimelineContextType | undefined>(undefined)

export function TimelineProvider({ children }: { children: ReactNode }) {
    // Start timeline from beginning of current week
    const [startDate, setStartDate] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))
    const [zoom, setZoom] = useState<"day" | "week" | "month">("day")
    const [scrollX, setScrollX] = useState(0)

    return (
        <TimelineContext.Provider value={{ startDate, setStartDate, zoom, setZoom, scrollX, setScrollX }}>
            {children}
        </TimelineContext.Provider>
    )
}

export function useTimeline() {
    const context = useContext(TimelineContext)
    if (!context) {
        throw new Error("useTimeline must be used within a TimelineProvider")
    }
    return context
}
