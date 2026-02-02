"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { SlidersHorizontal, Search, Settings2, X } from "lucide-react"

export interface Column<T> {
    id?: string
    header: string
    accessorKey?: keyof T
    cell?: (item: T) => React.ReactNode
    className?: string
    enableHiding?: boolean
    enableSorting?: boolean // Future proofing
}

interface DataTableProps<T> {
    data: T[]
    columns: Column<T>[]
    onRowClick?: (item: T) => void
    storageKey?: string
    searchKey?: keyof T // accesskey to search by
    searchPlaceholder?: string
}

export function DataTable<T extends { id: string | number }>({
    data,
    columns,
    onRowClick,
    storageKey = "data-table-settings",
    searchKey,
    searchPlaceholder = "Hledat..."
}: DataTableProps<T>) {
    // -- State --
    const [columnVisibility, setColumnVisibility] = React.useState<Record<string, boolean>>({})
    const [globalFilter, setGlobalFilter] = React.useState("")
    const [mounted, setMounted] = React.useState(false)

    // -- Persistence --
    React.useEffect(() => {
        setMounted(true)
        const stored = localStorage.getItem(storageKey)
        if (stored) {
            try {
                setColumnVisibility(JSON.parse(stored))
            } catch (e) {
                console.error("Failed to parse stored column visibility", e)
            }
        } else {
            // Default visibility: all true
            const initial: Record<string, boolean> = {}
            columns.forEach(col => {
                const key = col.id || col.accessorKey as string
                if (key) initial[key] = true
            })
            setColumnVisibility(initial)
        }
    }, [storageKey]) // Run once on mount (or key change)

    // Save on change
    React.useEffect(() => {
        if (!mounted) return
        localStorage.setItem(storageKey, JSON.stringify(columnVisibility))
    }, [columnVisibility, storageKey, mounted])

    // -- Logic --
    const visibleColumns = React.useMemo(() => {
        return columns.filter(col => {
            const key = col.id || col.accessorKey as string
            // If key is missing, always show. If key exists, check visibility map (default true if not found)
            if (!key) return true
            return columnVisibility[key] !== false
        })
    }, [columns, columnVisibility])

    const filteredData = React.useMemo(() => {
        if (!globalFilter) return data
        return data.filter(item => {
            // Simple robust search: check all visible columns or specific searchKey
            if (searchKey) {
                const val = item[searchKey]
                return String(val).toLowerCase().includes(globalFilter.toLowerCase())
            }
            // Search all searchable fields
            return Object.values(item).some(val =>
                String(val).toLowerCase().includes(globalFilter.toLowerCase())
            )
        })
    }, [data, globalFilter, searchKey])

    if (!mounted) return null // Avoid hydration mismatch for persisted state

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4 p-1">
                <div className="flex items-center gap-2 flex-1 max-w-sm relative">
                    <Search className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                        placeholder={searchPlaceholder}
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className="pl-9 bg-secondary/30 border-transparent focus:bg-background focus:border-input transition-all"
                    />
                    {globalFilter && (
                        <button
                            onClick={() => setGlobalFilter("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="hidden lg:flex gap-2">
                                <Settings2 className="w-4 h-4" />
                                Zobrazení
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[200px]">
                            <DropdownMenuLabel>Zobrazit sloupce</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {columns
                                .filter((col) => col.enableHiding !== false && (col.id || col.accessorKey))
                                .map((column) => {
                                    const key = (column.id || column.accessorKey) as string
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={key}
                                            checked={columnVisibility[key] !== false}
                                            onCheckedChange={(checked) => {
                                                setColumnVisibility((prev) => ({
                                                    ...prev,
                                                    [key]: checked,
                                                }))
                                            }}
                                        >
                                            <span className="truncate">{column.header}</span>
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Table */}
            <div className="glass-panel overflow-hidden p-0 border border-border/50 shadow-xl shadow-black/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-secondary/30">
                            <tr className="border-b border-border/50">
                                {visibleColumns.map((col, i) => (
                                    <th
                                        key={i}
                                        className={cn("h-12 px-4 font-semibold text-muted-foreground whitespace-nowrap", col.className)}
                                    >
                                        {col.header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="">
                            <AnimatePresence mode="popLayout">
                                {filteredData.length > 0 ? (
                                    filteredData.map((item, index) => (
                                        <motion.tr
                                            layout
                                            key={item.id}
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.98 }}
                                            transition={{ delay: index * 0.03, duration: 0.2 }}
                                            onClick={() => onRowClick?.(item)}
                                            className="group border-b border-border/10 last:border-0 hover:bg-muted/40 cursor-pointer transition-colors"
                                        >
                                            {visibleColumns.map((col, i) => (
                                                <td key={i} className={cn("p-4 align-middle", col.className)}>
                                                    {col.cell ? col.cell(item) : (item[col.accessorKey as keyof T] as React.ReactNode)}
                                                </td>
                                            ))}
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={visibleColumns.length} className="h-24 text-center">
                                            <div className="flex flex-col items-center justify-center text-muted-foreground gap-1">
                                                <Search className="w-5 h-5 opacity-50" />
                                                <span>Žádné výsledky</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
                <div className="px-4 py-2 border-t border-border/30 bg-secondary/10 text-xs text-muted-foreground flex justify-between">
                    <span>Celkem {filteredData.length} položek</span>
                    {filteredData.length !== data.length && (
                        <span>Filtrováno z {data.length}</span>
                    )}
                </div>
            </div>
        </div>
    )
}
