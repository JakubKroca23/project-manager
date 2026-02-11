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

    // Calculate column groups
    const allColumns = table.getAllColumns();

    const basicColumns = allColumns.filter(
        (column) => typeof column.accessorFn !== "undefined" && column.getCanHide() && !column.id.startsWith('custom_')
    );

    const customColumns = allColumns.filter(
        (column) => typeof column.accessorFn !== "undefined" && column.getCanHide() && column.id.startsWith('custom_')
    );

    return (
        <div className="relative inline-block text-left" ref={ref}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 hover:text-blue-700 border border-blue-500/20 rounded-lg text-[10px] font-medium uppercase tracking-wider transition-all active:scale-[0.97]"
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

                        {/* Global Toggles */}
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

                        {/* Basic Columns Group */}
                        {basicColumns.length > 0 && (
                            <>
                                <div className="flex items-center justify-between px-2 py-1.5 bg-muted/20">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                        Základní
                                    </span>
                                    <input
                                        type="checkbox"
                                        className="h-3.5 w-3.5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                        checked={basicColumns.every(c => c.getIsVisible())}
                                        ref={input => {
                                            if (input) {
                                                const all = basicColumns.every(c => c.getIsVisible());
                                                const some = basicColumns.some(c => c.getIsVisible());
                                                input.indeterminate = !all && some;
                                            }
                                        }}
                                        onChange={(e) => {
                                            const checked = e.target.checked;
                                            const currentVisibility = table.getState().columnVisibility;
                                            const newVisibility = { ...currentVisibility };
                                            basicColumns.forEach(c => {
                                                newVisibility[c.id] = checked;
                                            });
                                            table.setColumnVisibility(newVisibility);
                                        }}
                                    />
                                </div>
                                {basicColumns.map((column) => (
                                    <label
                                        key={column.id}
                                        className="flex items-center px-2 py-1.5 text-xs cursor-pointer hover:bg-accent rounded-sm pl-4"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={column.getIsVisible()}
                                            onChange={(e) => column.toggleVisibility(!!e.target.checked)}
                                            className="mr-2 h-3.5 w-3.5 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <span className="capitalize text-popover-foreground">
                                            {typeof column.columnDef.header === 'string'
                                                ? column.columnDef.header
                                                : column.id}
                                        </span>
                                    </label>
                                ))}
                            </>
                        )}

                        {/* Additional Columns Group */}
                        {customColumns.length > 0 && (
                            <>
                                <div className="flex items-center justify-between px-2 py-1.5 mt-2 bg-muted/20 border-t border-border/50">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                        Dodatečné
                                    </span>
                                    <input
                                        type="checkbox"
                                        className="h-3.5 w-3.5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                        checked={customColumns.every(c => c.getIsVisible())}
                                        ref={input => {
                                            if (input) {
                                                const all = customColumns.every(c => c.getIsVisible());
                                                const some = customColumns.some(c => c.getIsVisible());
                                                input.indeterminate = !all && some;
                                            }
                                        }}
                                        onChange={(e) => {
                                            const checked = e.target.checked;
                                            const currentVisibility = table.getState().columnVisibility;
                                            const newVisibility = { ...currentVisibility };
                                            customColumns.forEach(c => {
                                                newVisibility[c.id] = checked;
                                            });
                                            table.setColumnVisibility(newVisibility);
                                        }}
                                    />
                                </div>
                                {customColumns.map((column) => (
                                    <label
                                        key={column.id}
                                        className="flex items-center px-2 py-1.5 text-xs cursor-pointer hover:bg-accent rounded-sm pl-4"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={column.getIsVisible()}
                                            onChange={(e) => column.toggleVisibility(!!e.target.checked)}
                                            className="mr-2 h-3.5 w-3.5 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <span className="capitalize text-popover-foreground truncate" title={column.id}>
                                            {typeof column.columnDef.header === 'string'
                                                ? column.columnDef.header
                                                : column.id.replace('custom_', '')}
                                        </span>
                                    </label>
                                ))}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
