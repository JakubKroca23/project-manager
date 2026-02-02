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
    const handleDragEnd = (_: any, info: any) => {
        const movePixels = info.offset.x
        const daysDelta = Math.round(movePixels / pixelsPerDay)
        if (daysDelta === 0) return

        const newStart = addDays(start, daysDelta).toISOString()
        const newEnd = addDays(end, daysDelta).toISOString()

        onUpdate(item.id, newStart, newEnd)
    }

    const handleResizeStart = (e: React.PointerEvent, direction: 'left' | 'right') => {
        e.stopPropagation()
        e.preventDefault()
        setIsResizing(true)

        const startX = e.clientX
        const startLeft = left
        const startWidth = width

        const onPointerMove = (e: PointerEvent) => {
            const deltaX = e.clientX - startX

            if (direction === 'right') {
                const newWidth = Math.max(startWidth + deltaX, pixelsPerDay) // Min 1 day
                setWidth(newWidth)
            } else {
                const newWidth = Math.max(startWidth - deltaX, pixelsPerDay)
                const newLeft = startLeft + deltaX
                if (newWidth > pixelsPerDay) {
                    setLeft(newLeft)
                    setWidth(newWidth)
                }
            }
        }

        const onPointerUp = () => {
            setIsResizing(false)
            window.removeEventListener('pointermove', onPointerMove)
            window.removeEventListener('pointerup', onPointerUp)

            // Calculate final dates
            // Delta from initial state
            const finalLeftDelta = left - initialLeft
            const startDeltaDays = Math.round(finalLeftDelta / pixelsPerDay)

            const finalWidthDelta = width - initialWidth
            const durationDeltaDays = Math.round(finalWidthDelta / pixelsPerDay)

            // New Dates
            // Left resize: start changes, end stays same (mostly)
            // Right resize: start stays same, end changes

            let newStart = start
            let newEnd = end

            if (direction === 'left') {
                newStart = addDays(start, startDeltaDays)
                // End date should ideally stay same if we just moved start? 
                // logic: newWidth = oldWidth - deltaX
                // Duration changed.
            }

            // Simpler Logic: 
            // Calculate new Start based on new Left
            // Calculate new End based on new Left + new Width

            const newStartDays = Math.round(left / pixelsPerDay)
            const newDurationDays = Math.round(width / pixelsPerDay)

            const finalStart = addDays(startDate, newStartDays)
            const finalEnd = addDays(finalStart, Math.max(newDurationDays - 1, 0)) // duration 1 day = start==end

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
                drag={isResizing ? false : "x"} // Disable drag when resizing
                dragMomentum={false}
                dragElastic={0}
                dragControls={controls}
                dragListener={!isResizing}
                onDragEnd={handleDragEnd}
                whileDrag={{ cursor: "grabbing", zIndex: 50, opacity: 0.9 }}
                animate={{ x: 0 }} // Reset transform after drag
                className={`absolute h-8 top-1 shadow-sm ${color} cursor-grab active:cursor-grabbing border border-primary/20 bg-opacity-90 hover:bg-opacity-100 transition-colors z-10 flex items-center select-none`}
                style={{
                    left,
                    width,
                    minWidth: 4,
                    borderRadius: 0 // Square corners
                }}
                onClick={() => {
                    if (!isResizing && item.type === 'project') {
                        router.push(`/projects/${item.id}`)
                    }
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
