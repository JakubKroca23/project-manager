'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo, useLayoutEffect } from 'react';
import './Timeline.css';
import { supabase } from '@/lib/supabase/client';
import { Project } from '@/types/project';
import TimelineGrid from './TimelineGrid';
import TimelineBar from './TimelineBar';
import { Search, Calendar, ZoomIn, ZoomOut, Palette, X, RotateCcw } from 'lucide-react';
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

const Timeline: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | 'civil' | 'military'>('all');
    const [isLoading, setIsLoading] = useState(true);

    const [dayWidth, setDayWidth] = useState(DEFAULT_DAY_WIDTH);
    const [rowHeight, setRowHeight] = useState(32);

    // Color Configuration State
    const [showColorEditor, setShowColorEditor] = useState(false);
    const [colors, setColors] = useState({
        phaseInitial: { color: '#bae6fd', opacity: 0.4, label: 'Zahájení' },
        phaseMounting: { color: '#4ade80', opacity: 0.35, label: 'Příprava' },
        phaseBufferYellow: { color: '#facc15', opacity: 0.5, label: 'Montáž' },
        phaseBufferOrange: { color: '#fb923c', opacity: 0.55, label: 'Revize' },
        phaseService: { color: '#ef4444', opacity: 0.2, label: 'Servis' },
        milestoneChassis: { color: '#f97316', opacity: 1, label: 'Podvozek' },
        milestoneBody: { color: '#a855f7', opacity: 1, label: 'Nástavba' },
        milestoneHandover: { color: '#3b82f6', opacity: 1, label: 'Předání' },
        milestoneDeadline: { color: '#ef4444', opacity: 1, label: 'Deadline' },
        milestoneServiceStart: { color: '#ef4444', opacity: 1, label: 'Zahájení servisu' },
        milestoneServiceEnd: { color: '#b91c1c', opacity: 1, label: 'Ukončení servisu' },
    });

    const [outline, setOutline] = useState({ enabled: true, width: 1, color: '#000000', opacity: 0.2 });

    const hexToRgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const customStyles = {
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
        '--timeline-row-height': `${rowHeight}px`,
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
            phaseService: { color: '#ef4444', opacity: 0.2, label: 'Servis' },
            milestoneServiceStart: { color: '#ef4444', opacity: 1, label: 'Zahájení servisu' },
            milestoneServiceEnd: { color: '#b91c1c', opacity: 1, label: 'Ukončení servisu' },
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
        setScrollTop(scrollContainerRef.current.scrollTop);

        // Init physics tracking
        lastPos.current = { x: e.pageX, y: e.pageY };
        lastTime.current = performance.now();
        velocity.current = { x: 0, y: 0 };

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

        // Start inertia if velocity is significant
        startInertia();
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !scrollContainerRef.current) return;
        e.preventDefault();

        const x = e.pageX - scrollContainerRef.current.offsetLeft;
        const y = e.pageY - scrollContainerRef.current.offsetTop;
        const walkX = (x - startX);
        const walkY = (y - startY);

        scrollContainerRef.current.scrollLeft = scrollLeft - walkX;
        scrollContainerRef.current.scrollTop = scrollTop - walkY;

        // Calculate velocity
        const now = performance.now();
        const dt = now - lastTime.current;
        if (dt > 0) {
            const vX = (e.pageX - lastPos.current.x) / dt;
            const vY = (e.pageY - lastPos.current.y) / dt;

            // Smooth velocity a bit
            velocity.current = {
                x: vX, // * 0.8 + velocity.current.x * 0.2, // Simple exponential smoothing if needed
                y: vY
            };

            lastPos.current = { x: e.pageX, y: e.pageY };
            lastTime.current = now;
        }
    };

    const startInertia = () => {
        const FRICTION = 0.95;
        const STOP_THRESHOLD = 0.1;

        const animate = () => {
            if (isDraggingRef.current || !scrollContainerRef.current) return;

            // Apply friction
            velocity.current.x *= FRICTION;
            velocity.current.y *= FRICTION;

            // Apply movement
            scrollContainerRef.current.scrollLeft -= velocity.current.x * 16; // approx 16ms frame
            scrollContainerRef.current.scrollTop -= velocity.current.y * 16;

            // Check if we should stop
            if (Math.abs(velocity.current.x) > STOP_THRESHOLD || Math.abs(velocity.current.y) > STOP_THRESHOLD) {
                requestRef.current = requestAnimationFrame(animate);
            }
        };

        cancelAnimationFrame(requestRef.current);
        requestRef.current = requestAnimationFrame(animate);
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
            // Handle vertical zoom on left column
            if ((e.target as Element).closest('.project-info-sticky')) {
                e.preventDefault();
                e.stopPropagation();
                const delta = e.deltaY > 0 ? -2 : 2;
                setRowHeight(prev => Math.min(Math.max(prev + delta, 22), 80));
                return;
            }

            if (e.ctrlKey) {
                e.preventDefault();

                // NATIVE ZOOM (Day Width)
                const delta = e.deltaY > 0 ? 0.9 : 1.1;
                const newWidth = Math.max(MIN_DAY_WIDTH, Math.min(MAX_DAY_WIDTH, dayWidthRef.current * delta));

                // Calculate mouse position relative to timeline start for centering zoom
                const rect = container.getBoundingClientRect();
                const mouseX = e.clientX - rect.left - 250; // 250 is sticky column width
                const scrollLeft = container.scrollLeft;
                const dateAtMouse = (scrollLeft + mouseX) / dayWidthRef.current;

                setDayWidth(newWidth);

                // Prepare restore scroll
                zoomFocus.current = {
                    pointDays: dateAtMouse,
                    pixelOffset: mouseX
                };
                return;
            }



            // Pokud uživatel drží Shift, necháme nativní horizontální scroll
            if (e.shiftKey) return;

            e.preventDefault();

            const currentWidth = dayWidthRef.current;

            // Jemný faktor zoomu
            const zoomFactor = 1.1;
            const direction = e.deltaY < 0 ? zoomFactor : 1 / zoomFactor;
            const next = Math.min(Math.max(currentWidth * direction, MIN_DAY_WIDTH), MAX_DAY_WIDTH);

            if (next !== currentWidth) {
                const rect = container.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;

                // Pozice myši v timeline (včetně scrollu)
                const pointDays = (container.scrollLeft + mouseX) / currentWidth;

                zoomFocus.current = { pointDays, pixelOffset: mouseX };
                setDayWidth(next);
            }
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

    const filteredProjects = useMemo(() => {
        let filtered = projects;
        if (typeFilter !== 'all') {
            filtered = filtered.filter(p => p.project_type === typeFilter);
        }
        const query = searchQuery.toLowerCase().trim();
        if (query) {
            const terms = query.split(/\s+/);
            filtered = filtered.filter(p => {
                const name = p.name?.toLowerCase() || '';
                const customer = p.customer?.toLowerCase() || '';
                const searchStr = `${name} ${customer}`;
                return terms.every(term => searchStr.includes(term));
            });
        }

        // Řazení: Nejdále v budoucnosti nahoře
        return filtered.sort((a, b) => {
            const dateA = getLatestMilestoneDate(a);
            const dateB = getLatestMilestoneDate(b);
            return dateB - dateA;
        });
    }, [projects, searchQuery, typeFilter]);

    // Výpočet "pruhů" pro servisní výjezdy k automatickému rozbalení při překryvu
    const serviceLanes = useMemo(() => {
        const services = filteredProjects.filter(p => p.project_type === 'service');
        const sorted = [...services].sort((a, b) => {
            const startA = parseDate(a.deadline)?.getTime() || 0;
            const startB = parseDate(b.deadline)?.getTime() || 0;
            return startA - startB;
        });

        const lanes: any[][] = [];
        const serviceMap = new Map<string, { lane: number }>();

        sorted.forEach(service => {
            const start = parseDate(service.deadline)?.getTime() || 0;
            let end = parseDate(service.customer_handover)?.getTime();
            if (start && !end) {
                end = start + 2 * 24 * 60 * 60 * 1000;
            }

            let laneIdx = -1;
            for (let i = 0; i < lanes.length; i++) {
                const lastInLane = lanes[i][lanes[i].length - 1];
                const lastStart = parseDate(lastInLane.deadline)?.getTime() || 0;
                let lastEnd = parseDate(lastInLane.customer_handover)?.getTime();
                if (lastStart && !lastEnd) lastEnd = lastStart + 2 * 24 * 60 * 60 * 1000;

                // Přidáme malou mezeru (12h) mezi projekty v jednom pruhu
                if (start > (lastEnd || 0) + (12 * 60 * 60 * 1000)) {
                    laneIdx = i;
                    break;
                }
            }

            if (laneIdx === -1) {
                laneIdx = lanes.length;
                lanes.push([service]);
            } else {
                lanes[laneIdx].push(service);
            }
            serviceMap.set(service.id, { lane: laneIdx });
        });

        return { lanes, serviceMap };
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
                    <h1>Timeline</h1>
                    <div className="search-container">
                        <Search size={16} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Hledat..."
                            className="search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="type-filters flex items-center gap-1 ml-4 bg-muted/30 p-1 rounded-lg border border-border/50">
                        {['all', 'civil', 'military'].map((type) => (
                            <button
                                key={type}
                                className={`filter-btn ${typeFilter === type ? 'active' : ''}`}
                                onClick={() => setTypeFilter(type as any)}
                            >
                                {type === 'all' ? 'Vše' : type === 'civil' ? 'Civilní' : 'Armáda'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="timeline-legend">
                    <div className="legend-group">
                        <span className="legend-group-title">Milníky:</span>
                        <div className="legend-item"><div className="legend-color dot" style={{ backgroundColor: 'var(--milestone-chassis)' }}></div> Podvozek</div>
                        <div className="legend-item"><div className="legend-color dot" style={{ backgroundColor: 'var(--milestone-body)' }}></div> Nástavba</div>
                        <div className="legend-item"><div className="legend-color dot" style={{ backgroundColor: 'var(--milestone-handover)' }}></div> Předání</div>
                        <div className="legend-item"><div className="legend-color dot" style={{ backgroundColor: 'var(--milestone-deadline)' }}></div> Deadline</div>
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
                                                    onChange={(e) => setColors(prev => ({ ...prev, [key]: { ...prev[key as keyof typeof colors], color: e.target.value } }))}
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
                                                    onChange={(e) => setColors(prev => ({ ...prev, [key]: { ...prev[key as keyof typeof colors], opacity: parseFloat(e.target.value) } }))}
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
            >
                <div className="timeline-content">
                    <TimelineGrid
                        startDate={timelineRange.start}
                        endDate={timelineRange.end}
                        dayWidth={dayWidth}
                    >
                        <div className="timeline-rows">
                            {/* SERVICE ROW */}
                            {filteredProjects.some(p => p.project_type === 'service') && (
                                <div
                                    className="timeline-row bg-muted/30"
                                    style={{ height: Math.max(1, serviceLanes.lanes.length) * rowHeight }}
                                >
                                    <Link
                                        href="/projekty?type=service"
                                        className="project-info-sticky bg-muted/30 font-semibold border-r border-border hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="project-info-content p-2">
                                            <span className="project-name text-primary">Servisní výjezdy</span>
                                            <div className="text-xs text-muted-foreground font-normal flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-primary/50"></span>
                                                {filteredProjects.filter(p => p.project_type === 'service').length} aktivních
                                            </div>
                                        </div>
                                    </Link>
                                    <div className="relative w-full h-full flex-1">
                                        {filteredProjects
                                            .filter(p => p.project_type === 'service')
                                            .map(service => (
                                                <TimelineBar
                                                    key={service.id}
                                                    id={service.id}
                                                    name={service.name}
                                                    project={service}
                                                    status={service.status}
                                                    startDate={new Date()}
                                                    endDate={new Date()}
                                                    timelineStart={timelineRange.start}
                                                    dayWidth={dayWidth}
                                                    isService={true}
                                                    topOffset={(serviceLanes.serviceMap.get(service.id)?.lane || 0) * rowHeight}
                                                />
                                            ))}
                                    </div>
                                </div>
                            )}

                            {/* REGULAR PROJECTS */}
                            {filteredProjects
                                .filter(p => p.project_type !== 'service')
                                .map((project) => (
                                    <div key={project.id} className="timeline-row">
                                        <Link
                                            href={`/projekty/${project.id}`}
                                            className="project-info-sticky hover:bg-muted/50 transition-colors group"
                                        >
                                            <div className="project-info-content">
                                                {rowHeight >= 30 && (
                                                    <span className="customer-name">
                                                        {project.customer || 'Bez zákazníka'}
                                                    </span>
                                                )}
                                                <span className="project-name">
                                                    {project.name}
                                                </span>
                                            </div>
                                        </Link>
                                        <TimelineBar
                                            id={project.id}
                                            name={project.name}
                                            project={project}
                                            status={project.status}
                                            startDate={new Date()}
                                            endDate={new Date()}
                                            timelineStart={timelineRange.start}
                                            dayWidth={dayWidth}
                                        />
                                    </div>
                                ))}
                        </div>
                    </TimelineGrid>
                </div>
            </div>
        </div>
    );
};

export default Timeline;
