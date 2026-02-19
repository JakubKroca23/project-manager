'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo, useLayoutEffect } from 'react';
import './Timeline.css';
import { supabase } from '@/lib/supabase/client';
import { Project, Milestone as ProjectMilestone } from '@/types/project';
import { useSearch } from '@/providers/SearchProvider';
import { useActions } from '@/providers/ActionProvider';
import TimelineGrid from './TimelineGrid';
import TimelineBar from './TimelineBar';
import { cn } from '@/lib/utils';
import {
    Search, Calendar, ZoomIn, ZoomOut, Loader2, X, Plus, Minus,
    RotateCcw, ChevronDown, ChevronRight, ChevronUp, Clock,
    Save, HelpCircle, Info, MousePointer2, MoveHorizontal,
    MousePointerClick, Palette, Trash2, Settings2,
    Truck, Hammer, ThumbsUp, AlertTriangle, Play,
    Check, Milestone, Wrench, Package, Factory, ShieldCheck,
    Box, Drill, Settings, Briefcase, Building2, Globe, TrendingUp,
    Euro, Warehouse, Landmark, Users, Laptop, Phone, Mail,
    Zap, Star, Rocket, Coffee
} from 'lucide-react';
import Link from 'next/link';

// ─── CUSTOM ICONS ────────────────────────────────────────────────

const Hiab = ({ size = 24, color }: any) => (
    <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', width: size, height: size,
        backgroundColor: color || '#000000',
        maskImage: `url(/hiab.svg)`,
        maskSize: 'contain',
        maskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskImage: `url(/hiab.svg)`,
        WebkitMaskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
    }} />
);

const wrapLucide = (Icon: any) => ({ size = 24, color, ...props }: any) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
        <Icon size={size - 6} color={color || "#000000"} strokeWidth={3} {...props} />
    </div>
);

const ICON_OPTIONS = {
    Truck: wrapLucide(Truck),
    Hammer: wrapLucide(Hammer),
    ThumbsUp: wrapLucide(ThumbsUp),
    AlertTriangle: wrapLucide(AlertTriangle),
    Play: wrapLucide(Play),
    Check: wrapLucide(Check),
    Milestone: wrapLucide(Milestone),
    Wrench: wrapLucide(Wrench),
    Package: wrapLucide(Package),
    Factory: wrapLucide(Factory),
    ShieldCheck: wrapLucide(ShieldCheck),
    Box: wrapLucide(Box),
    Drill: wrapLucide(Drill),
    Settings: wrapLucide(Settings),
    Hiab: Hiab,
    Briefcase: wrapLucide(Briefcase),
    Building2: wrapLucide(Building2),
    Globe: wrapLucide(Globe),
    TrendingUp: wrapLucide(TrendingUp),
    Euro: wrapLucide(Euro),
    Warehouse: wrapLucide(Warehouse),
    Landmark: wrapLucide(Landmark),
    Users: wrapLucide(Users),
    Laptop: wrapLucide(Laptop),
    Phone: wrapLucide(Phone),
    Mail: wrapLucide(Mail),
    Zap: wrapLucide(Zap),
    Star: wrapLucide(Star),
    Rocket: wrapLucide(Rocket),
    Coffee: wrapLucide(Coffee)
};

// Seznam ikon pro výběr v editoru
const VISIBLE_ICONS = Object.keys(ICON_OPTIONS);

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
    color: string;           // Main color for bars/text
    iconColor?: string;      // Icon foreground
    iconBgColor?: string;    // Icon background/box
    opacity: number;
    label: string;
    icon?: keyof typeof ICON_OPTIONS;
    showInStack?: boolean;
}

interface IColorsState {
    phaseInitial: IColorConfig;
    phaseMounting: IColorConfig;
    phaseBufferYellow: IColorConfig;
    phaseBufferOrange?: IColorConfig;
    milestoneChassis: IColorConfig;
    milestoneBody: IColorConfig;
    milestoneHandover: IColorConfig;
    milestoneDeadline: IColorConfig;
    milestoneRevisionEnd?: IColorConfig;
    milestoneStart?: IColorConfig;
    priority1: IColorConfig;
    priority2: IColorConfig;
    priority3: IColorConfig;
    statePending: IColorConfig;
    stateCompleted: IColorConfig;
    stateOverdue: IColorConfig;
}

interface IOutlineState {
    enabled: boolean;
    width: number;
    color: string;
    opacity: number;
    showInStack?: boolean;
}

interface IServiceLanesResult {
    lanes: Project[][];
    serviceMap: Map<string, { lane: number }>;
}

const Timeline: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [allMilestones, setAllMilestones] = useState<ProjectMilestone[]>([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { searchTerm: searchQuery } = useSearch();
    const { setOnFit } = useActions();
    const [activeTypes, setActiveTypes] = useState<Record<string, boolean>>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('timeline_activeFilter');
            if (saved) {
                try {
                    return JSON.parse(saved);
                } catch (e) {
                    console.error('Failed to parse timeline_activeFilter', e);
                }
            }
        }
        return {
            civil: true,
            military: true,
            service: true
        };
    });



    const toggleType = (type: string) => {
        setActiveTypes((prev: Record<string, boolean>) => ({ ...prev, [type]: !prev[type] }));
    };

    const [dayWidth, setDayWidth] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('timeline_dayWidth');
            return saved ? parseFloat(saved) : DEFAULT_DAY_WIDTH;
        }
        return DEFAULT_DAY_WIDTH;
    });
    const [isLoading, setIsLoading] = useState(true);
    const [rowHeight, setRowHeight] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('timeline_rowHeight');
            return saved ? parseInt(saved) : 34; // Default to 34px per user request
        }
        return 34;
    });
    // Summary row height fixed at 34px by user request
    const summaryRowHeight = 34;
    const [showDesignSettings, setShowDesignSettings] = useState(false);
    const [openIconSelector, setOpenIconSelector] = useState<string | null>(null);
    const [design, setDesign] = useState({
        borderRadius: 4,
        barHeight: 70, // in %
        opacity: 1,
        usePriorityColors: true,
        stackedOpacity: 0.15
    });
    const timelineRef = useRef<HTMLDivElement>(null);

    // Ref for accessing current dayWidth in event listeners
    const dayWidthRef = useRef(dayWidth);

    // CRITICAL: Update ref synchronously after render to ensure event handlers have fresh state
    // immediately for the next event in the loop.
    useLayoutEffect(() => {
        dayWidthRef.current = dayWidth;
        if (typeof window !== 'undefined') {
            localStorage.setItem('timeline_dayWidth', dayWidth.toString());
        }
    }, [dayWidth]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('timeline_rowHeight', rowHeight.toString());
        }
    }, [rowHeight]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('timeline_summaryRowHeight', summaryRowHeight.toString());
        }
    }, [summaryRowHeight]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('timeline_activeFilter', JSON.stringify(activeTypes));
        }
    }, [activeTypes]);

    // Color Configuration State
    const [colors, setColors] = useState<IColorsState>({
        phaseInitial: { color: '#bae6fd', opacity: 0.4, label: 'Zahájení', showInStack: false },
        phaseMounting: { color: '#4ade80', opacity: 0.35, label: 'Příprava', showInStack: true },
        phaseBufferYellow: { color: '#facc15', opacity: 0.5, label: 'Montáž', showInStack: true },
        milestoneChassis: { color: '#f97316', iconColor: '#000000', iconBgColor: '#f97316', opacity: 1, label: 'Podvozek', icon: 'Truck', showInStack: true },
        milestoneBody: { color: '#a855f7', iconColor: '#000000', iconBgColor: '#a855f7', opacity: 1, label: 'Nástavba', icon: 'Hiab', showInStack: true },
        milestoneHandover: { color: '#3b82f6', iconColor: '#000000', iconBgColor: '#3b82f6', opacity: 1, label: 'Předání', icon: 'ThumbsUp', showInStack: true },
        milestoneDeadline: { color: '#ef4444', iconColor: '#000000', iconBgColor: '#ef4444', opacity: 1, label: 'Deadline', icon: 'AlertTriangle', showInStack: true },
        priority1: { color: '#ef4444', opacity: 1, label: 'Urgentní' },
        priority2: { color: '#3b82f6', opacity: 1, label: 'Normální' },
        priority3: { color: '#94a3b8', opacity: 1, label: 'Nízká' },
        statePending: { color: '#374151', opacity: 1, label: 'Čeká' },
        stateCompleted: { color: '#22c55e', opacity: 1, label: 'Hotovo' },
        stateOverdue: { color: '#ef4444', opacity: 1, label: 'Zpožděno' },
    });

    const [outline, setOutline] = useState<IOutlineState>({ enabled: true, width: 1, color: '#000000', opacity: 0.2, showInStack: true });

    // Global Milestone Size
    const [milestoneSize, setMilestoneSize] = useState<number>(34);

    // Collapsed Sectors State
    const [collapsedSectors, setCollapsedSectors] = useState<Record<string, boolean>>({});

    const toggleSector = (sectorId: string) => {
        setCollapsedSectors(prev => ({ ...prev, [sectorId]: !prev[sectorId] }));
    };



    const saveSettings = async () => {
        if (!isAdmin) return;
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('app_settings')
                .upsert({
                    id: 'timeline_config',
                    settings: {
                        colors,
                        outline,
                        milestoneSize,
                        design
                    },
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;
            alert('Nastavení uloženo pro všechny.');
        } catch (err) {
            console.error('Error saving settings:', err);
            alert('Chyba při ukládání nastavení.');
        } finally {
            setIsSaving(false);
        }
    };

    const fetchSettings = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('app_settings')
                .select('settings')
                .eq('id', 'timeline_config')
                .maybeSingle();

            if (data?.settings) {
                const s = data.settings;
                if (s.colors) {
                    setColors(prev => ({
                        ...prev,
                        ...s.colors
                    }));
                }
                if (s.outline) setOutline(s.outline);
                if (s.milestoneSize) setMilestoneSize(s.milestoneSize);
                if (s.design) {
                    setDesign(prev => ({
                        ...prev,
                        ...s.design
                    }));
                }
            }
        } catch (err) {
            console.error('Error fetching settings:', err);
        }
    }, []);



    const checkAdmin = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .maybeSingle();

            setIsAdmin(profile?.role === 'admin');
        } catch (err) {
            console.error('Error checking admin role:', err);
        }
    }, []);

    useEffect(() => {
        checkAdmin();
        fetchSettings();
    }, [checkAdmin, fetchSettings]);

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
        '--phase-initial': hexToRgba(colors.phaseInitial?.color || '#bae6fd', colors.phaseInitial?.opacity || 0.4),
        '--phase-mounting': hexToRgba(colors.phaseMounting?.color || '#4ade80', colors.phaseMounting?.opacity || 0.35),
        '--phase-buffer-yellow': hexToRgba(colors.phaseBufferYellow?.color || '#facc15', colors.phaseBufferYellow?.opacity || 0.5),
        '--milestone-chassis': colors.milestoneChassis?.color || '#888',
        '--milestone-body': colors.milestoneBody?.color || '#888',
        '--milestone-handover': colors.milestoneHandover?.color || '#888',
        '--milestone-deadline': colors.milestoneDeadline?.color || '#888',
        '--milestone-start': colors.milestoneStart?.color || '#888',
        '--summary-row-height': `${summaryRowHeight}px`,
        '--project-row-height': `${rowHeight}px`,
        '--element-border': outline.enabled ? `${outline.width}px solid ${hexToRgba(outline.color, outline.opacity)}` : 'none',
        '--row-height': `${rowHeight}px`,
        '--timeline-row-height': `${rowHeight}px`,
        '--day-width': `${dayWidth}px`,
        '--bar-radius': `${design.borderRadius}px`,
        '--bar-height': `${design.barHeight}%`,
        '--bar-opacity': design.opacity,
        '--priority-1-color': colors.priority1.color,
        '--priority-2-color': colors.priority2.color,
        '--priority-3-color': colors.priority3.color,
    } as React.CSSProperties;







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

            // Do not clear immediately if multiple effects run? 
            // Actually it is safer to clear to avoid stale restoration.
            zoomFocus.current = null;
        }
    }, [dayWidth]);

    const [scrollTop, setScrollTop] = useState(0);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const top = e.currentTarget.scrollTop;
        requestAnimationFrame(() => {
            setScrollTop(top);
        });
    };

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

    // --- DRAG TO SCROLL IMPLEMENTATION ---
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0, left: 0, top: 0 });

    const handleMouseDown = (e: React.MouseEvent) => {
        // Prevent for interactive elements or when clicking the date header
        if ((e.target as HTMLElement).closest('button, a, input, select, .timeline-bar, .timeline-grid-header-multi')) {
            return;
        }

        if (scrollContainerRef.current) {
            setIsDragging(true);
            dragStart.current = {
                x: e.clientX,
                y: e.clientY,
                left: scrollContainerRef.current.scrollLeft,
                top: scrollContainerRef.current.scrollTop
            };
            document.body.style.cursor = 'grabbing';
            document.body.style.userSelect = 'none';
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !scrollContainerRef.current) return;

        e.preventDefault();
        const dx = e.clientX - dragStart.current.x;
        const dy = e.clientY - dragStart.current.y;

        scrollContainerRef.current.scrollLeft = dragStart.current.left - dx;
        scrollContainerRef.current.scrollTop = dragStart.current.top - dy;
    };

    const handleMouseUp = () => {
        if (isDragging) {
            setIsDragging(false);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
    };

    const handleMouseLeave = () => {
        if (isDragging) {
            setIsDragging(false);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
    };

    // Wheel zoom and scroll handler - AGGRESSIVE WINDOW CAPTURE
    useEffect(() => {
        const handleWindowWheel = (e: WheelEvent) => {
            const container = scrollContainerRef.current;
            if (!container) return;

            // 1. Check if we are in an "excluded" zone where native scroll should happen
            // (Design settings sidebar OR Top Header Actions)
            if ((e.target as HTMLElement).closest('.design-settings-sidebar, .timeline-header-actions')) {
                return;
            }

            // 2. Check if mouse is over the timeline container (and not excluded)
            const isOverTimeline = (e.target as HTMLElement).closest('.timeline-container');
            if (!isOverTimeline) return;

            // 3. ABSOLUTE BLOCK: Stop all native scrolling on the timeline grid
            e.preventDefault();
            e.stopPropagation();

            // 4. Ctrl + Wheel = Vertical Zoom (Row Height)
            if (e.ctrlKey || e.metaKey) {
                const delta = e.deltaY;

                if (delta === 0) return;

                const target = e.target as HTMLElement;
                const summaryRow = target.closest('.is-summary');
                const projectRow = target.closest('.is-project');

                if (summaryRow) {
                    // Summary rows have fixed height now, do nothing
                    return;
                } else {
                    // Default behavior for projects or anything else
                    setRowHeight(prev => {
                        const next = delta > 0 ? prev - 4 : prev + 4;
                        return Math.min(120, Math.max(12, next));
                    });
                }
                return;
            }

            // 2. Just Wheel = Horizontal Zoom (Day Width)
            // handle both deltaY (vertical wheel) and deltaX (trackpad horizontal)
            const delta = e.deltaY !== 0 ? e.deltaY : e.deltaX;
            if (delta === 0) return;

            const currentWidth = dayWidthRef.current;
            const rect = container.getBoundingClientRect();
            // mouseX relative to viewport start of scroll container
            const mouseX = e.clientX - rect.left;

            // Capture exact state BEFORE state changes
            const pointDays = (container.scrollLeft + mouseX) / currentWidth;
            zoomFocus.current = { pointDays, pixelOffset: mouseX };

            // Změna šířky dne (zoom)
            if (delta > 0) {
                setDayWidth(prev => Math.max(prev / 1.1, MIN_DAY_WIDTH));
            } else if (delta < 0) {
                setDayWidth(prev => Math.min(prev * 1.1, MAX_DAY_WIDTH));
            }
        };

        // window capture: true is necessary to beat native scroll on position: sticky elements
        window.addEventListener('wheel', handleWindowWheel, { passive: false, capture: true });
        return () => window.removeEventListener('wheel', handleWindowWheel, { capture: true });
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

    const fetchMilestones = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('project_milestones')
                .select('*');

            if (error) throw error;
            setAllMilestones(data || []);
        } catch (error) {
            console.error('Error fetching milestones:', error);
        }
    }, []);

    useEffect(() => {
        fetchProjects();
        fetchMilestones();

        // Listen for global refresh from ImportWizard
        const handleGlobalRefresh = () => {
            fetchProjects();
            fetchMilestones();
        };
        window.addEventListener('projects-updated', handleGlobalRefresh);
        return () => window.removeEventListener('projects-updated', handleGlobalRefresh);
    }, [fetchProjects, fetchMilestones]);

    const handleProjectUpdate = useCallback((updatedProject: Project) => {
        setProjects((prev: Project[]) => prev.map((p: Project) => p.id === updatedProject.id ? updatedProject : p));
        fetchMilestones(); // Refresh milestones too
    }, [fetchMilestones]);

    // Helper pro řazení
    const getSortDate = (project: Project): number => {
        // Zjišťujeme začátek montáže (maximum z podvozku a nástavby)
        const t_chassis = parseDate(project.chassis_delivery);
        const t_body = parseDate(project.body_delivery);

        const lastMainM = [t_chassis, t_body].filter((d): d is Date => d !== null);

        if (lastMainM.length > 0) {
            return Math.max(...lastMainM.map(d => d.getTime()));
        }

        // Pokud není montáž definována, použijeme deadline/předání jako náhradní datum
        const dateStr = project.deadline || project.customer_handover || project.body_delivery || project.chassis_delivery;
        const d = parseDate(dateStr);
        return d ? d.getTime() : 4102444800000; // Far future
    };

    const filteredProjects = useMemo((): Project[] => {
        let filtered = projects;

        // Pre-calculate parents that have children
        const parentIds = new Set(projects.map(p => p.parent_id).filter(Boolean));

        // Filtr podle aktivních typů a subzakázek
        filtered = filtered.filter((p: Project) => {
            const type = p.project_type || 'civil';

            // Special rule for Military: Hide all parent projects, show only sub-projects
            if (type === 'military' && !p.parent_id) {
                return false;
            }

            // return activeTypes[type] === true; // REMOVED: Filtering logic moved to render time
            return true;
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
                    p.serial_number,
                    p.manager,
                    p.status,
                    p.category,
                    p.production_status,
                    p.mounting_company,
                    p.body_type,
                    p.body_setup
                ].map(term => normalize(term || ''));

                // Prohledávání i v custom_fields
                const customTerms = p.custom_fields ? Object.values(p.custom_fields)
                    .filter(v => typeof v === 'string')
                    .map(v => normalize(v as string)) : [];

                const searchStr = [...searchTerms, ...customTerms].join(' ');
                return terms.every((term: string) => searchStr.includes(term));
            });
        }

        // Filter projects that only have the 'start' (closed_at) milestone
        filtered = filtered.filter((p: Project) => {
            const hasOtherMilestones =
                p.chassis_delivery ||
                p.body_delivery ||
                p.customer_handover ||
                p.deadline ||
                p.custom_fields?.mounting_end_date ||
                p.custom_fields?.revision_end_date;

            return !!hasOtherMilestones;
        });

        // Hide completed projects if showHidden is false


        // Sorting: Hierarchical (Parent + Children together)
        return filtered.sort((a, b) => {
            const dateA = getSortDate(a);
            const dateB = getSortDate(b);

            if (dateA !== dateB) {
                return dateA - dateB;
            }

            return (a.name || '').localeCompare(b.name || '');
        });
    }, [projects, searchQuery, activeTypes]);

    // Grupa projektů do sektorů
    const sectorizedProjects = useMemo(() => {
        const service = filteredProjects.filter(p => p.project_type === 'service');
        const civil = filteredProjects.filter(p => p.project_type === 'civil' || !p.project_type);
        const military = filteredProjects.filter(p => p.project_type === 'military');


        return [
            { id: 'total', label: 'CELKEM (VŠECHNY ZAKÁZKY)', projects: filteredProjects, color: '#6366f1' }, // Indigo for total
            { id: 'service', label: 'SERVIS', projects: service, color: '#a855f7' },
            { id: 'civil', label: 'CIVILNÍ ZAKÁZKY', projects: civil, color: '#3b82f6' },
            { id: 'military', label: 'VOJENSKÉ ZAKÁZKY', projects: military, color: '#10b981' }
        ];
    }, [filteredProjects]);

    const jumpToToday = () => {
        if (scrollContainerRef.current) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const diffDays = Math.floor((today.getTime() - timelineRange.start.getTime()) / (1000 * 60 * 60 * 24));

            const containerWidth = scrollContainerRef.current.clientWidth;
            const offset = containerWidth / 2; // Center the view

            scrollContainerRef.current.scrollTo({
                left: diffDays * dayWidth - offset,
                behavior: 'smooth'
            });
        }
    };

    useEffect(() => {
        if (!isLoading && scrollContainerRef.current) {
            setTimeout(jumpToToday, 100);
        }
    }, [isLoading]);

    const handleFitVertical = useCallback(() => {
        if (!timelineRef.current) return;
        const bodyHeight = timelineRef.current.offsetHeight - (Object.keys(activeTypes).length * 80);
        const totalRows = filteredProjects.length + 6;
        if (totalRows <= 0) return;
        const targetHeight = Math.floor(bodyHeight / totalRows);
        const newHeight = Math.max(14, Math.min(100, targetHeight));
        setRowHeight(newHeight);
    }, [filteredProjects.length, activeTypes, timelineRef]);

    useEffect(() => {
        setOnFit(() => handleFitVertical);
        return () => setOnFit(null);
    }, [handleFitVertical, setOnFit]);

    const isCompact = dayWidth < 18;

    if (isLoading) {
        return (
            <div className="timeline-container">
                <div className="timeline-loading-spinner">Načítám časovou osu...</div>
            </div>
        );
    }
    return (
        <div
            ref={timelineRef}
            className={`timeline-container ${isCompact ? 'mode-compact' : ''}`}
            style={{
                ...customStyles,
                cursor: isDragging ? 'grabbing' : 'grab',
                flexDirection: 'row'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
        >
            {/* Design Settings Panel - Static Sidebar (LEFT) */}
            {showDesignSettings && (
                <div className="design-settings-sidebar w-[320px] h-full bg-background/95 backdrop-blur-sm border-r border-border shadow-xl z-[4000] flex flex-col animate-in slide-in-from-left-5 fade-in duration-300 shrink-0">
                    <div className="flex items-center justify-between p-3 border-b border-border/50 bg-muted/20">
                        <div className="flex items-center gap-2">
                            <Settings2 size={14} className="text-primary" />
                            <h3 className="text-xs font-black uppercase tracking-widest">Nastavení Vzhledu</h3>
                        </div>
                        <button onClick={() => setShowDesignSettings(false)} className="p-1 hover:bg-muted rounded-md transition-colors">
                            <X size={14} />
                        </button>
                    </div>

                    <div className="overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent flex-1">
                        {/* 1. Shape & Opacity */}
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-wider mb-2">Tvar a Průhlednost</h4>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-[10px] font-bold mb-1.5">
                                        <span className="text-muted-foreground">Výška Baru</span>
                                        <span className="text-primary">{design.barHeight}%</span>
                                    </div>
                                    <input
                                        type="range" min="10" max="100" step="5"
                                        value={design.barHeight}
                                        onChange={(e) => setDesign({ ...design, barHeight: parseInt(e.target.value) })}
                                        className="w-full accent-primary h-1 bg-muted rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="flex justify-between text-[10px] font-bold mb-1.5">
                                            <span className="text-muted-foreground">Zaoblení</span>
                                            <span className="text-primary">{design.borderRadius}px</span>
                                        </div>
                                        <input
                                            type="range" min="0" max="20" step="1"
                                            value={design.borderRadius}
                                            onChange={(e) => setDesign({ ...design, borderRadius: parseInt(e.target.value) })}
                                            className="w-full accent-primary h-1 bg-muted rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-[10px] font-bold mb-1.5">
                                            <span className="text-muted-foreground">Obrys</span>
                                            <span className="text-primary">{outline.width}px</span>
                                        </div>
                                        <input
                                            type="range" min="0" max="4" step="1"
                                            value={outline.width}
                                            onChange={(e) => setOutline({ ...outline, width: parseInt(e.target.value), enabled: parseInt(e.target.value) > 0 })}
                                            className="w-full accent-primary h-1 bg-muted rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-[10px] font-bold mb-1.5">
                                        <span className="text-muted-foreground">Průhlednost - Standard</span>
                                        <span className="text-primary">{Math.round(design.opacity * 100)}%</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="1" step="0.05"
                                        value={design.opacity}
                                        onChange={(e) => setDesign({ ...design, opacity: parseFloat(e.target.value) })}
                                        className="w-full accent-primary h-1 bg-muted rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>
                                <div>
                                    <div className="flex justify-between text-[10px] font-bold mb-1.5">
                                        <span className="text-muted-foreground">Průhlednost - Stacked</span>
                                        <span className="text-primary">{Math.round((design.stackedOpacity || 0.15) * 100)}%</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="1" step="0.05"
                                        value={design.stackedOpacity || 0.15}
                                        onChange={(e) => setDesign({ ...design, stackedOpacity: parseFloat(e.target.value) })}
                                        className="w-full accent-primary h-1 bg-muted rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>


                                <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg border border-border/30">
                                    <span className="text-[10px] font-bold text-muted-foreground">Barvy dle priority</span>
                                    <button
                                        onClick={() => setDesign({ ...design, usePriorityColors: !design.usePriorityColors })}
                                        className={cn(
                                            "w-7 h-3.5 rounded-full transition-colors relative",
                                            design.usePriorityColors ? "bg-primary" : "bg-muted-foreground/30"
                                        )}
                                    >
                                        <div className={cn(
                                            "absolute top-0.5 left-0.5 w-2.5 h-2.5 rounded-full bg-white transition-transform shadow-sm",
                                            design.usePriorityColors ? "translate-x-3.5" : "translate-x-0"
                                        )} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-border/40" />

                        {/* 2. Colors */}
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-wider mb-2">Barvy Projektů</h4>
                            <div className="grid grid-cols-2 gap-2">
                                {/* Phases */}
                                {Object.entries(colors).filter(([k]) => k.startsWith('phase')).map(([key, config]) => (
                                    <div key={key} className="flex items-center justify-between p-1.5 bg-muted/20 rounded border border-border/20">
                                        <span className="text-[9px] font-bold truncate max-w-[80px] text-muted-foreground">{config.label}</span>
                                        <input
                                            type="color"
                                            value={config.color}
                                            onChange={(e) => setColors({ ...colors, [key]: { ...config, color: e.target.value } })}
                                            className="w-4 h-4 rounded cursor-pointer bg-transparent border-none p-0 overflow-hidden"
                                        />
                                    </div>
                                ))}
                                {/* Priorities */}
                                {Object.entries(colors).filter(([k]) => k.startsWith('priority')).map(([key, config]) => (
                                    <div key={key} className="flex items-center justify-between p-1.5 bg-muted/20 rounded border border-border/20">
                                        <span className="text-[9px] font-bold truncate max-w-[80px] text-muted-foreground">{config.label}</span>
                                        <input
                                            type="color"
                                            value={config.color}
                                            onChange={(e) => setColors({ ...colors, [key]: { ...config, color: e.target.value } })}
                                            className="w-4 h-4 rounded cursor-pointer bg-transparent border-none p-0 overflow-hidden"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="h-px bg-border/40" />

                        {/* 3. Milestones */}
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-wider mb-2">Milníky</h4>

                            {/* States */}
                            <div className="flex gap-2 mb-3">
                                {Object.entries(colors).filter(([k]) => k.startsWith('state')).map(([key, config]) => (
                                    <div key={key} className="flex-1 flex flex-col gap-1 items-center bg-muted/20 p-1.5 rounded border border-border/20">
                                        <span className="text-[8px] font-bold text-muted-foreground uppercase">{config.label}</span>
                                        <div className="w-full h-6 rounded border border-border/50 overflow-hidden relative">
                                            <div className="absolute inset-0" style={{ backgroundColor: config.color }} />
                                            <input
                                                type="color"
                                                value={config.color}
                                                onChange={(e) => setColors({ ...colors, [key]: { ...config, color: e.target.value } })}
                                                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer p-0 border-none"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </div>
                    </div>


                    {/* Footer */}
                    {isAdmin && (
                        <div className="p-3 border-t border-border/50 bg-muted/20 shrink-0">
                            <button
                                onClick={saveSettings}
                                disabled={isSaving}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-emerald-700 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
                            >
                                {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                                Uložit Všem
                            </button>
                        </div>
                    )}
                </div>
            )
            }

            <div className="flex flex-col flex-1 h-full min-w-0 relative">
                <header className="timeline-header-actions relative border-b border-border/40">
                    <div className="header-left">
                        <div className="type-filters flex items-center gap-4">
                            {[
                                { id: 'service', label: 'Servis', color: '#a855f7' },
                                { id: 'civil', label: 'Civilní', color: '#3b82f6' },
                                { id: 'military', label: 'Vojenské', color: '#10b981' }
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

                        <button
                            className={`action-button ${showDesignSettings ? 'primary' : ''}`}
                            onClick={() => setShowDesignSettings(!showDesignSettings)}
                            title="Nastavení designu"
                        >
                            <Settings2 size={16} />
                            <span>Vzhled</span>
                        </button>
                    </div>

                    <div className="header-center flex items-center gap-3">
                        <div className="zoom-controls flex items-center gap-1 bg-muted/30 p-1 rounded-lg border border-border/50">
                            <button
                                className="action-button icon-only"
                                onClick={handleZoomOut}
                                title="Oddálit"
                            >
                                <ZoomOut size={16} />
                            </button>
                            <span className="text-[10px] font-mono text-muted-foreground min-w-[32px] text-center select-none">
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
                    </div>

                    <div className="header-right flex items-center gap-4">
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
                    onScroll={handleScroll}
                >
                    <div className="timeline-content">
                        <TimelineGrid
                            startDate={timelineRange.start}
                            endDate={timelineRange.end}
                            dayWidth={dayWidth}
                        >
                            <div className="timeline-rows">
                                {/* 1. CATEGORY SUMMARIES (Stacked) */}
                                {(() => {
                                    const visibleSectors = sectorizedProjects.filter(s => s.id === 'total' || activeTypes[s.id]);

                                    // Generate days array for matching the grid exactly
                                    const days: Date[] = [];
                                    const curr = new Date(timelineRange.start);
                                    while (curr <= timelineRange.end) {
                                        days.push(new Date(curr));
                                        curr.setDate(curr.getDate() + 1);
                                    }

                                    const isWeekend = (d: Date) => {
                                        const day = d.getDay();
                                        return day === 0 || day === 6;
                                    };
                                    const isToday = (d: Date) => {
                                        const t = new Date();
                                        return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
                                    };

                                    const totalDaysWidth = days.length * dayWidth;

                                    return (
                                        <>
                                            {visibleSectors.map((sector, vIdx) => {
                                                const topOffset = `calc(var(--timeline-header-height) + (${vIdx} * var(--summary-row-height)))`;
                                                const isTotal = sector.id === 'total';
                                                return (
                                                    <div
                                                        key={`summary-${sector.id}`}
                                                        className={cn("timeline-row is-summary", isTotal && "is-total-summary")}
                                                        style={{
                                                            position: 'sticky',
                                                            top: topOffset,
                                                            height: 'var(--summary-row-height)',
                                                            zIndex: isTotal ? 3600 : 3500 - vIdx,
                                                            width: 'max-content',
                                                            minWidth: '100%',
                                                            backgroundColor: isTotal ? 'rgba(99, 102, 241, 0.05)' : undefined
                                                        }}
                                                    >
                                                        {/* Block scrolling projects */}
                                                        <div className="absolute inset-0 bg-background pointer-events-none" style={{ zIndex: 0 }} />

                                                        <div
                                                            className="project-info-sticky"
                                                            style={{
                                                                borderLeft: `10px solid ${sector.color}`,
                                                                height: '100%',
                                                                background: `color-mix(in srgb, ${sector.color}, var(--background) 90%)`,
                                                                zIndex: 2005,
                                                                fontWeight: 900,
                                                                color: sector.color,
                                                                fontSize: '11px',
                                                                letterSpacing: '0.05em',
                                                                boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
                                                                position: 'sticky',
                                                                left: 0
                                                            }}
                                                        >
                                                            <div className="flex items-center h-full pl-2">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="uppercase">{sector.label}</span>
                                                                    <span className="text-[10px] text-muted-foreground font-mono opacity-90">({sector.projects.length})</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Grid lines inside summary for parity */}
                                                        <div className="absolute inset-x-0 inset-y-0 flex pointer-events-none" style={{ zIndex: 1 }}>
                                                            {days.map((day, idx) => (
                                                                <div
                                                                    key={idx}
                                                                    className={`timeline-grid-column ${isWeekend(day) ? 'is-weekend' : ''} ${isToday(day) ? 'is-today' : ''}`}
                                                                    style={{ width: dayWidth }}
                                                                />
                                                            ))}
                                                        </div>

                                                        {sector.projects.map(p => (
                                                            <TimelineBar
                                                                key={`stack-${p.id}`}
                                                                id={p.id}
                                                                name={p.name}
                                                                project={p}
                                                                status={p.status}
                                                                startDate={parseDate(p.created_at) || new Date()}
                                                                endDate={parseDate(p.deadline) || parseDate(p.customer_handover) || new Date()}
                                                                timelineStart={timelineRange.start}
                                                                dayWidth={dayWidth}
                                                                rowHeight={summaryRowHeight}
                                                                isCollapsed={true}
                                                                config={{ colors, milestoneSize, design }}
                                                                onProjectUpdate={handleProjectUpdate}
                                                                milestones={allMilestones.filter(m => m.project_id === p.id)}
                                                            />
                                                        ))}
                                                    </div >
                                                );
                                            })}


                                            {/* 2. HEAVY DIVIDER */}
                                            <div
                                                className="timeline-row p-0"
                                                style={{
                                                    position: 'sticky',
                                                    top: `calc(var(--timeline-header-height) + (${visibleSectors.length} * var(--summary-row-height)))`,
                                                    height: '2px',
                                                    background: '#1a1a1a',
                                                    borderBottom: 'none',
                                                    zIndex: 4000,
                                                    boxShadow: 'none',
                                                    width: 'max-content',
                                                    minWidth: '100%'
                                                }}
                                            >
                                                <div className="h-full bg-[#1a1a1a]" style={{ width: 250 + totalDaysWidth }}></div>
                                            </div>

                                        </>
                                    );
                                })()}

                                {/* 3. INDIVIDUAL PROJECTS */}
                                {filteredProjects.map((project) => {
                                    const sector = sectorizedProjects.find(s => s.id === (project.project_type || 'civil'));
                                    const sectorColor = sector?.color || '#90caf9';

                                    // Check visibility based on activeTypes -> REMOVED per user request
                                    /* 
                                    const type = project.project_type || 'civil';
                                    if (!activeTypes[type]) return null;
                                    */

                                    return (
                                        <div key={project.id} className="timeline-row is-project">
                                            <Link
                                                href={`/projekty/${project.id}?type=${project.project_type || 'civil'}`}
                                                className="project-info-sticky transition-colors group"
                                                style={{ borderLeft: `10px solid ${sectorColor}` }}
                                            >
                                                <div className={`project-info-content pr-2 ${project.parent_id ? 'pl-5' : 'pl-1'}`}>
                                                    <div className="flex items-center justify-between w-full">
                                                        {rowHeight >= 25 ? (
                                                            <div className="flex flex-col h-full justify-center">
                                                                <div className="flex items-center gap-1">
                                                                    {project.parent_id && (
                                                                        <div className="w-2 h-2 border-l border-b border-muted-foreground/50 rounded-bl-sm mb-1" />
                                                                    )}
                                                                    <span
                                                                        className={`project-name w-full text-left ${project.parent_id ? 'text-[11px] text-muted-foreground' : 'text-[13px] !font-bold'} ${rowHeight >= 45 ? 'is-wrapped' : 'truncate'}`}
                                                                        style={{ textAlign: 'left' }}
                                                                    >
                                                                        {project.name}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-[10px] truncate font-bold">{project.name}</span>
                                                        )}
                                                    </div>

                                                    {rowHeight >= 80 && (
                                                        <div className="mt-1 flex flex-col gap-0.5">
                                                            {(project.serial_number || project.abra_order) && (
                                                                <div className="flex justify-between items-center text-[9px] bg-black/5 px-1.5 py-0.5 rounded">
                                                                    <span className="text-muted-foreground/60 font-bold">SN/OBJ:</span>
                                                                    <span className="font-mono font-bold text-black/60">{project.serial_number || project.abra_order}</span>
                                                                </div>
                                                            )}
                                                            <div className="flex justify-between items-center text-[10px] italic">
                                                                <span className="text-muted-foreground/60">Stav:</span>
                                                                <span className="truncate max-w-[120px] font-medium text-muted-foreground" title={project.status}>{project.status}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </Link>

                                            <TimelineBar
                                                id={project.id}
                                                name={project.name}
                                                project={project}
                                                status={project.status}
                                                startDate={parseDate(project.created_at) || new Date()}
                                                endDate={parseDate(project.deadline) || parseDate(project.customer_handover) || new Date()}
                                                timelineStart={timelineRange.start}
                                                dayWidth={dayWidth}
                                                rowHeight={rowHeight}
                                                config={{ colors, milestoneSize, design }}
                                                onProjectUpdate={handleProjectUpdate}
                                                milestones={allMilestones.filter((m: ProjectMilestone) => m.project_id === project.id)}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </TimelineGrid>
                    </div >
                </div >
            </div>
        </div >
    );
};

export default Timeline;
