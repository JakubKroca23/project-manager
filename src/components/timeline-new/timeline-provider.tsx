"use client"

import React, { createContext, useContext, useState, useMemo, ReactNode, useCallback } from "react"
import { startOfYear, addDays, differenceInDays } from "date-fns"

export type TimelineItemType = {
    id: string
    title: string
    type: 'project' | 'production' | 'service'
    status: string
    start_date: string
    end_date: string
    parent_id: string | null
    owner_id: string | null
}

interface TimelineContextType {
    items: TimelineItemType[]
    // State
    startDate: Date
    setStartDate: (date: Date) => void
    pixelsPerDay: number
    setPixelsPerDay: (px: number) => void
    // Grouping & Expansion
    expandedIds: Set<string>
    toggleExpand: (id: string) => void
    visibleItems: TimelineItemType[]
}

const TimelineContext = createContext<TimelineContextType | undefined>(undefined)

export function TimelineProvider({ children, items }: { children: ReactNode, items: TimelineItemType[] }) {
    const [startDate, setStartDate] = useState(startOfYear(new Date()))
    const [pixelsPerDay, setPixelsPerDay] = useState(40)
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

    const toggleExpand = useCallback((id: string) => {
        setExpandedIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }, [])

    const visibleItems = useMemo(() => {
        const parents = items.filter(i => !i.parent_id)
        const childrenMap = new Map<string, TimelineItemType[]>()

        items.filter(i => i.parent_id).forEach(child => {
            const pid = child.parent_id!
            if (!childrenMap.has(pid)) childrenMap.set(pid, [])
            childrenMap.get(pid)!.push(child)
        })

        const result: TimelineItemType[] = []

        parents.forEach(parent => {
            result.push(parent)
            if (expandedIds.has(parent.id) && childrenMap.has(parent.id)) {
                result.push(...childrenMap.get(parent.id)!)
            }
        })

        return result
    }, [items, expandedIds])

    return (
        <TimelineContext.Provider value={{
            items,
            startDate, setStartDate,
            pixelsPerDay, setPixelsPerDay,
            expandedIds, toggleExpand,
            visibleItems
        }}>
            {children}
        </TimelineContext.Provider>
    )
}

export function useTimeline() {
    const context = useContext(TimelineContext)
    if (!context) throw new Error("useTimeline must be used within a TimelineProvider")
    return context
}
