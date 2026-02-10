'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import ExcelImporter from '@/components/ExcelImporter';
import { Upload, Loader2, Search, Database, RefreshCcw, FileSpreadsheet, History } from 'lucide-react';
import { DataTable } from '@/components/DataTable/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { useTableSettings } from '@/hooks/useTableSettings';

import { Project } from '@/types/project';
import { useRouter, useSearchParams } from 'next/navigation';

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
        minSize: 60,
        cell: ({ row }) => <span>{row.getValue('id')}</span>,
    },
    {
        accessorKey: 'name',
        header: 'Název',
        minSize: 120,
        cell: ({ row }) => <span className="font-medium">{row.getValue('name')}</span>,
    },
    {
        accessorKey: 'customer',
        header: 'Klient',
        minSize: 100,
    },
    {
        accessorKey: 'manager',
        header: 'Manažer',
        minSize: 100,
    },
    {
        accessorKey: 'status',
        header: 'Status',
        minSize: 80,
        cell: ({ row }) => (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                {row.getValue('status')}
            </span>
        ),
    },
    {
        accessorKey: 'production_status',
        header: 'Status Výroby',
        minSize: 120,
    },
    {
        accessorKey: 'chassis_delivery',
        header: 'Dodání Podvozku',
        minSize: 130,
        cell: ({ row }) => <span>{row.getValue('chassis_delivery') || '-'}</span>,
    },
    {
        accessorKey: 'body_delivery',
        header: 'Dodání Nástavby',
        minSize: 130,
        cell: ({ row }) => <span>{row.getValue('body_delivery') || '-'}</span>,
    },
    {
        accessorKey: 'customer_handover',
        header: 'Předání',
        minSize: 100,
        cell: ({ row }) => <span>{row.getValue('customer_handover') || '-'}</span>,
    },
    {
        accessorKey: 'abra_project',
        header: 'ABRA Zakázka',
        minSize: 120,
        cell: ({ row }) => <span>{row.getValue('abra_project') || '-'}</span>,
    },
    {
        accessorKey: 'mounting_company',
        header: 'Montáž',
        minSize: 100,
    },
    {
        accessorKey: 'category',
        header: 'Kategorie',
        minSize: 100,
    },
    {
        accessorKey: 'body_setup',
        header: 'Nastavení Nástavby',
        minSize: 150,
    },
    {
        accessorKey: 'closed_at',
        header: 'Uzavřeno',
        minSize: 50,
        cell: ({ row }) => <span>{row.getValue('closed_at') || '-'}</span>,
    },
    {
        accessorKey: 'serial_number',
        header: 'VIN / VČ',
        minSize: 50,
        cell: ({ row }) => <span>{row.getValue('serial_number') || '-'}</span>,
    },
];

export default function ProjektyPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const searchParams = useSearchParams();
    const typeParam = searchParams.get('type');
    const activeTab = (typeParam === 'military' ? 'military' : 'civil') as 'civil' | 'military';

    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [lastImport, setLastImport] = useState<ImportInfo | null>(null);
    const [lastUpdate, setLastUpdate] = useState<string>('-');
    const tableSettings = useTableSettings('projects');
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

            // Find last database update from projects
            if (data && data.length > 0) {
                const latest = data[0]; // Ordered by updated_at desc
                const date = new Date(latest.updated_at || latest.created_at).toLocaleString('cs-CZ');
                setLastUpdate(`${date} (${latest.last_modified_by || 'Neznámý'})`);
            }
        }

        // Load Global Import Metadata from DB
        const { data: metaData } = await supabase
            .from('app_metadata')
            .select('*')
            .eq('key', 'last_import_info')
            .single();

        if (metaData?.value) {
            setLastImport(metaData.value as ImportInfo);
        } else {
            // Fallback to localStorage if DB is empty
            const stored = localStorage.getItem('lastImportInfo');
            if (stored) {
                try { setLastImport(JSON.parse(stored)); } catch { /* ignore */ }
            }
        }

        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    // Universal filter – searches across ALL fields and respects active tab
    const filteredProjects = projects.filter(p => {
        // Tab filter
        if (p.project_type !== activeTab) return false;

        // Search filter
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return Object.values(p).some(val =>
            val !== null && val !== undefined && String(val).toLowerCase().includes(term)
        );
    });

    return (
        <div className="h-full flex flex-col pt-2 bg-background">
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
                        columns={columns}
                        data={filteredProjects}
                        leftToolbar={
                            <div className="flex items-center gap-6 w-full">
                                {/* Search component inside the unified row */}
                                <div className="relative group max-w-sm flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={14} />
                                    <input
                                        type="text"
                                        placeholder="Hledat..."
                                        className="w-full h-9 pl-9 pr-4 bg-muted/20 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary text-xs font-medium transition-all"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                {/* Enhanced Metadata */}
                                <div className="flex items-center gap-6">
                                    <MetadataItem
                                        icon={<Database size={13} />}
                                        label="Počet"
                                        value={`${filteredProjects.length}`}
                                    />
                                    <MetadataItem
                                        icon={<RefreshCcw size={13} />}
                                        label="Poslední úprava"
                                        value={lastUpdate}
                                    />
                                    {lastImport && (
                                        <MetadataItem
                                            icon={<History size={13} />}
                                            label="Poslední import"
                                            value={`${lastImport.date} (${lastImport.user})`}
                                        />
                                    )}
                                </div>
                            </div>
                        }
                        toolbar={<ExcelImporter onImportSuccess={fetchProjects} />}
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
                    />
                )}
            </div>
        </div>
    );
}

function MetadataItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div className="flex items-center gap-2 group cursor-default">
            <div className="p-1.5 bg-muted/50 rounded-lg text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                {icon}
            </div>
            <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">{label}</span>
                <span className="text-[11px] font-bold text-foreground/80">{value}</span>
            </div>
        </div>
    );
}
