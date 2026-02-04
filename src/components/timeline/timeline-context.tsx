"use client"

import React, { createContext, useContext, useState, useMemo, ReactNode, useCallback } from "react"
import { addDays, startOfWeek, differenceInDays, startOfYear } from "date-fns"

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
    updateItemDates: (id: string, newStart: string, newEnd: string) => void
    // State
    startDate: Date
    setStartDate: (date: Date) => void
    pixelsPerDay: number
    setPixelsPerDay: (px: number) => void
    headerHeight: number
    // Grouping & Expansion
    expandedIds: Set<string>
    toggleExpand: (id: string) => void
    visibleItems: TimelineItemType[] // Flattened tree with expanded items only
    isFullscreen: boolean
    setIsFullscreen: (val: boolean) => void
}

const TimelineContext = createContext<TimelineContextType | undefined>(undefined)

export function TimelineProvider({ children, items: initialItems }: { children: ReactNode, items: any[] }) {
    const [items, setItems] = useState<TimelineItemType[]>(initialItems)

    // Update local state optimistic logic
    const updateItemDates = useCallback((id: string, newStart: string, newEnd: string) => {
        setItems(prev => prev.map(item =>
            item.id === id
                ? { ...item, start_date: newStart, end_date: newEnd }
                : item
        ))
    }, [])

    // Ensure state syncs if props change (revalidation)
    React.useEffect(() => {
        setItems(initialItems)
    }, [initialItems])

    // Start from beginning of year to show past
    const [startDate, setStartDate] = useState(startOfYear(new Date()))
    const [pixelsPerDay, setPixelsPerDay] = useState(40) // Default zoom
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
    const [isFullscreen, setIsFullscreen] = useState(false)

    const toggleExpand = useCallback((id: string) => {
        setExpandedIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }, [])

    // Process items into a structured list based on expansion
    const visibleItems = useMemo(() => {
        // 1. Separate parents and children
        const parents = items.filter(i => !i.parent_id)
        const childrenMap = new Map<string, TimelineItemType[]>()

        items.filter(i => i.parent_id).forEach(child => {
            const pid = child.parent_id!
            if (!childrenMap.has(pid)) childrenMap.set(pid, [])
            childrenMap.get(pid)!.push(child)
        })

        // 2. Build flat list respecting collapse state
        const result: TimelineItemType[] = []

        parents.forEach(parent => {
            result.push(parent)
            // If expanded and has children, add them immediately after
            if (expandedIds.has(parent.id) && childrenMap.has(parent.id)) {
                result.push(...childrenMap.get(parent.id)!)
            }
        })

        return result
    }, [items, expandedIds])

    // Calculate dynamic header height based on zoom
    const showMonths = true
    const showWeeks = pixelsPerDay >= 2
    const showDays = pixelsPerDay >= 10
    const headerHeight = (showMonths ? 25 : 0) + (showWeeks ? 25 : 0) + (showDays ? 25 : 0)

    return (
        <TimelineContext.Provider value={{
            items,
            updateItemDates,
            startDate, setStartDate,
            pixelsPerDay, setPixelsPerDay,
            expandedIds, toggleExpand,
            visibleItems,
            headerHeight, // Exposed
            isFullscreen, setIsFullscreen
        }}>
            {children}
        </TimelineContext.Provider >
    )
}

export function useTimeline() {
    const context = useContext(TimelineContext)
    if (!context) throw new Error("useTimeline must be used within a TimelineProvider")
    return context
}
