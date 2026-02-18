'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo, useLayoutEffect } from 'react';
import './Timeline.css';
import { supabase } from '@/lib/supabase/client';
import { Project, Milestone as ProjectMilestone } from '@/types/project';
import { useSearch } from '@/providers/SearchProvider';
import { useActions } from '@/providers/ActionProvider';
import TimelineGrid from './TimelineGrid';
import TimelineBar from './TimelineBar';
import {
    Search, Calendar, ZoomIn,
    ZoomOut,
    X,
    RotateCcw,
    ChevronDown,
    ChevronRight,
    ChevronUp,
    Truck,
    Hammer,
    ThumbsUp,
    AlertTriangle,
    Play,
    Check,
    Save,
    Milestone,
    Cog,
    Wrench,
    Zap,
    Cpu,
    Activity,
    Package,
    Box,
    HardHat,
    Construction,
    Factory,
    Pickaxe,
    Settings2,
    ShieldCheck,
    Container,
    Anchor,
    Component,
    Drill,
    Settings,
    HelpCircle,
    Info,
    MousePointer2,
    MoveHorizontal,
    MousePointerClick,
    Palette,
    Flag
} from 'lucide-react';
import Link from 'next/link';

// ─── CUSTOM ICONS ────────────────────────────────────────────────
const HookLoader = ({ size = 24, ...props }: any) => (
    <svg width={size} height={size} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 17h18" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="17" cy="18" r="2" />
        <path d="M2 17h2v-4h4v4h2" />
        <path d="M18 17h4v-6h-4z" />
        <path d="M13 14l5-5h3" />
    </svg>
);

const HydraulicCrane = ({ size = 24, ...props }: any) => (
    <svg width={size} height={size} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 17h18" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="17" cy="18" r="2" />
        <path d="M2 17h2v-4h4v4h2" />
        <path d="M12 13l4-7 5 1" />
    </svg>
);

const HydraulicPlatform = ({ size = 24, ...props }: any) => (
    <svg width={size} height={size} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 17h18" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="17" cy="18" r="2" />
        <path d="M3 17v-3h4v3" />
        <path d="M10 17l3-6 3 6" />
        <path d="M11 11l2-4 2 4" />
        <path d="M11 7h4" />
    </svg>
);

const TruckCrane = ({ size = 24, ...props }: any) => (
    <svg width={size} height={size} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 17h20" />
        <circle cx="6" cy="18" r="2" />
        <circle cx="14" cy="18" r="2" />
        <circle cx="18" cy="18" r="2" />
        <path d="M2 17v-4h4l3 3h5v-3l7-5" />
    </svg>
);




const Crane = ({ size = 24, ...props }: any) => (
    <svg width={size} height={size} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 21h16" />
        <path d="M12 21V3" />
        <path d="M12 3l8 4" />
        <path d="M12 3H4" />
        <path d="M4 3v4" />
        <path d="M12 7H8" />
        <path d="M8 3v4" />
    </svg>
);

const Superstructure = ({ size = 24, ...props }: any) => (
    <svg width={size} height={size} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* Hook */}
        <path d="M12 2v2" />
        <circle cx="12" cy="5" r="1.5" />
        <path d="M12 6.5v2" />
        <path d="M12 8.5a2.5 2.5 0 0 0 2.5 2.5" />

        {/* Cables */}
        <path d="M12 11l-7 5" />
        <path d="M12 11l7 5" />

        {/* Load Block (Box) */}
        <path d="M5 16h14v6H5z" />
        <path d="M5 16l2-2h10l2 2" /> {/* Top/Perspective of box */}
        <path d="M12 16v6" /> {/* Center line */}
    </svg>
);

const Hiab = ({ size = 24, ...props }: any) => (
    <svg width={size} height={size} {...props} viewBox="0 0 756 719" version="1.1" xmlns="http://www.w3.org/2000/svg">
        {/* Background square with border */}
        <path fill="#FDFDFD" stroke="currentColor" strokeWidth="40" d="M709.98,682.51 C490.48,682.52 271.49,682.53 52.50,682.54 C48.33,682.54 44.13,682.78 40.02,682.33 C38.74,682.19 36.78,680.18 36.68,678.91 C36.30,674.11 36.58,669.26 36.58,664.42 C36.60,458.26 36.63,252.10 36.51,45.94 C36.51,40.97 37.56,39.57 42.79,39.58 C209.62,39.77 376.45,39.78 543.28,39.81 C599.78,39.82 656.27,39.78 712.77,39.78 C714.07,39.78 715.37,39.89 717.04,39.97 C717.16,41.61 717.37,43.05 717.37,44.48 C717.39,254.98 717.39,465.47 717.39,675.96 C717.39,682.51 717.38,682.51 709.98,682.51 Z" />
        {/* Bird logo silhouette */}
        <path fill="currentColor" stroke="none" d="M239.325577,244.186447 C203.676422,260.819580 181.076263,297.162354 182.767044,334.754974 C184.659683,376.835571 214.633133,412.044403 255.930511,420.166931 C290.925354,427.049896 321.923950,419.072845 348.072388,394.205811 C348.646942,393.659393 349.350281,393.248383 350.698639,392.254486 C350.876465,394.253387 351.104340,395.619995 351.103790,396.986572 C351.094727,420.319366 350.979187,443.652557 351.102631,466.984528 C351.123352,470.902740 349.982635,472.827637 346.087982,474.136627 C314.852814,484.634644 282.792542,488.090546 250.473999,482.307434 C176.538651,469.077393 127.043213,426.617065 103.475761,355.035187 C90.394173,315.302216 90.995651,275.095520 104.500275,235.729980 C124.083107,178.646637 162.374619,139.218216 219.688461,118.965439 C265.006805,102.951469 309.664490,106.366371 353.827484,123.622246 C379.737000,133.745926 403.279755,147.750900 425.192444,164.987671 C442.542694,178.635559 460.278503,192.182083 479.337524,203.185028 C515.062378,223.809326 554.102417,231.555420 595.280273,226.561981 C615.185608,224.148117 633.773682,217.584396 650.923706,207.098816 C652.627502,206.057114 654.341736,205.031387 656.075623,204.041153 C656.311707,203.906326 656.691223,204.022583 657.474792,204.022583 C657.474792,343.750275 657.474792,483.451508 657.474792,623.471130 C592.401489,623.471130 527.332031,623.471130 461.703094,623.471130 C465.198578,598.751526 472.556335,575.556274 481.364807,553.438538 C470.681000,543.735840 459.901154,534.822144 450.133575,524.910889 C420.921997,495.269623 402.146088,459.562714 389.878693,420.032654 C380.711121,390.491394 375.579071,360.200592 371.022034,329.723511 C367.572266,306.651764 359.240570,285.458252 344.542786,267.071228 C332.136230,251.550446 315.365082,243.249496 296.460724,238.938934 C277.059540,234.515060 258.087372,236.593246 239.325577,244.186447 M405.066071,356.463867 C410.432312,383.842468 418.457458,410.395691 430.494324,435.600952 C445.061768,466.105164 463.614624,493.674988 490.639832,514.752502 C492.789459,516.429016 495.057343,517.953857 496.417114,518.934143 C513.274902,494.606476 529.752014,470.828064 546.346313,446.880646 C544.305969,446.365356 542.040405,445.919800 539.855347,445.221893 C516.372620,437.721619 498.028503,423.066315 483.016296,403.948822 C457.174347,371.040009 444.689209,332.920502 439.677368,291.924713 C438.283508,280.522980 437.043335,269.093719 435.263367,257.750763 C433.873779,248.895523 427.581482,243.368057 419.133240,242.589844 C411.363129,241.874100 404.838959,245.662964 401.942169,253.419128 C400.451782,257.409546 399.698334,261.814636 399.397797,266.087616 C397.282166,296.164215 399.298950,326.010345 405.066071,356.463867 M526.730957,299.152283 C524.841736,300.771179 522.798889,302.243286 521.088745,304.033264 C511.238831,314.342743 509.870361,330.107635 517.726929,341.649139 C526.089478,353.933990 540.631409,358.646790 554.090332,352.992706 C565.409607,348.237457 572.231384,339.693481 573.135559,327.223969 C574.031616,314.867828 568.991577,305.131012 558.450073,298.728607 C548.244873,292.530487 537.709229,292.676788 526.730957,299.152283 z" />
    </svg>
);

const ICON_OPTIONS = {
    Truck: Truck,
    Hammer: Hammer,
    ThumbsUp: ThumbsUp,
    AlertTriangle: AlertTriangle,
    Check: Check,
    Wrench: Wrench,
    Zap: Zap,
    Package: Package,
    Factory: Factory,
    ShieldCheck: ShieldCheck,
    Box: Box,
    Drill: Drill,
    Settings: Settings,
    HookLoader: HookLoader,
    HydraulicCrane: HydraulicCrane,
    HydraulicPlatform: HydraulicPlatform,
    TruckCrane: TruckCrane,
    Crane: Crane,
    Superstructure: Superstructure,
    Play: Play,
    Milestone: Milestone,
    Hiab: Hiab
};

// Seznam ikon pro výběr v editoru (dle požadavku uživatele - ty co jsou vidět + nové)
const VISIBLE_ICONS = [
    'Truck', 'Hammer', 'ThumbsUp', 'AlertTriangle', 'Check',
    'Wrench', 'Zap', 'Package', 'Factory', 'ShieldCheck',
    'Box', 'Drill', 'Settings', 'HookLoader', 'HydraulicCrane',
    'HydraulicPlatform', 'TruckCrane', 'Crane', 'Superstructure', 'Milestone', 'Hiab'
];

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
    icon?: keyof typeof ICON_OPTIONS;
    showInStack?: boolean;
}

interface IColorsState {
    phaseInitial: IColorConfig;
    phaseMounting: IColorConfig;
    phaseBufferYellow: IColorConfig;
    phaseBufferOrange: IColorConfig;
    milestoneChassis: IColorConfig;
    milestoneBody: IColorConfig;
    milestoneHandover: IColorConfig;
    milestoneDeadline: IColorConfig;
    milestoneMountingEnd: IColorConfig;
    milestoneRevisionEnd: IColorConfig;
    milestoneStart: IColorConfig;
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
    const [activeTypes, setActiveTypes] = useState<Record<string, boolean>>({
        civil: true,
        military: true,
        service: true
    });
    const [showHidden, setShowHidden] = useState(false);


    const toggleType = (type: string) => {
        setActiveTypes((prev: Record<string, boolean>) => ({ ...prev, [type]: !prev[type] }));
    };

    const [dayWidth, setDayWidth] = useState(DEFAULT_DAY_WIDTH);
    const [isLoading, setIsLoading] = useState(true);
    const [rowHeight, setRowHeight] = useState(32);
    const [summaryRowHeight, setSummaryRowHeight] = useState(36);
    const timelineRef = useRef<HTMLDivElement>(null);

    // Ref for accessing current dayWidth in event listeners
    const dayWidthRef = useRef(dayWidth);

    // CRITICAL: Update ref synchronously after render to ensure event handlers have fresh state
    // immediately for the next event in the loop.
    useLayoutEffect(() => {
        dayWidthRef.current = dayWidth;
    }, [dayWidth]);

    // Color Configuration State
    const [colors, setColors] = useState<IColorsState>({
        phaseInitial: { color: '#bae6fd', opacity: 0.4, label: 'Zahájení', showInStack: false },
        phaseMounting: { color: '#4ade80', opacity: 0.35, label: 'Příprava', showInStack: true },
        phaseBufferYellow: { color: '#facc15', opacity: 0.5, label: 'Montáž', showInStack: true },
        milestoneChassis: { color: '#f97316', opacity: 1, label: 'Podvozek', icon: 'Truck', showInStack: true },
        milestoneBody: { color: '#a855f7', opacity: 1, label: 'Nástavba', icon: 'Superstructure', showInStack: true },
        milestoneHandover: { color: '#3b82f6', opacity: 1, label: 'Předání', icon: 'ThumbsUp', showInStack: true },
        milestoneDeadline: { color: '#ef4444', opacity: 1, label: 'Deadline', icon: 'AlertTriangle', showInStack: true },
        milestoneMountingEnd: { color: '#eab308', opacity: 1, label: 'Konec Montáže', icon: 'Wrench', showInStack: false },
    });

    const [outline, setOutline] = useState<IOutlineState>({ enabled: true, width: 1, color: '#000000', opacity: 0.2, showInStack: true });

    // Global Milestone Size
    const [milestoneSize, setMilestoneSize] = useState<number>(34);

    // Collapsed Sectors State
    const [collapsedSectors, setCollapsedSectors] = useState<Record<string, boolean>>({});

    const toggleSector = (sectorId: string) => {
        setCollapsedSectors(prev => ({ ...prev, [sectorId]: !prev[sectorId] }));
    };

    // Help Modal State
    const [showHelp, setShowHelp] = useState(false);

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
        '--day-width': `${dayWidth}px`, // Added for dynamic CSS grid line calculation
    } as React.CSSProperties;

    // Independent vertical zoom via Ctrl + Wheel
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            if (e.ctrlKey) {
                e.preventDefault();
                const delta = e.deltaY > 0 ? -4 : 4;
                const target = e.target as HTMLElement;
                const summaryRow = target.closest('.is-summary');
                const projectRow = target.closest('.is-project');

                if (summaryRow) {
                    setSummaryRowHeight(prev => Math.min(120, Math.max(12, prev + delta)));
                } else if (projectRow) {
                    setRowHeight(prev => Math.min(120, Math.max(12, prev + delta)));
                } else {
                    // Default horizontal zoom if not over a specific row
                    const currentWidth = dayWidthRef.current;
                    const next = delta > 0 ? Math.min(currentWidth * 1.15, MAX_DAY_WIDTH) : Math.max(currentWidth / 1.15, MIN_DAY_WIDTH);
                    if (next !== currentWidth) {
                        setDayWidth(next);
                    }
                }
            }
        };

        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => container.removeEventListener('wheel', handleWheel);
    }, [scrollContainerRef]);





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
        // Prevent for interactive elements
        if ((e.target as HTMLElement).closest('button, a, input, select, .timeline-bar')) {
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

            // Check if mouse is over the timeline container or its children
            const isOverTimeline = (e.target as HTMLElement).closest('.timeline-container');
            if (!isOverTimeline) return;

            // ABSOLUTE BLOCK: Stop all native scrolling on the timeline
            // User requested to use DRAG for scrolling, wheel is ONLY for zoom.
            e.preventDefault();
            e.stopPropagation();

            // 1. Ctrl + Wheel = Vertical Zoom (Row Height)
            if (e.ctrlKey || e.metaKey) {
                const delta = e.deltaY;
                if (delta === 0) return;

                setRowHeight(prev => {
                    const next = delta > 0 ? prev - 4 : prev + 4;
                    const clamped = Math.min(100, Math.max(14, next));
                    return clamped;
                });
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

            // Special rule for Military: Hide parents without children
            if (type === 'military' && !p.parent_id && !parentIds.has(p.id)) {
                return false;
            }

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
        if (!showHidden) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            filtered = filtered.filter((p: Project) => {
                // Skrýt projekty kde je výroba "Dokončeno"
                if (p.production_status && p.production_status.toLowerCase() === 'dokončeno') {
                    return false;
                }

                const handoverDate = parseDate(p.customer_handover);
                // IF handover exists AND is before today -> Hide it
                if (handoverDate && handoverDate < today) {
                    return false;
                }
                return true;
            });
        }

        // Sorting: Hierarchical (Parent + Children together)
        return filtered.sort((a, b) => {
            // 1. Identify Root ID for both
            const rootA = a.parent_id || a.id;
            const rootB = b.parent_id || b.id;

            // 2. If same root, sort Parent first, then Children by Name
            if (rootA === rootB) {
                if (a.id === rootA) return -1; // A is parent -> first
                if (b.id === rootB) return 1;  // B is parent -> first
                return (a.name || '').localeCompare(b.name || '');
            }

            // 3. If different roots, sort by Root Project's Date
            // We need to find the root project to get its date
            // Optimization: If projects are fully loaded, we might find them. 
            // If not found (filtered out), fallback to own date.

            const pA = projects.find(p => p.id === rootA) || a;
            const pB = projects.find(p => p.id === rootB) || b;

            const dateA = getSortDate(pA);
            const dateB = getSortDate(pB);

            const diff = dateA - dateB;
            if (diff !== 0) return diff;

            return (pA.name || '').localeCompare(pB.name || '');
        });
    }, [projects, searchQuery, activeTypes, showHidden]);

    // Grupa projektů do sektorů
    const sectorizedProjects = useMemo(() => {
        const service = filteredProjects.filter(p => p.project_type === 'service');
        const civil = filteredProjects.filter(p => p.project_type === 'civil' || !p.project_type);
        const military = filteredProjects.filter(p => p.project_type === 'military');

        return [
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
                cursor: isDragging ? 'grabbing' : 'grab'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
        >
            <header className="timeline-header-actions relative">
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

                        {/* Hidden Projects Toggle */}
                        <label className="flex items-center gap-2 cursor-pointer group select-none border-l pl-4 border-border/50">
                            <div className="relative flex items-center justify-center">
                                <input
                                    type="checkbox"
                                    checked={showHidden}
                                    onChange={() => setShowHidden(!showHidden)}
                                    className="peer appearance-none w-4 h-4 border-2 rounded transition-all border-muted-foreground peer-checked:bg-muted-foreground peer-checked:border-muted-foreground"
                                />
                                <div className={`absolute w-2.5 h-2.5 text-white flex items-center justify-center transition-all ${showHidden ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
                                Dokončené
                            </span>
                        </label>
                    </div>

                    <div className="timeline-legend">
                        <div className="legend-group">
                            <span className="legend-group-title">Legenda:</span>
                            <div className="legend-item"><div className="legend-color" style={{ backgroundColor: 'var(--phase-initial)' }}></div> Zahájení</div>
                            <div className="legend-item"><div className="legend-marker" style={{ backgroundColor: colors.milestoneChassis?.color }}></div> Podvozek</div>
                            <div className="legend-item"><div className="legend-marker" style={{ backgroundColor: colors.milestoneBody?.color }}></div> Nástavba</div>
                            <div className="legend-item"><div className="legend-marker" style={{ backgroundColor: colors.milestoneMountingEnd?.color }}></div> Konec Montáže</div>
                            <div className="legend-item"><div className="legend-marker" style={{ backgroundColor: colors.milestoneHandover?.color }}></div> Předání</div>
                            <div className="legend-item"><div className="legend-marker" style={{ backgroundColor: colors.milestoneDeadline?.color }}></div> Deadline</div>
                        </div>
                    </div>

                    <button
                        className="action-button"
                        onClick={() => setShowHelp(true)}
                        title="Nápověda a Legenda"
                    >
                        <HelpCircle size={16} />
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

                    <div className="zoom-controls flex items-center gap-1 bg-muted/30 p-1 rounded-lg border border-border/50">
                        <button
                            className="action-button icon-only"
                            onClick={() => setRowHeight(prev => Math.max(14, prev - 4))}
                            title="Zmenšit řádky"
                        >
                            <ChevronDown size={16} />
                        </button>
                        <span className="text-[10px] font-mono text-muted-foreground min-w-[32px] text-center select-none">
                            {rowHeight}px
                        </span>
                        <button
                            className="action-button icon-only"
                            onClick={() => setRowHeight(prev => Math.min(100, prev + 4))}
                            title="Zvětšit řádky"
                        >
                            <ChevronUp size={16} />
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

            {/* Help / Legend Modal */}
            {
                showHelp && (
                    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                        <div className="bg-background border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
                                <div className="flex items-center gap-2">
                                    <HelpCircle size={20} className="text-primary" />
                                    <h3 className="font-bold text-lg">Nápověda a Legenda</h3>
                                </div>
                                <button onClick={() => setShowHelp(false)} className="hover:bg-destructive/10 hover:text-destructive p-1.5 rounded-lg transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="overflow-y-auto p-6 space-y-8 custom-scrollbar">

                                {/* 1. OVLÁDÁNÍ */}
                                <section>
                                    <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                                        <MousePointer2 size={16} /> Navigace a Interakce
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border/50">
                                            <div className="bg-background p-2 rounded-md shadow-sm border border-border">
                                                <MoveHorizontal size={20} className="text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">Posun osy (Scroll)</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    <strong>Kolečko myši:</strong> Klasický posun v čase (vlevo/vpravo) i vertikálně mezi projekty.<br />
                                                    <strong>Shift + Kolečko:</strong> Rychlejší horizontální posun v čase.<br />
                                                    <strong>Táhnutí (Scrollbar):</strong> Použijte spodní lištu pro rychlou navigaci.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border/50">
                                            <div className="bg-background p-2 rounded-md shadow-sm border border-border">
                                                <ZoomIn size={20} className="text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">Zoom (Lupa a Výška)</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    <strong>V hlavičce:</strong> Nastavte si hustotu dní (Dne/Měsíce) i výšku řádků pro detailnější náhled.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border/50">
                                            <div className="bg-background p-2 rounded-md shadow-sm border border-border">
                                                <MousePointerClick size={20} className="text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">Správa Milníků</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    <strong>2x Kliknutí:</strong> Rychlé přidání nového milníku na dané datum.<br />
                                                    <strong>Klik na ikonu:</strong> Editace názvu, data nebo smazání milníku.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border/50">
                                            <div className="bg-background p-2 rounded-md shadow-sm border border-border">
                                                <Info size={20} className="text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">Detaily a Rychlý náhled</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    <strong>Najetí myší:</strong> Zobrazí kontextové menu s informacemi o projektu a milníku.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <div className="h-px bg-border/50" />

                                {/* 2. LEGENDA BAREV (FÁZE A MILNÍKY) */}
                                <section>
                                    <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                                        <Palette size={16} /> Legenda
                                    </h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {Object.entries(colors).map(([key, conf]) => (
                                            <div key={key} className="flex items-center gap-3 p-2 rounded-lg border border-border/40 bg-background/50">
                                                <div
                                                    className="w-8 h-8 rounded-md shadow-sm border border-border/20 flex items-center justify-center text-white"
                                                    style={{ backgroundColor: conf.color, opacity: conf.opacity || 1 }}
                                                >
                                                    {conf.icon && ICON_OPTIONS[conf.icon as keyof typeof ICON_OPTIONS] ? React.createElement(ICON_OPTIONS[conf.icon as keyof typeof ICON_OPTIONS], { size: 16 }) : null}
                                                </div>
                                                <span className="text-sm font-medium">{conf.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <div className="h-px bg-border/50" />

                                {/* 3. LEGENDA MILNÍKŮ */}
                                <section>
                                    <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                                        <Flag size={16} /> Legenda milníků
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3 p-3 rounded-lg border border-border/40 bg-background/50">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#374151] shadow-sm">
                                                <div className="w-1.5 h-1.5 rounded-full bg-white opacity-20" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold">Čekající (Standardní)</p>
                                                <p className="text-[10px] text-muted-foreground leading-tight">Milník v budoucnu nebo v termínu, který zatím nebyl potvrzen.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 rounded-lg border border-border/40 bg-background/50">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#22c55e] shadow-sm">
                                                <Check size={16} className="text-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-emerald-600">Splněno (Potvrzeno)</p>
                                                <p className="text-[10px] text-muted-foreground leading-tight">Zelená barva značí milník, který byl uživatelem ručně potvrzen jako doručený/hotový.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 rounded-lg border border-border/40 bg-background/50">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#ef4444] shadow-sm">
                                                <AlertTriangle size={16} className="text-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-red-600">Po termínu (Upozornění)</p>
                                                <p className="text-[10px] text-muted-foreground leading-tight">Červená barva svítí, pokud milník není splněn (nepotvrzen) a jeho datum už proběhlo.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 rounded-lg border border-border/40 bg-muted/20 italic">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-muted border border-border/50 shadow-inner">
                                                <RotateCcw size={14} className="text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-muted-foreground">Ostatní</p>
                                                <p className="text-[10px] text-muted-foreground leading-tight">Ikonku libovolného milníku lze změnit individuálně pro každou zakázku.</p>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                            <div className="p-4 border-t border-border bg-muted/20 flex justify-end">
                                <button onClick={() => setShowHelp(false)} className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-colors text-sm">
                                    Rozumím
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

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
                                const visibleSectors = sectorizedProjects.filter(s => activeTypes[s.id]);

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
                                            return (
                                                <div
                                                    key={`summary-${sector.id}`}
                                                    className="timeline-row is-summary"
                                                    style={{
                                                        position: 'sticky',
                                                        top: topOffset,
                                                        height: 'var(--summary-row-height)',
                                                        zIndex: 3500 - vIdx,
                                                        width: 'max-content',
                                                        minWidth: '100%'
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
                                                        <div className="flex items-center gap-2 pl-2">
                                                            <span className="uppercase">{sector.label}</span>
                                                            <span className="text-[10px] text-muted-foreground font-mono opacity-90">({sector.projects.length})</span>
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
                                                            config={{ ...colors, milestoneSize }}
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

                                return (
                                    <div key={project.id} className="timeline-row is-project">
                                        <Link
                                            href={`/projekty/${project.id}`}
                                            className="project-info-sticky transition-colors group"
                                            style={{ borderLeft: `10px solid ${sectorColor}` }}
                                        >
                                            <div className={`project-info-content pr-2 ${project.parent_id ? 'pl-5' : 'pl-1'}`}>
                                                {rowHeight >= 25 ? (
                                                    <>
                                                        <div className="flex items-center gap-1">
                                                            {project.parent_id && (
                                                                <div className="w-2 h-2 border-l border-b border-muted-foreground/50 rounded-bl-sm mb-1" />
                                                            )}
                                                            <span
                                                                className={`project-name w-full text-left ${project.parent_id ? 'text-[11px] text-muted-foreground' : 'text-[13px] !font-normal'} ${rowHeight >= 45 ? 'is-wrapped' : ''}`}
                                                                style={{ textAlign: 'left', fontWeight: project.parent_id ? 400 : 600 }}
                                                            >
                                                                {project.name}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between items-end w-full gap-2 mt-0.5">
                                                            <div className="flex flex-col shrink-0">
                                                                <span className="text-[10px] font-black text-black uppercase tracking-tight whitespace-nowrap" title={project.id}>
                                                                    {project.id}
                                                                </span>
                                                            </div>
                                                            <span className="customer-name text-[11px] font-bold text-muted-foreground/70 leading-none pb-[1px]" style={{ textAlign: 'right' }}>
                                                                {project.customer || 'Bez zákazníka'}
                                                            </span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="flex justify-between items-center w-full h-full">
                                                        <span className="text-[9px] font-black text-black uppercase tracking-tighter truncate mr-1" title={project.id}>
                                                            {project.id}
                                                        </span>
                                                        <span className="text-[9px] font-bold text-muted-foreground/60 truncate italic" style={{ textAlign: 'right' }}>
                                                            {project.customer || ''}
                                                        </span>
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
                                            config={{ ...colors, milestoneSize }}
                                            onProjectUpdate={handleProjectUpdate}
                                            milestones={allMilestones.filter((m: ProjectMilestone) => m.project_id === project.id)}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </TimelineGrid>
                </div>
            </div >
        </div >
    );
};

export default Timeline;
