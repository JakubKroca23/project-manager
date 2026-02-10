'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Search } from 'lucide-react';
import ExcelImporter from '@/components/ExcelImporter';
import { DataTable } from '@/components/DataTable/DataTable';
import { ColumnDef } from '@tanstack/react-table';

interface Project {
    id: string;
    name: string;
    customer: string;
    manager: string;
    status: string;
    category?: string;
    abra_order?: string;
    abra_project?: string;
    deadline?: string;
    closed_at?: string;
    body_delivery?: string;
    customer_handover?: string;
    chassis_delivery?: string;
    production_status?: string;
    mounting_company?: string;
    body_setup?: string;
    serial_number?: string;
    created_at?: string;
}

const columns: ColumnDef<Project>[] = [
    {
        accessorKey: 'id',
        header: 'Kód',
        minSize: 40,
        cell: ({ row }) => <span className="font-mono font-medium">{row.getValue('id')}</span>,
    },
    {
        accessorKey: 'name',
        header: 'Název',
        minSize: 100,
        cell: ({ row }) => <div className="max-w-[200px] truncate font-medium" title={row.getValue('name')}>{row.getValue('name')}</div>,
    },
    {
        accessorKey: 'customer',
        header: 'Klient',
        minSize: 80,
        cell: ({ row }) => <div className="max-w-[150px] truncate text-muted-foreground" title={row.getValue('customer')}>{row.getValue('customer')}</div>,
    },
    {
        accessorKey: 'manager',
        header: 'Manažer',
        minSize: 60,
    },
    {
        accessorKey: 'status',
        header: 'Status',
        minSize: 70,
        cell: ({ row }) => (
            <span className="px-2 py-1 rounded-full text-xs font-bold bg-primary/20 text-primary border border-primary/20 whitespace-nowrap">
                {row.getValue('status')}
            </span>
        ),
    },
    {
        accessorKey: 'production_status',
        header: 'Status Výroby',
        minSize: 60,
    },
    {
        accessorKey: 'chassis_delivery',
        header: 'Dodání Podvozku',
        minSize: 60,
        cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.getValue('chassis_delivery') || '-'}</span>,
    },
    {
        accessorKey: 'body_delivery',
        header: 'Dodání Nástavby',
        minSize: 60,
        cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.getValue('body_delivery') || '-'}</span>,
    },
    {
        accessorKey: 'customer_handover',
        header: 'Předání',
        minSize: 60,
        cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.getValue('customer_handover') || '-'}</span>,
    },
    {
        accessorKey: 'abra_project',
        header: 'ABRA Zakázka',
        minSize: 60,
        cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.getValue('abra_project') || '-'}</span>,
    },
    {
        accessorKey: 'mounting_company',
        header: 'Montáž',
        minSize: 60,
    },
    {
        accessorKey: 'category',
        header: 'Kategorie',
        minSize: 60,
        cell: ({ row }) => <span className="text-muted-foreground">{row.getValue('category') || '-'}</span>,
    },
    {
        accessorKey: 'body_setup',
        header: 'Nastavení Nástavby',
        minSize: 70,
        cell: ({ row }) => <div className="max-w-[200px] truncate" title={row.getValue('body_setup')}>{row.getValue('body_setup') || '-'}</div>,
    },
    {
        accessorKey: 'closed_at',
        header: 'Uzavřeno',
        minSize: 50,
        cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.getValue('closed_at') || '-'}</span>,
    },
    {
        accessorKey: 'serial_number',
        header: 'VIN / VČ',
        minSize: 50,
        cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.getValue('serial_number') || '-'}</span>,
    },
];

export default function ProjektyPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

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
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const filteredProjects = projects.filter(p =>
        (p.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (p.id?.toString()?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (p.customer?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    return (
        <div className="dashboard-container">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Projekty</h1>
                    <p className="text-muted-foreground">Přehled všech aktivních projektů</p>
                </div>
                <div className="flex items-center gap-4">
                    <ExcelImporter onImportSuccess={fetchProjects} />

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input
                            type="text"
                            placeholder="Hledat projekt..."
                            className="h-10 pl-10 pr-4 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            <div className="card-glass flex-1 overflow-hidden flex flex-col p-4">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64 text-muted-foreground">Načítám data...</div>
                ) : (
                    <DataTable columns={columns} data={filteredProjects} />
                )}
            </div>
        </div>
    );
}
