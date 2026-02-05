'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Project } from '@/types/project';
import { ListFilter, Search, Check } from 'lucide-react';

interface ProjectListProps {
    projects: Project[];
}

const ProjectList: React.FC<ProjectListProps> = ({ projects }) => {
    // 1. Šířky sloupců
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('projectTableWidths');
            if (saved) return JSON.parse(saved);
        }
        return {
            main: 300, customer: 150, manager: 120, abra_project: 120,
            abra_order: 120, mounting_company: 150, serial_number: 130,
            body_delivery: 130, chassis_delivery: 130, customer_handover: 150,
            closed_at: 120, actions: 140, note: 200, category: 120,
            production_status: 150, body_setup: 150
        };
    });

    // 2. Viditelnost sloupců
    const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('projectTableVisibility');
            if (saved) return JSON.parse(saved);
        }
        return {
            customer: true, manager: true, abra_project: false,
            abra_order: false, mounting_company: false, serial_number: true,
            body_delivery: true, chassis_delivery: false, customer_handover: true,
            closed_at: false, actions: true, note: true, category: false,
            production_status: false, body_setup: false
        };
    });

    // 3. Pořadí sloupců
    const [columnOrder, setColumnOrder] = useState<string[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('projectTableOrder');
            if (saved) return JSON.parse(saved);
        }
        return [
            'main', 'customer', 'manager', 'abra_project', 'abra_order',
            'mounting_company', 'serial_number', 'body_delivery',
            'chassis_delivery', 'customer_handover', 'closed_at',
            'actions', 'note'
        ];
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [showViewOptions, setShowViewOptions] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Persistenci ukládáme při každé změně stavu
    useEffect(() => {
        localStorage.setItem('projectTableWidths', JSON.stringify(columnWidths));
    }, [columnWidths]);

    useEffect(() => {
        localStorage.setItem('projectTableVisibility', JSON.stringify(visibleColumns));
    }, [visibleColumns]);

    useEffect(() => {
        localStorage.setItem('projectTableOrder', JSON.stringify(columnOrder));
    }, [columnOrder]);

    const isResizing = useRef<string | null>(null);
    const startX = useRef(0);
    const startWidth = useRef(0);

    // Drag and drop state
    const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
    const [dropTarget, setDropTarget] = useState<{ id: string, side: 'left' | 'right' } | null>(null);
    const dragSourceRef = useRef<string | null>(null);

    const handleMouseDown = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        isResizing.current = id;
        startX.current = e.pageX;
        startWidth.current = columnWidths[id];
        document.body.classList.add('resizing');
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isResizing.current) {
            const diff = e.pageX - startX.current;
            const newWidth = Math.max(30, startWidth.current + diff);

            setColumnWidths((prev: Record<string, number>) => ({
                ...prev,
                [isResizing.current!]: newWidth
            }));
        }
    }, []);

    const handleMouseUp = useCallback(() => {
        isResizing.current = null;
        document.body.classList.remove('resizing');
    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowViewOptions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredProjects = projects.filter((project: Project) =>
        (project.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (project.customer?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (project.manager?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (project.id?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

    const toggleColumn = (column: string) => {
        setVisibleColumns((prev: Record<string, boolean>) => ({
            ...prev,
            [column]: !prev[column]
        }));
    };

    // Drag and Drop handlery
    const onDragStart = (e: React.DragEvent, id: string) => {
        dragSourceRef.current = id;
        setDraggedColumn(id);

        // Nutné pro Firefox a Chrome aby se drag spustil korektně
        e.dataTransfer.setData('columnId', id);
        e.dataTransfer.effectAllowed = 'move';

        // Vizuální feedback
        const target = e.currentTarget as HTMLElement;
        target.style.opacity = '0.5';
    };

    const onDragEnd = (e: React.DragEvent) => {
        const target = e.currentTarget as HTMLElement;
        target.style.opacity = '1';
        setDraggedColumn(null);
        setDropTarget(null);
        dragSourceRef.current = null;
    };

    const onDragOver = (e: React.DragEvent, id: string) => {
        e.preventDefault();
        const sourceId = dragSourceRef.current;

        if (sourceId === id) {
            if (dropTarget) setDropTarget(null);
            return;
        }

        const rect = e.currentTarget.getBoundingClientRect();
        const midpoint = rect.left + rect.width / 2;
        const side = e.clientX < midpoint ? 'left' : 'right';

        // Optimalizace renderování
        if (!dropTarget || dropTarget.id !== id || dropTarget.side !== side) {
            setDropTarget({ id, side });
        }
    };

    const onDrop = (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        const sourceId = dragSourceRef.current || e.dataTransfer.getData('columnId');
        const currentTarget = dropTarget;

        setDraggedColumn(null);
        setDropTarget(null);
        dragSourceRef.current = null;

        if (!sourceId || !currentTarget || sourceId === currentTarget.id) return;

        setColumnOrder((prevOrder: string[]) => {
            const newOrder = [...prevOrder];
            const draggedIdx = newOrder.indexOf(sourceId);
            if (draggedIdx === -1) return prevOrder;

            newOrder.splice(draggedIdx, 1);

            const targetIndexInNewOrder = newOrder.indexOf(currentTarget.id);
            if (targetIndexInNewOrder === -1) return prevOrder;

            const finalIdx = currentTarget.side === 'right' ? targetIndexInNewOrder + 1 : targetIndexInNewOrder;

            newOrder.splice(finalIdx, 0, sourceId);
            return newOrder;
        });
    };

    // Všechny definice sloupců
    const columnDefinitions: Record<string, { label: React.ReactNode, visible: boolean }> = {
        main: { label: 'Předmět', visible: true },
        customer: { label: 'Zákazník', visible: visibleColumns.customer },
        manager: { label: 'Vlastník', visible: visibleColumns.manager },
        abra_project: { label: 'Abra Zakázka', visible: visibleColumns.abra_project },
        abra_order: { label: 'Abra Obj.', visible: visibleColumns.abra_order },
        mounting_company: { label: 'Montáž', visible: visibleColumns.mounting_company },
        serial_number: { label: 'Výr. číslo', visible: visibleColumns.serial_number },
        body_delivery: { label: 'Termín Nástavba', visible: visibleColumns.body_delivery },
        chassis_delivery: { label: 'Termín Podvozek', visible: visibleColumns.chassis_delivery },
        customer_handover: { label: 'Předání Zákaz.', visible: visibleColumns.customer_handover },
        closed_at: { label: 'Uzavřeno', visible: visibleColumns.closed_at },
        actions: { label: 'Vyžadovaná akce', visible: visibleColumns.actions },
        note: { label: 'Poznámka', visible: visibleColumns.note }
    };

    // Seřadíme sloupce podle columnOrder a odfiltrujeme ty co nejsou v definici
    const orderedColumns = columnOrder
        .filter(id => columnDefinitions[id])
        .map(id => ({ id, ...columnDefinitions[id] }));

    const activeColumns = orderedColumns.filter((col: any) => col.visible);
    const totalTableWidth = activeColumns.reduce((sum: number, col: any) => sum + (columnWidths[col.id] || 0), 0);

    const DropdownCheck = ({ label, column }: { label: string, column: string }) => (
        <button className="dropdown-item" onClick={() => toggleColumn(column)}>
            <div className={`checkbox ${visibleColumns[column] ? 'checked' : ''}`}>
                {visibleColumns[column] && <Check size={12} />}
            </div>
            <span>{label}</span>
        </button>
    );

    const Th = ({ id, label, isVisible = true }: { id: string, label: React.ReactNode, isVisible?: boolean }) => {
        if (!isVisible) return null;

        const isDragging = draggedColumn === id;
        const isTarget = dropTarget?.id === id;
        const dropSideClass = isTarget ? (dropTarget.side === 'left' ? 'drop-target-left' : 'drop-target-right') : '';

        return (
            <th
                style={{ position: 'relative' }}
                draggable
                onDragStart={(e) => onDragStart(e, id)}
                onDragEnd={onDragEnd}
                onDragOver={(e) => onDragOver(e, id)}
                onDrop={(e) => onDrop(e, id)}
                className={`${isDragging ? 'is-dragging' : ''} ${dropSideClass}`}
            >
                <div className="th-content">{label}</div>
                <div
                    className="column-resizer"
                    onMouseDown={(e: React.MouseEvent) => handleMouseDown(e, id)}
                />
            </th>
        );
    };
    const renderCell = (project: Project, columnId: string) => {
        switch (columnId) {
            case 'main':
                return (
                    <td className="font-bold">
                        <div className="truncate-text" style={{ fontSize: '12px' }}>{project.name}</div>
                        <div className="text-secondary truncate-text" style={{ fontSize: '10px', fontWeight: '400' }}>{project.id}</div>
                    </td>
                );
            case 'customer_handover':
                return (
                    <td>
                        <div style={{ color: 'var(--primary)', fontWeight: '600' }} className="truncate-text">
                            {project.customer_handover || '-'}
                        </div>
                    </td>
                );
            case 'actions':
                return (
                    <td>
                        <div className="action-toggle-container">
                            <button className={`action-toggle ${project.action_needed_by === 'internal' ? 'active-internal' : ''}`}>Int.</button>
                            <button className={`action-toggle ${project.action_needed_by === 'external' ? 'active-external' : ''}`}>Ext.</button>
                        </div>
                    </td>
                );
            case 'note':
                return (
                    <td>
                        <div className="note-cell" title={project.note || 'Bez poznámky'}>
                            <span className="truncate-text">{project.note || '-'}</span>
                        </div>
                    </td>
                );
            case 'abra_project':
            case 'serial_number':
                return <td><div className="font-mono text-xs truncate-text">{(project as any)[columnId] || '-'}</div></td>;
            case 'abra_order':
            case 'chassis_delivery':
            case 'closed_at':
                return <td><div className="text-secondary truncate-text">{(project as any)[columnId] || '-'}</div></td>;
            default:
                return <td><div className="truncate-text">{(project as any)[columnId] || '-'}</div></td>;
        }
    };

    return (
        <div className="card-glass h-full">
            <div className="table-header-actions">
                <div className="search-in-table" style={{ position: 'relative' }}>
                    <Search
                        size={16}
                        className="text-secondary"
                        style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                    />
                    <input
                        type="text"
                        placeholder="Hledat zakázky, zákazníky, kódy, výrobní čísla..."
                        className="table-search-input"
                        style={{ paddingLeft: '40px', width: '400px' }}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="relative" ref={dropdownRef}>
                    <button
                        className={`view-toggle-btn ${showViewOptions ? 'active' : ''}`}
                        onClick={() => setShowViewOptions(!showViewOptions)}
                    >
                        <ListFilter size={16} />
                        <span>Zobrazení ({Object.values(visibleColumns).filter(v => v).length})</span>
                    </button>

                    {showViewOptions && (
                        <div className="view-dropdown-glass" style={{ width: '280px', maxHeight: '500px', overflowY: 'auto' }}>
                            <div className="dropdown-header">Základní pole</div>
                            <DropdownCheck label="Zákazník" column="customer" />
                            <DropdownCheck label="Vlastník" column="manager" />
                            <DropdownCheck label="Uzavřeno" column="closed_at" />
                            <DropdownCheck label="Kategorie" column="category" />

                            <div className="dropdown-header">Abra & Výroba</div>
                            <DropdownCheck label="Abra Projekt (Zakázka)" column="abra_project" />
                            <DropdownCheck label="Abra Objednávka" column="abra_order" />
                            <DropdownCheck label="Status Výroby" column="production_status" />
                            <DropdownCheck label="Výrobní číslo" column="serial_number" />
                            <DropdownCheck label="Montážní firma" column="mounting_company" />
                            <DropdownCheck label="Nastavení nástavby" column="body_setup" />

                            <div className="dropdown-header">Termíny</div>
                            <DropdownCheck label="Dodání nástavby" column="body_delivery" />
                            <DropdownCheck label="Dodání podvozku" column="chassis_delivery" />
                            <DropdownCheck label="Předání zákazníkovi" column="customer_handover" />

                            <div className="dropdown-header">Systém</div>
                            <DropdownCheck label="Vyžadovaná akce" column="actions" />
                            <DropdownCheck label="Poznámka" column="note" />
                        </div>
                    )}
                </div>
            </div>

            <div className="project-table-container">
                <table
                    className="project-table"
                    style={{
                        tableLayout: 'fixed',
                        width: `${totalTableWidth}px`,
                        minWidth: `${totalTableWidth}px`,
                        maxWidth: `${totalTableWidth}px`
                    }}
                >
                    <colgroup>
                        {activeColumns.map(col => (
                            <col key={col.id} style={{ width: `${columnWidths[col.id]}px` }} />
                        ))}
                    </colgroup>
                    <thead>
                        <tr>
                            {activeColumns.map(col => (
                                <Th
                                    key={col.id}
                                    id={col.id}
                                    label={col.id === 'main' ? (
                                        <div style={{ lineHeight: '1.2' }}>
                                            <div>Předmět</div>
                                            <div style={{ fontSize: '8px', opacity: 0.8, fontWeight: 'normal' }}>Číslo OP</div>
                                        </div>
                                    ) : col.label}
                                    isVisible={col.visible}
                                />
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProjects.map((project: Project) => (
                            <tr key={project.id}>
                                {activeColumns.map(col => (
                                    <React.Fragment key={col.id}>
                                        {renderCell(project, col.id)}
                                    </React.Fragment>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="table-footer">
                Ukázáno {filteredProjects.length} z {projects.length} položek | CRM Import v2
            </div>
        </div>
    );
};

export default ProjectList;
