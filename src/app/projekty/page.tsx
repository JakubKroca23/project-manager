'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';
import ExcelImporter from '@/components/ExcelImporter';
import { Loader2, Search, Database, X, ShieldAlert } from 'lucide-react';
import { DataTable } from '@/components/DataTable/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { useTableSettings } from '@/hooks/useTableSettings';
import { usePermissions } from '@/hooks/usePermissions';
import { toast } from 'sonner';

import { Project } from '@/types/project';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';


interface ImportInfo {
    date: string;
    user: string;
    count: number;
    excelDate: string;
}

const columns: ColumnDef<Project>[] = [
    {
        accessorKey: 'id',
        header: 'Kód',
        minSize: 30,
        cell: ({ row }) => <span>{row.getValue('id')}</span>,
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
        cell: ({ row }) => (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                {row.getValue('status')}
            </span>
        ),
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
        cell: ({ row }) => <span>{row.getValue('chassis_delivery') || '-'}</span>,
    },
    {
        accessorKey: 'body_delivery',
        header: 'Dodání Nástavby',
        minSize: 30,
        cell: ({ row }) => <span>{row.getValue('body_delivery') || '-'}</span>,
    },
    {
        accessorKey: 'customer_handover',
        header: 'Předání',
        minSize: 30,
        cell: ({ row }) => <span>{row.getValue('customer_handover') || '-'}</span>,
    },
    {
        accessorKey: 'abra_project',
        header: 'ABRA Zakázka',
        minSize: 30,
        cell: ({ row }) => <span>{row.getValue('abra_project') || '-'}</span>,
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
        cell: ({ row }) => <span>{row.getValue('closed_at') || '-'}</span>,
    },
    {
        accessorKey: 'serial_number',
        header: 'VIN / VČ',
        minSize: 30,
        cell: ({ row }) => <span>{row.getValue('serial_number') || '-'}</span>,
    },
];

export default function ProjektyPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const searchParams = useSearchParams();
    const typeParam = searchParams.get('type');
    const activeTab = (typeParam === 'military' ? 'military' : 'civil') as 'civil' | 'military';

    const [searchTerm, setSearchTerm] = useState('');
    const [searchTags, setSearchTags] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lastImport, setLastImport] = useState<ImportInfo | null>(null);
    const tableSettings = useTableSettings(`projects-${activeTab}`);
    const router = useRouter();
    const { checkPerm, isLoading: permsLoading } = usePermissions();

    // Permissions check
    useEffect(() => {
        if (!permsLoading) {
            const hasGeneralAccess = checkPerm('projects');
            const hasTypeAccess = activeTab === 'civil' ? checkPerm('projects_civil') : checkPerm('projects_military');

            if (!hasGeneralAccess) {
                toast.error('Přístup odepřen: Nemáte oprávnění k prohlížení projektů.');
                router.push('/');
            } else if (!hasTypeAccess) {
                toast.error(`Přístup odepřen: Nemáte oprávnění pro ${activeTab === 'civil' ? 'civilní' : 'armádní'} projekty.`);
                // If they have civil but are on military, or vice-versa, redirect to the one they HAVE
                if (activeTab === 'military' && checkPerm('projects_civil')) {
                    router.push('/projekty?type=civil');
                } else if (activeTab === 'civil' && checkPerm('projects_military')) {
                    router.push('/projekty?type=military');
                } else if (checkPerm('service')) {
                    router.push('/servis');
                } else {
                    router.push('/');
                }
            }
        }
    }, [permsLoading, activeTab, checkPerm, router]);

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
                p.mounting_company
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
                cell: ({ getValue }) => <span className="text-muted-foreground">{getValue() as string}</span>
            });
        });

        return [...columns, ...dynamicColumns];
    }, [projects]);

    return (
        <div className="h-full flex flex-col bg-background">
            {(isLoading || permsLoading) ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="animate-spin text-primary" size={24} />
                        <span className="text-[9px] font-bold uppercase tracking-widest opacity-50">Načítám prostředí...</span>
                    </div>
                </div>
            ) : (
                <div className="flex-1 overflow-hidden flex flex-col px-4">
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
                                            activeTab === 'military'
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

                                {/* Search */}
                                <div className="relative group max-w-xs flex-1" title="Hledat lze podle: Názvu, ID, Zákazníka, Manažera, Stavu, Výrobního čísla, Abra kódů a dalších vlastních polí.">
                                    <div className="flex items-center gap-1.5 w-full min-h-[30px] px-2.5 py-0.5 bg-muted/20 border border-border/60 rounded-lg focus-within:ring-1 focus-within:ring-primary/20 focus-within:border-primary/40 transition-all flex-wrap">
                                        <Search className="text-muted-foreground/50 group-focus-within:text-primary transition-colors flex-shrink-0" size={12} />

                                        {searchTags.map((tag, idx) => (
                                            <div key={idx} className="flex items-center gap-1 px-1.5 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-bold animate-in zoom-in-50 duration-200">
                                                <span>{tag}</span>
                                                <button
                                                    onClick={() => removeTag(tag)}
                                                    className="hover:text-destructive transition-colors"
                                                    title={`Odstranit filtr: ${tag}`}
                                                >
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
                                            title="Zadejte text pro vyhledávání"
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
                        onRowClick={(row) => router.push(`/projekty/${row.id}`)}
                        searchValue={searchTerm}
                        columnOrder={tableSettings.columnOrder}
                        onColumnOrderChange={tableSettings.setColumnOrder}
                        columnVisibility={tableSettings.columnVisibility}
                        onColumnVisibilityChange={tableSettings.setColumnVisibility}
                        sorting={tableSettings.sorting}
                        onSortingChange={tableSettings.setSorting}
                        columnSizing={tableSettings.columnSizing}
                        onColumnSizingChange={tableSettings.setColumnSizing}
                        headerClassName={activeTab === 'military' ? 'bg-emerald-100 text-emerald-900' : 'bg-blue-100 text-blue-900'}
                        getRowClassName={(row: Project) => {
                            if (row.project_type === 'military') return 'bg-emerald-500/5 hover:bg-emerald-500/10 active:bg-emerald-500/20';
                            if (row.project_type === 'service') return 'bg-purple-500/5 hover:bg-purple-500/10 active:bg-purple-500/20';
                            if (row.project_type === 'civil') return 'bg-blue-500/5 hover:bg-blue-500/10 active:bg-blue-500/20';
                            return '';
                        }}
                    />
                </div>
            )}
        </div>
    );
}

