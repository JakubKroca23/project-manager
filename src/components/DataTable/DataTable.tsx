'use client';

import React, { useCallback, useMemo, useRef } from 'react';
import {
    ColumnDef,
    ColumnOrderState,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    useReactTable,
    SortingState,
    ColumnFiltersState,
    VisibilityState,
    ColumnSizingState,
} from '@tanstack/react-table';
import { ArrowUpDown, Search, Maximize2, RefreshCcw } from 'lucide-react';
import { ColumnToggle } from './ColumnToggle';

// dnd-kit
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    horizontalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';

// --- Draggable Header Cell ---
function DraggableHeader({ header, children, isSorted }: { header: any; children: React.ReactNode; isSorted: boolean }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: header.id });

    const style: React.CSSProperties = {
        width: header.getSize(),
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 20 : undefined,
        position: 'relative',
    };

    return (
        <th
            ref={setNodeRef}
            style={style}
            className={`px-2 py-1.5 text-left align-middle font-semibold relative group uppercase tracking-wider text-[10px] border-r border-border last:border-r-0 ${isDragging ? 'bg-primary/10' : ''} ${isSorted ? 'text-primary bg-primary/5' : 'text-muted-foreground'}`}
            {...attributes}
            {...listeners}
        >
            {children}
        </th>
    );
}

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    toolbar?: React.ReactNode;
    leftToolbar?: React.ReactNode;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    // Settings props
    columnOrder?: ColumnOrderState;
    onColumnOrderChange?: (order: ColumnOrderState) => void;
    columnVisibility?: VisibilityState;
    onColumnVisibilityChange?: (visibility: VisibilityState) => void;
    sorting?: SortingState;
    onSortingChange?: (sorting: SortingState) => void;
    columnSizing?: ColumnSizingState;
    onColumnSizingChange?: (sizing: ColumnSizingState) => void;
    onRowClick?: (row: TData) => void;
    headerClassName?: string;
    toolbarSubtext?: React.ReactNode;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    toolbar,
    leftToolbar,
    searchValue,
    onSearchChange,
    columnOrder: externalColumnOrder,
    onColumnOrderChange,
    columnVisibility: externalColumnVisibility,
    onColumnVisibilityChange,
    sorting: externalSorting,
    onSortingChange,
    columnSizing: externalColumnSizing,
    onColumnSizingChange,
    onRowClick,
    headerClassName,
    toolbarSubtext,
}: DataTableProps<TData, TValue>) {
    const [internalSorting, setInternalSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [internalColumnVisibility, setInternalColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [internalColumnOrder, setInternalColumnOrder] = React.useState<ColumnOrderState>([]);
    const [internalColumnSizing, setInternalColumnSizing] = React.useState<ColumnSizingState>({});

    // Use external state if provided, otherwise internal
    const sorting = externalSorting ?? internalSorting;
    const columnVisibility = externalColumnVisibility ?? internalColumnVisibility;
    const columnOrder = externalColumnOrder ?? internalColumnOrder;
    const columnSizing = externalColumnSizing ?? internalColumnSizing;

    const handleSortingChange = useCallback((updaterOrValue: SortingState | ((prev: SortingState) => SortingState)) => {
        const newValue = typeof updaterOrValue === 'function' ? updaterOrValue(sorting) : updaterOrValue;
        if (onSortingChange) {
            onSortingChange(newValue);
        } else {
            setInternalSorting(newValue);
        }
    }, [sorting, onSortingChange]);

    const handleVisibilityChange = useCallback((updaterOrValue: VisibilityState | ((prev: VisibilityState) => VisibilityState)) => {
        const newValue = typeof updaterOrValue === 'function' ? updaterOrValue(columnVisibility) : updaterOrValue;
        if (onColumnVisibilityChange) {
            onColumnVisibilityChange(newValue);
        } else {
            setInternalColumnVisibility(newValue);
        }
    }, [columnVisibility, onColumnVisibilityChange]);

    const handleColumnOrderChange = useCallback((updaterOrValue: ColumnOrderState | ((prev: ColumnOrderState) => ColumnOrderState)) => {
        const newValue = typeof updaterOrValue === 'function' ? updaterOrValue(columnOrder) : updaterOrValue;
        if (onColumnOrderChange) {
            onColumnOrderChange(newValue);
        } else {
            setInternalColumnOrder(newValue);
        }
    }, [columnOrder, onColumnOrderChange]);

    const handleColumnSizingChange = useCallback((updaterOrValue: ColumnSizingState | ((prev: ColumnSizingState) => ColumnSizingState)) => {
        const newValue = typeof updaterOrValue === 'function' ? updaterOrValue(columnSizing) : updaterOrValue;
        if (onColumnSizingChange) {
            onColumnSizingChange(newValue);
        } else {
            setInternalColumnSizing(newValue);
        }
    }, [columnSizing, onColumnSizingChange]);

    const tableContainerRef = useRef<HTMLDivElement>(null);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: handleSortingChange as any,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: handleVisibilityChange as any,
        onRowSelectionChange: setRowSelection,
        onColumnOrderChange: handleColumnOrderChange as any,
        onColumnSizingChange: handleColumnSizingChange as any,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            columnOrder,
            columnSizing,
            rowSelection,
        },
        columnResizeMode: 'onChange',
        enableMultiSort: true,
        isMultiSortEvent: () => true,
    });

    // Column IDs for DnD
    const columnIds = useMemo(
        () => table.getVisibleLeafColumns().map(c => c.id),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [table.getVisibleLeafColumns().length, columnOrder, columnVisibility]
    );

    // DnD sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        }),
        useSensor(KeyboardSensor)
    );

    // Handle drag end
    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = columnIds.indexOf(active.id as string);
        const newIndex = columnIds.indexOf(over.id as string);

        if (oldIndex !== -1 && newIndex !== -1) {
            const newOrder = arrayMove(columnIds, oldIndex, newIndex);
            handleColumnOrderChange(newOrder);
        }
    }, [columnIds, handleColumnOrderChange]);

    // Auto-fit columns to container width
    const handleAutoFit = useCallback(() => {
        const container = tableContainerRef.current;
        if (!container) return;

        const visibleColumns = table.getVisibleLeafColumns();
        const columnCount = visibleColumns.length;
        if (columnCount === 0) return;

        // Get the actual available width (subtract borders: 1px per column + 1px table border)
        const availableWidth = container.clientWidth - (columnCount + 1);
        const perColumnWidth = Math.max(50, Math.floor(availableWidth / columnCount));

        // Distribute any remaining pixels to the first columns
        const remainder = availableWidth - (perColumnWidth * columnCount);

        const newSizing: Record<string, number> = {};
        visibleColumns.forEach((col, i) => {
            newSizing[col.id] = perColumnWidth + (i < remainder ? 1 : 0);
        });
        table.setColumnSizing(newSizing);
    }, [table]);

    // Reset column sizing to defaults
    const handleResetSizing = useCallback(() => {
        table.resetColumnSizing();
    }, [table]);

    return (
        <div className="flex flex-col h-full">
            <div className="flex-shrink-0 pb-2">
                <div className="flex flex-wrap items-center gap-3 px-1">
                    {/* Left: Search + Metadata */}
                    <div className="flex items-center gap-3">
                        {leftToolbar}
                    </div>

                    {/* Left-Aligned Actions */}
                    <div className="flex items-center gap-1.5 ml-0">
                        <button
                            onClick={handleAutoFit}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 hover:text-emerald-700 border border-emerald-500/20 rounded-lg text-[10px] font-medium uppercase tracking-wider transition-all active:scale-[0.97]"
                            title="Přizpůsobit šířku sloupců"
                        >
                            <Maximize2 size={12} />
                            <span className="hidden sm:inline">Přizpůsobit</span>
                        </button>
                        <button
                            onClick={handleResetSizing}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 hover:text-rose-700 border border-rose-500/20 rounded-lg text-[10px] font-medium uppercase tracking-wider transition-all active:scale-[0.97]"
                            title="Obnovit výchozí šířky"
                        >
                            <RefreshCcw size={12} />
                            <span className="hidden sm:inline">Obnovit</span>
                        </button>
                        <ColumnToggle table={table} />
                        {toolbar}
                        {toolbarSubtext && (
                            <div className="ml-2 flex items-center">
                                {toolbarSubtext}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div ref={tableContainerRef} className="flex-1 overflow-auto rounded-md border border-border">
                <div className="max-w-full">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                        modifiers={[restrictToHorizontalAxis]}
                    >
                        <table
                            className="w-full text-xs text-left caption-bottom table-fixed"
                            style={{ width: table.getTotalSize() }}
                        >
                            <thead className={`border-b-2 border-border sticky top-0 z-10 shadow-sm ${headerClassName || 'bg-secondary'}`}>
                                <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <tr key={headerGroup.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                            {headerGroup.headers.map((header) => {
                                                const sortDir = header.column.getIsSorted();
                                                const sortIndex = header.column.getSortIndex();
                                                return (
                                                    <DraggableHeader key={header.id} header={header} isSorted={!!sortDir}>
                                                        {header.isPlaceholder ? null : (
                                                            <div
                                                                className={header.column.getCanSort() ? 'cursor-pointer select-none flex items-center gap-1 hover:text-foreground transition-colors break-words leading-tight' : 'break-words leading-tight'}
                                                                onClick={header.column.getToggleSortingHandler()}
                                                            >
                                                                {flexRender(
                                                                    header.column.columnDef.header,
                                                                    header.getContext()
                                                                )}
                                                                {sortDir ? (
                                                                    <span className="flex items-center gap-0.5">
                                                                        <ArrowUpDown size={12} className={sortDir === 'asc' ? 'rotate-180' : ''} />
                                                                        {sorting.length > 1 && (
                                                                            <span className="text-[8px] font-bold text-primary">{sortIndex + 1}</span>
                                                                        )}
                                                                    </span>
                                                                ) : (
                                                                    header.column.getCanSort() ? <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-50" /> : null
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Resizer Handle */}
                                                        <div
                                                            onMouseDown={(e) => {
                                                                e.stopPropagation();
                                                                header.getResizeHandler()(e);
                                                            }}
                                                            onTouchStart={(e) => {
                                                                e.stopPropagation();
                                                                header.getResizeHandler()(e);
                                                            }}
                                                            onClick={(e) => e.stopPropagation()}
                                                            onPointerDown={(e) => e.stopPropagation()} // Stop pointer events for dnd-kit
                                                            className={`absolute right-0 top-0 h-full w-1 bg-border cursor-col-resize select-none touch-none opacity-0 group-hover:opacity-100 hover:bg-primary ${header.column.getIsResizing() ? 'bg-primary opacity-100' : ''
                                                                }`}
                                                        />
                                                    </DraggableHeader>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </SortableContext>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <tr
                                            key={row.id}
                                            data-state={row.getIsSelected() && "selected"}
                                            onClick={() => onRowClick?.(row.original)}
                                            className={`border-b transition-all duration-150 group/row ${onRowClick ? 'cursor-pointer hover:bg-primary/[0.04] hover:shadow-[inset_3px_0_0_hsl(var(--primary))] active:bg-primary/[0.06]' : 'hover:bg-muted/50'} data-[state=selected]:bg-muted`}
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <td
                                                    key={cell.id}
                                                    className="px-3 py-1.5 align-middle border-r border-border/30 last:border-r-0 group-hover/row:border-primary/10 transition-colors text-[13px]"
                                                    style={{ width: cell.column.getSize(), maxWidth: cell.column.getSize() }}
                                                >
                                                    <div className="line-clamp-2 break-words">
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </div>
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                                            Žádné výsledky.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </DndContext>
                </div>
            </div>
        </div >
    );
}
