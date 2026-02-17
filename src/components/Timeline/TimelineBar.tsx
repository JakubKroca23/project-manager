'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Project } from '@/types/project';
import {
    Truck, Hammer, ThumbsUp, AlertTriangle, Play, Check, Milestone,
    Cog, Wrench, Zap, Cpu, Activity, Package, Box, HardHat,
    Construction, Factory, Pickaxe, Settings2, ShieldCheck,
    Container, Anchor, Component, Drill, Settings,
    Clock,
    X,
    Trash2,
    Plus,
} from 'lucide-react';

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
        <path fill="currentColor" stroke="none" d="M1.000000,719.000000 C1.000000,480.305298 1.000000,241.610611 1.458877,2.563841 C3.083466,2.234620 4.249180,2.277543 5.414892,2.277472 C251.967224,2.262367 498.519562,2.245386 745.071899,2.212702 C748.063049,2.212305 751.054138,2.008735 754.379395,2.190670 C754.916687,4.776751 755.297546,7.072153 755.297729,9.367578 C755.312805,243.420898 755.300293,477.474213 755.272644,711.527527 C755.272339,714.011108 755.051025,716.494629 754.481934,718.977051 C752.198853,718.986023 750.366760,719.005188 748.534607,719.005188 C499.356415,719.004333 250.178207,719.002136 1.000000,719.000000 M710.484558,682.519592 C717.382812,682.514832 717.397461,682.514832 717.397400,675.968628 C717.395813,465.474792 717.391846,254.980927 717.373535,44.487080 C717.373413,43.051239 717.167297,41.615414 717.041809,39.975128 C715.375916,39.898144 714.076355,39.785503 712.776794,39.785595 C656.278442,39.789574 599.780151,39.821056 543.281799,39.812984 C376.453217,39.789158 209.624588,39.779362 42.796196,39.582157 C37.561188,39.575974 36.512508,40.978024 36.515289,45.945698 C36.630692,252.106094 36.602631,458.266602 36.588947,664.427063 C36.588627,669.260132 36.308804,674.111877 36.685020,678.913757 C36.784760,680.186768 38.745804,682.192627 40.020535,682.332947 C44.138775,682.786255 48.335388,682.541382 52.501797,682.541199 C271.495605,682.532410 490.489410,682.521240 710.484558,682.519592 z" />
        <path fill="currentColor" stroke="none" d="M754.932861,718.978210 C755.051025,716.494629 755.272339,714.011108 755.272644,711.527527 C755.300293,477.474213 755.312805,243.420898 755.297729,9.367578 C755.297546,7.072153 754.916687,4.776751 754.382629,1.964943 C754.051697,1.448549 754.000000,1.000000 754.000000,1.000000 C755.654358,1.048076 757.871765,0.378559 757.024292,3.506584 C756.856018,4.127662 757.000000,4.833333 757.000000,5.500000 C757.000000,242.166672 757.001831,478.833344 756.958679,715.500000 C756.958435,717.000061 756.333313,718.500000 755.524780,719.741821 C755.010559,719.315186 754.971680,719.146729 754.932861,718.978210 z" />
        <path fill="currentColor" stroke="none" d="M754.481934,718.977051 C754.971680,719.146729 755.010559,719.315186 755.024780,719.741821 C503.666656,720.000000 252.333328,720.000000 1.000000,719.500000 C250.178207,719.002136 499.356415,719.004333 748.534607,719.005188 C750.366760,719.005188 752.198853,718.986023 754.481934,718.977051 z" />
        <path fill="currentColor" stroke="none" d="M753.531372,1.000000 C754.000000,1.000000 754.051697,1.448549 754.048462,1.674276 C751.054138,2.008735 748.063049,2.212305 745.071899,2.212702 C498.519562,2.245386 251.967224,2.262367 5.414892,2.277472 C4.249180,2.277543 3.083466,2.234620 1.458877,2.105888 C1.166376,1.666667 1.315335,1.056180 1.501923,1.044454 C2.829240,0.961039 4.164248,1.000000 5.496808,1.000000 C254.685440,1.000000 503.874054,1.000000 753.531372,1.000000 z" />
        <path fill="var(--background, #fff)" stroke="none" d="M709.983887,682.514893 C490.489410,682.521240 271.495605,682.532410 52.501797,682.541199 C48.335388,682.541382 44.138775,682.786255 40.020535,682.332947 C38.745804,682.192627 36.784760,680.186768 36.685020,678.913757 C36.308804,674.111877 36.588627,669.260132 36.588947,664.427063 C36.602631,458.266602 36.630692,252.106094 36.515289,45.945698 C36.512508,40.978024 37.561188,39.575974 42.796196,39.582157 C209.624588,39.779362 376.453217,39.789158 543.281799,39.812984 C599.780151,39.821056 656.278442,39.789574 712.776794,39.785595 C714.076355,39.785503 715.375916,39.898144 717.041809,39.975128 C717.167297,41.615414 717.373413,43.051239 717.373535,44.487080 C717.391846,254.980927 717.395813,465.474792 717.397400,675.968628 C717.397461,682.514832 717.382812,682.514832 709.983887,682.514893 M239.668610,244.016754 C258.087372,236.593246 277.059540,234.515060 296.460724,238.938934 C315.365082,243.249496 332.136230,251.550446 344.542786,267.071228 C359.240570,285.458252 367.572266,306.651764 371.022034,329.723511 C375.579071,360.200592 380.711121,390.491394 389.878693,420.032654 C402.146088,459.562714 420.921997,495.269623 450.133575,524.910889 C459.901154,534.822144 470.681000,543.735840 481.364807,553.438538 C472.556335,575.556274 465.198578,598.751526 461.703094,623.471130 C527.332031,623.471130 592.401489,623.471130 657.474792,623.471130 C657.474792,483.451508 657.474792,343.750275 657.474792,204.022583 C656.691223,204.022583 656.311707,203.906326 656.075623,204.041153 C654.341736,205.031387 652.627502,206.057114 650.923706,207.098816 C633.773682,217.584396 615.185608,224.148117 595.280273,226.561981 C554.102417,231.555420 515.062378,223.809326 479.337524,203.185028 C460.278503,192.182083 442.542694,178.635559 425.192444,164.987671 C403.279755,147.750900 379.737000,133.745926 353.827484,123.622246 C309.664490,106.366371 265.006805,102.951469 219.688461,118.965439 C162.374619,139.218216 124.083107,178.646637 104.500275,235.729980 C90.995651,275.095520 90.394173,315.302216 103.475761,355.035187 C127.043213,426.617065 176.538651,469.077393 250.473999,482.307434 C282.792542,488.090546 314.852814,484.634644 346.087982,474.136627 C349.982635,472.827637 351.123352,470.902740 351.102631,466.984528 C350.979187,443.652557 351.094727,420.319366 351.103790,396.986572 C351.104340,395.619995 350.876465,394.253387 350.698639,392.254486 C349.350281,393.248383 348.646942,393.659393 348.072388,394.205811 C321.923950,419.072845 290.925354,427.049896 255.930511,420.166931 C214.633133,412.044403 184.659683,376.835571 182.767044,334.754974 C181.076263,297.162354 203.676422,260.819580 239.668610,244.016754 z" />
        <path fill="var(--background, #fff)" stroke="none" d="M527.041626,298.965088 C537.709229,292.676788 548.244873,292.530487 558.450073,298.728607 C568.991577,305.131012 574.031616,314.867828 573.135559,327.223969 C572.231384,339.693481 565.409607,348.237457 554.090332,352.992706 C540.631409,358.646790 526.089478,353.933990 517.726929,341.649139 C509.870361,330.107635 511.238831,314.342743 521.088745,304.033264 C522.798889,302.243286 524.841736,300.771179 527.041626,298.965088 z" />
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

interface IPhase {
    key: string;
    start: Date;
    end: Date;
    class: string;
}

interface IMilestone {
    key: string;
    date: Date;
    label: string;
    class: string;
    icon?: string;
}

interface ITimelineBarProps {
    id: string;
    name: string;
    project: Project;
    status: string | undefined;
    startDate: Date;
    endDate: Date;
    timelineStart: Date;
    dayWidth: number;
    topOffset?: number;
    isCollapsed?: boolean;
    config?: any;
    onProjectUpdate?: (updatedProject: Project) => void;
    milestones?: any[];
}

const parseDate = (dateStr: string | undefined): Date | null => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    return isNaN(d.getTime()) ? null : d;
};

/**
 * Komponenta pro vykreslení jednoho řádku (projektu/servisu) v časové ose.
 * Zobrazuje fáze jako barevné plochy a milníky jako body.
 */
const TimelineBar: React.FC<ITimelineBarProps> = ({
    id,
    name,
    project,
    startDate,
    endDate,
    timelineStart,
    dayWidth,
    topOffset = 0,
    isCollapsed = false,
    config,
    onProjectUpdate,
    milestones = []
}: ITimelineBarProps) => {
    const [activeCell, setActiveCell] = useState<string | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState<'top' | 'bottom'>('bottom');
    const [isUpdating, setIsUpdating] = useState(false);

    // Popup States
    const [addMilestoneDate, setAddMilestoneDate] = useState<Date | null>(null);
    const [addMilestonePos, setAddMilestonePos] = useState<{ x: number, y: number, placement: 'top' | 'bottom' } | null>(null);

    const [editPopup, setEditPopup] = useState<{ m: IMilestone, x: number, y: number } | null>(null);
    const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);
    const [isEditingDate, setIsEditingDate] = useState(false);
    const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
    const [addingCustomMode, setAddingCustomMode] = useState(false);
    const [customForm, setCustomForm] = useState({ name: '', description: '', status: 'pending', icon: 'Milestone' });

    // Hover timeout ref to prevent flickering
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = (m: IMilestone, rect: DOMRect) => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }
        // Only set if not already editing/confirming on another popup (optional check)
        if (!isDeleteConfirm && !isEditingDate && !isIconPickerOpen) {
            setEditPopup({ m, x: rect.left, y: rect.bottom });
        }
    };

    const handleMouseLeave = () => {
        hoverTimeoutRef.current = setTimeout(() => {
            // Only close if we are not in the middle of an edit interaction that requires persistence
            // But since this is a hover popover, generally we close it. 
            // If user clicked "Delete", we might want to keep it? 
            // For now, let's assume if they are interacting, they are INSIDE the popup, 
            // so this onMouseLeave (from icon) is valid. 
            // The popup ITSELF needs to cancel this timeout on enter.
            if (!isEditingDate && !isDeleteConfirm && !isIconPickerOpen) {
                setEditPopup(null);
            }
        }, 300); // 300ms grace period
    };
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;

            // If clicking inside a popup, do nothing
            if (target.closest('.timeline-popup-content')) return;

            // Otherwise close everything
            if (addMilestoneDate || editPopup) {
                setAddMilestoneDate(null);
                setEditPopup(null);
                setIsDeleteConfirm(false);
                setIsEditingDate(false);
                setIsIconPickerOpen(false);
                setAddingCustomMode(false);
                setCustomForm({ name: '', description: '', status: 'pending', icon: 'Milestone' });
            }
        };

        if (addMilestoneDate || editPopup) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [addMilestoneDate, editPopup]);
    // Parsujeme všechna data
    const t_closed = parseDate(project.closed_at) || parseDate(project.created_at);
    const t_chassis = parseDate(project.chassis_delivery);
    const t_body = parseDate(project.body_delivery);
    const t_handover = parseDate(project.customer_handover);
    const t_deadline = parseDate(project.deadline);

    // Custom fields for end dates
    const customMountingEnd = parseDate(project.custom_fields?.mounting_end_date);
    const customRevisionEnd = parseDate(project.custom_fields?.revision_end_date);

    // Calculated derived dates
    const lastMainM = [t_chassis, t_body].filter((d): d is Date => d !== null);
    let mountingStart: Date | null = null;
    let mountingEnd: Date | null = null;
    let revisionEnd: Date | null = null;

    if (lastMainM.length > 0) {
        mountingStart = new Date(Math.max(...lastMainM.map(d => d.getTime())));

        // Mounting End
        if (customMountingEnd) {
            mountingEnd = customMountingEnd;
        } else {
            const d = new Date(mountingStart);
            d.setDate(d.getDate() + 14);
            mountingEnd = d;
        }

        // Revision End
        if (customRevisionEnd) {
            revisionEnd = customRevisionEnd;
        } else {
            const d = new Date(mountingEnd);
            d.setDate(d.getDate() + 7);
            revisionEnd = d;
        }
    }

    // 1. Milníky (body v čase)
    const groupedMilestones = useMemo((): Record<string, IMilestone[]> => {
        const raw: IMilestone[] = [
            { key: 'chassis', date: t_chassis!, label: 'Podvozek', class: 'chassis' },
            { key: 'body', date: t_body!, label: 'Nástavba', class: 'body' },
            { key: 'handover', date: t_handover!, label: 'Předání', class: 'handover' },
            { key: 'deadline', date: t_deadline!, label: 'Deadline', class: 'deadline' },
        ];

        // Add dynamic end milestones if they are relevant (mountingStart exists)
        if (mountingStart && mountingEnd) {
            raw.push({ key: 'mounting_end', date: mountingEnd, label: 'Konec Montáže', class: 'mounting_end' });
        }
        if (mountingEnd && revisionEnd) {
            raw.push({ key: 'revision_end', date: revisionEnd, label: 'Konec Revize', class: 'revision_end' });
        }

        // Add Start (Uzavřeno) milestone
        if (t_closed) {
            raw.push({ key: 'start', date: t_closed, label: 'Start (Uzavřeno)', class: 'start' });
        }

        // Add dynamic milestones from prop
        milestones.forEach((m: any) => {
            if (m.date) {
                raw.push({
                    key: m.id,
                    date: parseDate(m.date)!,
                    label: m.name,
                    class: m.status === 'completed' ? 'custom-completed' : 'custom-pending',
                    icon: m.icon
                });
            }
        });

        const validRaw = raw.filter(m => m.date !== null);

        const groups: Record<string, IMilestone[]> = {};
        validRaw.forEach(m => {
            const d = m.date;
            const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(m);
        });
        return groups;
    }, [t_chassis, t_body, t_handover, t_deadline, project.project_type, mountingStart, mountingEnd, revisionEnd]);

    const handleDateUpdate = async (milestoneClass: string, newDateStr: string | null) => {
        setIsUpdating(true);
        try {
            // Special handling for custom field milestones
            if (milestoneClass === 'mounting_end' || milestoneClass === 'revision_end') {
                const key = milestoneClass === 'mounting_end' ? 'mounting_end_date' : 'revision_end_date';

                if (newDateStr === null) {
                    // Deletion logic for custom fields: reset to auto if needed? 
                    // For now, let's just clear the field.
                }

                const { data: currentProject } = await supabase
                    .from('projects')
                    .select('custom_fields')
                    .eq('id', id)
                    .single();

                const currentCustom = currentProject?.custom_fields || {};
                const updatedCustom = {
                    ...currentCustom,
                    [key]: newDateStr
                };

                const { error } = await supabase
                    .from('projects')
                    .update({ custom_fields: updatedCustom })
                    .eq('id', id);

                if (error) throw error;
            } else if (milestoneClass === 'custom_new') {
                // Add new arbitrary milestone
                if (!customForm.name) return;

                const { error } = await supabase
                    .from('project_milestones')
                    .insert({
                        project_id: id,
                        name: customForm.name,
                        description: customForm.description,
                        date: newDateStr,
                        status: customForm.status,
                        icon: customForm.icon
                    });

                if (error) throw error;
                setAddingCustomMode(false);
                setCustomForm({ name: '', description: '', status: 'pending', icon: 'Milestone' });
            } else if (milestoneClass.startsWith('custom-') || !['chassis', 'body', 'handover', 'deadline', 'start'].includes(milestoneClass)) {
                // This is an existing arbitrary milestone (id is passed as milestoneClass in m.key)
                if (newDateStr === null) {
                    // Delete
                    const { error } = await supabase
                        .from('project_milestones')
                        .delete()
                        .eq('id', milestoneClass);
                    if (error) throw error;
                } else {
                    // Update date
                    const { error } = await supabase
                        .from('project_milestones')
                        .update({ date: newDateStr })
                        .eq('id', milestoneClass);
                    if (error) throw error;
                }
            } else {
                const fieldMap: Record<string, string> = {
                    'chassis': 'chassis_delivery',
                    'body': 'body_delivery',
                    'handover': 'customer_handover',
                    'deadline': 'deadline',
                    'start': 'closed_at'
                };

                const field = fieldMap[milestoneClass];
                if (!field) return;

                // 1. Get current project custom_fields
                const { data: currentProject, error: fetchError } = await supabase
                    .from('projects')
                    .select('custom_fields')
                    .eq('id', id)
                    .single();

                if (fetchError) throw fetchError;

                // 2. Prepare update payload
                const currentCustom = currentProject?.custom_fields || {};
                const manualOverrides = currentCustom.manual_overrides || {};

                // Mark this field as manually overridden
                if (newDateStr) {
                    manualOverrides[field] = true;
                } else {
                    delete manualOverrides[field]; // If clearing date, maybe unset override? Logic depends on intent.
                    // Actually if we clear date (set to null), maybe we want to un-override?
                    // For now, let's keep it simple: date update = manual override.
                }

                const updatedCustomFields = {
                    ...currentCustom,
                    manual_overrides: manualOverrides
                };

                // 3. Update both date and custom_fields
                const { error } = await supabase
                    .from('projects')
                    .update({
                        [field]: newDateStr,
                        custom_fields: updatedCustomFields
                    })
                    .eq('id', id);

                if (error) throw error;
            }

            // Updated local data without reload
            setAddMilestoneDate(null); // Close popup

            if (onProjectUpdate) {
                // Fetch the fresh full project row to ensure consistency
                const { data: updatedRow, error: fetchErr } = await supabase
                    .from('projects')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (!fetchErr && updatedRow) {
                    onProjectUpdate(updatedRow);
                }
            } else {
                // Fallback if no handler provided (should not happen with new setup)
                window.location.reload();
            }
        } catch (err) {
            console.error('Error updating milestone date:', err);
            alert('Chyba při ukládání data.');
        } finally {
            setIsUpdating(false);
        }
    };

    // 2. Fáze (plochy v čase)
    const phases = useMemo((): IPhase[] => {
        const list: IPhase[] = [];
        const mDates = [t_chassis, t_body, t_handover, t_deadline].filter((d): d is Date => d !== null);

        // Fáze 1: Zahájení (vlastní start -> první milník)
        if (t_closed && mDates.length > 0) {
            const firstM = new Date(Math.min(...mDates.map(d => d.getTime())));
            if (t_closed < firstM) {
                list.push({ key: 'p1', start: t_closed, end: firstM, class: 'phase-initial' });
            }
        }

        // Fáze 2: Příprava (mezi podvozkem a nástavbou)
        if (t_chassis && t_body) {
            const start = new Date(Math.min(t_chassis.getTime(), t_body.getTime()));
            const end = new Date(Math.max(t_chassis.getTime(), t_body.getTime()));
            if (start < end) {
                list.push({ key: 'p2', start, end, class: 'phase-mounting' });
            }
        }

        // Fáze 3 & 4: Dojezd po posledním milníku (podvozek nebo nástavba)
        if (mountingStart && mountingEnd) {
            // Fáze 3: Montáž
            list.push({ key: 'p3', start: mountingStart, end: mountingEnd, class: 'phase-buffer-yellow' });

            // Fáze 4: Revize
            if (revisionEnd) {
                list.push({ key: 'p4', start: mountingEnd, end: revisionEnd, class: 'phase-buffer-orange' });
            }
        }


        return list;
    }, [t_closed, t_chassis, t_body, t_handover, t_deadline, project.project_type]);

    /**
     * Vypočítá vodorovnou pozici data v pixelech vzhledem k začátku časové osy.
     * DST-safe calculation by counting days.
     */
    const getDatePos = (date: Date): number => {
        const d1 = new Date(timelineStart.getFullYear(), timelineStart.getMonth(), timelineStart.getDate());
        const d2 = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
        const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());

        const diffDays = Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
        return diffDays * dayWidth;
    };

    /**
     * Formátuje datum pro <input type="date"> v lokálním čase.
     */
    const formatLocalDate = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const containerStyle: React.CSSProperties = {
        ...(isCollapsed ? {
            pointerEvents: 'auto', // Enable hover for stacked rows
            zIndex: activeCell ? 10002 : 30, // Stacked rows on top, much higher on active tooltip
            background: 'transparent', // Was var(--background)
            boxShadow: 'none'
        } : {})
    };

    const handleDoubleClick = (e: React.MouseEvent) => {
        if (isCollapsed) return;

        const rect = e.currentTarget.getBoundingClientRect();
        // Calculate days based on click position relative to container
        const x = e.clientX - rect.left;
        const days = Math.floor(x / dayWidth);
        const clickedDate = new Date(timelineStart);
        clickedDate.setDate(clickedDate.getDate() + days);
        clickedDate.setHours(0, 0, 0, 0);

        const screenHeight = window.innerHeight;
        const clickY = e.clientY;
        const isNearBottom = screenHeight - clickY < 300; // threshold for popup height

        setAddMilestoneDate(clickedDate);
        // Use client coordinates for fixed positioning
        setAddMilestonePos({
            x: e.clientX,
            y: e.clientY,
            placement: isNearBottom ? 'top' : 'bottom'
        });

        // Close other popups
        setEditPopup(null);
    };

    return (
        <div
            className={`milestones-container ${isCollapsed ? 'is-collapsed-bar' : ''}`}
            style={containerStyle}
            onDoubleClick={handleDoubleClick}
        >
            {/* Add Milestone Popup */}
            {addMilestoneDate && !isCollapsed && addMilestonePos && createPortal((
                <div
                    className="fixed bg-popover text-popover-foreground border border-border shadow-xl rounded-lg p-3 z-[999999] timeline-popup-content animate-in zoom-in-95 duration-200"
                    style={{
                        left: Math.min(addMilestonePos.x, window.innerWidth - 220),
                        top: addMilestonePos.placement === 'bottom' ? addMilestonePos.y + 10 : 'auto',
                        bottom: addMilestonePos.placement === 'top' ? (window.innerHeight - addMilestonePos.y) + 10 : 'auto',
                        width: 200
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-border">
                        <span className="text-xs font-bold flex items-center gap-1.5 text-primary">
                            <Clock size={12} />
                            {new Date(addMilestoneDate).toLocaleDateString('cs-CZ')}
                        </span>
                        <button
                            onClick={() => {
                                setAddMilestoneDate(null);
                                setAddingCustomMode(false);
                                setCustomForm({ name: '', description: '', status: 'pending', icon: 'Milestone' });
                            }}
                            className="text-muted-foreground hover:text-foreground p-1 hover:bg-muted rounded-full transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>
                    <div className="flex flex-col gap-1 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                        {!addingCustomMode ? (
                            <>
                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1 px-1">Přidat milník</span>

                                <button
                                    className="text-xs text-left px-2 py-2 hover:bg-primary/10 hover:text-primary rounded-md flex items-center gap-2 transition-all font-bold border border-transparent hover:border-primary/20"
                                    onClick={() => setAddingCustomMode(true)}
                                >
                                    <Plus size={14} className="text-primary" />
                                    Vlastní milník...
                                </button>

                                <div className="h-px bg-border/50 my-1 mx-1" />

                                {[
                                    { id: 'chassis', label: 'Podvozek' },
                                    { id: 'body', label: 'Nástavba' },
                                    { id: 'mounting_end', label: 'Konec Montáže' },
                                    { id: 'revision_end', label: 'Konec Revize' },
                                    { id: 'start', label: 'Start (Uzavřeno)' },
                                    { id: 'handover', label: 'Předání', },
                                    { id: 'deadline', label: 'Deadline' },
                                ].map(type => (
                                    <button
                                        key={type.id}
                                        className="text-xs text-left px-2 py-1.5 hover:bg-muted rounded-md flex items-center gap-2 transition-colors text-muted-foreground hover:text-foreground"
                                        onClick={() => handleDateUpdate(type.id, formatLocalDate(addMilestoneDate!))}
                                    >
                                        <Plus size={12} />
                                        {type.label}
                                    </button>
                                ))}
                            </>
                        ) : (
                            <div className="flex flex-col gap-2 p-1">
                                <span className="text-[9px] font-black uppercase tracking-widest text-primary mb-1 px-1">Nový vlastní milník</span>
                                <div className="space-y-2">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 px-1">Název</label>
                                        <input
                                            type="text"
                                            placeholder="Např. Kontrola kvality"
                                            className="w-full text-xs bg-muted/50 border border-border px-2 py-1.5 rounded-md outline-none focus:ring-1 focus:ring-primary/30"
                                            value={customForm.name}
                                            onChange={(e) => setCustomForm({ ...customForm, name: e.target.value })}
                                            autoFocus
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 px-1">Popis (volitelné)</label>
                                        <textarea
                                            placeholder="Podrobnosti o milníku..."
                                            className="w-full text-[11px] bg-muted/50 border border-border px-2 py-1.5 rounded-md outline-none focus:ring-1 focus:ring-primary/30 min-h-[60px] resize-none"
                                            value={customForm.description}
                                            onChange={(e) => setCustomForm({ ...customForm, description: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 px-1">Ikonka</label>
                                        <div className="grid grid-cols-6 gap-1 p-1 bg-muted/30 rounded-md">
                                            {Object.entries(ICON_OPTIONS).map(([key, IconComponent]) => (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    onClick={() => setCustomForm({ ...customForm, icon: key })}
                                                    className={`p-1.5 rounded-md transition-all flex items-center justify-center ${customForm.icon === key ? 'bg-primary text-primary-foreground shadow-sm scale-110' : 'hover:bg-muted text-muted-foreground/70'}`}
                                                    title={key}
                                                >
                                                    <IconComponent size={14} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 pt-1">
                                        <button
                                            className="flex-1 text-[10px] font-bold uppercase py-2 rounded-md bg-muted hover:bg-muted/80 transition-colors"
                                            onClick={() => setAddingCustomMode(false)}
                                        >
                                            Zrušit
                                        </button>
                                        <button
                                            className="flex-1 text-[10px] font-bold uppercase py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-all shadow-sm"
                                            onClick={() => handleDateUpdate('custom_new', formatLocalDate(addMilestoneDate!))}
                                            disabled={!customForm.name || isUpdating}
                                        >
                                            {isUpdating ? 'Ukládám...' : 'Přidat'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ), document.body)}
            {/* Vykreslení fází (podklad) */}
            {phases.map((p: IPhase) => {
                const left = getDatePos(p.start);
                const right = getDatePos(p.end);
                const width = right - left;
                if (width <= 0) return null;
                if (isCollapsed) {
                    // Check stack visibility setting
                    let configKey = '';
                    if (p.class === 'phase-initial') configKey = 'phaseInitial';
                    if (p.class === 'phase-mounting') configKey = 'phaseMounting';
                    if (p.class === 'phase-buffer-yellow') configKey = 'phaseBufferYellow';
                    if (p.class === 'phase-buffer-orange') configKey = 'phaseBufferOrange';

                    const phaseConfig = config?.colors?.[configKey] || config?.[configKey];
                    if (phaseConfig?.showInStack === false) return null;
                }

                // Specific opacity for stacked view
                let opacityStyle: React.CSSProperties = {};
                if (isCollapsed) {
                    if (p.class === 'phase-mounting') opacityStyle = { opacity: 0.2, zIndex: 1 }; // Příprava: 20%, vespod
                    if (p.class === 'phase-buffer-yellow') opacityStyle = { opacity: 0.5, zIndex: 2 }; // Montáž: 50%, střední vrstva
                    if (p.class === 'phase-buffer-orange') {
                        opacityStyle = {
                            opacity: 0.5,
                            zIndex: 3, // Revize: 50%, nejvyšší vrstva fází
                            background: 'linear-gradient(to right, #facc15, #fb923c)' // Gradient Yellow -> Orange
                        };
                    }
                }

                return (
                    <div
                        key={`${id}-${p.key}`}
                        className={`timeline-phase ${p.class} flex items-center px-2 overflow-hidden`}
                        style={{ left, width, ...opacityStyle }}
                        title={`${name}`}
                    >
                    </div>
                );
            })}

            {/* Vykreslení milníků (body) */}
            {(Object.entries(groupedMilestones) as [string, IMilestone[]][]).map(([dateKey, ms]) => {
                const [y, m_idx, d] = dateKey.split('-').map(Number);
                const date = new Date(y, m_idx - 1, d);
                const mLeft = getDatePos(date);
                const isHovered = activeCell === dateKey;

                // Dynamic icon size: adjust more reasonably at extreme zoom
                // Dynamic icon size: adjust more reasonably at extreme zoom
                // Dynamic icon size: adjust more reasonably at extreme zoom
                const baseSize = config?.milestoneSize || 34; // Configurable base size, default 34
                let iconSize = baseSize;

                if (dayWidth < 5) {
                    iconSize = Math.max(16, baseSize * 0.5); // Much smaller at max zoom out
                } else if (dayWidth < 10) {
                    iconSize = Math.max(22, baseSize * 0.65);
                } else if (dayWidth < 20) {
                    iconSize = Math.max(28, baseSize * 0.8);
                }

                return (
                    <div
                        key={`${id}-${dateKey}`}
                        className={`milestone-cell ${isHovered ? 'is-active' : ''}`}
                        style={{
                            left: mLeft,
                            width: dayWidth,
                            zIndex: isHovered ? 1000 : (isCollapsed ? 30 : 20),
                            pointerEvents: 'auto'
                        }}
                    >
                        <div className="milestone-icons-stack flex items-center justify-center relative w-full h-full">
                            {ms.map((m: IMilestone, idx) => {
                                const configMap: Record<string, string> = {
                                    'chassis': 'milestoneChassis',
                                    'body': 'milestoneBody',
                                    'handover': 'milestoneHandover',
                                    'deadline': 'milestoneDeadline',
                                    'mounting_end': 'milestoneMountingEnd',
                                    'revision_end': 'milestoneRevisionEnd',
                                    'start': 'milestoneStart',
                                    'custom-completed': 'milestoneHandover', // Reusing colors/icons for now
                                    'custom-pending': 'milestoneBody'
                                };

                                const configKey = configMap[m.class];
                                const milestoneConfig = config?.colors?.[configKey] || config?.[configKey];

                                // Check stack visibility - explicit hide for mounting_end/revision_end/start in stack
                                if (isCollapsed && (milestoneConfig?.showInStack === false || m.class === 'mounting_end' || m.class === 'revision_end' || m.class === 'start')) return null;

                                const IconKey = (m.icon || milestoneConfig?.icon) as keyof typeof ICON_OPTIONS;
                                const Icon = ICON_OPTIONS[IconKey] || ICON_OPTIONS['Milestone'];
                                const milestoneColor = m.class === 'custom-completed' ? '#10b981' : (m.class === 'custom-pending' ? '#ef4444' : (milestoneConfig?.color || '#888'));

                                const isPhaseEndVal = m.class === 'mounting_end' || m.class === 'revision_end';
                                const isStartVal = m.class === 'start';
                                const isSmallMilestone = isPhaseEndVal || isStartVal;

                                return (
                                    <div
                                        key={m.key}
                                        className={`milestone-icon cursor-pointer transition-transform ${isSmallMilestone ? 'hover:scale-105' : 'hover:scale-125'}`}
                                        style={{
                                            color: milestoneColor,
                                            transform: `scale(${isHovered ? 1.6 : 1.1})`,
                                            zIndex: idx,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                        // title removed in favor of hover popup
                                        onMouseEnter={(e) => {
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            handleMouseEnter(m, rect);
                                        }}
                                        onMouseLeave={handleMouseLeave}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            setEditPopup({ m, x: rect.left, y: rect.bottom });
                                            setAddMilestoneDate(null);
                                            setIsDeleteConfirm(false);
                                            setIsEditingDate(false);
                                        }}
                                    >
                                        {isSmallMilestone ? (
                                            <div className="flex items-center justify-center w-full h-full">
                                                <div
                                                    className={`${isStartVal ? 'w-1.5 h-1.5' : 'w-1 h-1'} rounded-full`}
                                                    style={{ backgroundColor: milestoneColor }}
                                                />
                                            </div>
                                        ) : (
                                            <Icon
                                                size={iconSize}
                                                color={milestoneColor}
                                                fill={IconKey === 'Play' ? milestoneColor : 'none'}
                                                strokeWidth={2.5}
                                                className="milestone-svg"
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}

            {/* EDIT / DELETE POPUP */}
            {editPopup && createPortal((() => {
                const m = editPopup.m;
                const configMap: Record<string, string> = {
                    'chassis': 'milestoneChassis',
                    'body': 'milestoneBody',
                    'handover': 'milestoneHandover',
                    'deadline': 'milestoneDeadline',
                    'mounting_end': 'milestoneMountingEnd',
                    'revision_end': 'milestoneRevisionEnd',
                    'start': 'milestoneStart'
                };
                const configKey = configMap[m.class];
                const milestoneConfig = config?.colors?.[configKey] || config?.[configKey];
                const milestoneColor = m.class === 'custom-completed' ? '#10b981' : (m.class === 'custom-pending' ? '#ef4444' : (milestoneConfig?.color || '#888'));
                const IconKey = (m.icon || milestoneConfig?.icon) as keyof typeof ICON_OPTIONS;
                const Icon = ICON_OPTIONS[IconKey] || ICON_OPTIONS['Milestone'];

                // Calculate vertical position (check bounds)
                const isNearBottom = (window.innerHeight - editPopup.y) < 400;
                // Since we use Portal, coordinates are absolute to viewport, which matches clientRect
                const topPos = isNearBottom ? 'auto' : editPopup.y + 10;
                const bottomPos = isNearBottom ? Math.max(10, (window.innerHeight - editPopup.y) + 35) : 'auto';

                return (
                    <div
                        className="fixed bg-popover text-popover-foreground border border-border shadow-xl rounded-lg p-3 z-[99999] timeline-popup-content flex flex-col gap-2 transition-opacity duration-200 overflow-y-auto"
                        style={{
                            left: Math.min(editPopup.x - 100, window.innerWidth - 300), // Prevent overflow right
                            top: topPos,
                            bottom: bottomPos,
                            width: 280, // Compact width
                            maxWidth: '90vw',
                            maxHeight: '85vh'
                        }}
                        onMouseEnter={() => {
                            if (hoverTimeoutRef.current) {
                                clearTimeout(hoverTimeoutRef.current);
                                hoverTimeoutRef.current = null;
                            }
                        }}
                        onMouseLeave={handleMouseLeave}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Compact Header: Milestone Info & Project Info Combined */}
                        <div className="flex flex-col gap-1 relative border-b border-border/50 pb-2">
                            <button
                                onClick={() => setEditPopup(null)}
                                className="absolute -top-1 -right-1 text-muted-foreground hover:text-foreground p-1 hover:bg-muted rounded-full transition-colors outline-none"
                            >
                                <X size={14} />
                            </button>

                            {/* Row 1: Icon + Milestone Name + Date */}
                            <div className="flex items-center justify-between gap-2 pr-6">
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <Icon size={14} color={milestoneColor} className="shrink-0" />
                                    {m.class.startsWith('custom-') ? (
                                        <input
                                            type="text"
                                            defaultValue={m.label}
                                            className="font-bold text-sm bg-muted/50 border-none px-1 py-0 rounded outline-none focus:ring-1 focus:ring-primary/30 min-w-0 w-full"
                                            onBlur={async (e: React.FocusEvent<HTMLInputElement>) => {
                                                const val = e.target.value;
                                                if (!val || val === m.label) return;
                                                try {
                                                    const { error } = await supabase
                                                        .from('project_milestones')
                                                        .update({ name: val })
                                                        .eq('id', m.key);
                                                    if (error) throw error;
                                                    handleDateUpdate(m.key, formatLocalDate(m.date));
                                                } catch (err) {
                                                    console.error('Error updating milestone name:', err);
                                                }
                                            }}
                                        />
                                    ) : (
                                        <span className="font-bold text-sm truncate leading-tight" style={{ color: milestoneColor }}>{m.label}</span>
                                    )}
                                </div>
                                <span className="text-[10px] font-mono bg-muted/50 px-1.5 py-0.5 rounded text-foreground/80 shrink-0 whitespace-nowrap">
                                    {formatLocalDate(m.date)}
                                </span>
                            </div>

                            {/* Row 2: OP Number (Key info) + Customer */}
                            <div className="flex flex-col gap-0.5 mt-0.5">
                                <div className="flex items-baseline gap-1.5 text-xs text-muted-foreground">
                                    <span className="font-bold text-foreground bg-primary/10 text-primary px-1 rounded-sm border border-primary/20" title="Číslo zakázky / OP">
                                        #{project.id}
                                    </span>
                                    {project.customer && (
                                        <span className="truncate" title={project.customer}>• {project.customer}</span>
                                    )}
                                </div>
                                {/* Row 3: Project Name (Description) */}
                                <Link
                                    href={`/projekty/${project.id}`}
                                    className="text-[10px] leading-tight text-muted-foreground/80 hover:text-primary transition-colors line-clamp-1"
                                    title={name}
                                >
                                    {name}
                                </Link>
                            </div>
                        </div>


                        {!isDeleteConfirm && !isEditingDate && !isIconPickerOpen && (
                            <div className="flex flex-col gap-2 pt-1">
                                {/* Status Toggle - Prominent */}
                                <button
                                    className={`w-full text-[10px] font-bold uppercase py-1.5 rounded transition-colors border shadow-sm ${m.class === 'custom-completed'
                                        ? 'bg-background border-amber-500/30 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                                        : 'bg-background border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                                        }`}
                                    onClick={async () => {
                                        const newStatus = m.class === 'custom-completed' ? 'pending' : 'completed';
                                        try {
                                            const { error } = await supabase
                                                .from('project_milestones')
                                                .update({ status: newStatus })
                                                .eq('id', m.key);
                                            if (error) throw error;
                                            handleDateUpdate(m.key, formatLocalDate(m.date));
                                        } catch (err) {
                                            console.error('Error toggling status:', err);
                                        }
                                    }}
                                >
                                    {m.class === 'custom-completed' ? 'Rozpracovat' : 'Dokončit'}
                                </button>

                                {/* Icon Actions Row - Compact Grid */}
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        className="flex flex-col items-center justify-center gap-1 py-1.5 rounded bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                        onClick={() => setIsEditingDate(true)}
                                        disabled={isUpdating}
                                        title="Změnit datum"
                                    >
                                        <Clock size={14} />
                                        <span className="text-[9px] font-medium">Datum</span>
                                    </button>

                                    <button
                                        className="flex flex-col items-center justify-center gap-1 py-1.5 rounded bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                        onClick={() => setIsIconPickerOpen(true)}
                                        disabled={isUpdating}
                                        title="Změnit ikonku"
                                    >
                                        <Settings size={14} />
                                        <span className="text-[9px] font-medium">Ikona</span>
                                    </button>

                                    <button
                                        className="flex flex-col items-center justify-center gap-1 py-1.5 rounded bg-destructive/5 hover:bg-destructive/10 text-destructive/80 hover:text-destructive transition-colors"
                                        onClick={() => setIsDeleteConfirm(true)}
                                        disabled={isUpdating}
                                        title="Smazat milník"
                                    >
                                        <Trash2 size={14} />
                                        <span className="text-[9px] font-medium">Smazat</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {isIconPickerOpen && (
                            <div className="flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-200">
                                <div className="flex items-center justify-between pb-1 border-b border-border/50">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Vybrat ikonu</span>
                                    <button
                                        className="text-[10px] font-bold bg-muted hover:bg-muted/80 px-2 py-0.5 rounded"
                                        onClick={() => setIsIconPickerOpen(false)}
                                    >
                                        Zpět
                                    </button>
                                </div>
                                <div className="grid grid-cols-6 gap-1 p-0.5">
                                    {Object.entries(ICON_OPTIONS).map(([key, IconComponent]) => (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={async () => {
                                                try {
                                                    const { error } = await supabase
                                                        .from('project_milestones')
                                                        .update({ icon: key })
                                                        .eq('id', m.key);
                                                    if (error) throw error;
                                                    handleDateUpdate(m.key, formatLocalDate(m.date));
                                                    setIsIconPickerOpen(false);
                                                } catch (err) {
                                                    console.error('Error updating icon:', err);
                                                }
                                            }}
                                            className={`aspect-square rounded-md transition-all flex items-center justify-center ${m.icon === key ? 'bg-primary text-primary-foreground shadow-sm scale-105' : 'bg-muted/30 hover:bg-muted text-muted-foreground/70'}`}
                                            title={key}
                                        >
                                            <IconComponent size={14} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {isEditingDate && (
                            <div className="flex flex-col gap-2 p-1 bg-muted/30 rounded-md animate-in fade-in zoom-in-95 duration-200">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Nové datum</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="date"
                                        className="flex-1 bg-background border border-border px-2 py-1 rounded text-xs outline-none focus:ring-1 focus:ring-primary/30"
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            const val = e.target.value;
                                            const updateKey = m.class.startsWith('custom-') ? m.key : m.class;
                                            handleDateUpdate(updateKey, val);
                                            setIsEditingDate(false);
                                        }}
                                        defaultValue={formatLocalDate(m.date)}
                                        autoFocus
                                    />
                                    <button
                                        className="p-1.5 bg-muted hover:bg-muted/80 rounded"
                                        onClick={() => setIsEditingDate(false)}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {isDeleteConfirm && (
                            <div className="flex flex-col gap-2 p-2 bg-destructive/5 rounded-md border border-destructive/10 animate-in fade-in zoom-in-95 duration-200">
                                <p className="text-[11px] font-bold text-destructive text-center">Opravdu smazat?</p>
                                <div className="flex gap-2">
                                    <button
                                        className="flex-1 bg-background hover:bg-muted border border-border text-[10px] font-bold uppercase py-1.5 rounded transition-colors"
                                        onClick={() => setIsDeleteConfirm(false)}
                                    >
                                        Zrušit
                                    </button>
                                    <button
                                        className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground text-[10px] font-bold uppercase py-1.5 rounded transition-colors shadow-sm"
                                        onClick={() => {
                                            const updateKey = m.class.startsWith('custom-') ? m.key : m.class;
                                            handleDateUpdate(updateKey, null);
                                            setEditPopup(null);
                                        }}
                                    >
                                        Smazat
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })(), document.body)}
        </div >
    );
};

export default TimelineBar;
