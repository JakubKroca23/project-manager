'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';
import ExcelImporter from '@/components/ExcelImporter';
import { Loader2, Search, Database, X, Plus, PackageCheck, Trash2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { DataTable } from '@/components/DataTable/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { useTableSettings } from '@/hooks/useTableSettings';

import { Project } from '@/types/project';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import CreateProjectModal from '@/components/CreateProjectModal';
import { CategoryChip } from '@/components/CategoryChip';


interface ImportInfo {
    date: string;
    user: string;
    count: number;
    excelDate: string;
}

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
        header: 'Manažer',
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
        header: 'Uzavřeno',
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

    const [searchTerm, setSearchTerm] = useState('');
    const [searchTags, setSearchTags] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lastImport, setLastImport] = useState<ImportInfo | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
    const [isBulkMode, setIsBulkMode] = useState(false);
    const tableSettings = useTableSettings(`projects-${activeTab}`);
    const router = useRouter();

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

        // Load Global Import Metadata from DB (Category Specific)
        const metaKey = `last_import_info_${activeTab}`;
        const { data: metaData } = await supabase
            .from('app_metadata')
            .select('*')
            .eq('key', metaKey)
            .single();

        if (metaData?.value) {
            setLastImport(metaData.value as ImportInfo);
        } else {
            // Fallback to old key or clear if not found
            if (activeTab === 'civil') {
                const { data: legacyData } = await supabase
                    .from('app_metadata')
                    .select('*')
                    .eq('key', 'last_import_info')
                    .single();

                if (legacyData?.value) {
                    setLastImport(legacyData.value as ImportInfo);
                } else {
                    setLastImport(null);
                }
            } else {
                setLastImport(null);
            }
        }

        setIsLoading(false);
    }, [activeTab]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    // All projects for this tab (no search filtering)
    const tabProjects = projects.filter(p => p.project_type === activeTab);

    // Universal filter – searches across ALL fields and respects active tab
    const filteredProjects = useMemo(() => {
        const normalize = (str: string) =>
            str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

        return tabProjects.filter(p => {
            // Search filter (Tags + Current Input)
            const currentTerm = normalize(searchTerm);
            const allTerms = [...searchTags.map(t => normalize(t)), currentTerm].filter(t => t);

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
            ].map(val => normalize(val || ''));

            // Check custom fields as well
            if (p.custom_fields) {
                Object.values(p.custom_fields).forEach(val => {
                    if (typeof val === 'string') searchableFields.push(normalize(val));
                });
            }

            const searchString = searchableFields.join(' ');

            return allTerms.every(term => searchString.includes(term));
        });
    }, [tabProjects, searchTerm, searchTags]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if ((e.key === 'Enter' || e.key === ' ') && searchTerm.trim()) {
            e.preventDefault();
            setSearchTags([...searchTags, searchTerm.trim()]);
            setSearchTerm('');
        } else if (e.key === 'Backspace' && !searchTerm && searchTags.length > 0) {
            setSearchTags(searchTags.slice(0, -1));
        }
    };

    const removeTag = (tagToRemove: string) => {
        setSearchTags(searchTags.filter(tag => tag !== tagToRemove));
    };

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
                        leftToolbar={
                            <div className="flex items-center gap-3 w-full">
                                {/* Compact Count - Styled like Navbar Active Pill */}
                                <div className="hidden md:flex items-center gap-1" title="Zobrazeno / Celkem projektů">
                                    <span
                                        className={cn(
                                            "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border shadow-sm transition-all",
                                            activeTab === 'service'
                                                ? "bg-[#1a1a1a] text-purple-500 border-purple-500/20 shadow-purple-500/10"
                                                : activeTab === 'military'
                                                    ? "bg-[#1a1a1a] text-emerald-500 border-emerald-500/20 shadow-emerald-500/10"
                                                    : "bg-[#1a1a1a] text-blue-500 border-blue-500/20 shadow-blue-500/10"
                                        )}
                                    >
                                        <Database size={10} className="opacity-80" />
                                        <span>
                                            {filteredProjects.length}
                                            <span className="opacity-50 mx-0.5">/</span>
                                            {tabProjects.length}
                                        </span>
                                    </span>
                                </div>

                                {/* Create New Button */}
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className={cn(
                                        "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border shadow-sm transition-all hover:scale-105 active:scale-95",
                                        activeTab === 'service'
                                            ? "bg-purple-600 text-white border-purple-500/20 shadow-purple-500/10"
                                            : activeTab === 'military'
                                                ? "bg-emerald-600 text-white border-emerald-500/20 shadow-emerald-500/10"
                                                : "bg-blue-600 text-white border-blue-500/20 shadow-blue-500/10"
                                    )}
                                >
                                    <Plus size={10} />
                                    <span>Nový projekt</span>
                                </button>

                                {/* Maintenance: Finish Unplanned Civil Projects */}
                                {activeTab === 'civil' && (
                                    <button
                                        onClick={async () => {
                                            const projectsToUpdate = tabProjects.filter(p => {
                                                const hasMilestones =
                                                    p.chassis_delivery ||
                                                    p.body_delivery ||
                                                    p.customer_handover ||
                                                    p.deadline ||
                                                    p.custom_fields?.mounting_end_date ||
                                                    p.custom_fields?.revision_end_date;
                                                return !hasMilestones && p.status !== 'Dokončeno';
                                            });

                                            if (projectsToUpdate.length === 0) {
                                                toast.info('Žádné projekty k aktualizaci.');
                                                return;
                                            }

                                            if (confirm(`Opravdu chcete nastavit status "Dokončeno" u ${projectsToUpdate.length} nezařazených projektů?`)) {
                                                const ids = projectsToUpdate.map(p => p.id);
                                                const { error } = await supabase
                                                    .from('projects')
                                                    .update({ status: 'Dokončeno' })
                                                    .in('id', ids);

                                                if (error) {
                                                    toast.error('Chyba při aktualizaci: ' + error.message);
                                                } else {
                                                    toast.success(`Aktualizováno ${projectsToUpdate.length} projektů.`);
                                                    fetchProjects();
                                                }
                                            }
                                        }}
                                        className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border border-blue-500/20 bg-blue-500/5 text-blue-500 hover:bg-blue-500/10 transition-all"
                                        title="Nastaví 'Dokončeno' u projektů, které nejsou na časové ose"
                                    >
                                        <PackageCheck size={10} />
                                        <span>Dokončit nezařazené</span>
                                    </button>
                                )}

                                {isBulkMode ? (
                                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 transition-all">
                                        <button
                                            onClick={() => {
                                                setIsBulkMode(false);
                                                setRowSelection({});
                                            }}
                                            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border border-border bg-muted/50 text-muted-foreground hover:bg-muted transition-all"
                                        >
                                            <X size={10} />
                                            <span>Zrušit</span>
                                        </button>

                                        {Object.keys(rowSelection).length > 0 && (
                                            <button
                                                onClick={async () => {
                                                    const selectedProjects = filteredProjects.filter((_, idx) => rowSelection[idx]);
                                                    const count = selectedProjects.length;

                                                    if (confirm(`Opravdu chcete nenávratně smazat ${count} vybraných zakázek?`)) {
                                                        const ids = selectedProjects.map(p => p.id);
                                                        const { error } = await supabase
                                                            .from('projects')
                                                            .delete()
                                                            .in('id', ids);

                                                        if (error) {
                                                            toast.error('Chyba při mazání: ' + error.message);
                                                        } else {
                                                            toast.success(`Smazáno ${count} zakázek.`);
                                                            setRowSelection({});
                                                            setIsBulkMode(false);
                                                            fetchProjects();
                                                        }
                                                    }
                                                }}
                                                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-rose-600 text-white border border-rose-500/20 shadow-lg shadow-rose-500/20 hover:bg-rose-700 transition-all animate-in zoom-in-95"
                                            >
                                                <Trash2 size={10} />
                                                <span>Smazat ({Object.keys(rowSelection).length})</span>
                                            </button>
                                        )}

                                        {Object.keys(rowSelection).length > 0 && (
                                            <button
                                                onClick={async () => {
                                                    const selectedProjects = filteredProjects.filter((_, idx) => rowSelection[idx]);
                                                    const count = selectedProjects.length;

                                                    if (confirm(`Opravdu změnit stav výroby na "Dokončeno" u ${count} položek?`)) {
                                                        const ids = selectedProjects.map(p => p.id);
                                                        const { error } = await supabase
                                                            .from('projects')
                                                            .update({ production_status: 'Dokončeno' })
                                                            .in('id', ids);

                                                        if (error) {
                                                            toast.error('Chyba: ' + error.message);
                                                        } else {
                                                            toast.success('Hromadná úprava dokončena');
                                                            setRowSelection({});
                                                            setIsBulkMode(false);
                                                            fetchProjects();
                                                        }
                                                    }
                                                }}
                                                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-all animate-in fade-in"
                                            >
                                                <PackageCheck size={10} />
                                                <span>Dokončit ({Object.keys(rowSelection).length})</span>
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setIsBulkMode(true)}
                                        className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border border-border bg-background text-muted-foreground hover:bg-muted transition-all"
                                        title="Zapne režim pro hromadné označování a mazání"
                                    >
                                        <CheckCircle2 size={10} />
                                        <span>Hromadné akce</span>
                                    </button>
                                )}

                                {/* Search */}
                                <div className="relative group max-w-xs flex-1" title="Hledat lze podle: Názvu, ID, Zákazníka, Manažera, Stavu, Výrobního čísla, Abra kódů a dalších vlastních polí.">
                                    <div className="flex items-center gap-1.5 w-full min-h-[30px] px-2.5 py-0.5 bg-muted/20 border border-border/60 rounded-lg focus-within:ring-1 focus-within:ring-primary/20 focus-within:border-primary/40 transition-all flex-wrap">
                                        <Search className="text-muted-foreground/50 group-focus-within:text-primary transition-colors flex-shrink-0" size={12} />

                                        {searchTags.map((tag, idx) => (
                                            <div key={idx} className="flex items-center gap-1 px-1.5 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-bold animate-in zoom-in-50 duration-200">
                                                <span>{tag}</span>
                                                <button onClick={() => removeTag(tag)} className="hover:text-destructive transition-colors">
                                                    <X size={8} />
                                                </button>
                                            </div>
                                        ))}

                                        <input
                                            type="text"
                                            placeholder={searchTags.length === 0 ? "Hledat..." : ""}
                                            className="flex-1 bg-transparent border-none outline-none text-[11px] font-medium placeholder:text-muted-foreground/50 min-w-[40px]"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                        />
                                    </div>
                                </div>
                            </div>
                        }
                        toolbar={<ExcelImporter onImportSuccess={fetchProjects} projectType={activeTab} />}
                        toolbarSubtext={lastImport ? (
                            <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground/70 font-medium">
                                <Database size={10} />
                                Poslední import: {lastImport.date} · {lastImport.user}
                            </span>
                        ) : null}
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
                            router.push(`/projekty/${row.id}`);
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

