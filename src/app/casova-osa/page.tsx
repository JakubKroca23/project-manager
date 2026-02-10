'use client';

import React, { useMemo, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { getMappedProjects } from '@/lib/data-utils';
import { projectsToGanttTasks, GanttTask } from '@/types/gantt';
import { Search, ZoomIn, ZoomOut, Calendar } from 'lucide-react';
import ErrorBoundary from '@/components/ErrorBoundary';

import { CustomGantt } from '@/components/CustomGantt';

type ZoomLevel = 'day' | 'week' | 'month';

// Barevné schéma podle fáze projektu
const getTaskColor = (phase?: string): string => {
    switch (phase) {
        case 'preparation': return '#22c55e'; // zelená
        case 'assembly': return '#eab308'; // žlutá
        case 'final': return '#f97316'; // oranžová
        case 'delayed': return '#ef4444'; // červená
        case 'completed': return '#a855f7'; // fialová
        default: return '#6b7280'; // šedá
    }
};

export default function CasovaOsaPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('week');
    const [isClient, setIsClient] = useState(false);

    // Hydration fix
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Načtení a transformace dat
    const projects = useMemo(() => getMappedProjects(), []);
    const allTasks = useMemo(() => projectsToGanttTasks(projects), [projects]);

    // Filtrace podle vyhledávání
    const filteredTasks = useMemo(() => {
        if (!searchQuery) return allTasks;
        const query = searchQuery.toLowerCase();
        return allTasks.filter(task =>
            task.text.toLowerCase().includes(query) ||
            task.customer?.toLowerCase().includes(query) ||
            String(task.id).toLowerCase().includes(query)
        );
    }, [allTasks, searchQuery]);

    // Konfigurace pro Gantt
    const scales = useMemo(() => {
        switch (zoomLevel) {
            case 'day':
                return [
                    { unit: 'month' as const, step: 1, format: 'MMMM yyyy' },
                    { unit: 'day' as const, step: 1, format: 'd' }
                ];
            case 'week':
                return [
                    { unit: 'month' as const, step: 1, format: 'MMMM yyyy' },
                    { unit: 'week' as const, step: 1, format: "'Týden' w" }
                ];
            case 'month':
                return [
                    { unit: 'year' as const, step: 1, format: 'yyyy' },
                    { unit: 'month' as const, step: 1, format: 'MMMM' }
                ];
            default:
                return [
                    { unit: 'month' as const, step: 1, format: 'MMMM yyyy' },
                    { unit: 'week' as const, step: 1, format: "'Týden' w" }
                ];
        }
    }, [zoomLevel]);

    // Transformace do formátu SVAR Gantt (užívaný Custom komponentou)
    const ganttTasks = useMemo(() => {
        return filteredTasks.map(task => ({
            id: task.id,
            text: task.text,
            start: task.start,
            end: task.end,
            progress: task.progress || 0,
            type: task.type || 'task',
            details: task.details,
            phase: task.phase, // Added phase
            customer: task.customer // Added customer
        }));
    }, [filteredTasks]);

    // Sloupce pro Gantt
    const columns = [
        { id: 'text', header: 'Projekt', width: 280 }
    ];

    // Legenda
    const legendItems = [
        { color: '#22c55e', label: 'Příprava' },
        { color: '#eab308', label: 'Montáž' },
        { color: '#f97316', label: 'Finále' },
        { color: '#ef4444', label: 'Zpoždění' },
        { color: '#a855f7', label: 'Předáno' }
    ];

    if (!isClient) {
        return (
            <div className="dashboard-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Načítání časové osy...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {/* Header */}
            <div className="table-header-actions" style={{ marginBottom: '1rem' }}>
                <div className="search-in-table" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Search
                            size={16}
                            className="text-secondary"
                            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                        />
                        <input
                            type="text"
                            placeholder="Hledat projekt..."
                            className="table-search-input"
                            style={{ paddingLeft: '40px', width: '250px' }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Legenda */}
                    <div className="timeline-legend">
                        <div className="legend-section">
                            {legendItems.map(item => (
                                <div key={item.label} className="legend-item">
                                    <div
                                        className="legend-box"
                                        style={{ backgroundColor: item.color }}
                                    ></div>
                                    <span>{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Zoom controls */}
                <div className="zoom-controls">
                    <button
                        onClick={() => setZoomLevel('day')}
                        className={`zoom-btn ${zoomLevel === 'day' ? 'active' : ''}`}
                    >
                        Den
                    </button>
                    <button
                        onClick={() => setZoomLevel('week')}
                        className={`zoom-btn ${zoomLevel === 'week' ? 'active' : ''}`}
                    >
                        Týden
                    </button>
                    <button
                        onClick={() => setZoomLevel('month')}
                        className={`zoom-btn ${zoomLevel === 'month' ? 'active' : ''}`}
                    >
                        Měsíc
                    </button>
                </div>
            </div>

            {/* Statistiky */}
            <div className="gantt-stats">
                <div className="stat-item">
                    <span className="stat-value">{filteredTasks.length}</span>
                    <span className="stat-label">Projektů</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value">{filteredTasks.filter(t => t.phase === 'preparation').length}</span>
                    <span className="stat-label">V přípravě</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value">{filteredTasks.filter(t => t.phase === 'assembly' || t.phase === 'final').length}</span>
                    <span className="stat-label">V realizaci</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value">{filteredTasks.filter(t => t.phase === 'delayed').length}</span>
                    <span className="stat-label">Zpožděných</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value">{filteredTasks.filter(t => t.phase === 'completed').length}</span>
                    <span className="stat-label">Dokončených</span>
                </div>
            </div>

            {/* Gantt Chart */}
            <div className="gantt-container" style={{ minHeight: '500px', position: 'relative' }}>
                <ErrorBoundary
                    fallback={
                        <div className="p-8 text-center border-2 border-dashed border-red-200 rounded-xl bg-red-50">
                            <h3 className="text-lg font-bold text-red-600 mb-2">Chyba při načítání grafu</h3>
                            <p className="text-red-500 mb-4">Komponentu časové osy se nepodařilo načíst.</p>
                            <p className="text-xs text-gray-500">Zkuste stránku obnovit nebo kontaktujte podporu.</p>
                        </div>
                    }
                >
                    {/* Custom Gantt Implementation */}
                    <CustomGantt
                        tasks={ganttTasks}
                        zoomLevel={zoomLevel}
                    />
                    {/* <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                        <p className="text-gray-500">Gantt chart temporarily disabled for debugging.</p>
                    </div> */}
                </ErrorBoundary>
            </div>
        </div>
    );
}
