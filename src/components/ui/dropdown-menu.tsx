"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface DropdownMenuContextType {
    isOpen: boolean
    setIsOpen: (open: boolean) => void
    close: () => void
}

const DropdownMenuContext = React.createContext<DropdownMenuContextType | undefined>(undefined)

export function DropdownMenu({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = React.useState(false)
    const containerRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return (
        <DropdownMenuContext.Provider value={{ isOpen, setIsOpen, close: () => setIsOpen(false) }}>
            <div ref={containerRef} className="relative inline-block text-left">
                {children}
            </div>
        </DropdownMenuContext.Provider>
    )
}

export function DropdownMenuTrigger({ children, asChild, className }: { children: React.ReactNode, asChild?: boolean, className?: string }) {
    const context = React.useContext(DropdownMenuContext)
    if (!context) throw new Error("DropdownMenuTrigger must be used within DropdownMenu")

    return (
        <div onClick={() => context.setIsOpen(!context.isOpen)} className={cn("cursor-pointer", className)}>
            {children}
        </div>
    )
}

export function DropdownMenuContent({ children, className, align = "end" }: { children: React.ReactNode, className?: string, align?: "start" | "end" }) {
    const context = React.useContext(DropdownMenuContext)
    if (!context) throw new Error("DropdownMenuContent must be used within DropdownMenu")

    return (
        <AnimatePresence>
            {context.isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className={cn(
                        "absolute z-50 mt-2 min-w-[8rem] overflow-hidden rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-lg shadow-black/5 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
                        align === "end" ? "right-0" : "left-0",
                        className
                    )}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export function DropdownMenuItem({ children, onClick, className }: { children: React.ReactNode, onClick?: () => void, className?: string }) {
    const context = React.useContext(DropdownMenuContext)
    return (
        <div
            onClick={(e) => {
                onClick?.()
                context?.close()
                e.stopPropagation()
            }}
            className={cn(
                "relative flex cursor-default select-none items-center rounded-lg px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 cursor-pointer",
                className
            )}
        >
            {children}
        </div>
    )
}

export function DropdownMenuLabel({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={cn("px-2 py-1.5 text-xs font-semibold uppercase text-muted-foreground", className)}>
            {children}
        </div>
    )
}

export function DropdownMenuSeparator({ className }: { className?: string }) {
    return <div className={cn("-mx-1 my-1 h-px bg-muted", className)} />
}

export function DropdownMenuCheckboxItem({
    children,
    checked,
    onCheckedChange,
    className
}: {
    children: React.ReactNode
    checked?: boolean
    onCheckedChange?: (checked: boolean) => void
    className?: string
}) {
    // Note: We don't close on checkbox click to allow multiple selections
    return (
        <div
            onClick={(e) => {
                e.stopPropagation()
                onCheckedChange?.(!checked)
            }}
            className={cn(
                "relative flex cursor-default select-none items-center rounded-lg py-1.5 pl-8 pr-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 cursor-pointer",
                className
            )}
        >
            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                {checked && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <Check className="h-4 w-4 text-primary" />
                    </motion.div>
                )}
            </span>
            {children}
        </div>
    )
}
