"use client"

import { useState, useEffect } from "react"
import { motion, useDragControls } from "framer-motion"
import { differenceInDays, addDays } from "date-fns"
import { useRouter } from "next/navigation"

interface TimelineBarProps {
    item: any // Typed in context but keeping flexible for now
    startDate: Date
    pixelsPerDay: number
    onUpdate: (id: string, newStart: string, newEnd: string) => void
    height: number
    top: number
}

export function TimelineBar({ item, startDate, pixelsPerDay, onUpdate, height, top }: TimelineBarProps) {
    const router = useRouter()
    const controls = useDragControls()

    // Derived state
    const start = new Date(item.start_date)
    const end = new Date(item.end_date)
    const offsetDays = differenceInDays(start, startDate)
    const durationDays = differenceInDays(end, start) + 1

    // Position
    const initialLeft = offsetDays * pixelsPerDay
    const initialWidth = Math.max(durationDays * pixelsPerDay, 4)

    // Local state for smooth interaction without re-rendering parent
    const [left, setLeft] = useState(initialLeft)
    const [width, setWidth] = useState(initialWidth)
    const [isResizing, setIsResizing] = useState(false)

    // Sync when props change (e.g. zoom)
    useEffect(() => {
        setLeft(offsetDays * pixelsPerDay)
        setWidth(Math.max(durationDays * pixelsPerDay, 4))
    }, [offsetDays, durationDays, pixelsPerDay])

    const color = item.type === 'project' ? 'bg-blue-600'
        : item.type === 'service' ? 'bg-purple-600'
            : 'bg-orange-500'

    // Handlers
    const handleDragStart = (e: React.PointerEvent) => {
        if (isResizing) return
        e.preventDefault()

        const startX = e.clientX
        const startLeft = left

        const onPointerMove = (e: PointerEvent) => {
            const deltaX = e.clientX - startX
            // Snap to grid
            const daysDelta = Math.round(deltaX / pixelsPerDay)
            setLeft(startLeft + (daysDelta * pixelsPerDay))
        }

        const onPointerUp = (e: PointerEvent) => {
            window.removeEventListener('pointermove', onPointerMove)
            window.removeEventListener('pointerup', onPointerUp)

            const totalDeltaX = e.clientX - startX
            const daysDelta = Math.round(totalDeltaX / pixelsPerDay)

            if (daysDelta === 0) {
                setLeft(startLeft)
                return
            }

            // Force visual snap
            setLeft(startLeft + (daysDelta * pixelsPerDay))

            const newStart = addDays(start, daysDelta).toISOString()
            const newEnd = addDays(end, daysDelta).toISOString()

            onUpdate(item.id, newStart, newEnd)
        }

        window.addEventListener('pointermove', onPointerMove)
        window.addEventListener('pointerup', onPointerUp)
    }

    const handleResizeStart = (e: React.PointerEvent, direction: 'left' | 'right') => {
        e.stopPropagation()
        e.preventDefault()
        setIsResizing(true)

        const startX = e.clientX
        const startLeft = left
        const startWidth = width

        const startDayOffset = Math.round(startLeft / pixelsPerDay)
        const startDuration = Math.round(startWidth / pixelsPerDay)

        const onPointerMove = (e: PointerEvent) => {
            const deltaX = e.clientX - startX
            const daysDelta = Math.round(deltaX / pixelsPerDay)

            if (direction === 'right') {
                const newDuration = Math.max(1, startDuration + daysDelta)
                setWidth(newDuration * pixelsPerDay)
            } else {
                const maxLeftDrag = startDuration - 1
                const validDaysDelta = Math.min(daysDelta, maxLeftDrag)

                setLeft((startDayOffset + validDaysDelta) * pixelsPerDay)
                setWidth((startDuration - validDaysDelta) * pixelsPerDay)
            }
        }

        const onPointerUp = (e: PointerEvent) => {
            setIsResizing(false)
            window.removeEventListener('pointermove', onPointerMove)
            window.removeEventListener('pointerup', onPointerUp)

            const deltaX = e.clientX - startX
            const daysDelta = Math.round(deltaX / pixelsPerDay)

            let finalStartDays = startDayOffset
            let finalDurationDays = startDuration

            if (direction === 'right') {
                finalDurationDays = Math.max(1, startDuration + daysDelta)
            } else {
                const maxLeftDrag = startDuration - 1
                const validDaysDelta = Math.min(daysDelta, maxLeftDrag)

                finalStartDays = startDayOffset + validDaysDelta
                finalDurationDays = startDuration - validDaysDelta
            }

            const finalStart = addDays(startDate, finalStartDays)
            const finalEnd = addDays(finalStart, Math.max(finalDurationDays - 1, 0))

            onUpdate(item.id, finalStart.toISOString(), finalEnd.toISOString())
        }

        window.addEventListener('pointermove', onPointerMove)
        window.addEventListener('pointerup', onPointerUp)
    }

    return (
        <div
            className="absolute border-b border-border/5 hover:bg-white/5 transition-colors group"
            style={{ height, top }}
        >
            <motion.div
                onPointerDown={handleDragStart}
                className={`absolute h-8 top-1 shadow-sm ${color} cursor-grab active:cursor-grabbing border border-primary/20 bg-opacity-90 hover:bg-opacity-100 transition-colors z-10 flex items-center select-none`}
                style={{
                    left,
                    width,
                    minWidth: 4,
                    borderRadius: 0 // Square corners
                }}
            >
                {/* Left Resize Handle */}
                <div
                    className="w-2 h-full absolute left-0 top-0 cursor-w-resize hover:bg-white/20 z-20"
                    onPointerDown={(e) => handleResizeStart(e, 'left')}
                />

                {/* Content */}
                {width > 30 && (
                    <span className="px-3 text-[10px] text-white font-medium truncate pointer-events-none drop-shadow-md">
                        {item.title}
                    </span>
                )}

                {/* Right Resize Handle */}
                <div
                    className="w-2 h-full absolute right-0 top-0 cursor-e-resize hover:bg-white/20 z-20"
                    onPointerDown={(e) => handleResizeStart(e, 'right')}
                />
            </motion.div>
        </div>
    )
}
