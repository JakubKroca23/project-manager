'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo, useLayoutEffect } from 'react';
import './Timeline.css';
import { supabase } from '@/lib/supabase/client';
import { Project } from '@/types/project';
import TimelineGrid from './TimelineGrid';
import TimelineBar from './TimelineBar';
import {
    Search, Calendar, ZoomIn,
    ZoomOut,
    Palette,
    X,
    RotateCcw,
    ChevronDown,
    ChevronRight,
    Truck,
    Hammer,
    ThumbsUp,
    AlertTriangle
} from 'lucide-react';
import Link from 'next/link';

// Rozsah plynulého zoomu (šířka dne v px)
const MIN_DAY_WIDTH = 2;   // Roční přehled
const MAX_DAY_WIDTH = 120; // Maximální detail
const DEFAULT_DAY_WIDTH = 25;

const parseDate = (dateStr: string | undefined): Date | null => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
};

interface IColorConfig {
    color: string;
    opacity: number;
    label: string;
}

interface IColorsState {
    phaseInitial: IColorConfig;
    phaseMounting: IColorConfig;
    phaseBufferYellow: IColorConfig;
    phaseBufferOrange: IColorConfig;
    phaseService: IColorConfig;
    milestoneChassis: IColorConfig;
    milestoneBody: IColorConfig;
    milestoneHandover: IColorConfig;
    milestoneDeadline: IColorConfig;
    milestoneServiceStart: IColorConfig;
    milestoneServiceEnd: IColorConfig;
}

interface IOutlineState {
    enabled: boolean;
    width: number;
    color: string;
    opacity: number;
}

interface IServiceLanesResult {
    lanes: Project[][];
    serviceMap: Map<string, { lane: number }>;
}

const Timeline: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTypes, setActiveTypes] = useState<Record<string, boolean>>({
        civil: true,
        military: true,
        service: true
    });


    const toggleType = (type: string) => {
        setActiveTypes((prev: Record<string, boolean>) => ({ ...prev, [type]: !prev[type] }));
    };

    const [dayWidth, setDayWidth] = useState(DEFAULT_DAY_WIDTH);
    const [isLoading, setIsLoading] = useState(true);
    const [rowHeight, setRowHeight] = useState(32);

    // Color Configuration State
    const [showColorEditor, setShowColorEditor] = useState(false);
    const [colors, setColors] = useState<IColorsState>({
        phaseInitial: { color: '#bae6fd', opacity: 0.4, label: 'Zahájení' },
        phaseMounting: { color: '#4ade80', opacity: 0.35, label: 'Příprava' },
        phaseBufferYellow: { color: '#facc15', opacity: 0.5, label: 'Montáž' },
        phaseBufferOrange: { color: '#fb923c', opacity: 0.55, label: 'Revize' },
        phaseService: { color: '#ce93d8', opacity: 0.35, label: 'Servis' },
        milestoneChassis: { color: '#f97316', opacity: 1, label: 'Podvozek' },
        milestoneBody: { color: '#a855f7', opacity: 1, label: 'Nástavba' },
        milestoneHandover: { color: '#3b82f6', opacity: 1, label: 'Předání' },
        milestoneDeadline: { color: '#ef4444', opacity: 1, label: 'Deadline' },
        milestoneServiceStart: { color: '#ef4444', opacity: 1, label: 'Zahájení servisu' },
        milestoneServiceEnd: { color: '#b91c1c', opacity: 1, label: 'Ukončení servisu' },
    });

    const [outline, setOutline] = useState<IOutlineState>({ enabled: true, width: 1, color: '#000000', opacity: 0.2 });

    const hexToRgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const headerHeight = dayWidth > 12 ? 66 : 42;

    const customStyles = {
        '--timeline-header-height': `${headerHeight}px`,
        '--timeline-sector-height': '36px',
        '--phase-initial': hexToRgba(colors.phaseInitial.color, colors.phaseInitial.opacity),
        '--phase-mounting': hexToRgba(colors.phaseMounting.color, colors.phaseMounting.opacity),
        '--phase-buffer-yellow': hexToRgba(colors.phaseBufferYellow.color, colors.phaseBufferYellow.opacity),
        '--phase-buffer-orange': hexToRgba(colors.phaseBufferOrange.color, colors.phaseBufferOrange.opacity),
        '--phase-service': hexToRgba(colors.phaseService.color, colors.phaseService.opacity),
        '--milestone-chassis': colors.milestoneChassis.color,
        '--milestone-body': colors.milestoneBody.color,
        '--milestone-handover': colors.milestoneHandover.color,
        '--milestone-deadline': colors.milestoneDeadline.color,
        '--milestone-service-start': colors.milestoneServiceStart.color,
        '--milestone-service-end': colors.milestoneServiceEnd.color,
        '--element-border': outline.enabled ? `${outline.width}px solid ${hexToRgba(outline.color, outline.opacity)}` : 'none',
        '--row-height': `${rowHeight}px`,
        '--timeline-row-height': `${rowHeight}px`,
        '--day-width': `${dayWidth}px`, // Added for dynamic CSS grid line calculation
    } as React.CSSProperties;

    const resetColors = () => {
        setColors({
            phaseInitial: { color: '#bae6fd', opacity: 0.4, label: 'Zahájení' },
            phaseMounting: { color: '#4ade80', opacity: 0.35, label: 'Příprava' },
            phaseBufferYellow: { color: '#facc15', opacity: 0.5, label: 'Montáž' },
            phaseBufferOrange: { color: '#fb923c', opacity: 0.55, label: 'Revize' },
            milestoneChassis: { color: '#f97316', opacity: 1, label: 'Podvozek' },
            milestoneBody: { color: '#a855f7', opacity: 1, label: 'Nástavba' },
            milestoneHandover: { color: '#3b82f6', opacity: 1, label: 'Předání' },
            milestoneDeadline: { color: '#ef4444', opacity: 1, label: 'Deadline' },
            phaseService: { color: '#ce93d8', opacity: 0.35, label: 'Servis' },
            milestoneServiceStart: { color: '#ce93d8', opacity: 1, label: 'Zahájení servisu' },
            milestoneServiceEnd: { color: '#7b1fa2', opacity: 1, label: 'Ukončení servisu' },
        });
        setOutline({ enabled: true, width: 1, color: '#000000', opacity: 0.2 });
    };

    // Ref pro aktuální dayWidth pro event listenery
    const dayWidthRef = useRef(dayWidth);
    useEffect(() => {
        dayWidthRef.current = dayWidth;
    }, [dayWidth]);

    // Ref pro uchování pozice pro zoom
    const zoomFocus = useRef<{ pointDays: number; pixelOffset: number } | null>(null);

    // Časový rozsah 2025 - 2027
    const timelineRange = useMemo(() => {
        const start = new Date(2025, 0, 1); // 1. 1. 2025
        const end = new Date(2027, 11, 31); // 31. 12. 2027
        return { start, end };
    }, []);

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Restore scroll position after zoom
    useLayoutEffect(() => {
        if (zoomFocus.current && scrollContainerRef.current) {
            const { pointDays, pixelOffset } = zoomFocus.current;
            const newScrollLeft = pointDays * dayWidth - pixelOffset;
            scrollContainerRef.current.scrollLeft = newScrollLeft;
            zoomFocus.current = null;
        }
    }, [dayWidth]);

    // DRAG SCROLL & INERTIA LOGIC
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startY, setStartY] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [scrollTop, setScrollTop] = useState(0);

    // Physics refs
    const velocity = useRef({ x: 0, y: 0 });
    const lastPos = useRef({ x: 0, y: 0 });
    const lastTime = useRef(0);
    const requestRef = useRef<number>(0);
    const isDraggingRef = useRef(false); // Ref for immediate access in loop

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!scrollContainerRef.current) return;

        // Stop any current inertia
        cancelAnimationFrame(requestRef.current);

        setIsDragging(true);
        isDraggingRef.current = true;

        setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
        setStartY(e.pageY - scrollContainerRef.current.offsetTop);
        setScrollLeft(scrollContainerRef.current.scrollLeft);
        scrollContainerRef.current.classList.add('is-dragging');
    };


    const handleMouseLeave = () => {
        if (isDragging) {
            endDrag();
        }
    };

    const handleMouseUp = () => {
        endDrag();
    };

    const endDrag = () => {
        if (!isDragging) return;

        setIsDragging(false);
        isDraggingRef.current = false;
        if (scrollContainerRef.current) {
            scrollContainerRef.current.classList.remove('is-dragging');
        }

        if (scrollContainerRef.current) {
            scrollContainerRef.current.classList.remove('is-dragging');
        }
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        // Update scrollTop for animations
        // Use rAF to avoid thrashing
        const top = e.currentTarget.scrollTop;
        requestAnimationFrame(() => {
            setScrollTop(top);
        });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !scrollContainerRef.current) return;
        e.preventDefault();

        const x = e.pageX - scrollContainerRef.current.offsetLeft;
        const walkX = (x - startX);

        scrollContainerRef.current.scrollLeft = scrollLeft - walkX;
        // scrollContainerRef.current.scrollTop = scrollTop - walkY; // Disabled vertical drag
    };



    // Cleanup on unmount
    useEffect(() => {
        return () => cancelAnimationFrame(requestRef.current);
    }, []);

    // Zoom handlers
    const handleZoomIn = () => {
        const currentWidth = dayWidth;
        const next = Math.min(currentWidth * 1.2, MAX_DAY_WIDTH);

        if (next !== currentWidth && scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const offset = container.clientWidth / 2;
            const pointDays = (container.scrollLeft + offset) / currentWidth;
            zoomFocus.current = { pointDays, pixelOffset: offset };
            setDayWidth(next);
        }
    };

    const handleZoomOut = () => {
        const currentWidth = dayWidth;
        const next = Math.max(currentWidth / 1.2, MIN_DAY_WIDTH);

        if (next !== currentWidth && scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const offset = container.clientWidth / 2;
            const pointDays = (container.scrollLeft + offset) / currentWidth;
            zoomFocus.current = { pointDays, pixelOffset: offset };
            setDayWidth(next);
        }
    };



    // SMOOTH WHEEL ZOOM LOGIC (Mouse Wheel)
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            const target = e.target as Element;

            // Handle vertical zoom on left column
            if (target.closest('.project-info-sticky')) {
                e.preventDefault();
                e.stopPropagation();
                const delta = e.deltaY > 0 ? -2 : 2;
                setRowHeight((prev: number) => Math.min(Math.max(prev + delta, 14), 100));
                return;
            }

            // Check if hovering over the timeline header area (months/weeks/days)
            const isOverHeader = target.closest('.timeline-grid-header-multi') || target.closest('.timeline-header-actions');

            if (e.ctrlKey || isOverHeader) {
                // If Ctrl is pressed OR we are over the header -> ZOOM
                e.preventDefault();

                // NATIVE ZOOM (Day Width) - logic shared
                const delta = e.deltaY > 0 ? 0.9 : 1.1; // Zoom out/in

                // Jemnější faktor zoomu pokud jsme jen nad headerem bez Ctrl
                const effectiveDelta = !e.ctrlKey && isOverHeader ? (e.deltaY > 0 ? 0.95 : 1.05) : delta;

                const newWidth = Math.max(MIN_DAY_WIDTH, Math.min(MAX_DAY_WIDTH, dayWidthRef.current * effectiveDelta));

                // Calculate mouse position relative to timeline start for centering zoom
                const rect = container.getBoundingClientRect();
                // If zooming via header, we might want to center on mouse X
                // But we need to account for sticky column width (250px) if we are in the scrollable area
                // Actually, the mouseX relative to container content is what matters.

                let mouseX = e.clientX - rect.left;

                // Adjust for sticky column if we are not over it
                // Container scrollLeft starts after the sticky column visually, but logically includes it?
                // No, the sticky column is inside the container. 
                // Let's rely on scrollLeft + offset.

                const scrollLeft = container.scrollLeft;
                const pointDays = (scrollLeft + mouseX) / dayWidthRef.current;

                setDayWidth(newWidth);

                // Prepare restore scroll
                zoomFocus.current = {
                    pointDays: pointDays,
                    pixelOffset: mouseX
                };
                return;
            }

            // Otherwise, default scrolling behavior (Vertical Scroll)
            // Shift = Horizontal Scroll (Native)
            if (e.shiftKey) return;

            // Allow default vertical scroll
            return;
        };

        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => container.removeEventListener('wheel', handleWheel);
    }, [isLoading]);

    const fetchProjects = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProjects(data || []);
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    // Helper pro řazení
    const getLatestMilestoneDate = (project: Project): number => {
        const dates = [
            project.deadline,
            project.customer_handover,
            project.body_delivery,
            project.chassis_delivery
        ]
            .map(d => parseDate(d)?.getTime())
            .filter((t): t is number => t !== undefined && !isNaN(t));

        return dates.length > 0 ? Math.max(...dates) : 0;
    };

    const filteredProjects = useMemo((): Project[] => {
        let filtered = projects;

        // Filtr podle aktivních typů
        filtered = filtered.filter((p: Project) => {
            const type = p.project_type || 'civil';
            return activeTypes[type] === true;
        });

        // Helper pro normalizaci (odstranění diakritiky)
        const normalize = (str: string) =>
            str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

        const query = normalize(searchQuery.trim());

        if (query) {
            const terms = query.split(/\s+/);
            filtered = filtered.filter((p: Project) => {
                const searchTerms = [
                    p.name,
                    p.customer,
                    p.id,
                    p.abra_project,
                    p.abra_order,
                    p.serial_number
                ].map(term => normalize(term || ''));

                const searchStr = searchTerms.join(' ');
                return terms.every((term: string) => searchStr.includes(term));
            });
        }

        // Řazení: Servisy nahoru (pro filteredProjects.some), pak nejdále v budoucnosti nahoře.
        return filtered.sort((a: Project, b: Project) => {
            if (a.project_type === 'service' && b.project_type !== 'service') return -1;
            if (a.project_type !== 'service' && b.project_type === 'service') return 1;

            const dateA = getLatestMilestoneDate(a);
            const dateB = getLatestMilestoneDate(b);
            return dateB - dateA;
        });
    }, [projects, searchQuery, activeTypes]);

    // Grupa projektů do sektorů
    const sectorizedProjects = useMemo(() => {
        const services = filteredProjects.filter(p => p.project_type === 'service');
        const civil = filteredProjects.filter(p => p.project_type === 'civil');
        const military = filteredProjects.filter(p => p.project_type === 'military');

        return [
            { id: 'service', label: 'SERVISY', projects: services, color: '#ce93d8' },
            { id: 'civil', label: 'CIVILNÍ ZAKÁZKY', projects: civil, color: '#90caf9' },
            { id: 'military', label: 'ARMÁDNÍ ZAKÁZKY', projects: military, color: '#a5d6a7' }
        ];
    }, [filteredProjects]);

    const jumpToToday = () => {
        if (scrollContainerRef.current) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const diffDays = Math.floor((today.getTime() - timelineRange.start.getTime()) / (1000 * 60 * 60 * 24));

            scrollContainerRef.current.scrollTo({
                left: diffDays * dayWidth - 400,
                behavior: 'smooth'
            });
        }
    };

    useEffect(() => {
        if (!isLoading && scrollContainerRef.current) {
            setTimeout(jumpToToday, 100);
        }
    }, [isLoading]);

    const isCompact = dayWidth < 18;

    if (isLoading) {
        return (
            <div className="timeline-container">
                <div className="timeline-loading-spinner">Načítám časovou osu...</div>
            </div>
        );
    }
    return (
        <div className={`timeline-container ${isCompact ? 'mode-compact' : ''}`} style={customStyles}>
            <header className="timeline-header-actions relative">
                <div className="header-left">
                    <div className="search-container">
                        <Search size={16} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Hledat..."
                            className="search-input"
                            value={searchQuery}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="type-filters flex items-center gap-4 ml-6">
                        {[
                            { id: 'service', label: 'Servis', color: '#ef4444' }, // Red for Service
                            { id: 'civil', label: 'Civilní', color: '#3b82f6' },
                            { id: 'military', label: 'Armáda', color: '#10b981' }
                        ].map(({ id, label, color }) => (
                            <label
                                key={id}
                                className="flex items-center gap-2 cursor-pointer group select-none"
                            >
                                <div className="relative flex items-center justify-center">
                                    <input
                                        type="checkbox"
                                        checked={activeTypes[id]}
                                        onChange={() => toggleType(id)}
                                        className="peer appearance-none w-4 h-4 border-2 rounded transition-all"
                                        style={{
                                            borderColor: activeTypes[id] ? color : 'var(--border)',
                                            backgroundColor: activeTypes[id] ? color : 'transparent'
                                        }}
                                    />
                                    <div className={`absolute w-2.5 h-2.5 text-white flex items-center justify-center transition-all ${activeTypes[id] ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </div>
                                </div>
                                <span
                                    className="text-[10px] font-bold uppercase tracking-wider transition-colors"
                                    style={{ color: activeTypes[id] ? color : 'var(--muted-foreground)' }}
                                >
                                    {label}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="timeline-legend">
                    <div className="legend-group">
                        <span className="legend-group-title">Milníky:</span>
                        <div className="legend-item"><div className="legend-color dot" style={{ backgroundColor: 'var(--milestone-chassis)' }}><Truck size={8} /></div> Podvozek</div>
                        <div className="legend-item"><div className="legend-color dot" style={{ backgroundColor: 'var(--milestone-body)' }}><Hammer size={8} /></div> Nástavba</div>
                        <div className="legend-item"><div className="legend-color dot" style={{ backgroundColor: 'var(--milestone-handover)' }}><ThumbsUp size={8} /></div> Předání</div>
                        <div className="legend-item"><div className="legend-color dot" style={{ backgroundColor: 'var(--milestone-deadline)' }}><AlertTriangle size={8} /></div> Deadline</div>
                    </div>
                    <div className="legend-group">
                        <span className="legend-group-title">Fáze:</span>
                        <div className="legend-item"><div className="legend-color" style={{ backgroundColor: 'var(--phase-initial)' }}></div> Zahájení</div>
                        <div className="legend-item"><div className="legend-color" style={{ backgroundColor: 'var(--phase-mounting)' }}></div> Příprava</div>
                        <div className="legend-item"><div className="legend-color" style={{ backgroundColor: 'var(--phase-buffer-yellow)' }}></div> Montáž</div>
                        <div className="legend-item"><div className="legend-color" style={{ backgroundColor: 'var(--phase-buffer-orange)' }}></div> Revize</div>
                        <div className="legend-item"><div className="legend-color" style={{ backgroundColor: 'var(--phase-service)', border: '1px dashed rgba(59, 130, 246, 0.4)' }}></div> Servis</div>
                    </div>
                </div>

                <div className="header-right flex items-center gap-4">
                    <button
                        className={`action-button ${showColorEditor ? 'active' : ''}`}
                        onClick={() => setShowColorEditor(!showColorEditor)}
                        title="Upravit barvy"
                    >
                        <Palette size={16} />
                    </button>

                    {showColorEditor && (
                        <div className="absolute top-14 right-4 z-[100] w-80 bg-background border border-border shadow-xl rounded-lg p-4 animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center mb-4 border-b border-border pb-2">
                                <h3 className="font-bold text-sm">Nastavení barev</h3>
                                <div className="flex items-center gap-2">
                                    <button onClick={resetColors} title="Resetovat" className="hover:bg-muted p-1 rounded">
                                        <RotateCcw size={14} className="text-muted-foreground" />
                                    </button>
                                    <button onClick={() => setShowColorEditor(false)} className="hover:bg-muted p-1 rounded">
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                                <div className="space-y-2">
                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase">Fáze</h4>
                                    {Object.entries(colors).filter(([key]) => key.startsWith('phase')).map(([key, config]) => (
                                        <div key={key} className="flex flex-col gap-1 p-2 rounded bg-muted/30">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-medium">{config.label}</span>
                                                <input
                                                    type="color"
                                                    value={config.color}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                        const newVal = e.target.value;
                                                        setColors((prev: IColorsState) => ({
                                                            ...prev,
                                                            [key]: { ...config, color: newVal }
                                                        }));
                                                    }}
                                                    className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <span>Opacita:</span>
                                                <input
                                                    type="range"
                                                    min="0.1"
                                                    max="1"
                                                    step="0.05"
                                                    value={config.opacity}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                        const newVal = parseFloat(e.target.value);
                                                        setColors((prev: IColorsState) => ({
                                                            ...prev,
                                                            [key]: { ...config, opacity: newVal }
                                                        }));
                                                    }}
                                                    className="flex-1 h-1 bg-muted-foreground/30 rounded-lg appearance-none cursor-pointer"
                                                />
                                                <span className="w-8 text-right">{Math.round(config.opacity * 100)}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase">Milníky</h4>
                                    {Object.entries(colors).filter(([key]) => key.startsWith('milestone')).map(([key, config]) => (
                                        <div key={key} className="flex justify-between items-center p-2 rounded bg-muted/30">
                                            <span className="text-xs font-medium">{config.label}</span>
                                            <input
                                                type="color"
                                                value={config.color}
                                                onChange={(e) => setColors(prev => ({ ...prev, [key]: { ...prev[key as keyof typeof colors], color: e.target.value } }))}
                                                className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="space-y-2 pt-4 mt-2 border-t border-border">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-xs font-semibold text-muted-foreground uppercase">Obrys prvků</h4>
                                        <input
                                            type="checkbox"
                                            checked={outline.enabled}
                                            onChange={(e) => setOutline(prev => ({ ...prev, enabled: e.target.checked }))}
                                            className="accent-primary"
                                        />
                                    </div>

                                    {outline.enabled && (
                                        <div className="flex flex-col gap-2 p-2 rounded bg-muted/30">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-medium">Barva</span>
                                                <input
                                                    type="color"
                                                    value={outline.color}
                                                    onChange={(e) => setOutline(prev => ({ ...prev, color: e.target.value }))}
                                                    className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                                                />
                                            </div>

                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <span>Šířka:</span>
                                                <input
                                                    type="range"
                                                    min="1"
                                                    max="5"
                                                    step="1"
                                                    value={outline.width}
                                                    onChange={(e) => setOutline(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                                                    className="flex-1 h-1 bg-muted-foreground/30 rounded-lg appearance-none cursor-pointer"
                                                />
                                                <span className="w-8 text-right">{outline.width}px</span>
                                            </div>

                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <span>Opacita:</span>
                                                <input
                                                    type="range"
                                                    min="0.1"
                                                    max="1"
                                                    step="0.05"
                                                    value={outline.opacity}
                                                    onChange={(e) => setOutline(prev => ({ ...prev, opacity: parseFloat(e.target.value) }))}
                                                    className="flex-1 h-1 bg-muted-foreground/30 rounded-lg appearance-none cursor-pointer"
                                                />
                                                <span className="w-8 text-right">{Math.round(outline.opacity * 100)}%</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="zoom-controls flex items-center gap-1 bg-muted/30 p-1 rounded-lg border border-border/50">
                        <button
                            className="action-button icon-only"
                            onClick={handleZoomOut}
                            title="Oddálit"
                        >
                            <ZoomOut size={16} />
                        </button>
                        <span className="text-xs font-mono text-muted-foreground min-w-[30px] text-center select-none">
                            {Math.round((dayWidth / 25) * 100)}%
                        </span>
                        <button
                            className="action-button icon-only"
                            onClick={handleZoomIn}
                            title="Přiblížit"
                        >
                            <ZoomIn size={16} />
                        </button>
                    </div>
                    <button
                        className="action-button primary"
                        onClick={jumpToToday}
                        title="Skočit na dnešek"
                    >
                        <Calendar size={14} />
                        <span className="hidden lg:inline">Dnešek</span>
                    </button>
                </div>
            </header>

            <div
                className="timeline-scroll-wrapper"
                ref={scrollContainerRef}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onScroll={handleScroll}
            >
                <div className="timeline-content">
                    <TimelineGrid
                        startDate={timelineRange.start}
                        endDate={timelineRange.end}
                        dayWidth={dayWidth}
                    >
                        <div className="timeline-rows">
                            <div className="timeline-rows">
                                {(() => {
                                    const visibleSectors = sectorizedProjects.filter(
                                        sector => activeTypes[sector.id] && sector.projects.length > 0
                                    );

                                    const renderSectorRecursively = (index: number): React.ReactNode => {
                                        if (index >= visibleSectors.length) return null;

                                        const sector = visibleSectors[index];
                                        const topOffset = `calc(var(--timeline-header-height) + (${index} * var(--timeline-sector-height)))`;
                                        return (
                                            <div key={sector.id} className="timeline-sector-stack" style={{ position: 'relative' }}>
                                                {/* HEADER */}
                                                <div
                                                    className="timeline-sector-header-row group/header"
                                                    style={{
                                                        background: `color-mix(in srgb, ${sector.color} 4%, white)`, // Opaque background to hide scrolling content
                                                        top: topOffset,
                                                        zIndex: 145 - index
                                                    }}
                                                >
                                                    <div
                                                        className="project-info-sticky sector-header"
                                                        style={{
                                                            borderLeft: `6px solid ${sector.color}`,
                                                            background: `color-mix(in srgb, ${sector.color} 15%, white)`,
                                                            height: 'var(--timeline-sector-height)'
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'space-between', padding: '0 4px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                <span className="sector-label uppercase text-[10px] font-black tracking-tight" style={{ color: sector.color }}>
                                                                    {sector.label}
                                                                </span>
                                                                <span className="text-[10px] text-muted-foreground font-mono opacity-90" style={{ fontWeight: 'bold' }}>
                                                                    ({sector.projects.length})
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="sector-grid-line" />

                                                    {/* HOT ZONES - CONDITIONAL VISIBILITY */}
                                                    <div className="absolute inset-0 pointer-events-none hot-zones-container">
                                                        {sector.projects.map(project => {
                                                            // Calculate Threshold:
                                                            // StartY of this row (relative to content top)
                                                            // - StickyBottom position

                                                            // We basically need to know the index of this project in the global list of rows? 
                                                            // No, we can calculate it relative to this sector.
                                                            // Flow Y position:
                                                            // MainHeader (H_main)
                                                            // + Sum of previous sectors (Header + Rows) -> Let's approximate or compute.

                                                            // Computing "global index" is expensive inside map. 
                                                            // Let's rely on sector index and project index.

                                                            // GlobalY of Row = H_main + H_sec + (rows_before_in_sector * H_row) + (previous_sectors_height)
                                                            // But recursion makes "previous_sectors_height" simply the current flow Y passed down?

                                                            // Let's create a helper that computes offsets roughly or precise?
                                                            // Precise is best.
                                                            // We know:
                                                            // Header Height = headerHeight
                                                            // Sector Header = 36
                                                            // Row = rowHeight

                                                            // Previous sectors: 0 to index-1
                                                            let previousRowsCount = 0;
                                                            for (let k = 0; k < index; k++) {
                                                                previousRowsCount += visibleSectors[k].projects.length;
                                                            }

                                                            // Current project index in this sector
                                                            const pIndex = sector.projects.findIndex(p => p.id === project.id);

                                                            // Total Headers before this row: (index + 1) sector headers + Main Header
                                                            const yComponents = headerHeight + ((index + 1) * 36) + (previousRowsCount * rowHeight) + (pIndex * rowHeight);

                                                            // Sticky Bottom of THIS sector header:
                                                            const myHeaderBottom = headerHeight + ((index + 1) * 36);

                                                            // Trigger when Row Top < Header Bottom
                                                            // Row Visual Top = yComponents - scrollTop
                                                            // Trigger: yComponents - scrollTop < myHeaderBottom
                                                            // scrollTop > yComponents - myHeaderBottom
                                                            // scrollTop > (previousRowsCount * rowHeight) + (pIndex * rowHeight)

                                                            const triggerScroll = (previousRowsCount * rowHeight) + (pIndex * rowHeight);
                                                            const isVisible = scrollTop > triggerScroll;

                                                            const sDate = project.project_type === 'service'
                                                                ? (parseDate(project.deadline) || new Date())
                                                                : (parseDate(project.created_at) || new Date());
                                                            const eDate = project.project_type === 'service'
                                                                ? (parseDate(project.customer_handover) || sDate)
                                                                : (parseDate(project.deadline) || parseDate(project.customer_handover) || sDate);

                                                            return (
                                                                <div
                                                                    key={`hot-wrapper-${project.id}`}
                                                                    className="absolute inset-0 transition-opacity duration-300"
                                                                    style={{ opacity: isVisible ? 1 : 0 }}
                                                                >
                                                                    <TimelineBar
                                                                        key={`hot-${project.id}`}
                                                                        id={project.id}
                                                                        name={project.name}
                                                                        project={project}
                                                                        status={project.status}
                                                                        startDate={sDate}
                                                                        endDate={eDate}
                                                                        timelineStart={timelineRange.start}
                                                                        dayWidth={dayWidth}
                                                                        isService={project.project_type === 'service'}
                                                                        isCollapsed={true}
                                                                    />
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                {/* ROWS */}
                                                {sector.projects.map((project) => (
                                                    <div key={project.id} className="timeline-row">
                                                        <Link
                                                            href={project.project_type === 'service' ? '/servis' : `/projekty/${project.id}`}
                                                            className={`project-info-sticky hover:bg-muted/50 transition-colors group ${project.project_type === 'service' ? 'is-service-row' : ''}`}
                                                        >
                                                            <div className="project-info-content pr-2">
                                                                {rowHeight >= 30 ? (
                                                                    <>
                                                                        <span
                                                                            className={`project-name w-full text-left !font-normal pl-1 ${rowHeight >= 45 ? 'is-wrapped' : ''}`}
                                                                            style={{ textAlign: 'left', fontWeight: 400 }}
                                                                        >
                                                                            {project.name}
                                                                        </span>
                                                                        <span className="customer-name w-full text-right" style={{ textAlign: 'right' }}>
                                                                            {project.customer || 'Bez zákazníka'}
                                                                        </span>
                                                                    </>
                                                                ) : (
                                                                    <span className="customer-name w-full text-right" style={{ textAlign: 'right' }}>
                                                                        {project.customer || 'Bez zákazníka'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </Link>
                                                        <TimelineBar
                                                            id={project.id}
                                                            name={project.name}
                                                            project={project}
                                                            status={project.status}
                                                            startDate={project.project_type === 'service' ? (parseDate(project.deadline) || new Date()) : new Date()}
                                                            endDate={project.project_type === 'service' ? (parseDate(project.customer_handover) || new Date()) : new Date()}
                                                            timelineStart={timelineRange.start}
                                                            dayWidth={dayWidth}
                                                            isService={project.project_type === 'service'}
                                                        />
                                                    </div>
                                                ))}

                                                {/* NESTED NEXT SECTOR */}
                                                {renderSectorRecursively(index + 1)}
                                            </div>
                                        );
                                    };

                                    return renderSectorRecursively(0);
                                })()}
                            </div>
                        </div>
                    </TimelineGrid>
                </div>
            </div>
        </div>
    );
};

export default Timeline;
