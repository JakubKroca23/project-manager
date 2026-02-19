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






const FlatbedTruck = ({ size = 24, ...props }: any) => (
    <svg width={size} height={size} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    <svg width={size} height={size} {...props} viewBox="0 0 756 719" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <path fill="currentColor" stroke="none" d="M1.000000,719.000000 C1.000000,480.305298 1.000000,241.610611 1.458877,2.563841 C3.083466,2.234620 4.249180,2.277543 5.414892,2.277472 C251.967224,2.262367 498.519562,2.245386 745.071899,2.212702 C748.063049,2.212305 751.054138,2.008735 754.379395,2.190670 C754.916687,4.776751 755.297546,7.072153 755.297729,9.367578 C755.312805,243.420898 755.300293,477.474213 755.272644,711.527527 C755.272339,714.011108 755.051025,716.494629 754.481934,718.977051 C752.198853,718.986023 750.366760,719.005188 748.534607,719.005188 C499.356415,719.004333 250.178207,719.002136 1.000000,719.000000 M710.484558,682.519592 C717.382812,682.514832 717.397461,682.514832 717.397400,675.968628 C717.395813,465.474792 717.391846,254.980927 717.373535,44.487080 C717.373413,43.051239 717.167297,41.615414 717.041809,39.975128 C715.375916,39.898144 714.076355,39.785503 712.776794,39.785595 C656.278442,39.789574 599.780151,39.821056 543.281799,39.812984 C376.453217,39.789158 209.624588,39.779362 42.796196,39.582157 C37.561188,39.575974 36.512508,39.978024 36.515289,45.945698 C36.630692,252.106094 36.602631,458.266602 36.588947,664.427063 C36.588627,669.260132 36.308804,674.111877 36.685020,678.913757 C36.784760,680.186768 38.745804,682.192627 40.020535,682.332947 C44.138775,682.786255 48.335388,682.541382 52.501797,682.541199 C271.495605,682.532410 490.489410,682.521240 710.484558,682.519592 z" />
        <path fill="currentColor" stroke="none" d="M754.932861,718.978210 C755.051025,716.494629 755.272339,714.011108 755.272644,711.527527 C755.300293,477.474213 755.312805,243.420898 755.297729,9.367578 C755.297546,7.072153 754.916687,4.776751 754.382629,1.964943 C754.051697,1.448549 754.000000,1.000000 754.000000,1.000000 C755.654358,1.048076 757.871765,0.378559 757.024292,3.506584 C756.856018,4.127662 757.000000,4.833333 757.000000,5.500000 C757.000000,242.166672 757.001831,478.833344 756.958679,715.500000 C756.958435,717.000061 756.333313,718.500000 755.524780,719.741821 C755.010559,719.315186 754.971680,719.146729 754.932861,718.978210 z" />
        <path fill="currentColor" opacity="0.5" stroke="none" d="M239.325577,244.186447 C203.676422,260.819580 181.076263,297.162354 182.767044,334.754974 C184.659683,376.835571 214.633133,412.044403 255.930511,420.166931 C290.925354,427.049896 321.923950,419.072845 348.072388,394.205811 C348.646942,393.659393 349.350281,393.248383 350.698639,392.254486 C350.876465,394.253387 351.104340,395.619995 351.103790,396.986572 C351.094727,420.319366 350.979187,443.652557 351.102631,466.984528 C351.123352,470.902740 349.982635,472.827637 346.087982,474.136627 C314.852814,484.634644 282.792542,488.090546 250.473999,482.307434 C176.538651,469.077393 127.043213,426.617065 103.475761,355.035187 C90.394173,315.302216 90.995651,275.095520 104.500275,235.729980 C124.083107,178.646637 162.374619,139.218216 219.688461,118.965439 C265.006805,102.951469 309.664490,106.366371 353.827484,123.622246 C379.737000,133.745926 403.279755,147.750900 425.192444,164.987671 C442.542694,178.635559 460.278503,192.182083 479.337524,203.185028 C515.062378,223.809326 554.102417,231.555420 595.280273,226.561981 C615.185608,224.148117 633.773682,217.584396 650.923706,207.098816 C652.627502,206.057114 654.341736,205.031387 656.075623,204.041153 C656.311707,203.906326 656.691223,204.022583 657.474792,204.022583 C657.474792,343.750275 657.474792,483.451508 657.474792,623.471130 C592.401489,623.471130 527.332031,623.471130 461.703094,623.471130 C465.198578,598.751526 472.556335,575.556274 481.364807,553.438538 C470.681000,543.735840 459.901154,534.822144 450.133575,524.910889 C420.921997,495.269623 402.146088,459.562714 389.878693,420.032654 C380.711121,390.491394 375.579071,360.200592 371.022034,329.723511 C367.572266,306.651764 359.240570,285.458252 344.542786,267.071228 C332.136230,251.550446 315.365082,243.249496 296.460724,238.938934 C277.059540,234.515060 258.087372,236.593246 239.325577,244.186447 M405.066071,356.463867 C410.432312,383.842468 418.457458,410.395691 430.494324,435.600952 C445.061768,466.105164 463.614624,493.674988 490.639832,514.752502 C492.789459,516.429016 495.057343,517.953857 496.417114,518.934143 C513.274902,494.606476 529.752014,470.828064 546.346313,446.880646 C544.305969,446.365356 542.040405,445.919800 539.855347,445.221893 C516.372620,437.721619 498.028503,423.066315 483.016296,403.948822 C457.174347,371.040009 444.689209,332.920502 439.677368,291.924713 C438.283508,280.522980 437.043335,269.093719 435.263367,257.750763 C433.873779,248.895523 427.581482,243.368057 419.133240,242.589844 C411.363129,241.874100 404.838959,245.662964 401.942169,253.419128 C400.451782,257.409546 399.698334,261.814636 399.397797,266.087616 C397.282166,296.164215 399.298950,326.010345 405.066071,356.463867 M526.730957,299.152283 C524.841736,300.771179 522.798889,302.243286 521.088745,304.033264 C511.238831,314.342743 509.870361,330.107635 517.726929,341.649139 C526.089478,353.933990 540.631409,358.646790 554.090332,352.992706 C565.409607,348.237457 572.231384,339.693481 573.135559,327.223969 C574.031616,314.867828 568.991577,305.131012 558.450073,298.728607 C548.244873,292.530487 537.709229,292.676788 526.730957,299.152283 z" />
    </svg>
);

const Hiab = ({ size = 24, ...props }: any) => (
    <svg width={size} height={size} {...props} viewBox="0 0 756 719" version="1.1" xmlns="http://www.w3.org/2000/svg">
        {/* Background square with border */}
        <path fill="#000000" stroke="currentColor" strokeWidth="40" d="M709.98,682.51 C490.48,682.52 271.49,682.53 52.50,682.54 C48.33,682.54 44.13,682.78 40.02,682.33 C38.74,682.19 36.78,680.18 36.68,678.91 C36.30,674.11 36.58,669.26 36.58,664.42 C36.60,458.26 36.63,252.10 36.51,45.94 C36.51,40.97 37.56,39.57 42.79,39.58 C209.62,39.77 376.45,39.78 543.28,39.81 C599.78,39.82 656.27,39.78 712.77,39.78 C714.07,39.78 715.37,39.89 717.04,39.97 C717.16,41.61 717.37,43.05 717.37,44.48 C717.39,254.98 717.39,465.47 717.39,675.96 C717.39,682.51 717.38,682.51 709.98,682.51 Z" />
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
    Hiab: Hiab,
    FlatbedTruck: FlatbedTruck
};

// Seznam ikon pro výběr v editoru (dle požadavku uživatele - ty co jsou vidět + nové)
const VISIBLE_ICONS = [
    'Truck', 'FlatbedTruck', 'Hammer', 'ThumbsUp', 'AlertTriangle', 'Check',
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
        milestoneChassis: { color: '#f97316', opacity: 1, label: 'Podvozek', icon: 'FlatbedTruck', showInStack: true },
        milestoneBody: { color: '#a855f7', opacity: 1, label: 'Nástavba', icon: 'Superstructure', showInStack: true },
        milestoneHandover: { color: '#3b82f6', opacity: 1, label: 'Předání', icon: 'ThumbsUp', showInStack: true },
        milestoneDeadline: { color: '#ef4444', opacity: 1, label: 'Deadline', icon: 'AlertTriangle', showInStack: true },
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
    }, [projects, searchQuery, activeTypes]);

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
                                        <div key={key} className="flex items-center gap-2 p-1.5 bg-muted/20 rounded border border-border/20">
                                            <input
                                                type="color"
                                                value={config.color}
                                                onChange={(e) => setColors({ ...colors, [key]: { ...config, color: e.target.value } })}
                                                className="w-5 h-5 min-w-[20px] rounded cursor-pointer bg-transparent border-none p-0"
                                            />
                                            <div className="flex-1 flex flex-col min-w-0">
                                                <span className="text-[9px] font-bold truncate text-muted-foreground">{config.label}</span>
                                            </div>
                                            <div className="relative">
                                                <button
                                                    onClick={() => setOpenIconSelector(openIconSelector === key ? null : key)}
                                                    className="w-8 h-8 flex items-center justify-center bg-background border border-border/40 rounded hover:bg-muted/50 transition-colors"
                                                    title="Vybrat ikonu"
                                                >
                                                    {config.icon && ICON_OPTIONS[config.icon as keyof typeof ICON_OPTIONS] ? (
                                                        (() => {
                                                            const Icon = ICON_OPTIONS[config.icon as keyof typeof ICON_OPTIONS];
                                                            return <Icon size={14} />;
                                                        })()
                                                    ) : (
                                                        <div className="w-3 h-3 bg-muted-foreground/30 rounded-full" />
                                                    )}
                                                </button>

                                                {openIconSelector === key && (
                                                    <>
                                                        <div
                                                            className="fixed inset-0 z-[5000]"
                                                            onClick={() => setOpenIconSelector(null)}
                                                        />
                                                        <div className="absolute right-0 top-full mt-1 p-2 bg-popover border border-border shadow-xl rounded-lg z-[5001] w-[180px] grid grid-cols-4 gap-1 animate-in zoom-in-95 duration-200">
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
                                                                        {Icon && <Icon size={16} />}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </>
                                                )}
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
