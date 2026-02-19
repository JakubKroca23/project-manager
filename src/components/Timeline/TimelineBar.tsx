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
    Mail
} from 'lucide-react';
import { toast } from 'sonner';

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
            {/* Flatbed - LOWERED from y=14 to y=16 */}
            <path d="M9 16h13v2H9z" />
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

const Superstructure = ({ size = 24, fgColor = '#000000', bgColor = '#FFFFFF', ...props }: any) => (
    <svg width={size} height={size} {...props} viewBox="0 0 756 719" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <path fill={bgColor} stroke="none" d="M1.0,719.0 C1.0,480.3 1.0,241.6 1.4,2.5 C3.0,2.2 4.2,2.2 5.4,2.2 C251.9,2.2 498.5,2.2 745.0,2.2 C748.0,2.2 751.0,2.0 754.3,2.1 C754.9,4.7 755.2,7.0 755.2,9.3 C755.3,243.4 755.3,477.4 755.2,711.5 C755.2,714.0 755.0,716.4 754.4,718.9 C752.1,718.9 750.3,719.0 748.5,719.0 C499.3,719.0 250.1,719.0 1.0,719.0 Z" />
        <path fill={fgColor} stroke="none" d="M710.4,682.5 C717.3,682.5 717.3,682.5 717.3,675.9 C717.3,465.4 717.3,254.9 717.3,44.4 C717.3,43.0 717.1,41.6 717.0,39.9 C715.3,39.8 714.0,39.7 712.7,39.7 C656.2,39.7 599.7,39.8 543.2,39.8 C376.4,39.7 209.6,39.7 42.7,39.5 C37.5,39.5 36.5,40.9 36.5,45.9 C36.6,252.1 36.6,458.2 36.5,664.4 C36.5,669.2 36.3,674.1 36.6,678.9 C36.7,680.1 38.7,682.1 40.0,682.3 C44.1,682.7 48.3,682.5 52.5,682.5 C271.4,682.5 490.4,682.5 710.4,682.5 Z" />
    </svg>
);

const Hiab = ({ size = 24, fgColor = '#000000', bgColor = '#FFFFFF', ...props }: any) => (
    <svg width={size} height={size} {...props} viewBox="0 0 756 719" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <path fill={bgColor} stroke="none" d="M1,719 C1.0,480.3 1.0,241.6 1.4,2.5 C3.0,2.2 4.2,2.2 5.4,2.2 C251.9,2.2 498.5,2.2 745.0,2.2 C748.0,2.2 751.0,2.0 754.3,2.1 C754.9,4.7 755.2,7.0 755.2,9.3 C755.3,243.4 755.3,477.4 755.2,711.5 C755.2,714.0 755.0,716.4 754.4,718.9 C752.1,718.9 750.3,719.0 748.5,719.0 C499.3,719.0 250.1,719.0 1.0,719.0 Z M710.4,682.5 C717.3,682.5 717.3,682.5 717.3,675.9 C717.3,465.4 717.3,254.9 717.3,44.4 C717.3,43.0 717.1,41.6 717.0,39.9 C715.3,39.8 714.0,39.7 712.7,39.7 C656.2,39.7 599.7,39.8 543.2,39.8 C376.4,39.7 209.6,39.7 42.7,39.5 C37.5,39.5 36.5,40.9 36.5,45.9 C36.6,252.1 36.6,458.2 36.5,664.4 C36.5,669.2 36.3,674.1 36.6,678.9 C36.7,680.1 38.7,682.1 40.0,682.3 C44.1,682.7 48.3,682.5 52.5,682.5 C271.4,682.5 490.4,682.5 710.4,682.5 Z" />
        <path fill="#FFFFFF" stroke="none" d="M709.98,682.51 C490.48,682.52 271.49,682.53 52.50,682.54 C48.33,682.54 44.13,682.78 40.02,682.33 C38.74,682.19 36.78,680.18 36.68,678.91 C36.30,674.11 36.58,669.26 36.58,664.42 C36.60,458.26 36.63,252.10 36.51,45.94 C36.51,40.97 37.56,39.57 42.79,39.58 C209.62,39.77 376.45,39.78 543.28,39.81 C599.78,39.82 656.27,39.78 712.77,39.78 C714.07,39.78 715.37,39.89 717.04,39.97 C717.16,41.61 717.37,43.05 717.37,44.48 C717.39,254.98 717.39,465.47 717.39,675.96 C717.39,682.51 717.38,682.51 709.98,682.51 Z" />
        <path fill={fgColor} stroke="none" d="M239.3,244.1 C203.6,260.8 181.0,297.1 182.7,334.7 C184.6,376.8 214.6,412.0 255.9,420.1 C290.9,427.0 321.9,419.0 348.0,394.2 C348.6,393.6 349.3,393.2 350.6,392.2 C350.8,394.2 351.1,396.9 C351.1,396.9 351.0,420.3 351.0,443.6 351.1,466.9 C351.1,470.9 349.9,472.8 346.0,474.1 C314.8,484.6 282.7,488.0 250.4,482.3 C176.5,469.0 127.0,426.6 103.4,355.0 C90.3,315.3 90.9,275.0 104.5,235.7 C124.0,178.6 162.3,139.2 219.6,118.9 C265.0,102.9 309.6,106.3 353.8,123.6 C379.7,133.7 403.2,147.7 425.1,164.9 C442.5,178.6 460.2,192.1 479.3,203.1 C515.0,223.8 554.1,231.5 595.2,226.5 C615.1,224.1 633.7,217.5 650.9,207.0 C652.6,206.0 654.3,205.0 656.0,204.0 C656.3,203.9 656.6,204.0 657.4,204.0 C657.4,343.7 657.4,483.4 657.4,623.4 C592.4,623.4 527.3,623.4 461.7,623.4 C465.1,598.7 472.5,575.5 481.3,553.4 C470.6,543.7 459.9,534.8 450.1,524.9 C420.9,495.2 402.1,459.5 389.8,420.0 C380.7,390.4 375.5,360.2 371.0,329.7 C367.5,306.6 359.2,285.4 344.5,267.0 C332.1,251.5 315.3,243.2 296.4,238.9 C277.0,234.5 258.0,236.5 239.3,244.1 Z" />
    </svg>
);

const wrapLucide = (Icon: any) => ({ size = 24, fgColor = '#000000', bgColor = 'transparent', ...props }: any) => (
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
                        opacity: 0.15, // Reduced for better distinguishability of stacked orders (1, 2, 4-5)
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

                                // Color Logic: Uses global state colors from config
                                const completedMilestones = project.custom_fields?.completed_milestones || [];
                                const isCompleted = m.class.startsWith('custom-')
                                    ? (milestones.find(cm => cm.id === m.key)?.status === 'completed')
                                    : completedMilestones.includes(m.key);

                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                const isOverdue = !isCompleted && m.date < today;

                                // Status color for icon background
                                const statusColor = isCompleted ? (config?.colors?.stateCompleted?.color || '#22c55e')
                                    : isOverdue ? (config?.colors?.stateOverdue?.color || '#ef4444')
                                        : (config?.colors?.statePending?.color || '#374151');

                                // Category color for label and line
                                let milestoneColor = milestoneConfig?.color || statusColor;

                                const isPhaseEndVal = m.class === 'mounting_end' || m.class === 'revision_end';
                                const isStartVal = m.class === 'start';
                                const isSmallMilestone = isPhaseEndVal || isStartVal;

                                // Global icon settings
                                const globalIconColor = config?.design?.iconColor || '#000000';
                                const globalIconOpacity = config?.design?.iconOpacity ?? 1;

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
                                            justifyContent: 'center',
                                            opacity: globalIconOpacity
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
                                                fgColor={globalIconColor}
                                                bgColor={statusColor}
                                                // color={milestoneColor} // Removed to avoid overriding fgColor in some icons if specific props used
                                                // fill={IconKey === 'Play' ? milestoneColor : 'none'} // Play icon fill
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

                // Status color for icon background
                const statusColor = isCompleted ? (config?.colors?.stateCompleted?.color || '#22c55e')
                    : isOverdue ? (config?.colors?.stateOverdue?.color || '#ef4444')
                        : (config?.colors?.statePending?.color || '#374151');

                // Category color for label
                let milestoneColor = milestoneConfig?.color || statusColor;

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
                                    <Icon
                                        size={16}
                                        fgColor="#000000"
                                        bgColor={statusColor}
                                        color={milestoneColor}
                                        className="shrink-0"
                                    />
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
