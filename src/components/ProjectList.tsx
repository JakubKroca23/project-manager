'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Project } from '@/types/project';
import { ListFilter, Search, Check } from 'lucide-react';

interface ProjectListProps {
    projects: Project[];
}

const ProjectList: React.FC<ProjectListProps> = ({ projects }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showViewOptions, setShowViewOptions] = useState(false);

    // Rozšířené stavy pro všechny sloupce
    const [visibleColumns, setVisibleColumns] = useState({
        customer: true,
        manager: true,
        abra_project: true,
        abra_order: false,
        body_delivery: true,
        chassis_delivery: true,
        mounting_company: true,
        body_setup: false,
        serial_number: true,
        customer_handover: true,
        production_status: false,
        category: false,
        closed_at: true,
        actions: true,
        note: false
    });

    // Šířky sloupců s výchozími hodnotami
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>({
        main: 250,
        customer: 150,
        manager: 120,
        abra_project: 100,
        abra_order: 100,
        body_delivery: 100,
        chassis_delivery: 100,
        mounting_company: 120,
        body_setup: 120,
        serial_number: 120,
        customer_handover: 120,
        production_status: 100,
        category: 100,
        closed_at: 100,
        actions: 140,
        note: 150
    });

    const isResizing = useRef<string | null>(null);
    const startX = useRef<number>(0);
    const startWidth = useRef<number>(0);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Načtení šířek z localStorage při mountu
    useEffect(() => {
        const savedWidths = localStorage.getItem('project-table-widths');
        if (savedWidths) {
            try {
                setColumnWidths(JSON.parse(savedWidths));
            } catch (e) {
                console.error("Failed to parse saved column widths", e);
            }
        }
    }, []);

    // Uložení šířek do localStorage při změně
    useEffect(() => {
        localStorage.setItem('project-table-widths', JSON.stringify(columnWidths));
    }, [columnWidths]);

    const handleMouseDown = (e: React.MouseEvent, column: string) => {
        isResizing.current = column;
        startX.current = e.pageX;
        startWidth.current = columnWidths[column];
        document.body.classList.add('resizing');
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isResizing.current) return;

        requestAnimationFrame(() => {
            if (!isResizing.current) return;
            const diff = e.pageX - startX.current;
            const newWidth = Math.max(30, startWidth.current + diff);

            setColumnWidths((prev: Record<string, number>) => ({
                ...prev,
                [isResizing.current!]: newWidth
            }));
        });
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
        (project.id?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (project.abra_project?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (project.serial_number?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

    const toggleColumn = (column: keyof typeof visibleColumns) => {
        setVisibleColumns((prev: typeof visibleColumns) => ({
            ...prev,
            [column]: !prev[column]
        }));
    };

    // Definice sloupců pro snadnější mapování
    const columns: { id: string, label: React.ReactNode, visible: boolean }[] = [
        { id: 'main', label: 'Předmět', visible: true },
        { id: 'customer', label: 'Zákazník', visible: visibleColumns.customer },
        { id: 'manager', label: 'Vlastník', visible: visibleColumns.manager },
        { id: 'abra_project', label: 'Abra Zakázka', visible: visibleColumns.abra_project },
        { id: 'abra_order', label: 'Abra Obj.', visible: visibleColumns.abra_order },
        { id: 'mounting_company', label: 'Montáž', visible: visibleColumns.mounting_company },
        { id: 'serial_number', label: 'Výr. číslo', visible: visibleColumns.serial_number },
        { id: 'body_delivery', label: 'Termín Nástavba', visible: visibleColumns.body_delivery },
        { id: 'chassis_delivery', label: 'Termín Podvozek', visible: visibleColumns.chassis_delivery },
        { id: 'customer_handover', label: 'Předání Zákaz.', visible: visibleColumns.customer_handover },
        { id: 'closed_at', label: 'Uzavřeno', visible: visibleColumns.closed_at },
        { id: 'actions', label: 'Vyžadovaná akce', visible: visibleColumns.actions },
        { id: 'note', label: 'Poznámka', visible: visibleColumns.note }
    ];

    const activeColumns = columns.filter(col => col.visible);
    const totalTableWidth = activeColumns.reduce((sum, col) => sum + (columnWidths[col.id] || 0), 0);

    const DropdownCheck = ({ label, column }: { label: string, column: keyof typeof visibleColumns }) => (
        <button className="dropdown-item" onClick={() => toggleColumn(column)}>
            <div className={`checkbox ${visibleColumns[column] ? 'checked' : ''}`}>
                {visibleColumns[column] && <Check size={12} />}
            </div>
            <span>{label}</span>
        </button>
    );

    const Th = ({ id, label, isVisible = true }: { id: string, label: React.ReactNode, isVisible?: boolean, key?: string }) => {
        if (!isVisible) return null;
        return (
            <th style={{ position: 'relative' }}>
                <div className="th-content">{label}</div>
                <div
                    className="column-resizer"
                    onMouseDown={(e: React.MouseEvent) => handleMouseDown(e, id)}
                />
            </th>
        );
    };

    return (
        <div className="card-glass overflow-visible">
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
                        width: totalTableWidth
                    }}
                >
                    <colgroup>
                        {activeColumns.map(col => (
                            <col key={col.id} style={{ width: columnWidths[col.id] }} />
                        ))}
                    </colgroup>
                    <thead>
                        <tr>
                            <Th
                                id="main"
                                label={
                                    <div style={{ lineHeight: '1.2' }}>
                                        <div>Předmět</div>
                                        <div style={{ fontSize: '8px', opacity: 0.8, fontWeight: 'normal' }}>Číslo OP</div>
                                    </div>
                                }
                            />
                            {columns.slice(1).map(col => (
                                <Th key={col.id} id={col.id} label={col.label} isVisible={col.visible} />
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProjects.map((project: Project) => (
                            <tr key={project.id}>
                                <td className="font-bold">
                                    <div className="truncate-text" style={{ fontSize: '12px' }}>{project.name}</div>
                                    <div className="text-secondary truncate-text" style={{ fontSize: '10px', fontWeight: '400' }}>{project.id}</div>
                                </td>
                                {visibleColumns.customer && <td className="text-secondary truncate-text">{project.customer || '-'}</td>}
                                {visibleColumns.manager && <td className="truncate-text">{project.manager}</td>}
                                {visibleColumns.abra_project && <td className="font-mono text-xs truncate-text">{project.abra_project || '-'}</td>}
                                {visibleColumns.abra_order && <td className="font-mono text-xs text-secondary truncate-text">{project.abra_order || '-'}</td>}
                                {visibleColumns.mounting_company && <td className="text-secondary truncate-text">{project.mounting_company || '-'}</td>}
                                {visibleColumns.serial_number && <td className="font-mono text-xs truncate-text">{project.serial_number || '-'}</td>}

                                {visibleColumns.body_delivery && <td className="truncate-text">{project.body_delivery || '-'}</td>}
                                {visibleColumns.chassis_delivery && <td className="text-secondary truncate-text">{project.chassis_delivery || '-'}</td>}
                                {visibleColumns.customer_handover && (
                                    <td className="truncate-text">
                                        <div style={{ color: 'var(--primary)', fontWeight: '600' }} className="truncate-text">
                                            {project.customer_handover || '-'}
                                        </div>
                                    </td>
                                )}
                                {visibleColumns.closed_at && <td className="text-secondary truncate-text">{project.closed_at || '-'}</td>}

                                {visibleColumns.actions && (
                                    <td>
                                        <div className="action-toggle-container">
                                            <button
                                                className={`action-toggle ${project.action_needed_by === 'internal' ? 'active-internal' : ''}`}
                                            >
                                                Int.
                                            </button>
                                            <button
                                                className={`action-toggle ${project.action_needed_by === 'external' ? 'active-external' : ''}`}
                                            >
                                                Ext.
                                            </button>
                                        </div>
                                    </td>
                                )}
                                {visibleColumns.note && (
                                    <td>
                                        <div className="note-cell" title={project.note || 'Bez poznámky'}>
                                            <span className="truncate-text">{project.note || '-'}</span>
                                        </div>
                                    </td>
                                )}
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
