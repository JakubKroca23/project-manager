'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Loader2, Search, Database, X, Plus, PackageCheck, Trash2, CheckCircle2 } from 'lucide-react';
import { useSearch } from '@/providers/SearchProvider';
import { toast } from 'sonner';
import { DataTable } from '@/components/DataTable/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { useTableSettings } from '@/hooks/useTableSettings';

import { Project } from '@/types/project';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import CreateProjectModal from '@/components/CreateProjectModal';
import { CategoryChip } from '@/components/CategoryChip';
import { useActions } from '@/providers/ActionProvider';




const parseDate = (dateStr: string | undefined | null): Date | null => {
    if (!dateStr || typeof dateStr !== 'string') return null;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
};

const SafeCellValue: React.FC<{ value: any }> = ({ value }) => {
    if (value === null || value === undefined) return <span>-</span>;
    if (typeof value === 'object') {
        // Safe stringify for objects to prevent React crash
        return <span className="text-muted-foreground text-[10px] break-all">{JSON.stringify(value)}</span>;
    }
    return <span>{String(value)}</span>;
};

const columns: ColumnDef<Project>[] = [

    {
        accessorKey: 'id',
        header: 'Kód',
        minSize: 30,
        cell: ({ row }) => <span className="font-mono">{row.getValue('id')}</span>,
    },
    {
        accessorKey: 'name',
        header: 'Název',
        minSize: 30,
        cell: ({ row }) => <span className="font-medium">{row.getValue('name')}</span>,
    },
    {
        accessorKey: 'customer',
        header: 'Klient',
        minSize: 30,
    },
    {
        accessorKey: 'manager',
        header: 'Vedoucí projektu',
        minSize: 30,
    },
    {
        accessorKey: 'status',
        header: 'Status',
        minSize: 30,
        cell: ({ row }) => {
            const val = row.getValue('status');
            return (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                    {typeof val === 'string' ? val : '-'}
                </span>
            );
        },
    },
    {
        accessorKey: 'production_status',
        header: 'Status Výroby',
        minSize: 30,
    },
    {
        accessorKey: 'chassis_delivery',
        header: 'Dodání Podvozku',
        minSize: 30,
        cell: ({ row }) => <SafeCellValue value={row.getValue('chassis_delivery')} />,
    },
    {
        accessorKey: 'body_delivery',
        header: 'Dodání Nástavby',
        minSize: 30,
        cell: ({ row }) => <SafeCellValue value={row.getValue('body_delivery')} />,
    },
    {
        accessorKey: 'customer_handover',
        header: 'Předání',
        minSize: 30,
        cell: ({ row }) => <SafeCellValue value={row.getValue('customer_handover')} />,
    },
    {
        accessorKey: 'abra_project',
        header: 'ABRA Zakázka',
        minSize: 30,
        cell: ({ row }) => <SafeCellValue value={row.getValue('abra_project')} />,
    },
    {
        accessorKey: 'mounting_company',
        header: 'Montáž',
        minSize: 30,
    },
    {
        accessorKey: 'category',
        header: 'Kategorie',
        minSize: 30,
        cell: ({ row }) => <CategoryChip value={row.getValue('category')} />
    },
    {
        accessorKey: 'body_setup',
        header: 'Nastavení Nástavby',
        minSize: 30,
    },
    {
        accessorKey: 'closed_at',
        header: 'Zahájení',
        minSize: 30,
        cell: ({ row }) => <SafeCellValue value={row.getValue('closed_at')} />,
    },
    {
        accessorKey: 'serial_number',
        header: 'VIN / VČ',
        minSize: 30,
        cell: ({ row }) => <SafeCellValue value={row.getValue('serial_number')} />,
    },
    {
        accessorKey: 'body_type',
        header: 'Typ Nástavby',
        minSize: 30,
        cell: ({ row }) => <SafeCellValue value={row.getValue('body_type')} />,
    },
];

export default function ProjektyPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const searchParams = useSearchParams();
    const typeParam = searchParams.get('type');
    const activeTab = (typeParam === 'service' ? 'service' : typeParam === 'military' ? 'military' : 'civil') as 'civil' | 'military' | 'service';

    const tableSettings = useTableSettings(`projects-${activeTab}`);
    const router = useRouter();
    const { searchTerm } = useSearch();
    const { setCustomToolbar } = useActions();
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [tableTools, setTableTools] = useState<React.ReactNode>(null);

    const fetchProjects = useCallback(async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('Error fetching projects:', error);
        } else {
            setProjects(data || []);
        }

        setIsLoading(false);
    }, [activeTab]);

    useEffect(() => {
        fetchProjects();

        // Listen for global refresh from ImportWizard
        const handleGlobalRefresh = () => fetchProjects();
        window.addEventListener('projects-updated', handleGlobalRefresh);
        return () => window.removeEventListener('projects-updated', handleGlobalRefresh);
    }, [fetchProjects]);


    // All projects for this tab (no search filtering)
    const tabProjects = projects.filter(p => p.project_type === activeTab);

    // Universal filter – searches across ALL fields and respects active tab
    const filteredProjects = useMemo(() => {
        const normalize = (str: string) =>
            str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

        return tabProjects.filter(p => {
            // Search filter (Words separated by space)
            const allTerms = searchTerm
                .split(/\s+/)
                .filter((t: string) => t.length > 0)
                .map((t: string) => normalize(t));

            if (allTerms.length === 0) return true;

            const searchableFields = [
                p.name,
                p.customer,
                p.id,
                p.abra_project,
                p.abra_order,
                p.serial_number,
                p.manager,
                p.status,
                p.category,
                p.production_status,
                p.mounting_company,
                p.body_type
            ].map((val: string | undefined) => normalize(val || ''));

            // Check custom fields as well
            if (p.custom_fields) {
                Object.values(p.custom_fields).forEach((val: any) => {
                    if (typeof val === 'string') searchableFields.push(normalize(val));
                });
            }

            const searchString = searchableFields.join(' ');

            return allTerms.every((term: string) => searchString.includes(term));
        });
    }, [tabProjects, searchTerm]);

    // Update global navbar toolbar
    useEffect(() => {
        setCustomToolbar(
            <div className="flex items-center gap-2">
                {/* Column Toggle (From Table) */}
                {tableTools}

                {/* Compact Count */}
                <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold text-muted-foreground/60 border border-transparent">
                    <Database size={12} />
                    <span>{filteredProjects.length} / {tabProjects.length}</span>
                </div>

                {/* Create New Button */}
                <button
                    onClick={() => setIsModalOpen(true)}
                    className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider text-white transition-all hover:scale-105 active:scale-95 shadow-sm",
                        activeTab === 'service' ? "bg-purple-600 shadow-purple-500/20" : activeTab === 'military' ? "bg-emerald-600 shadow-emerald-500/20" : "bg-blue-600 shadow-blue-500/20"
                    )}
                >
                    <Plus size={12} strokeWidth={3} />
                    <span>{activeTab === 'service' ? 'Nový servis' : 'Nová zakázka'}</span>
                </button>

                {/* Bulk Mode Toggle */}
                <button
                    onClick={() => {
                        if (isBulkMode) setRowSelection({});
                        setIsBulkMode(!isBulkMode);
                    }}
                    className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all",
                        isBulkMode ? "bg-rose-500 text-white border-rose-600" : "bg-muted/50 text-muted-foreground border-border/50 hover:bg-muted"
                    )}
                >
                    <CheckCircle2 size={12} strokeWidth={3} />
                    <span>{isBulkMode ? 'Zrušit' : 'Hromadné akce'}</span>
                </button>

                {/* Bulk Actions (Delete/Complete) */}
                {isBulkMode && Object.keys(rowSelection).length > 0 && (
                    <div className="flex items-center gap-1.5 pl-1 border-l border-border/50 animate-in slide-in-from-left-2 transition-all">
                        <button
                            onClick={async () => {
                                const selectedProjects = filteredProjects.filter((_, idx) => rowSelection[idx]);
                                const count = selectedProjects.length;
                                if (confirm(`Opravdu smazat ${count} zakázek?`)) {
                                    const { error } = await supabase.from('projects').delete().in('id', selectedProjects.map(p => p.id));
                                    if (error) toast.error(error.message);
                                    else {
                                        toast.success('Smazáno');
                                        setRowSelection({});
                                        setIsBulkMode(false);
                                        fetchProjects();
                                    }
                                }
                            }}
                            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                            title="Smazat vybrané"
                        >
                            <Trash2 size={14} />
                        </button>
                        <button
                            onClick={async () => {
                                const selectedProjects = filteredProjects.filter((_, idx) => rowSelection[idx]);
                                if (confirm(`Změnit stav na Dokončeno u ${selectedProjects.length} položek?`)) {
                                    const { error } = await supabase.from('projects').update({ production_status: 'Dokončeno' }).in('id', selectedProjects.map(p => p.id));
                                    if (error) toast.error(error.message);
                                    else {
                                        toast.success('Hotovo');
                                        setRowSelection({});
                                        setIsBulkMode(false);
                                        fetchProjects();
                                    }
                                }
                            }}
                            className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                            title="Označit jako hotové"
                        >
                            <PackageCheck size={14} />
                        </button>
                    </div>
                )}
            </div>
        );

        return () => setCustomToolbar(null);
    }, [activeTab, filteredProjects.length, tabProjects.length, isBulkMode, rowSelection, tableTools, setCustomToolbar, fetchProjects]);



    // Memoize columns to include dynamic custom fields
    const tableColumns = useMemo(() => {
        const dynamicColumns: ColumnDef<Project>[] = [];
        const customKeys = new Set<string>();

        // Collect all custom keys from current project list
        projects.forEach(p => {
            if (p.custom_fields) {
                Object.keys(p.custom_fields).forEach(key => customKeys.add(key));
            }
        });

        // Create column definitions for each custom key
        customKeys.forEach(key => {
            dynamicColumns.push({
                accessorFn: (row) => row.custom_fields?.[key] || '-',
                id: `custom_${key}`,
                header: key,
                minSize: 30,
                cell: ({ getValue }) => <SafeCellValue value={getValue()} />
            });
        });

        return [...columns, ...dynamicColumns];
    }, [projects]);

    return (
        <div className="h-full flex flex-col bg-background">
            <div className="flex-1 overflow-hidden flex flex-col px-4">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64 text-muted-foreground">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="animate-spin text-primary" size={24} />
                            <span className="text-[9px] font-bold uppercase tracking-widest opacity-50">Načítám prostředí...</span>
                        </div>
                    </div>
                ) : (
                    <DataTable
                        columns={tableColumns}
                        data={filteredProjects}
                        renderToolbar={setTableTools}
                        leftToolbar={null}
                        toolbar={null}
                        toolbarSubtext={null}
                        onRowClick={(row) => {
                            if (isBulkMode) {
                                // Find index of this row in filteredProjects to toggle selection
                                const idx = filteredProjects.findIndex(p => p.id === row.id);
                                if (idx !== -1) {
                                    setRowSelection(prev => ({
                                        ...prev,
                                        [idx]: !prev[idx]
                                    }));
                                }
                                return;
                            }
                            router.push(`/projekty/${row.id}?type=${row.project_type || 'civil'}`);
                        }}
                        searchValue={searchTerm}
                        columnOrder={tableSettings.columnOrder}
                        onColumnOrderChange={tableSettings.setColumnOrder}
                        columnVisibility={tableSettings.columnVisibility}
                        onColumnVisibilityChange={tableSettings.setColumnVisibility}
                        sorting={tableSettings.sorting}
                        onSortingChange={tableSettings.setSorting}
                        columnSizing={tableSettings.columnSizing}
                        onColumnSizingChange={tableSettings.setColumnSizing}
                        enableMultiSelect={true}
                        onRowSelectionChange={setRowSelection}
                        rowSelection={rowSelection}
                        headerClassName={activeTab === 'service' ? 'bg-purple-100 text-purple-900' : activeTab === 'military' ? 'bg-emerald-100 text-emerald-900' : 'bg-blue-100 text-blue-900'}
                        getRowClassName={(row: Project) => {
                            if (row.project_type === 'service') return 'bg-purple-500/5 hover:bg-purple-500/10 active:bg-purple-500/20';
                            if (row.project_type === 'military') return 'bg-emerald-500/5 hover:bg-emerald-500/10 active:bg-emerald-500/20';
                            if (row.project_type === 'civil') return 'bg-blue-500/5 hover:bg-blue-500/10 active:bg-blue-500/20';
                            return '';
                        }}
                    />
                )}
            </div>

            <CreateProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchProjects}
                projectType={activeTab}
            />
        </div >
    );
}

