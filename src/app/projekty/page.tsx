'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import ExcelImporter from '@/components/ExcelImporter';
import { Upload, Loader2, Search, Database, RefreshCcw, FileSpreadsheet, History } from 'lucide-react';
import { DataTable } from '@/components/DataTable/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { useTableSettings } from '@/hooks/useTableSettings';

import { Project } from '@/types/project';
import { useRouter } from 'next/navigation';

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
    const [activeTab, setActiveTab] = useState<'civil' | 'military'>('civil');
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
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching projects:', error);
        } else {
            setProjects(data || []);

            // Find last database update
            if (data && data.length > 0) {
                const latest = data.reduce((max: string, p: any) => {
                    const current = p.updated_at || p.created_at;
                    return current > max ? current : max;
                }, data[0].updated_at || data[0].created_at);
                setLastUpdate(new Date(latest).toLocaleString('cs-CZ'));
            }
        }

        // Load Last Import Info
        const stored = localStorage.getItem('lastImportInfo');
        if (stored) {
            try {
                setLastImport(JSON.parse(stored));
            } catch { /* ignore */ }
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
            {/* Header Content Section */}
            <div className="px-6 mb-6 space-y-6">
                {/* 1. Tabs */}
                <div className="flex items-center gap-1 p-1 bg-muted/40 rounded-2xl border border-border/50 self-start">
                    <button
                        onClick={() => setActiveTab('civil')}
                        className={`px-8 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${activeTab === 'civil'
                            ? 'bg-card text-foreground shadow-lg shadow-black/5 ring-1 ring-border border-transparent scale-[1.02]'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                            }`}
                    >
                        Civilní Projekty
                    </button>
                    <button
                        onClick={() => setActiveTab('military')}
                        className={`px-8 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${activeTab === 'military'
                            ? 'bg-card text-indigo-500 shadow-lg shadow-indigo-600/5 ring-1 ring-indigo-500/20 scale-[1.02]'
                            : 'text-muted-foreground hover:text-indigo-500 hover:bg-muted/30'
                            }`}
                    >
                        Armádní Projekty
                    </button>
                </div>

                {/* 2. Search & Filter Bar */}
                <div className="space-y-4">
                    <div className="relative max-w-2xl group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Hledat napříč všemi projekty a sloupci..."
                            className="w-full h-12 pl-12 pr-6 bg-muted/30 border border-border rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary text-sm font-medium transition-all shadow-inner"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* 3. Metadata Row */}
                    <div className="flex flex-wrap items-center gap-6 px-2">
                        <MetadataItem
                            icon={<Database size={14} />}
                            label="Počet projektů"
                            value={`${filteredProjects.length}`}
                        />
                        <MetadataItem
                            icon={<RefreshCcw size={14} />}
                            label="Poslední aktualizace"
                            value={lastUpdate}
                        />
                        {lastImport && (
                            <>
                                <MetadataItem
                                    icon={<History size={14} />}
                                    label="Poslední import"
                                    value={lastImport.date}
                                />
                                <MetadataItem
                                    icon={<FileSpreadsheet size={14} />}
                                    label="Data Excelu"
                                    value={lastImport.excelDate}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64 text-muted-foreground">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="animate-spin text-primary" size={32} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Načítám data ze systému...</span>
                        </div>
                    </div>
                ) : (
                    <DataTable
                        columns={columns}
                        data={filteredProjects}
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
