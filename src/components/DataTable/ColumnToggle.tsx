'use client';

import { Table } from '@tanstack/react-table';
import { Settings2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface ColumnToggleProps<TData> {
    table: Table<TData>;
}

export function ColumnToggle<TData>({
    table,
}: ColumnToggleProps<TData>) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [ref]);

    return (
        <div className="relative inline-block text-left" ref={ref}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/30 rounded-lg text-[10px] font-medium uppercase tracking-wider transition-all active:scale-[0.97]"
            >
                <Settings2 size={12} />
                <span>Sloupce</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 origin-top-right bg-popover border border-border rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="p-2 space-y-1 max-h-60 overflow-y-auto">
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase">
                            Viditelnost sloupců
                        </div>
                        <div className="flex px-2 pb-2 gap-2 border-b border-border/50 mb-1">
                            <button
                                onClick={() => table.toggleAllColumnsVisible(true)}
                                className="text-[10px] bg-primary/10 text-primary hover:bg-primary/20 px-2 py-1 rounded font-bold uppercase tracking-wider flex-1"
                            >
                                Vše
                            </button>
                            <button
                                onClick={() => table.toggleAllColumnsVisible(false)}
                                className="text-[10px] bg-muted text-muted-foreground hover:bg-muted/80 px-2 py-1 rounded font-bold uppercase tracking-wider flex-1"
                            >
                                Žádné
                            </button>
                        </div>
                        {table
                            .getAllColumns()
                            .filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide())
                            .map((column) => {
                                return (
                                    <label
                                        key={column.id}
                                        className="flex items-center px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={column.getIsVisible()}
                                            onChange={(e) => column.toggleVisibility(!!e.target.checked)}
                                            className="mr-2 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <span className="capitalize text-popover-foreground">
                                            {/* Try to get header title or fallback to ID */}
                                            {/* @ts-ignore */}
                                            {column.columnDef.header as string || column.id}
                                        </span>
                                    </label>
                                );
                            })}
                    </div>
                </div>
            )}
        </div>
    );
}
