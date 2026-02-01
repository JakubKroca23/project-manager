"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface Column<T> {
    header: string
    accessorKey?: keyof T
    cell?: (item: T) => React.ReactNode
    className?: string
}

interface DataTableProps<T> {
    data: T[]
    columns: Column<T>[]
    onRowClick?: (item: T) => void
}

export function DataTable<T extends { id: string | number }>({ data, columns, onRowClick }: DataTableProps<T>) {
    return (
        <div className="glass-panel overflow-hidden p-0">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-border/50">
                            {columns.map((col, i) => (
                                <th
                                    key={i}
                                    className={cn("h-12 px-4 font-medium text-muted-foreground", col.className)}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="">
                        {data.map((item, index) => (
                            <motion.tr
                                key={item.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => onRowClick?.(item)}
                                className="group border-b border-border/10 last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
                            >
                                {columns.map((col, i) => (
                                    <td key={i} className={cn("p-4 align-middle", col.className)}>
                                        {col.cell ? col.cell(item) : (item[col.accessorKey as keyof T] as React.ReactNode)}
                                    </td>
                                ))}
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
