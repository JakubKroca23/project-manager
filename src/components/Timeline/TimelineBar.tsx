'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Project, Milestone as ProjectMilestone } from '@/types/project';
import {
    Truck, Hammer, ThumbsUp, AlertTriangle, Play, Check, Milestone,
    Cog, Wrench, Zap, Cpu, Activity, Package, Box, HardHat,
    Construction, Factory, Pickaxe, Settings2, ShieldCheck,
    Container, Anchor, Component, Drill, Settings,
    Clock, Flag, Star, Info, MessageSquare, FileText,
    Camera, MapPin, PenTool, Lightbulb, Rocket,
    Coffee, FileSignature, Paintbrush, BadgeCheck, Shield, Send,
    PackageCheck,
    X,
    Trash2,
    Plus,
} from 'lucide-react';
import { toast } from 'sonner';

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
        {/* Flatbed - LOWERED from y=14 to y=16 */}
        <path d="M9 16h13v2H9z" />
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
        <path fill="#000000" stroke="currentColor" strokeWidth="40" d="M709.98,682.51 C490.48,682.52 271.49,682.53 52.50,682.54 C48.33,682.54 44.13,682.78 40.02,682.33 C38.74,682.19 36.78,680.18 36.68,678.91 C36.30,674.11 36.58,669.26 36.58,664.42 C36.60,458.26 36.63,252.10 36.51,45.94 C36.51,40.97 37.56,39.57 42.79,39.58 C209.62,39.77 376.45,39.78 543.28,39.81 C599.78,39.82 656.27,39.78 712.77,39.78 C714.07,39.78 715.37,39.89 717.04,39.97 C717.16,41.61 717.37,43.05 717.37,44.48 C717.39,254.98 717.39,465.47 717.39,675.96 C717.39,682.51 717.38,682.51 709.98,682.51 Z" />
        {/* Bird logo silhouette */}
        <path fill="currentColor" stroke="none" d="M239.325577,244.186447 C203.676422,260.819580 181.076263,297.162354 182.767044,334.754974 C184.659683,376.835571 214.633133,412.044403 255.930511,420.166931 C290.925354,427.049896 321.923950,419.072845 348.072388,394.205811 C348.646942,393.659393 349.350281,393.248383 350.698639,392.254486 C350.876465,394.253387 351.104340,395.619995 351.103790,396.986572 C351.094727,420.319366 350.979187,443.652557 351.102631,466.984528 C351.123352,470.902740 349.982635,472.827637 346.087982,474.136627 C314.852814,484.634644 282.792542,488.090546 250.473999,482.307434 C176.538651,469.077393 127.043213,426.617065 103.475761,355.035187 C90.394173,315.302216 90.995651,275.095520 104.500275,235.729980 C124.083107,178.646637 162.374619,139.218216 219.688461,118.965439 C265.006805,102.951469 309.664490,106.366371 353.827484,123.622246 C379.737000,133.745926 403.279755,147.750900 425.192444,164.987671 C442.542694,178.635559 460.278503,192.182083 479.337524,203.185028 C515.062378,223.809326 554.102417,231.555420 595.280273,226.561981 C615.185608,224.148117 633.773682,217.584396 650.923706,207.098816 C652.627502,206.057114 654.341736,205.031387 656.075623,204.041153 C656.311707,203.906326 656.691223,204.022583 657.474792,204.022583 C657.474792,343.750275 657.474792,483.451508 657.474792,623.471130 C592.401489,623.471130 527.332031,623.471130 461.703094,623.471130 C465.198578,598.751526 472.556335,575.556274 481.364807,553.438538 C470.681000,543.735840 459.901154,534.822144 450.133575,524.910889 C420.921997,495.269623 402.146088,459.562714 389.878693,420.032654 C380.711121,390.491394 375.579071,360.200592 371.022034,329.723511 C367.572266,306.651764 359.240570,285.458252 344.542786,267.071228 C332.136230,251.550446 315.365082,243.249496 296.460724,238.938934 C277.059540,234.515060 258.087372,236.593246 239.325577,244.186447 M405.066071,356.463867 C410.432312,383.842468 418.457458,410.395691 430.494324,435.600952 C445.061768,466.105164 463.614624,493.674988 490.639832,514.752502 C492.789459,516.429016 495.057343,517.953857 496.417114,518.934143 C513.274902,494.606476 529.752014,470.828064 546.346313,446.880646 C544.305969,446.365356 542.040405,445.919800 539.855347,445.221893 C516.372620,437.721619 498.028503,423.066315 483.016296,403.948822 C457.174347,371.040009 444.689209,332.920502 439.677368,291.924713 C438.283508,280.522980 437.043335,269.093719 435.263367,257.750763 C433.873779,248.895523 427.581482,243.368057 419.133240,242.589844 C411.363129,241.874100 404.838959,245.662964 401.942169,253.419128 C400.451782,257.409546 399.397797,266.087616 C397.282166,296.164215 399.298950,326.010345 405.066071,356.463867 M526.730957,299.152283 C524.841736,300.771179 522.798889,302.243286 521.088745,304.033264 C511.238831,314.342743 509.870361,330.107635 517.726929,341.649139 C526.089478,353.933990 540.631409,358.646790 554.090332,352.992706 C565.409607,348.237457 572.231384,339.693481 573.135559,327.223969 C574.031616,314.867828 568.991577,305.131012 558.450073,298.728607 C548.244873,292.530487 537.709229,292.676788 526.730957,299.152283 z" />
    </svg>
);

const ICON_OPTIONS = {
    Truck: FlatbedTruck,
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
    FlatbedTruck: FlatbedTruck,
    Flag: Flag,
    Star: Star,
    Info: Info,
    MessageSquare: MessageSquare,
    FileText: FileText,
    Camera: Camera,
    MapPin: MapPin,
    PenTool: PenTool,
    Lightbulb: Lightbulb,
    Rocket: Rocket,
    Coffee: Coffee,
    Contract: FileSignature,
    Painting: Paintbrush,
    TUV: BadgeCheck,
    Fenders: Shield,
    Dispatch: Send,
    DeliveryCheck: PackageCheck
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
    rowHeight: number;
    topOffset?: number;
    isCollapsed?: boolean;
    config?: any;
    onProjectUpdate?: (updatedProject: Project) => void;
    milestones?: ProjectMilestone[];
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
    rowHeight,
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

    const lastMainM = [t_chassis, t_body].filter((d): d is Date => d !== null);
    let mountingStart: Date | null = null;
    let mountingEnd: Date | null = null;

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
    }

    // 1. Milníky (body v čase)
    const groupedMilestones = useMemo((): Record<string, IMilestone[]> => {
        const customIcons = project.custom_fields?.milestone_icons || {};

        const raw: IMilestone[] = [
            { key: 'chassis', date: t_chassis!, label: 'Podvozek', class: 'chassis', icon: customIcons['chassis'] },
            { key: 'body', date: t_body!, label: 'Nástavba', class: 'body', icon: customIcons['body'] },
            { key: 'handover', date: t_handover!, label: 'Předání', class: 'handover', icon: customIcons['handover'] },
            { key: 'deadline', date: t_deadline!, label: 'Deadline', class: 'deadline', icon: customIcons['deadline'] },
        ];

        // Milestones prop can still contain custom milestones



        // Add dynamic milestones from prop
        milestones.forEach((m: ProjectMilestone) => {
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
    }, [t_chassis, t_body, t_handover, t_deadline, project.project_type, mountingStart, mountingEnd]);

    const handleDateUpdate = async (milestoneClass: string, newDateStr: string | null) => {
        setIsUpdating(true);
        try {
            // Special handling for custom field milestones
            if (milestoneClass === 'mounting_end') {
                const key = 'mounting_end_date';

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
            toast.success('Datum milníku aktualizováno');
        } catch (err) {
            console.error('Error updating milestone date:', err);
            toast.error('Chyba při ukládání data.');
        } finally {
            setIsUpdating(false);
        }
    };

    const toggleMilestoneCompletion = async (milestoneKey: string) => {
        setIsUpdating(true);
        try {
            const isStandard = ['chassis', 'body', 'handover', 'deadline', 'mounting_end', 'start'].includes(milestoneKey);
            const currentCustom = project.custom_fields || {};
            const completed = currentCustom.completed_milestones || [];

            if (isStandard) {
                let nextCompleted;
                if (completed.includes(milestoneKey)) {
                    nextCompleted = completed.filter((k: string) => k !== milestoneKey);
                } else {
                    nextCompleted = [...completed, milestoneKey];
                }

                const { error } = await supabase
                    .from('projects')
                    .update({
                        custom_fields: {
                            ...currentCustom,
                            completed_milestones: nextCompleted
                        }
                    })
                    .eq('id', id);

                if (error) throw error;
            } else {
                // Custom milestone from project_milestones table
                const milestone = milestones.find(m => m.id === milestoneKey);
                const nextStatus = milestone?.status === 'completed' ? 'pending' : 'completed';

                const { error } = await supabase
                    .from('project_milestones')
                    .update({ status: nextStatus })
                    .eq('id', milestoneKey);

                if (error) throw error;
            }

            if (onProjectUpdate) {
                const { data: updatedRow } = await supabase.from('projects').select('*').eq('id', id).single();
                if (updatedRow) onProjectUpdate(updatedRow);
            }
            toast.success('Stav milníku aktualizován');
        } catch (err) {
            console.error('Error toggling milestone status:', err);
            toast.error('Chyba při aktualizaci stavu');
        } finally {
            setIsUpdating(false);
        }
    };

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

        // Fáze 3: Montáž
        if (mountingStart && mountingEnd) {
            list.push({ key: 'p3', start: mountingStart, end: mountingEnd, class: 'phase-buffer-yellow' });
        }

        return list;
    }, [t_closed, t_chassis, t_body, t_handover, t_deadline, project.project_type, mountingStart, mountingEnd]);

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
                                                    <IconComponent size={18} />
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
                    opacityStyle = {
                        opacity: 0.45,
                        zIndex: 1,
                        mixBlendMode: 'multiply',
                        borderLeft: '1px solid rgba(255,255,255,0.4)',
                        borderRight: '1px solid rgba(0,0,0,0.05)',
                        borderRadius: '2px'
                    };

                    if (p.class === 'phase-mounting') opacityStyle.backgroundColor = 'var(--phase-mounting)';
                    if (p.class === 'phase-buffer-yellow') opacityStyle.backgroundColor = 'var(--phase-buffer-yellow)';
                    if (p.class === 'phase-buffer-orange') opacityStyle.backgroundColor = 'var(--phase-buffer-orange)';
                }

                // Priority coloring
                const usePriorityColors = config?.design?.usePriorityColors;
                const projectPriority = project.priority;
                let phaseColor = 'var(--' + p.class + ')';

                if (usePriorityColors && projectPriority && p.class === 'phase-buffer-yellow') {
                    const priorityKey = `priority${projectPriority}` as keyof typeof config.colors;
                    const priorityConfig = config.colors[priorityKey];
                    if (priorityConfig) {
                        phaseColor = priorityConfig.color;
                    }
                }

                return (
                    <div
                        key={`${id}-${p.key}`}
                        className={`timeline-phase ${p.class} flex items-center px-2 overflow-hidden`}
                        style={{
                            left,
                            width,
                            ...opacityStyle,
                            backgroundColor: phaseColor
                        }}
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
                const baseSize = config?.milestoneSize || 22;
                let iconSize = baseSize;

                // Horizontal zoom scaling (compact icons when days are narrow)
                if (dayWidth < 10) {
                    iconSize = Math.max(12, baseSize * 0.6);
                } else if (dayWidth < 25) {
                    iconSize = Math.max(16, baseSize * 0.8);
                }

                // Vertical zoom scaling (larger icons when rows are tall)
                // Aggressive scaling for better visibility
                if (rowHeight > 32) {
                    const verticalScale = (rowHeight / 32) * 1.25;
                    iconSize = iconSize * verticalScale;
                } else if (rowHeight < 24) {
                    iconSize = iconSize * 0.8;
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

                                // Color Logic: Global but status-aware
                                // Grey default: #374151, Green: #22c55e, Red: #ef4444
                                const completedMilestones = project.custom_fields?.completed_milestones || [];
                                const isCompleted = m.class.startsWith('custom-')
                                    ? (milestones.find(cm => cm.id === m.key)?.status === 'completed')
                                    : completedMilestones.includes(m.key);

                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                const isOverdue = !isCompleted && m.date < today;

                                let milestoneColor = '#374151'; // Dark grey default
                                if (isCompleted) milestoneColor = '#22c55e'; // Green
                                else if (isOverdue) milestoneColor = '#ef4444'; // Red
                                else if (milestoneConfig?.color) milestoneColor = milestoneConfig.color; // Fallback to provided config color if pending and not overdue

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

                const completedMilestones = project.custom_fields?.completed_milestones || [];
                const isCompleted = m.class.startsWith('custom-')
                    ? (milestones.find(cm => cm.id === m.key)?.status === 'completed')
                    : completedMilestones.includes(m.key);

                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const isOverdue = !isCompleted && m.date < today;

                let milestoneColor = '#374151';
                if (isCompleted) milestoneColor = '#22c55e';
                else if (isOverdue) milestoneColor = '#ef4444';
                else if (milestoneConfig?.color) milestoneColor = milestoneConfig.color;

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
                        {/* Redesigned Header: Requested Row 1 */}
                        <div className="flex flex-col gap-2 relative border-b border-border/50 pb-3">
                            <button
                                onClick={() => setEditPopup(null)}
                                className="absolute -top-1 -right-1 text-muted-foreground hover:text-foreground p-1 hover:bg-muted rounded-full transition-colors outline-none z-10"
                            >
                                <X size={14} />
                            </button>

                            {/* Row 1: DATUM | IKONA | TYP MILNIKU | (dodatečné info o nástavbě/podvozku) */}
                            <div className="flex items-center gap-3">
                                <span className="text-[11px] font-mono bg-primary/10 text-primary px-2 py-0.5 rounded font-bold shrink-0">
                                    {formatLocalDate(m.date)}
                                </span>
                                <div className="flex items-center gap-2 min-w-0">
                                    <Icon size={16} color={milestoneColor} className="shrink-0" />
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-black text-xs uppercase tracking-tight truncate" style={{ color: milestoneColor }}>
                                            {m.label}
                                        </span>
                                        {(m.class === 'body' || m.class === 'chassis') && project.body_type && (
                                            <span className="text-[9px] font-bold text-muted-foreground/80 truncate">
                                                {project.body_type}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Row 2: CISLO OP | NAZEV PROJEKTU | ZAKAZNIK | MANAGER */}
                            <div className="flex flex-col gap-1.5 mt-1 bg-muted/30 p-2 rounded-lg border border-border/40">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="font-black text-[10px] text-foreground bg-background px-1.5 py-0.5 rounded border border-border shadow-sm shrink-0">
                                        #{project.id}
                                    </span>
                                    {project.manager && (
                                        <span className="text-[9px] font-bold text-primary/70 uppercase tracking-wider truncate">
                                            {project.manager}
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <Link
                                        href={`/projekty/${project.id}`}
                                        className="text-[11px] font-bold leading-tight hover:text-primary transition-colors line-clamp-2"
                                        title={name}
                                    >
                                        {name}
                                    </Link>
                                    {project.customer && (
                                        <span className="text-[10px] text-muted-foreground font-medium truncate italic" title={project.customer}>
                                            {project.customer}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {!isDeleteConfirm && !isEditingDate && !isIconPickerOpen && (
                            <div className="flex flex-col gap-2 pt-1">
                                {/* Row 3: UPRAVIT / POTVRDIT */}
                                <div className="flex gap-2">
                                    <button
                                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-muted/50 hover:bg-muted text-foreground transition-all border border-border/50 group"
                                        onClick={() => setIsEditingDate(true)}
                                        disabled={isUpdating}
                                    >
                                        <Settings size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Upravit</span>
                                    </button>

                                    <button
                                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl transition-all border group ${isCompleted ? 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30' : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border-emerald-500/20'}`}
                                        onClick={() => toggleMilestoneCompletion(m.key)}
                                        disabled={isUpdating}
                                    >
                                        <ShieldCheck size={14} className={isCompleted ? 'text-emerald-600' : 'text-emerald-500 group-hover:scale-110 transition-transform'} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{isCompleted ? 'Splněno' : 'Potvrdit'}</span>
                                    </button>
                                </div>

                                {/* Quick Actions Grid (Existing functionality preserved but hidden/reorganized if needed) */}
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                    <button
                                        className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-muted/30 hover:bg-muted text-muted-foreground/70 hover:text-foreground transition-colors border border-transparent hover:border-border"
                                        onClick={() => setIsIconPickerOpen(true)}
                                        disabled={isUpdating}
                                    >
                                        <Milestone size={12} />
                                        <span className="text-[9px] font-bold uppercase">Ikona</span>
                                    </button>

                                    <button
                                        className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-destructive/5 hover:bg-destructive/10 text-destructive/60 hover:text-destructive transition-colors border border-transparent hover:border-destructive/10"
                                        onClick={() => setIsDeleteConfirm(true)}
                                        disabled={isUpdating}
                                    >
                                        <Trash2 size={12} />
                                        <span className="text-[9px] font-bold uppercase">Smazat</span>
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
                                                setIsUpdating(true);
                                                try {
                                                    const isStandard = ['chassis', 'body', 'handover', 'deadline', 'mounting_end', 'revision_end', 'start'].includes(m.key);

                                                    if (isStandard) {
                                                        const currentCustom = project.custom_fields || {};
                                                        const iconOverrides = currentCustom.milestone_icons || {};
                                                        const { error } = await supabase
                                                            .from('projects')
                                                            .update({
                                                                custom_fields: {
                                                                    ...currentCustom,
                                                                    milestone_icons: { ...iconOverrides, [m.key]: key }
                                                                }
                                                            })
                                                            .eq('id', id);
                                                        if (error) throw error;
                                                    } else {
                                                        // Custom milestone from table
                                                        const { error } = await supabase
                                                            .from('project_milestones')
                                                            .update({ icon: key })
                                                            .eq('id', m.key);
                                                        if (error) throw error;
                                                    }

                                                    if (onProjectUpdate) {
                                                        const { data } = await supabase.from('projects').select('*').eq('id', id).single();
                                                        if (data) onProjectUpdate(data);
                                                    }
                                                    toast.success('Ikona aktualizována');
                                                    setIsIconPickerOpen(false);
                                                } catch (err) {
                                                    console.error('Error updating icon:', err);
                                                    toast.error('Chyba při změně ikony');
                                                } finally {
                                                    setIsUpdating(false);
                                                }
                                            }}
                                            className={`aspect-square rounded-md transition-all flex items-center justify-center ${m.icon === key ? 'bg-primary text-primary-foreground shadow-sm scale-110' : 'bg-muted/30 hover:bg-muted text-muted-foreground/70'}`}
                                            title={key}
                                        >
                                            <IconComponent size={18} />
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
