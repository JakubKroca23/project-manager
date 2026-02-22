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
    Zap, Star, Rocket, Coffee, Shield, Layers, Flame, Hand, Scissors, Cpu,
    Waves, Fan, CloudRain, Binary, Cog, Ruler, ClipboardCheck
} from 'lucide-react';
import Link from 'next/link';

// ─── CUSTOM ICONS ────────────────────────────────────────────────

const Hiab = ({ size = 24 }: any) => {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: size,
            height: size,
            filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.4))'
        }}>
            <svg version="1.1" viewBox="0 0 756 719" width={size} height={size} xmlSpace="preserve">
                <path fill="#000000" fillRule="evenodd" d="M239.325577,244.186447 C203.676422,260.819580 181.076263,297.162354 182.767044,334.754974 C184.659683,376.835571 214.633133,412.044403 255.930511,420.166931 C290.925354,427.049896 321.923950,419.072845 348.072388,394.205811 C348.646942,393.659393 349.350281,393.248383 350.698639,392.254486 C350.876465,394.253387 351.104340,395.619995 351.103790,396.986572 C351.103790,420.319366 350.979187,443.652557 351.102631,466.984528 C351.123352,470.902740 349.982635,472.827637 346.087982,474.136627 C314.852814,484.634644 282.792542,488.090546 250.473999,482.307434 C176.538651,469.077393 127.043213,426.617065 103.475761,355.035187 C90.394173,315.302216 90.995651,275.095520 104.500275,235.729980 C124.083107,178.646637 162.374619,139.218216 219.688461,118.965439 C265.006805,102.951469 309.664490,106.366371 353.827484,123.622246 C379.737000,133.745926 403.279755,147.750900 425.192444,164.987671 C442.542694,178.635559 460.278503,192.182083 479.337524,203.185028 C515.062378,223.809326 554.102417,231.555420 595.280273,226.561981 C615.185608,224.148117 633.773682,217.584396 650.923706,207.098816 C652.627502,206.057114 654.341736,205.031387 656.075623,204.041153 C656.311707,203.906326 656.691223,204.022583 657.474792,204.022583 C657.474792,343.750275 657.474792,483.451508 657.474792,623.471130 C592.401489,623.471130 527.332031,623.471130 461.703094,623.471130 C465.198578,598.751526 472.556335,575.556274 481.364807,553.438538 C470.681000,543.735840 459.901154,534.822144 450.133575,524.910889 C420.921997,495.269623 402.146088,459.562714 389.878693,420.032654 C380.711121,390.491394 375.579071,360.200592 371.022034,329.723511 C367.572266,306.651764 359.240570,285.458252 344.542786,267.071228 C332.136230,251.550446 315.365082,243.249496 296.460724,238.938934 C277.059540,234.515060 258.087372,236.593246 239.325577,244.186447 z M405.066071,356.463867 C410.432312,383.842468 418.457458,410.395691 430.494324,435.600952 C445.061768,466.105164 463.614624,493.674988 490.639832,514.752502 C492.789459,516.429016 495.057343,517.953857 496.417114,518.934143 C513.274902,494.606476 529.752014,470.828064 546.346313,446.880646 C544.305969,446.365356 542.040405,445.919800 539.855347,445.221893 C516.372620,437.721619 498.028503,423.066315 483.016296,403.948822 C457.174347,371.040009 444.689209,332.920502 439.677368,291.924713 C438.283508,280.522980 437.043335,269.093719 435.263367,257.750763 C433.873779,248.895523 427.581482,243.368057 419.133240,242.589844 C411.363129,241.874100 404.838959,245.662964 401.942169,253.419128 C400.451782,257.409546 399.397797,266.087616 399.397797,266.087616 C397.282166,296.164215 399.298950,326.010345 405.066071,356.463867 z M526.730957,299.152283 C524.841736,300.771179 522.798889,302.243286 521.088745,304.033264 C511.238831,314.342743 509.870361,330.107635 517.726929,341.649139 C526.089478,353.933990 540.631409,358.646790 554.090332,352.992706 C565.409607,348.237457 572.231384,339.693481 573.135559,327.223969 C574.031616,314.867828 568.991577,305.131012 558.450073,298.728607 C548.244873,292.530487 537.709229,292.676788 526.730957,299.152283 z" />
            </svg>
        </div>
    );
};

const wrapLucide = (Icon: any) => ({ size = 24, color, ...props }: any) => (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.4))'
    }}>
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
    Coffee: wrapLucide(Coffee),
    Shield: wrapLucide(Shield),
    Layers: wrapLucide(Layers),
    Flame: wrapLucide(Flame),
    Hand: wrapLucide(Hand),
    Scissors: wrapLucide(Scissors),
    Cpu: wrapLucide(Cpu),
    Waves: wrapLucide(Waves),
    Fan: wrapLucide(Fan),
    CloudRain: wrapLucide(CloudRain),
    Binary: wrapLucide(Binary),
    Cog: wrapLucide(Cog),
    Ruler: wrapLucide(Ruler),
    ClipboardCheck: wrapLucide(ClipboardCheck)
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
    milestoneMountingEnd: IColorConfig;
    milestoneRevisionEnd: IColorConfig;
    milestoneStart: IColorConfig;
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
    const { setOnFit, setOnJumpToToday, setOnZoomIn, setOnZoomOut, setOnToggleDesign, setDayWidth: setGlobalDayWidth } = useActions();
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

    // Global Milestone Size (%)
    const [milestoneSize, setMilestoneSize] = useState<number>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('timeline_milestoneSize');
            return saved ? parseInt(saved) : 65;
        }
        return 65;
    });
    // Summary row height fixed at 20px by user request
    const summaryRowHeight = 20;
    const [showDesignSettings, setShowDesignSettings] = useState(false);
    const [openIconSelector, setOpenIconSelector] = useState<string | null>(null);
    const [design, setDesign] = useState({
        borderRadius: 4,
        barHeight: 70, // in %
        opacity: 1,
        usePriorityColors: true,
        stackedOpacity: 0.15,
        milestoneBoxScale: 1.2,
        stackOpacityRed: 0.6, // New: multiplier for red overlap intensity
        useExtractedMilestones: true, // New: only icon outline, no box
        milestoneOutlineWidth: 2 // New: outline width in px
    });
    const timelineRef = useRef<HTMLDivElement>(null);
    const initialTouchDistance = useRef<number | null>(null);
    const initialTouchDayWidth = useRef<number | null>(null);

    // Ref for accessing current dayWidth in event listeners
    const dayWidthRef = useRef(dayWidth);

    // CRITICAL: Update ref synchronously after render to ensure event handlers have fresh state
    // immediately for the next event in the loop.
    useLayoutEffect(() => {
        dayWidthRef.current = dayWidth;
        setGlobalDayWidth(dayWidth);
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

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('timeline_milestoneSize', milestoneSize.toString());
        }
    }, [milestoneSize]);

    // Color Configuration State
    const [colors, setColors] = useState<IColorsState>({
        phaseInitial: { color: '#bae6fd', opacity: 0.4, label: 'Zahájení', showInStack: false },
        phaseMounting: { color: '#4ade80', opacity: 0.35, label: 'Příprava', showInStack: true },
        phaseBufferYellow: { color: '#facc15', opacity: 0.5, label: 'Montáž', showInStack: true },
        milestoneChassis: { color: '#000000', opacity: 1, label: 'Podvozek', icon: 'Truck', showInStack: true },
        milestoneBody: { color: '#000000', opacity: 1, label: 'Nástavba', icon: 'Hiab', showInStack: true },
        milestoneHandover: { color: '#000000', opacity: 1, label: 'Předání', icon: 'ThumbsUp', showInStack: true },
        milestoneDeadline: { color: '#000000', opacity: 1, label: 'Deadline', icon: 'AlertTriangle', showInStack: true },
        milestoneMountingEnd: { color: '#000000', opacity: 1, label: 'Konec Přípravy', icon: 'Package', showInStack: false },
        milestoneRevisionEnd: { color: '#000000', opacity: 1, label: 'Konec Montáže', icon: 'Factory', showInStack: false },
        milestoneStart: { color: '#000000', opacity: 1, label: 'Příjem', icon: 'Zap', showInStack: false },
        priority1: { color: '#ef4444', opacity: 1, label: 'Urgentní' },
        priority2: { color: '#3b82f6', opacity: 1, label: 'Normální' },
        priority3: { color: '#94a3b8', opacity: 1, label: 'Nízká' },
        statePending: { color: '#374151', opacity: 1, label: 'Čeká' },
        stateCompleted: { color: '#22c55e', opacity: 1, label: 'Hotovo' },
        stateOverdue: { color: '#ef4444', opacity: 1, label: 'Zpožděno' },
    });

    const [outline, setOutline] = useState<IOutlineState>({ enabled: true, width: 1, color: '#000000', opacity: 0.2, showInStack: true });

    const [collapsedSectors, setCollapsedSectors] = useState<Record<string, boolean>>({});

    const toggleSector = (sectorId: string) => {
        setCollapsedSectors((prev: Record<string, boolean>) => ({ ...prev, [sectorId]: !prev[sectorId] }));
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
                    setColors((prev: IColorsState) => ({
                        ...prev,
                        ...s.colors
                    }));
                }
                if (s.outline) setOutline(s.outline);
                if (s.milestoneSize) setMilestoneSize(s.milestoneSize);
                if (s.design) {
                    setDesign((prev: any) => ({
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

    const headerHeight = 38; // Months (20) + Weeks (18)

    const customStyles = {
        '--timeline-header-height': `${headerHeight}px`,
        '--timeline-sector-height': '36px',
        '--phase-initial': hexToRgba(colors.phaseInitial?.color || '#bae6fd', colors.phaseInitial?.opacity || 0.4),
        '--phase-mounting': hexToRgba(colors.phaseMounting?.color || '#4ade80', colors.phaseMounting?.opacity || 0.35),
        '--phase-buffer-yellow': hexToRgba(colors.phaseBufferYellow?.color || '#facc15', colors.phaseBufferYellow?.opacity || 0.5),
        '--summary-row-height': `${summaryRowHeight}px`,
        '--project-row-height': `${rowHeight}px`,
        '--element-border': outline.enabled ? `${outline.width}px solid ${hexToRgba(outline.color, outline.opacity)}` : 'none',
        '--row-height': `${rowHeight}px`,
        '--timeline-row-height': `${rowHeight}px`,
        '--day-width': `${dayWidth}px`,
        '--bar-radius': `${design.borderRadius}px`,
        '--bar-height': `${design.barHeight}%`,
        '--bar-opacity': design.opacity,
        '--stack-opacity-red': design.stackOpacityRed || 0.6,
        '--priority-1-color': colors.priority1.color,
        '--priority-2-color': colors.priority2.color,
        '--priority-3-color': colors.priority3.color,
    } as any;







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

    // Touch Pinch Zoom Handler
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const handleTouchStart = (e: TouchEvent) => {
            if (e.touches.length === 2) {
                const dist = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                initialTouchDistance.current = dist;
                initialTouchDayWidth.current = dayWidthRef.current;

                const midpointX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
                const rect = container.getBoundingClientRect();
                const focalX = midpointX - rect.left;
                const pointDays = (container.scrollLeft + focalX) / dayWidthRef.current;
                zoomFocus.current = { pointDays, pixelOffset: focalX };
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length === 2 && initialTouchDistance.current && initialTouchDayWidth.current) {
                // Stay on timeline container to allow custom pinch-zoom
                if ((e.target as HTMLElement).closest('.timeline-container')) {
                    e.preventDefault();
                    const dist = Math.hypot(
                        e.touches[0].clientX - e.touches[1].clientX,
                        e.touches[0].clientY - e.touches[1].clientY
                    );
                    const scale = dist / initialTouchDistance.current;
                    const nextWidth = Math.min(MAX_DAY_WIDTH, Math.max(MIN_DAY_WIDTH, initialTouchDayWidth.current * scale));
                    setDayWidth(nextWidth);
                }
            }
        };

        const handleTouchEnd = () => {
            initialTouchDistance.current = null;
            initialTouchDayWidth.current = null;
        };

        container.addEventListener('touchstart', handleTouchStart, { passive: true });
        container.addEventListener('touchmove', handleTouchMove, { passive: false });
        container.addEventListener('touchend', handleTouchEnd, { passive: true });

        return () => {
            container.removeEventListener('touchstart', handleTouchStart);
            container.removeEventListener('touchmove', handleTouchMove);
            container.removeEventListener('touchend', handleTouchEnd);
        };
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

    const getActivePhaseColor = (project: Project) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (project.project_type === 'service') {
            return '#6366f1';
        }

        const t_start = parseDate(project.created_at);
        const t_chassis = parseDate(project.chassis_delivery || project.custom_fields?.chassis_delivery);
        const t_body = parseDate(project.body_delivery || project.custom_fields?.body_delivery);
        const t_handover = parseDate(project.customer_handover || project.custom_fields?.customer_handover);
        const t_deadline = parseDate(project.deadline || project.custom_fields?.deadline);
        const customMountingEnd = parseDate(project.custom_fields?.mounting_end_date);

        const mDates = [t_chassis, t_body, t_handover, t_deadline].filter((d): d is Date => d !== null);

        // 1. Initial Phase
        if (t_start && mDates.length > 0) {
            const firstM = new Date(Math.min(...mDates.map(d => d.getTime())));
            if (today >= t_start && today < firstM) {
                return colors.phaseInitial?.color || '#bae6fd';
            }
        }

        // 2. Mounting Phase
        if (t_chassis && t_body) {
            const start = new Date(Math.min(t_chassis.getTime(), t_body.getTime()));
            const end = new Date(Math.max(t_chassis.getTime(), t_body.getTime()));
            if (today >= start && today < end) {
                return colors.phaseMounting?.color || '#4ade80';
            }
        }

        // 3. Buffer Yellow
        const lastMainM = [t_chassis, t_body].filter((d): d is Date => d !== null);
        if (lastMainM.length > 0) {
            const mountingStart = new Date(Math.max(...lastMainM.map(d => d.getTime())));
            let mountingEnd;
            if (customMountingEnd) {
                mountingEnd = customMountingEnd;
            } else {
                mountingEnd = new Date(mountingStart);
                mountingEnd.setDate(mountingEnd.getDate() + 14);
            }
            if (today >= mountingStart && today < mountingEnd) {
                // Priority logic check
                if (design.usePriorityColors && project.priority) {
                    const priorityKey = `priority${project.priority}` as keyof typeof colors;
                    const priorityConfig = colors[priorityKey] as any;
                    if (priorityConfig) return priorityConfig.color;
                }
                return colors.phaseBufferYellow?.color || '#facc15';
            }
        }

        return null;
    };

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

    // Projects filtered by search and basic rules, but NOT by activeTypes toggles (for "Total" summary)
    const searchFilteredProjects = useMemo((): Project[] => {
        let filtered = projects;

        // Special rule for Military: Hide all parent projects, show only sub-projects
        filtered = filtered.filter((p: Project) => {
            const isMilitary = p.project_type === 'military' || p.category?.toLowerCase() === 'vojenské';
            if (isMilitary && !p.parent_id) {
                return false;
            }
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
                    p.name, p.customer, p.id, p.abra_project, p.abra_order,
                    p.serial_number, p.manager, p.status, p.category,
                    p.production_status, p.mounting_company, p.body_type, p.body_setup
                ].map(term => normalize(term || ''));

                const customTerms = p.custom_fields ? Object.values(p.custom_fields)
                    .filter(v => typeof v === 'string')
                    .map(v => normalize(v as string)) : [];

                const searchStr = [...searchTerms, ...customTerms].join(' ');
                return terms.every((term: string) => searchStr.includes(term));
            });
        }

        // Filter projects that only have the 'start' milestone
        filtered = filtered.filter((p: Project) => {
            const hasOtherMilestones =
                p.chassis_delivery || p.body_delivery || p.customer_handover ||
                p.deadline || p.custom_fields?.mounting_end_date || p.custom_fields?.revision_end_date;
            return !!hasOtherMilestones;
        });

        // Sorting: Hierarchical
        return filtered.sort((a: Project, b: Project) => {
            const dateA = getSortDate(a);
            const dateB = getSortDate(b);
            if (dateA !== dateB) return dateA - dateB;
            return (a.name || '').localeCompare(b.name || '');
        });
    }, [projects, searchQuery]);

    // Final list of projects to display in the grid (shows everything, filters removed)
    const filteredProjects = useMemo((): Project[] => {
        return searchFilteredProjects;
    }, [searchFilteredProjects]);

    // Color mapping for sectors and projects
    const SECTOR_COLORS: Record<string, string> = {
        total: '#6366f1',
        civil: '#90caf9',
        military: '#1b5e20', // Tmavě zelená dle požadavku
        service: '#a855f7'
    };

    // Grupa projektů do sektorů (Pouze ty, které chceme jako SUMÁRNÍ ŘÁDKY nahoře)
    const sectorizedProjects = useMemo(() => {
        const service = searchFilteredProjects.filter(p => p.project_type === 'service');

        return [
            { id: 'total', label: 'CELKEM (VŠECHNY ZAKÁZKY)', projects: searchFilteredProjects, color: SECTOR_COLORS.total },
            { id: 'service', label: 'SERVIS', projects: service, color: SECTOR_COLORS.service }
        ].filter(s => s.id === 'total' || activeTypes[s.id]);
    }, [searchFilteredProjects, activeTypes]);

    const jumpToToday = () => {
        if (scrollContainerRef.current) {
            const today = new Date();
            const d1 = new Date(timelineRange.start.getFullYear(), timelineRange.start.getMonth(), timelineRange.start.getDate());
            const d2 = new Date(today.getFullYear(), today.getMonth(), today.getDate());

            const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
            const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());

            const diffDays = Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
            const dayPos = diffDays * dayWidth;

            const container = scrollContainerRef.current;
            const containerWidth = container.clientWidth;

            // Dynamicky zjistíme šířku sidebaru (na mobilu je 110px, na pc 250px)
            const sidebarEl = container.querySelector('.project-info-sticky');
            const sidebarWidth = sidebarEl ? (sidebarEl as HTMLElement).offsetWidth : 250;
            const visibleGridWidth = containerWidth - sidebarWidth;

            // Výpočet: scrollLeft nastavíme tak, aby dayPos (začátek dne) byl uprostřed volné plochy (za sidebarWidth)
            const targetScroll = dayPos - (visibleGridWidth / 2) + (dayWidth / 2);

            container.scrollTo({
                left: Math.max(0, targetScroll),
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
        // Header (38) + Celkem/Days (29) + Divider (2) + Servis (40) = 109px
        const summaryAreaHeight = 38 + 29 + 2 + (activeTypes.service ? 40 : 0);
        const bodyHeight = timelineRef.current.offsetHeight - summaryAreaHeight;
        const totalRows = filteredProjects.length + 2;
        if (totalRows <= 0) return;
        const targetHeight = Math.floor(bodyHeight / totalRows);
        const newHeight = Math.max(14, Math.min(100, targetHeight));
        setRowHeight(newHeight);
    }, [filteredProjects.length, activeTypes.service, timelineRef]);

    useEffect(() => {
        setOnFit(() => handleFitVertical);
        setOnJumpToToday(() => jumpToToday);
        setOnZoomIn(() => handleZoomIn);
        setOnZoomOut(() => handleZoomOut);
        setOnToggleDesign(() => () => setShowDesignSettings(prev => !prev));

        return () => {
            setOnFit(null);
            setOnJumpToToday(null);
            setOnZoomIn(null);
            setOnZoomOut(null);
            setOnToggleDesign(null);
        };
    }, [handleFitVertical, setOnFit, setOnJumpToToday, setOnZoomIn, setOnZoomOut, setOnToggleDesign]);

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
                                <div>
                                    <div className="flex justify-between text-[10px] font-bold mb-1.5">
                                        <span className="text-muted-foreground">Intenzita překryvů (Důraz)</span>
                                        <span className="text-primary">{Math.round((design.stackOpacityRed || 0.6) * 100)}%</span>
                                    </div>
                                    <input
                                        type="range" min="0.1" max="1.5" step="0.1"
                                        value={design.stackOpacityRed || 0.6}
                                        onChange={(e) => setDesign({ ...design, stackOpacityRed: parseFloat(e.target.value) })}
                                        className="w-full accent-primary h-1 bg-muted rounded-lg appearance-none cursor-pointer"
                                    />
                                    <div className="text-[8px] text-muted-foreground/60 mt-1 italic">
                                        Nastavení sytosti červeného varování při kumulaci zakázek
                                    </div>
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

                                <div className="h-px bg-border/40 my-1" />

                                <div>
                                    <div className="flex justify-between text-[10px] font-bold mb-1.5">
                                        <span className="text-muted-foreground">Velikost ikon</span>
                                        <span className="text-primary">{milestoneSize}%</span>
                                    </div>
                                    <input
                                        type="range" min="30" max="150" step="5"
                                        value={milestoneSize}
                                        onChange={(e) => setMilestoneSize(parseInt(e.target.value))}
                                        className="w-full accent-primary h-1 bg-muted rounded-lg appearance-none cursor-pointer"
                                    />
                                    <div className="text-[8px] text-muted-foreground/60 mt-1 italic">
                                        V % vůči výšce řádku ({Math.round(rowHeight * (milestoneSize / 100))}px)
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <div className="flex justify-between text-[10px] font-bold mb-1.5">
                                        <span className="text-muted-foreground">Velikost boxu milníku</span>
                                        <span className="text-primary">{Math.round((design.milestoneBoxScale || 1.2) * 100)}%</span>
                                    </div>
                                    <input
                                        type="range" min="1" max="2" step="0.05"
                                        value={design.milestoneBoxScale || 1.2}
                                        onChange={(e) => setDesign({ ...design, milestoneBoxScale: parseFloat(e.target.value) })}
                                        className="w-full accent-primary h-1 bg-muted rounded-lg appearance-none cursor-pointer"
                                    />
                                    <div className="text-[8px] text-muted-foreground/60 mt-1 italic">
                                        Poměr velikosti čtverce vůči ikoně
                                    </div>
                                </div>

                                <div className="h-px bg-border/40 my-2" />

                                <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg border border-border/30">
                                    <span className="text-[10px] font-bold text-muted-foreground">Použít extrakci ikon</span>
                                    <button
                                        onClick={() => setDesign({ ...design, useExtractedMilestones: !design.useExtractedMilestones })}
                                        className={cn(
                                            "w-7 h-3.5 rounded-full transition-colors relative",
                                            design.useExtractedMilestones ? "bg-primary" : "bg-muted-foreground/30"
                                        )}
                                    >
                                        <div className={cn(
                                            "absolute top-0.5 left-0.5 w-2.5 h-2.5 rounded-full bg-white transition-transform shadow-sm",
                                            design.useExtractedMilestones ? "translate-x-3.5" : "translate-x-0"
                                        )} />
                                    </button>
                                </div>

                                {design.useExtractedMilestones && (
                                    <div className="mt-3">
                                        <div className="flex justify-between text-[10px] font-bold mb-1.5">
                                            <span className="text-muted-foreground">Tloušťka vytažení (px)</span>
                                            <span className="text-primary">{design.milestoneOutlineWidth}px</span>
                                        </div>
                                        <input
                                            type="range" min="1" max="8" step="1"
                                            value={design.milestoneOutlineWidth}
                                            onChange={(e) => setDesign({ ...design, milestoneOutlineWidth: parseInt(e.target.value) })}
                                            className="w-full accent-primary h-1 bg-muted rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>
                                )}
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

                            <h4 className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-wider mb-2 mt-4">Barvy Stavů (Milníky)</h4>
                            <div className="grid grid-cols-1 gap-2">
                                {Object.entries(colors).filter(([k]) => k.startsWith('state')).map(([key, config]) => (
                                    <div key={key} className="flex items-center justify-between p-1.5 bg-muted/20 rounded border border-border/20">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded shadow-sm" style={{ backgroundColor: config.color }} />
                                            <span className="text-[9px] font-bold text-muted-foreground">{config.label}</span>
                                        </div>
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

                            {/* Milníkové barvy byly odstraněny na žádost uživatele */}

                            {isAdmin && (
                                <>
                                    <h4 className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-wider mb-2 mt-4">Ikony Milníků</h4>
                                    <div className="space-y-2">
                                        {[
                                            { key: 'milestoneChassis', label: 'Podvozek' },
                                            { key: 'milestoneBody', label: 'Nástavba' },
                                            { key: 'milestoneHandover', label: 'Předání' },
                                            { key: 'milestoneDeadline', label: 'Deadline' }
                                        ].map(({ key, label }) => {
                                            const config = (colors as any)[key];
                                            if (!config) return null;
                                            const IconComponent = ICON_OPTIONS[config.icon as keyof typeof ICON_OPTIONS] || ICON_OPTIONS['Milestone'];
                                            const isOpen = openIconSelector === key;

                                            return (
                                                <div key={key} className="space-y-2">
                                                    <div
                                                        className={cn(
                                                            "flex items-center justify-between p-2 bg-muted/20 rounded border transition-all cursor-pointer hover:bg-muted/30",
                                                            isOpen ? "border-primary shadow-sm bg-muted/40" : "border-border/20"
                                                        )}
                                                        onClick={() => setOpenIconSelector(isOpen ? null : key)}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                className="w-8 h-8 flex items-center justify-center transition-all bg-muted/40 rounded-md border border-border/20 group-hover:border-primary/30"
                                                            >
                                                                <IconComponent size={20} color="#000000" />
                                                            </div>
                                                            <span className="text-[10px] font-black uppercase tracking-tight text-muted-foreground">{label}</span>
                                                        </div>
                                                        {/* Výběr barvy byl odstraněn na žádost uživatele */}
                                                    </div>

                                                    {isOpen && (
                                                        <div className="grid grid-cols-6 gap-1.5 p-2 bg-muted/40 rounded-lg border border-primary/20 animate-in zoom-in-95 duration-200">
                                                            {VISIBLE_ICONS.map((iconName) => {
                                                                const SelectionIcon = ICON_OPTIONS[iconName as keyof typeof ICON_OPTIONS];
                                                                return (
                                                                    <button
                                                                        key={iconName}
                                                                        onClick={() => {
                                                                            setColors({ ...colors, [key]: { ...config, icon: iconName } });
                                                                            setOpenIconSelector(null);
                                                                        }}
                                                                        className={cn(
                                                                            "w-8 h-8 flex items-center justify-center rounded transition-all",
                                                                            config.icon === iconName
                                                                                ? "bg-primary text-white scale-110 shadow-md ring-2 ring-primary/20"
                                                                                : "bg-background/50 hover:bg-background text-muted-foreground hover:text-foreground hover:scale-105"
                                                                        )}
                                                                        title={iconName}
                                                                    >
                                                                        <SelectionIcon size={18} color={config.icon === iconName ? "#ffffff" : "#000000"} />
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
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
                            showDays={false}
                        >
                            <div className="timeline-rows">
                                {/* 1. CATEGORY SUMMARIES (Stacked) */}
                                {(() => {
                                    const visibleSectors = sectorizedProjects;

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
                                    const isWeekStart = (d: Date) => d.getDay() === 1; // Pondělí

                                    const totalDaysWidth = days.length * dayWidth;

                                    return (
                                        <>
                                            {visibleSectors.map((sector, vIdx) => {
                                                const isTotal = sector.id === 'total';
                                                const sHeight = isTotal ? 29 : 40;
                                                const topOffset = isTotal
                                                    ? '38px' // Static top for Total (Months 20 + Weeks 18)
                                                    : 'calc(38px + 29px + 2px)';

                                                return (
                                                    <div
                                                        key={`summary-${sector.id}`}
                                                        className={cn("timeline-row is-summary", isTotal && "is-total-summary")}
                                                        style={{
                                                            position: 'sticky',
                                                            top: topOffset,
                                                            height: sHeight,
                                                            zIndex: isTotal ? 3600 : 3500 - vIdx,
                                                            width: 'max-content',
                                                            minWidth: '100%',
                                                            backgroundColor: isTotal ? '#ffffff' : undefined,
                                                            borderBottom: isTotal ? '2px solid #cbd5e1' : undefined // Lighter 2px divider
                                                        }}
                                                    >
                                                        {/* Day Numbers for Total Row - Highest Z-index to pop over red warning and projects */}
                                                        {isTotal && dayWidth > 12 && (
                                                            <div className="absolute inset-0 flex pointer-events-none" style={{ zIndex: 75 }}>
                                                                {days.map((day, idx) => {
                                                                    const showDayName = dayWidth > 35;
                                                                    const today = isToday(day);

                                                                    return (
                                                                        <div
                                                                            key={idx}
                                                                            className={cn(
                                                                                "flex flex-col items-center justify-center border-r border-border/10",
                                                                                today ? "border-[4px] border-red-500 rounded-md shadow-[0_0_15px_rgba(239,68,68,0.6)] bg-red-500 mx-[1px]" : "",
                                                                                isWeekend(day) && "bg-muted/10"
                                                                            )}
                                                                            style={{ width: dayWidth }}
                                                                        >
                                                                            <div className="flex flex-col items-center gap-0 translate-y-[1px]">
                                                                                {showDayName && (
                                                                                    <span className="text-[7px] leading-tight font-black uppercase mb-[-1px] px-1 rounded-sm text-white"
                                                                                        style={{
                                                                                            textShadow: '1px 1px 0 #000, -1px 1px 0 #000, 1px -1px 0 #000, -1px -1px 0 #000, 0 0 2px #000'
                                                                                        }}>
                                                                                        {day.toLocaleDateString('cs-CZ', { weekday: 'short' })}
                                                                                    </span>
                                                                                )}
                                                                                <span
                                                                                    className="flex items-center justify-center shrink-0 text-white font-black"
                                                                                    style={{
                                                                                        fontSize: dayWidth < 20 ? '9px' : '12px',
                                                                                        textShadow: '1px 1px 0 #000, -1px 1px 0 #000, 1px -1px 0 #000, -1px -1px 0 #000, 0 0 3px #000'
                                                                                    }}
                                                                                >
                                                                                    {day.getDate()}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                        {/* Block scrolling projects */}
                                                        <div className="absolute inset-0 bg-white pointer-events-none" style={{ zIndex: 0 }} />

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

                                                        {/* Grid lines inside summary for parity - Higher Z-index to overlay projects/numbers */}
                                                        <div className="absolute inset-x-0 inset-y-0 flex pointer-events-none" style={{ zIndex: 60 }}>
                                                            {(() => {
                                                                // Calculate overlap counts for this sector
                                                                const zoneCounts = new Array(days.length).fill(0);
                                                                sector.projects.forEach(p => {
                                                                    // We only count overlaps for the "Mounting" phase (Buffer Yellow)
                                                                    const t_chassis = parseDate(p.chassis_delivery);
                                                                    const t_body = parseDate(p.body_delivery);
                                                                    const customMountingEnd = parseDate(p.custom_fields?.mounting_end_date);

                                                                    const lastMainM = [t_chassis, t_body].filter((d): d is Date => d !== null);
                                                                    if (lastMainM.length === 0) return;

                                                                    const mountingStart = new Date(Math.max(...lastMainM.map(d => d.getTime())));
                                                                    let mountingEnd;
                                                                    if (customMountingEnd) {
                                                                        mountingEnd = customMountingEnd;
                                                                    } else {
                                                                        mountingEnd = new Date(mountingStart);
                                                                        mountingEnd.setDate(mountingEnd.getDate() + 14);
                                                                    }

                                                                    const sIdx = Math.max(0, Math.floor((mountingStart.getTime() - timelineRange.start.getTime()) / (1000 * 3600 * 24)));
                                                                    const eIdx = Math.min(days.length - 1, Math.floor((mountingEnd.getTime() - timelineRange.start.getTime()) / (1000 * 3600 * 24)));

                                                                    for (let i = sIdx; i <= eIdx; i++) {
                                                                        zoneCounts[i]++;
                                                                    }
                                                                });

                                                                return days.map((day: Date, idx: number) => {
                                                                    const count = zoneCounts[idx];
                                                                    return (
                                                                        <div
                                                                            key={idx}
                                                                            className={cn(
                                                                                `timeline-grid-column`,
                                                                                isWeekend(day) && 'is-weekend',
                                                                                isToday(day) && 'is-today',
                                                                                isWeekStart(day) && 'is-week-start',
                                                                                count === 2 && 'stack-2',
                                                                                count === 3 && 'stack-3',
                                                                                count >= 4 && 'stack-4plus'
                                                                            )}
                                                                            style={{ width: dayWidth }}
                                                                        />
                                                                    );
                                                                });
                                                            })()}
                                                        </div>

                                                        {sector.projects.map((p: Project) => (
                                                            <TimelineBar
                                                                key={`stack-${p.id}`}
                                                                id={p.id}
                                                                name={p.id}
                                                                project={p}
                                                                status={p.status}
                                                                startDate={parseDate(p.created_at) || new Date()}
                                                                endDate={parseDate(p.deadline) || parseDate(p.customer_handover) || new Date()}
                                                                timelineStart={timelineRange.start}
                                                                dayWidth={dayWidth}
                                                                rowHeight={isTotal ? 29 : 40}
                                                                isCollapsed={true}
                                                                config={{ colors, milestoneSize, design }}
                                                                onProjectUpdate={handleProjectUpdate}
                                                                milestones={allMilestones.filter((m: ProjectMilestone) => m.project_id === p.id)}
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
                                                    top: `calc(var(--timeline-header-height) + ${29 + (activeTypes.service ? 40 : 0) + 2}px)`,
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

                                {filteredProjects.map((project) => {
                                    const type = project.project_type || 'civil';
                                    const sectorColor = SECTOR_COLORS[type] || SECTOR_COLORS.civil;

                                    // Check visibility based on activeTypes -> REMOVED per user request
                                    /*
                                    const type = project.project_type || 'civil';
                                    if (!activeTypes[type]) return null;
                                    */

                                    const activePhaseColor = getActivePhaseColor(project);

                                    return (
                                        <div key={project.id} className="timeline-row is-project">
                                            <Link
                                                href={`/projekty/${project.id}?type=${project.project_type || 'civil'}`}
                                                className="project-info-sticky transition-colors group"
                                                style={{
                                                    borderLeft: `10px solid ${sectorColor}`,
                                                    backgroundColor: activePhaseColor ? activePhaseColor : 'white',
                                                    background: activePhaseColor ? `color-mix(in srgb, ${activePhaseColor}, white 82%)` : 'white'
                                                }}
                                            >
                                                <div className="project-info-content pr-2 min-w-0 pl-1">
                                                    <div className="flex flex-col h-full justify-center overflow-hidden py-0.5">
                                                        {/* Priority: OP# and Customer */}
                                                        <div className="flex items-center gap-1.5 min-w-0">
                                                            <span className="text-[9px] font-black bg-black/10 px-1 rounded-[2px] shrink-0 text-foreground/80">
                                                                {(() => {
                                                                    const id = project.parent_id || project.id;
                                                                    return id.startsWith('OP-') ? id : `OP-${id}`;
                                                                })()}
                                                            </span>
                                                            {project.customer && (
                                                                <span className="text-[10px] font-bold text-muted-foreground truncate" title={project.customer}>{project.customer}</span>
                                                            )}
                                                        </div>

                                                        {/* Project Name - Show if height >= 28 */}
                                                        {rowHeight >= 28 && (
                                                            <span
                                                                className={cn(
                                                                    "text-[11px] font-bold leading-tight truncate mt-0.5",
                                                                    project.parent_id ? "text-muted-foreground/80 font-medium" : "text-foreground"
                                                                )}
                                                                title={project.name}
                                                            >
                                                                {project.name}
                                                            </span>
                                                        )}

                                                        {/* Manager - Show if height >= 48 */}
                                                        {rowHeight >= 48 && project.manager && (
                                                            <span className="text-[9px] font-bold text-black uppercase tracking-tighter truncate italic mt-0.5">
                                                                {project.manager}
                                                            </span>
                                                        )}
                                                    </div>
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
