'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo, useLayoutEffect } from 'react';
import './Timeline.css';
import { supabase } from '@/lib/supabase/client';
import { Project } from '@/types/project';
import TimelineGrid from './TimelineGrid';
import TimelineBar from './TimelineBar';
import { Search, Calendar, ZoomIn, ZoomOut } from 'lucide-react';
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

    // SMOTTH WHEEL ZOOM LOGIC (Ctrl + Mouse Wheel)
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            if (e.ctrlKey || e.metaKey) {
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
            }
        };

        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => container.removeEventListener('wheel', handleWheel);
    }, []);

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
            filtered = filtered.filter(p =>
                (p.name?.toLowerCase().includes(query)) ||
                (p.customer?.toLowerCase().includes(query))
            );
        }

        // Řazení: Nejdále v budoucnosti nahoře
        return filtered.sort((a, b) => {
            const dateA = getLatestMilestoneDate(a);
            const dateB = getLatestMilestoneDate(b);
            return dateB - dateA;
        });
    }, [projects, searchQuery, typeFilter]);

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
        <div className={`timeline-container ${isCompact ? 'mode-compact' : ''}`}>
            <header className="timeline-header-actions">
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
                        <div className="legend-item"><div className="legend-color dot" style={{ backgroundColor: '#f97316' }}></div> Podvozek</div>
                        <div className="legend-item"><div className="legend-color dot" style={{ backgroundColor: '#a855f7' }}></div> Nástavba</div>
                        <div className="legend-item"><div className="legend-color dot" style={{ backgroundColor: '#3b82f6' }}></div> Předání</div>
                        <div className="legend-item"><div className="legend-color dot" style={{ backgroundColor: '#ef4444' }}></div> Deadline</div>
                    </div>
                    <div className="legend-group">
                        <span className="legend-group-title">Fáze:</span>
                        <div className="legend-item"><div className="legend-color" style={{ backgroundColor: 'rgba(186, 230, 253, 0.6)' }}></div> Zahájení</div>
                        <div className="legend-item"><div className="legend-color" style={{ backgroundColor: 'rgba(74, 222, 128, 0.55)' }}></div> Příprava</div>
                        <div className="legend-item"><div className="legend-color" style={{ backgroundColor: 'rgba(250, 204, 21, 0.7)' }}></div> Montáž</div>
                        <div className="legend-item"><div className="legend-color" style={{ backgroundColor: 'rgba(251, 146, 60, 0.75)' }}></div> Revize</div>
                    </div>
                </div>

                <div className="header-right flex items-center gap-4">
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
                            {filteredProjects.map((project) => (
                                <div key={project.id} className="timeline-row">
                                    <Link href={`/projekty/${project.id}`} className="project-info-sticky hover:bg-muted/50 transition-colors group">
                                        <div className="project-info-content">
                                            {!isCompact && (
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
