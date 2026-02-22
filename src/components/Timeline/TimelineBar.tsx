'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Project, Milestone as ProjectMilestone } from '@/types/project';
import {
    Truck, Hammer, ThumbsUp, AlertTriangle, Play, Check, Milestone,
    Wrench, Package, Box, Factory, ShieldCheck, Drill, Settings,
    X, Trash2, Plus, Briefcase, Building2, Globe, TrendingUp,
    Euro, Warehouse, Landmark, Users, Laptop, Phone, Mail, Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ─── CUSTOM ICONS ────────────────────────────────────────────────

const Hiab = ({ size = 24 }: any) => {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
            <svg version="1.1" viewBox="0 0 756 719" width={size} height={size} xmlSpace="preserve">
                {/* Hiab Icon (Transparent) */}





                {/* 6. BLACK internal paths (#020202) */}
                <path fill="#000000" fillRule="evenodd" d="M239.325577,244.186447 C203.676422,260.819580 181.076263,297.162354 182.767044,334.754974 C184.659683,376.835571 214.633133,412.044403 255.930511,420.166931 C290.925354,427.049896 321.923950,419.072845 348.072388,394.205811 C348.646942,393.659393 349.350281,393.248383 350.698639,392.254486 C350.876465,394.253387 351.104340,395.619995 351.103790,396.986572 C351.103790,420.319366 350.979187,443.652557 351.102631,466.984528 C351.123352,470.902740 349.982635,472.827637 346.087982,474.136627 C314.852814,484.634644 282.792542,488.090546 250.473999,482.307434 C176.538651,469.077393 127.043213,426.617065 103.475761,355.035187 C90.394173,315.302216 90.995651,275.095520 104.500275,235.729980 C124.083107,178.646637 162.374619,139.218216 219.688461,118.965439 C265.006805,102.951469 309.664490,106.366371 353.827484,123.622246 C379.737000,133.745926 403.279755,147.750900 425.192444,164.987671 C442.542694,178.635559 460.278503,192.182083 479.337524,203.185028 C515.062378,223.809326 554.102417,231.555420 595.280273,226.561981 C615.185608,224.148117 633.773682,217.584396 650.923706,207.098816 C652.627502,206.057114 654.341736,205.031387 656.075623,204.041153 C656.311707,203.906326 656.691223,204.022583 657.474792,204.022583 C657.474792,343.750275 657.474792,483.451508 657.474792,623.471130 C592.401489,623.471130 527.332031,623.471130 461.703094,623.471130 C465.198578,598.751526 472.556335,575.556274 481.364807,553.438538 C470.681000,543.735840 459.901154,534.822144 450.133575,524.910889 C420.921997,495.269623 402.146088,459.562714 389.878693,420.032654 C380.711121,390.491394 375.579071,360.200592 371.022034,329.723511 C367.572266,306.651764 359.240570,285.458252 344.542786,267.071228 C332.136230,251.550446 315.365082,243.249496 296.460724,238.938934 C277.059540,234.515060 258.087372,236.593246 239.325577,244.186447 z M405.066071,356.463867 C410.432312,383.842468 418.457458,410.395691 430.494324,435.600952 C445.061768,466.105164 463.614624,493.674988 490.639832,514.752502 C492.789459,516.429016 495.057343,517.953857 496.417114,518.934143 C513.274902,494.606476 529.752014,470.828064 546.346313,446.880646 C544.305969,446.365356 542.040405,445.919800 539.855347,445.221893 C516.372620,437.721619 498.028503,423.066315 483.016296,403.948822 C457.174347,371.040009 444.689209,332.920502 439.677368,291.924713 C438.283508,280.522980 437.043335,269.093719 435.263367,257.750763 C433.873779,248.895523 427.581482,243.368057 419.133240,242.589844 C411.363129,241.874100 404.838959,245.662964 401.942169,253.419128 C400.451782,257.409546 399.397797,266.087616 399.397797,266.087616 C397.282166,296.164215 399.298950,326.010345 405.066071,356.463867 z M526.730957,299.152283 C524.841736,300.771179 522.798889,302.243286 521.088745,304.033264 C511.238831,314.342743 509.870361,330.107635 517.726929,341.649139 C526.089478,353.933990 540.631409,358.646790 554.090332,352.992706 C565.409607,348.237457 572.231384,339.693481 573.135559,327.223969 C574.031616,314.867828 568.991577,305.131012 558.450073,298.728607 C548.244873,292.530487 537.709229,292.676788 526.730957,299.152283 z" />


            </svg>
        </div>
    );
};

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
    Mail: wrapLucide(Mail)
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
        // Reduced grace period to 150ms for a snappier but accessible feel
        hoverTimeoutRef.current = setTimeout(() => {
            if (!isEditingDate && !isDeleteConfirm && !isIconPickerOpen) {
                setEditPopup(null);
            }
        }, 150);
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
                        opacity: config?.design?.stackedOpacity ?? 0.15, // Using global setting from design config
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

                // icon size is baseRowHeight * (sizePercent / 100)
                const sizePercent = config?.milestoneSize || 65;
                let iconSize = rowHeight * (sizePercent / 100);

                // Horizontal zoom scaling (compact icons when days are narrow to avoid overlap)
                if (dayWidth < 10) {
                    iconSize = Math.max(12, iconSize * 0.6);
                } else if (dayWidth < 25) {
                    iconSize = Math.max(16, iconSize * 0.8);
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

                                const completedMilestones = project.custom_fields?.completed_milestones || [];
                                const isCompleted = m.class.startsWith('custom-')
                                    ? (milestones.find(cm => cm.id === m.key)?.status === 'completed')
                                    : completedMilestones.includes(m.key);

                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                const isOverdue = !isCompleted && m.date < today;

                                const isPhaseEndVal = m.class === 'mounting_end' || m.class === 'revision_end';
                                const isStartVal = m.class === 'start';
                                const isSmallMilestone = isPhaseEndVal || isStartVal;

                                // Milestone icon rendering
                                const IconComponent = m.icon ? ICON_OPTIONS[m.icon as keyof typeof ICON_OPTIONS] : null;

                                return (
                                    <div
                                        key={m.key}
                                        className={cn(
                                            "milestone-icon cursor-pointer transition-all flex items-center justify-center shadow-lg",
                                            isSmallMilestone ? 'hover:scale-110' : 'hover:scale-125 hover:z-50',
                                            isCompleted ? "bg-emerald-500 text-white shadow-emerald-500/20" :
                                                isOverdue ? "bg-rose-500 text-white shadow-rose-500/20" :
                                                    "bg-white border-2 border-slate-200 text-slate-800"
                                        )}
                                        style={{
                                            transform: `scale(${isHovered ? 1.5 : 1.05})`,
                                            zIndex: idx,
                                            width: isSmallMilestone ? iconSize : iconSize + 6,
                                            height: isSmallMilestone ? iconSize : iconSize + 6,
                                            borderRadius: isSmallMilestone ? '50%' : '6px',
                                            pointerEvents: 'auto',
                                            transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                        }}
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
                                                    style={{ backgroundColor: isCompleted ? '#fff' : '#000' }}
                                                />
                                            </div>
                                        ) : Icon ? (
                                            <Icon
                                                size={iconSize}
                                                color={(isCompleted || isOverdue) ? "#ffffff" : "#000000"}
                                            />
                                        ) : null}
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

                const IconKey = (m.icon || milestoneConfig?.icon) as keyof typeof ICON_OPTIONS;
                const Icon = ICON_OPTIONS[IconKey] || ICON_OPTIONS['Milestone'];

                const completedMilestones = project.custom_fields?.completed_milestones || [];
                const isCompleted = m.class.startsWith('custom-')
                    ? (milestones.find(cm => cm.id === m.key)?.status === 'completed')
                    : completedMilestones.includes(m.key);

                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const isOverdue = !isCompleted && m.date < today;

                // Calculate vertical position (check bounds)
                const isNearBottom = (window.innerHeight - editPopup.y) < 400;
                // Since we use Portal, coordinates are absolute to viewport, which matches clientRect
                const topPos = isNearBottom ? 'auto' : editPopup.y + 5;
                const bottomPos = isNearBottom ? Math.max(10, (window.innerHeight - editPopup.y) + 30) : 'auto';

                const type = project.project_type || 'civil';
                const SECTOR_COLORS: Record<string, string> = {
                    civil: '#90caf9',
                    military: '#1b5e20',
                    service: '#a855f7',
                    industrial: '#90caf9',
                    business: '#90caf9'
                };
                const sectorLabels: Record<string, string> = {
                    civil: 'Civilní',
                    military: 'Vojenské',
                    service: 'Servis',
                    industrial: 'Průmysl',
                    business: 'Business'
                };
                const sectorColor = SECTOR_COLORS[type] || SECTOR_COLORS.civil;

                return (
                    <div
                        className={cn(
                            "fixed bg-popover text-popover-foreground border border-border shadow-xl rounded-lg p-3 z-[99999] timeline-popup-content flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-200",
                            isNearBottom ? "slide-in-from-bottom-2 origin-bottom" : "slide-in-from-top-2 origin-top"
                        )}
                        style={{
                            left: Math.min(editPopup.x - 100, window.innerWidth - 300),
                            top: topPos,
                            bottom: bottomPos,
                            width: 260,
                            maxWidth: '90vw'
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
                        <div className="flex flex-col gap-2 relative">
                            <button
                                onClick={() => setEditPopup(null)}
                                className="absolute -top-1 -right-1 text-muted-foreground hover:text-foreground p-1 hover:bg-muted rounded-full transition-colors outline-none z-10"
                            >
                                <X size={14} />
                            </button>

                            {/* Row 1: KATEGORIE */}
                            <div className="flex items-center gap-2">
                                <span
                                    className="text-[9px] font-black uppercase px-2 py-0.5 rounded-[4px] text-white shadow-sm"
                                    style={{ backgroundColor: sectorColor }}
                                >
                                    {sectorLabels[type] || type}
                                </span>
                                <span className="text-[9px] font-black text-muted-foreground/50 font-mono">
                                    #{project.id}
                                </span>
                            </div>

                            {/* Row 2: DATUM | IKONA | NAZEV (V jednom řádku) */}
                            <div className="flex items-center gap-2 pt-1 border-b border-border/50 pb-2">
                                <span className="text-[11px] font-black text-black bg-muted/80 px-2 py-0.5 rounded shrink-0">
                                    {new Date(m.date).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' })}
                                </span>
                                <Icon
                                    size={18}
                                    className="shrink-0"
                                    color="#000000"
                                />
                                <span className="font-black text-[11px] uppercase tracking-tighter text-black truncate">
                                    {m.label}
                                </span>
                            </div>
                        </div>

                        {!isDeleteConfirm && !isEditingDate && !isIconPickerOpen && (
                            <div className="flex flex-col gap-2">
                                <div className="flex gap-2">
                                    <button
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-all border border-border group"
                                        onClick={() => setIsEditingDate(true)}
                                        disabled={isUpdating}
                                    >
                                        <Settings size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Upravit</span>
                                    </button>

                                    <button
                                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all border group ${isCompleted
                                            ? 'bg-emerald-500 text-white border-emerald-600'
                                            : 'bg-yellow-400 hover:bg-yellow-500 text-yellow-950 border-yellow-500 shadow-sm'}`}
                                        onClick={() => toggleMilestoneCompletion(m.key)}
                                        disabled={isUpdating}
                                    >
                                        <ShieldCheck size={14} className={isCompleted ? 'text-white' : 'text-yellow-950 group-hover:scale-110 transition-transform'} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{isCompleted ? 'Doručeno' : 'Potvrdit'}</span>
                                    </button>
                                </div>

                                {/* Smazat button - Conditionally shown for non-standard milestones */}
                                {!['chassis', 'body'].includes(m.class) && (
                                    <button
                                        className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-destructive/5 hover:bg-destructive/10 text-destructive/60 hover:text-destructive transition-colors border border-transparent hover:border-destructive/10"
                                        onClick={() => setIsDeleteConfirm(true)}
                                        disabled={isUpdating}
                                    >
                                        <Trash2 size={12} />
                                        <span className="text-[9px] font-bold uppercase">Smazat</span>
                                    </button>
                                )}
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
