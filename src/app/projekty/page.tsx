'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import ExcelImporter from '@/components/ExcelImporter';
import { Upload, Loader2, Search, Database, RefreshCcw, FileSpreadsheet, History, X } from 'lucide-react';
import { DataTable } from '@/components/DataTable/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { useTableSettings } from '@/hooks/useTableSettings';

import { Project } from '@/types/project';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

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
    const [searchTags, setSearchTags] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lastImport, setLastImport] = useState<ImportInfo | null>(null);
    const [lastUpdate, setLastUpdate] = useState<React.ReactNode>('-');
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

            // Find last database update from projects FOR THIS CATEGORY
            const categoryProjects = (data || []).filter(p => p.project_type === activeTab);
            if (categoryProjects.length > 0) {
                const latest = categoryProjects[0]; // Ordered by updated_at desc
                const date = new Date(latest.updated_at || latest.created_at).toLocaleString('cs-CZ');
                setLastUpdate(
                    <div className="flex flex-col leading-tight">
                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                            <span>{date}</span>
                            <span className="text-muted-foreground font-medium text-[10px] uppercase opacity-70">
                                {latest.last_modified_by || 'Neznámý'}
                            </span>
                        </div>
                        <Link href={`/projekty/${latest.id}`} className="text-[10px] text-muted-foreground/80 truncate max-w-[220px] hover:text-primary hover:underline transition-colors block" title={latest.name}>
                            {latest.name}
                        </Link>
                    </div>
                );
            } else {
                setLastUpdate('-');
            }
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

    // Universal filter – searches across ALL fields and respects active tab
    const filteredProjects = projects.filter(p => {
        // Tab filter
        if (p.project_type !== activeTab) return false;

        // Search filter (Tags + Current Input)
        const currentTerm = searchTerm.toLowerCase();
        const allTerms = [...searchTags.map(t => t.toLowerCase()), currentTerm].filter(t => t);

        if (allTerms.length === 0) return true;

        return allTerms.every(term =>
            Object.values(p).some(val =>
                val !== null && val !== undefined && String(val).toLowerCase().includes(term)
            )
        );
    });

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
                                <div className="relative group max-w-lg flex-1">
                                    <div className="flex items-center gap-2 w-full min-h-[36px] px-3 py-1 bg-muted/20 border border-border rounded-xl focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary transition-all flex-wrap">
                                        <Search className="text-muted-foreground group-focus-within:text-primary transition-colors flex-shrink-0" size={14} />

                                        {searchTags.map((tag, idx) => (
                                            <div key={idx} className="flex items-center gap-1.5 px-2 py-0.5 bg-primary/10 text-primary rounded-lg text-xs font-bold animate-in zoom-in-50 duration-200">
                                                <span>{tag}</span>
                                                <button onClick={() => removeTag(tag)} className="hover:text-destructive transition-colors">
                                                    <X size={10} />
                                                </button>
                                            </div>
                                        ))}

                                        <input
                                            type="text"
                                            placeholder={searchTags.length === 0 ? "Hledat..." : ""}
                                            className="flex-1 bg-transparent border-none outline-none text-xs font-medium placeholder:text-muted-foreground min-w-[60px]"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                        />
                                    </div>
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
                                        label="Poslední změna"
                                        value={lastUpdate}
                                    />
                                    <MetadataItem
                                        icon={<History size={13} />}
                                        label="Poslední import"
                                        value={lastImport ? `${lastImport.date} (${lastImport.user})` : '-'}
                                    />
                                </div>
                            </div>
                        }
                        toolbar={<ExcelImporter onImportSuccess={fetchProjects} projectType={activeTab} />}
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

function MetadataItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: React.ReactNode }) {
    return (
        <div className="flex items-center gap-2 group cursor-default">
            <div className="p-1.5 bg-muted/50 rounded-lg text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                {icon}
            </div>
            <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">{label}</span>
                <div className="text-[11px] font-bold text-foreground/80">{value}</div>
            </div>
        </div>
    );
}
