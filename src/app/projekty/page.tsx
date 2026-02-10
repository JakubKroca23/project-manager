'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Search } from 'lucide-react';
import ExcelImporter from '@/components/ExcelImporter';

// Define Project type locally or import if shared (keeping it simple here based on schema)
interface Project {
    id: string;
    name: string;
    customer: string;
    manager: string;
    status: string;
    // ... add other fields if needed for display
}

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
                    <h1>Projekty</h1>
                    <p>Přehled všech aktivních projektů</p>
                </div>
                <div className="flex items-center gap-4">
                    <ExcelImporter onImportSuccess={fetchProjects} />

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Hledat projekt..."
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            <div className="card-glass flex-1 overflow-hidden">
                <div className="overflow-auto h-full">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                                <th className="p-4 border-b font-bold text-xs text-gray-500 uppercase">Kód</th>
                                <th className="p-4 border-b font-bold text-xs text-gray-500 uppercase">Název</th>
                                <th className="p-4 border-b font-bold text-xs text-gray-500 uppercase">Klient</th>
                                <th className="p-4 border-b font-bold text-xs text-gray-500 uppercase">Manažer</th>
                                <th className="p-4 border-b font-bold text-xs text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">Načítám data...</td>
                                </tr>
                            ) : filteredProjects.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">Žádné projekty nenalezeny. Zkuste importovat data z Excelu.</td>
                                </tr>
                            ) : (
                                filteredProjects.map((project) => (
                                    <tr key={project.id} className="hover:bg-gray-50 border-b last:border-0 text-sm">
                                        <td className="p-4 font-mono text-gray-600">{project.id}</td>
                                        <td className="p-4 font-medium">{project.name}</td>
                                        <td className="p-4 text-gray-600">{project.customer}</td>
                                        <td className="p-4 text-gray-600">{project.manager}</td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                                {project.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
