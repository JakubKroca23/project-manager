'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import ExcelImporter from '@/components/ExcelImporter';
import { DataTable } from '@/components/DataTable/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { useTableSettings } from '@/hooks/useTableSettings';

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
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/20">
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
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const tableSettings = useTableSettings('projects');

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

    // Universal filter – searches across ALL fields of each project
    const filteredProjects = projects.filter(p => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return Object.values(p).some(val =>
            val !== null && val !== undefined && String(val).toLowerCase().includes(term)
        );
    });

    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 overflow-hidden flex flex-col">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64 text-muted-foreground">Načítám data...</div>
                ) : (
                    <DataTable
                        columns={columns}
                        data={filteredProjects}
                        toolbar={<ExcelImporter onImportSuccess={fetchProjects} />}
                        searchValue={searchTerm}
                        onSearchChange={setSearchTerm}
                        columnOrder={tableSettings.columnOrder}
                        onColumnOrderChange={tableSettings.setColumnOrder}
                        columnVisibility={tableSettings.columnVisibility}
                        onColumnVisibilityChange={tableSettings.setColumnVisibility}
                        sorting={tableSettings.sorting}
                        onSortingChange={tableSettings.setSorting}
                    />
                )}
            </div>
        </div>
    );
}
