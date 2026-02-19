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
    Search, Calendar, ZoomIn,
    ZoomOut, Loader2,
    X, Plus, Minus,
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
    Flag,
    Briefcase,
    Building2,
    Globe,
    TrendingUp,
    Euro,
    Warehouse,
    Landmark,
    Users,
    Laptop,
    Phone,
    Mail,
    Star,
    Rocket,
    Coffee
} from 'lucide-react';
import Link from 'next/link';

// ─── CUSTOM ICONS ────────────────────────────────────────────────
const HookLoader = ({ size = 24, fgColor = 'currentColor', bgColor = 'transparent', ...props }: any) => (
    <div style={{ backgroundColor: bgColor, borderRadius: '4px', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
        <svg width={size - 4} height={size - 4} {...props} viewBox="0 0 24 24" fill="none" stroke={fgColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 17h18" />
            <circle cx="7" cy="18" r="2" />
            <circle cx="17" cy="18" r="2" />
            <path d="M2 17h2v-4h4v4h2" />
            <path d="M18 17h4v-6h-4z" />
            <path d="M13 14l5-5h3" />
        </svg>
    </div>
);

const HydraulicCrane = ({ size = 24, fgColor = 'currentColor', bgColor = 'transparent', ...props }: any) => (
    <div style={{ backgroundColor: bgColor, borderRadius: '4px', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
        <svg width={size - 4} height={size - 4} {...props} viewBox="0 0 24 24" fill="none" stroke={fgColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 17h18" />
            <circle cx="7" cy="18" r="2" />
            <circle cx="17" cy="18" r="2" />
            <path d="M2 17h2v-4h4v4h2" />
            <path d="M12 13l4-7 5 1" />
        </svg>
    </div>
);

const HydraulicPlatform = ({ size = 24, fgColor = 'currentColor', bgColor = 'transparent', ...props }: any) => (
    <div style={{ backgroundColor: bgColor, borderRadius: '4px', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
        <svg width={size - 4} height={size - 4} {...props} viewBox="0 0 24 24" fill="none" stroke={fgColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 17h18" />
            <circle cx="7" cy="18" r="2" />
            <circle cx="17" cy="18" r="2" />
            <path d="M3 17v-3h4v3" />
            <path d="M10 17l3-6 3 6" />
            <path d="M11 11l2-4 2 4" />
            <path d="M11 7h4" />
        </svg>
    </div>
);

const TruckCrane = ({ size = 24, fgColor = 'currentColor', bgColor = 'transparent', ...props }: any) => (
    <div style={{ backgroundColor: bgColor, borderRadius: '4px', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
        <svg width={size - 4} height={size - 4} {...props} viewBox="0 0 24 24" fill="none" stroke={fgColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 17h20" />
            <circle cx="6" cy="18" r="2" />
            <circle cx="14" cy="18" r="2" />
            <circle cx="18" cy="18" r="2" />
            <path d="M2 17v-4h4l3 3h5v-3l7-5" />
        </svg>
    </div>
);






const FlatbedTruck = ({ size = 24, fgColor = 'currentColor', bgColor = 'transparent', ...props }: any) => (
    <div style={{ backgroundColor: bgColor, borderRadius: '4px', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
        <svg width={size - 4} height={size - 4} {...props} viewBox="0 0 24 24" fill="none" stroke={fgColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {/* Cab */}
            <path d="M2 18V9c0-1 1-2 2-2h3c1 0 2 1 2 2v9" />
            <path d="M2 12h7" />
            {/* Flatbed */}
            <path d="M9 14h13v4H9z" />
            {/* 3 Axles (Wheels) */}
            <circle cx="5.5" cy="18" r="2" />
            <circle cx="14.5" cy="18" r="2" />
            <circle cx="19.5" cy="18" r="2" />
        </svg>
    </div>
);

const Crane = ({ size = 24, fgColor = 'currentColor', bgColor = 'transparent', ...props }: any) => (
    <div style={{ backgroundColor: bgColor, borderRadius: '4px', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
        <svg width={size - 4} height={size - 4} {...props} viewBox="0 0 24 24" fill="none" stroke={fgColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 21h16" />
            <path d="M12 21V3" />
            <path d="M12 3l8 4" />
            <path d="M12 3H4" />
            <path d="M4 3v4" />
            <path d="M12 7H8" />
            <path d="M8 3v4" />
        </svg>
    </div>
);

const Superstructure = ({ size = 24, fgColor = 'currentColor', bgColor = '#FFFFFF', ...props }: any) => (
    <svg width={size} height={size} {...props} viewBox="0 0 756 719" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <path fill={bgColor} stroke="none" d="M1.0,719.0 C1.0,480.3 1.0,241.6 1.4,2.5 C3.0,2.2 4.2,2.2 5.4,2.2 C251.9,2.2 498.5,2.2 745.0,2.2 C748.0,2.2 751.0,2.0 754.3,2.1 C754.9,4.7 755.2,7.0 755.2,9.3 C755.3,243.4 755.3,477.4 755.2,711.5 C755.2,714.0 755.0,716.4 754.4,718.9 C752.1,718.9 750.3,719.0 748.5,719.0 C499.3,719.0 250.1,719.0 1.0,719.0 Z" />
        <path fill={fgColor} stroke="none" d="M710.4,682.5 C717.3,682.5 717.3,682.5 717.3,675.9 C717.3,465.4 717.3,254.9 717.3,44.4 C717.3,43.0 717.1,41.6 717.0,39.9 C715.3,39.8 714.0,39.7 712.7,39.7 C656.2,39.7 599.7,39.8 543.2,39.8 C376.4,39.7 209.6,39.7 42.7,39.5 C37.5,39.5 36.5,40.9 36.5,45.9 C36.6,252.1 36.6,458.2 36.5,664.4 C36.5,669.2 36.3,674.1 36.6,678.9 C36.7,680.1 38.7,682.1 40.0,682.3 C44.1,682.7 48.3,682.5 52.5,682.5 C271.4,682.5 490.4,682.5 710.4,682.5 Z" />
    </svg>
);

const Hiab = ({ size = 24, fgColor = 'currentColor', bgColor = '#FFFFFF', ...props }: any) => (
    <svg width={size} height={size} {...props} viewBox="0 0 756 719" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <path fill={bgColor} stroke="none" d="M1.0,719.0 C1.0,480.3 1.0,241.6 1.4,2.5 C3.0,2.2 4.2,2.2 5.4,2.2 C251.9,2.2 498.5,2.2 745.0,2.2 C748.0,2.2 751.0,2.0 754.3,2.1 C754.9,4.7 755.2,7.0 755.2,9.3 C755.3,243.4 755.3,477.4 755.2,711.5 C755.2,714.0 755.0,716.4 754.4,718.9 C752.1,718.9 750.3,719.0 748.5,719.0 C499.3,719.0 250.1,719.0 1.0,719.0 Z" />
        <path fill={fgColor} stroke="none" d="M239.3,244.1 C203.6,260.8 181.0,297.1 182.7,334.7 C184.6,376.8 214.6,412.0 255.9,420.1 C290.9,427.0 321.9,419.0 348.0,394.2 C348.6,393.6 349.3,393.2 350.6,392.2 C350.8,394.2 351.1,395.6 351.1,396.9 C351.0,420.3 351.0,443.6 351.1,466.9 C351.1,470.9 349.9,472.8 346.0,474.1 C314.8,484.6 282.7,488.0 250.4,482.3 C176.5,469.0 127.0,426.6 103.4,355.0 C90.3,315.3 90.9,275.0 104.5,235.7 C124.0,178.6 162.3,139.2 219.6,118.9 C265.0,102.9 309.6,106.3 353.8,123.6 C379.7,133.7 403.2,147.7 425.1,164.9 C442.5,178.6 460.2,192.1 479.3,203.1 C515.0,223.8 554.1,231.5 595.2,226.5 C615.1,224.1 633.7,217.5 650.9,207.0 C652.6,206.0 654.3,205.0 656.0,204.0 C656.3,203.9 656.6,204.0 657.4,204.0 C657.4,343.7 657.4,483.4 657.4,623.4 C592.4,623.4 527.3,623.4 461.7,623.4 C465.1,598.7 472.5,575.5 481.3,553.4 C470.6,543.7 459.9,534.8 450.1,524.9 C420.9,495.2 402.1,459.5 389.8,420.0 C380.7,390.4 375.5,360.2 371.0,329.7 C367.5,306.6 359.2,285.4 344.5,267.0 C332.1,251.5 315.3,243.2 296.4,238.9 C277.0,234.5 258.0,236.5 239.3,244.1 Z" />
    </svg>
);

const wrapLucide = (Icon: any) => ({ size = 24, fgColor = 'currentColor', bgColor = 'transparent', ...props }: any) => (
    <div style={{ backgroundColor: bgColor, borderRadius: '4px', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
        <Icon size={size - 4} color={fgColor} {...props} />
    </div>
);

const ICON_OPTIONS = {
    Truck: wrapLucide(Truck),
    FlatbedTruck: FlatbedTruck,
    Hammer: wrapLucide(Hammer),
    ThumbsUp: wrapLucide(ThumbsUp),
    AlertTriangle: wrapLucide(AlertTriangle),
    Check: wrapLucide(Check),
    Wrench: wrapLucide(Wrench),
    Zap: wrapLucide(Zap),
    Package: wrapLucide(Package),
    Factory: wrapLucide(Factory),
    ShieldCheck: wrapLucide(ShieldCheck),
    Box: wrapLucide(Box),
    Drill: wrapLucide(Drill),
    Settings: wrapLucide(Settings),
    HookLoader: HookLoader,
    HydraulicCrane: HydraulicCrane,
    HydraulicPlatform: HydraulicPlatform,
    TruckCrane: TruckCrane,
    Crane: Crane,
    Superstructure: Superstructure,
    Play: wrapLucide(Play),
    Milestone: wrapLucide(Milestone),
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
    Star: wrapLucide(Star),
    Rocket: wrapLucide(Rocket),
    Coffee: wrapLucide(Coffee)
};

// Seznam ikon pro výběr v editoru
const VISIBLE_ICONS = [
    'Truck', 'FlatbedTruck', 'Hiab', 'HookLoader', 'HydraulicCrane', 'HydraulicPlatform', 'TruckCrane', 'Crane', 'Superstructure',
    'Hammer', 'Wrench', 'Drill', 'Settings', 'Zap', 'Package', 'Box', 'Factory', 'Warehouse',
    'Briefcase', 'Building2', 'Globe', 'Landmark', 'Users', 'TrendingUp', 'Euro',
    'Laptop', 'Phone', 'Mail', 'Star', 'Rocket', 'Coffee',
    'ThumbsUp', 'Check', 'ShieldCheck', 'AlertTriangle', 'Play', 'Milestone'
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
    const [activeTypes, setActiveTypes] = useState<Record<string, boolean>>({
        civil: true,
        military: true,
        service: true
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
            return saved ? parseInt(saved) : 32;
        }
        return 32;
    });
    const [summaryRowHeight, setSummaryRowHeight] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('timeline_summaryRowHeight');
            return saved ? parseInt(saved) : 36;
        }
        return 36;
    });
    const [showDesignSettings, setShowDesignSettings] = useState(false);
    const [openIconSelector, setOpenIconSelector] = useState<string | null>(null);
    const [design, setDesign] = useState({
        borderRadius: 4,
        barHeight: 70, // in %
        opacity: 1,
        usePriorityColors: true
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

    // Color Configuration State
    const [colors, setColors] = useState<IColorsState>({
        phaseInitial: { color: '#bae6fd', opacity: 0.4, label: 'Zahájení', showInStack: false },
        phaseMounting: { color: '#4ade80', opacity: 0.35, label: 'Příprava', showInStack: true },
        phaseBufferYellow: { color: '#facc15', opacity: 0.5, label: 'Montáž', showInStack: true },
        milestoneChassis: { color: '#f97316', iconColor: '#ffffff', iconBgColor: '#f97316', opacity: 1, label: 'Podvozek', icon: 'FlatbedTruck', showInStack: true },
        milestoneBody: { color: '#a855f7', iconColor: '#ffffff', iconBgColor: '#a855f7', opacity: 1, label: 'Nástavba', icon: 'Superstructure', showInStack: true },
        milestoneHandover: { color: '#3b82f6', iconColor: '#ffffff', iconBgColor: '#3b82f6', opacity: 1, label: 'Předání', icon: 'ThumbsUp', showInStack: true },
        milestoneDeadline: { color: '#ef4444', iconColor: '#ffffff', iconBgColor: '#ef4444', opacity: 1, label: 'Deadline', icon: 'AlertTriangle', showInStack: true },
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
                    setSummaryRowHeight(prev => {
                        const next = delta > 0 ? prev - 4 : prev + 4;
                        return Math.min(120, Math.max(12, next));
                    });
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
                                        <span className="text-muted-foreground">Průhlednost</span>
                                        <span className="text-primary">{Math.round(design.opacity * 100)}%</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="1" step="0.05"
                                        value={design.opacity}
                                        onChange={(e) => setDesign({ ...design, opacity: parseFloat(e.target.value) })}
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

                            {/* Standard Milestones */}
                            <div className="space-y-2">
                                {Object.entries(colors)
                                    .filter(([k]) => k.startsWith('milestone'))
                                    .filter(([k]) => !['milestoneStart', 'milestoneRevisionEnd', 'milestoneServiceStart', 'milestoneServiceEnd', 'milestoneMountingEnd'].includes(k))
                                    .map(([key, config]) => (
                                        <div key={key} className="flex flex-col gap-2 p-2 bg-muted/20 rounded border border-border/20">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={config.color}
                                                    onChange={(e) => setColors({ ...colors, [key]: { ...config, color: e.target.value } })}
                                                    className="w-5 h-5 min-w-[20px] rounded cursor-pointer bg-transparent border-none p-0"
                                                    title="Barva milníku"
                                                />
                                                <div className="flex-1 flex flex-col min-w-0">
                                                    <span className="text-[10px] font-black uppercase truncate text-foreground">{config.label}</span>
                                                </div>
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setOpenIconSelector(openIconSelector === key ? null : key)}
                                                        className="w-10 h-10 flex items-center justify-center bg-background border border-border/40 rounded-lg hover:bg-muted/50 transition-colors shadow-sm"
                                                        title="Vybrat ikonu"
                                                    >
                                                        {config.icon && ICON_OPTIONS[config.icon as keyof typeof ICON_OPTIONS] ? (
                                                            (() => {
                                                                const Icon = ICON_OPTIONS[config.icon as keyof typeof ICON_OPTIONS];
                                                                return (
                                                                    <Icon
                                                                        size={24}
                                                                        fgColor={config.iconColor || config.color}
                                                                        bgColor={config.iconBgColor || 'transparent'}
                                                                    />
                                                                );
                                                            })()
                                                        ) : (
                                                            <div className="w-4 h-4 bg-muted-foreground/30 rounded-full" />
                                                        )}
                                                    </button>

                                                    {openIconSelector === key && (
                                                        <>
                                                            <div
                                                                className="fixed inset-0 z-[5000]"
                                                                onClick={() => setOpenIconSelector(null)}
                                                            />
                                                            <div className="absolute right-0 top-full mt-1 p-2 bg-popover border border-border shadow-xl rounded-lg z-[5001] w-[220px] grid grid-cols-5 gap-1 animate-in zoom-in-95 duration-200">
                                                                {VISIBLE_ICONS.map(iconName => {
                                                                    const Icon = ICON_OPTIONS[iconName as keyof typeof ICON_OPTIONS];
                                                                    return (
                                                                        <button
                                                                            key={iconName}
                                                                            onClick={() => {
                                                                                setColors({ ...colors, [key]: { ...config, icon: iconName as any } });
                                                                                setOpenIconSelector(null);
                                                                            }}
                                                                            className={`p-1.5 rounded hover:bg-muted flex items-center justify-center transition-colors ${config.icon === iconName ? 'bg-primary/20 text-primary' : 'text-muted-foreground'}`}
                                                                            title={iconName}
                                                                        >
                                                                            {Icon && <Icon
                                                                                size={20}
                                                                                fgColor={config.iconColor || config.color}
                                                                                bgColor={config.iconBgColor || 'transparent'}
                                                                            />}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Icon Colors */}
                                            <div className="flex items-center gap-3 pl-1">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-3 h-3 rounded-full border border-border/50 overflow-hidden relative shadow-sm">
                                                        <input
                                                            type="color"
                                                            value={config.iconBgColor || "#ffffff"}
                                                            onChange={(e) => setColors({ ...colors, [key]: { ...config, iconBgColor: e.target.value } })}
                                                            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer p-0"
                                                        />
                                                        <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: config.iconBgColor || "#ffffff" }} />
                                                    </div>
                                                    <span className="text-[8px] font-bold text-muted-foreground uppercase">Pozadí</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-3 h-3 rounded-full border border-border/50 overflow-hidden relative shadow-sm">
                                                        <input
                                                            type="color"
                                                            value={config.iconColor || config.color}
                                                            onChange={(e) => setColors({ ...colors, [key]: { ...config, iconColor: e.target.value } })}
                                                            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer p-0"
                                                        />
                                                        <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: config.iconColor || config.color }} />
                                                    </div>
                                                    <span className="text-[8px] font-bold text-muted-foreground uppercase">Popředí</span>
                                                </div>
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
            )}

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
