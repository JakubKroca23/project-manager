'use client';

import React from 'react';
import { Project } from '@/types/project';
import {
    Building2,
    User,
    Hash,
    Shield,
    AlertTriangle,
    Info,
    LayoutGrid
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CategoryChip } from '@/components/CategoryChip';

interface ProjectDetailStatsProps {
    project: Project;
    isEditing: boolean;
    onChange: (field: keyof Project, value: any) => void;
}

export function ProjectDetailStats({ project, isEditing, onChange }: ProjectDetailStatsProps) {
    const p = project;

    const StatBox = ({ label, icon, value, isEditable, field, options, children }: any) => (
        <div className="flex flex-col gap-1 p-2 rounded-lg bg-background/50 border border-border/50 group hover:border-primary/20 transition-all">
            <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1">
                {icon}
                {label}
            </label>
            <div className="min-h-[1.5rem] flex items-center">
                {isEditing && isEditable ? (
                    options ? (
                        <select
                            value={value || ''}
                            onChange={(e) => onChange(field, e.target.value)}
                            className="w-full text-xs font-bold bg-background border border-border rounded px-1 py-0.5 outline-none"
                        >
                            {options.map((opt: any) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    ) : (
                        <input
                            type="text"
                            value={value || ''}
                            onChange={(e) => onChange(field, e.target.value)}
                            className="w-full text-xs font-bold bg-background border border-border rounded px-1 py-0.5 outline-none"
                        />
                    )
                ) : (
                    children || <span className="text-[11px] font-bold text-foreground truncate">{value || '—'}</span>
                )}
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            <StatBox label="Abra Project" icon={<Hash size={10} />} value={p.abra_project} field="abra_project" isEditable />
            <StatBox label="Zákazník" icon={<Building2 size={10} />} value={p.customer} field="customer" isEditable />
            <StatBox label="Vedoucí projektu" icon={<User size={10} />} value={p.manager} field="manager" isEditable />
            <StatBox label="Kategorie" icon={<LayoutGrid size={10} />} field="category" isEditable>
                <CategoryChip value={p.category} className="text-[9px] px-2 py-0.5" />
            </StatBox>

            <StatBox
                label="Priorita"
                icon={<AlertTriangle size={10} />}
                field="priority"
                isEditable
                options={[
                    { label: 'Urgentní', value: 1 },
                    { label: 'Normální', value: 2 },
                    { label: 'Nízká', value: 3 }
                ]}
            >
                <div className="flex items-center gap-1.5">
                    <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        p.priority === 1 ? "bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.4)]" : p.priority === 3 ? "bg-slate-400" : "bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.4)]"
                    )} />
                    <span className="text-[10px] font-bold">
                        {p.priority === 1 ? 'Urgentní' : p.priority === 3 ? 'Nízká' : 'Normální'}
                    </span>
                </div>
            </StatBox>

            <StatBox label="Status" icon={<Info size={10} />} value={p.status} field="status" />
            <StatBox label="Typ" icon={<Shield size={10} />} field="project_type" isEditable options={[
                { label: 'Civil', value: 'civil' },
                { label: 'Vojenské', value: 'military' },
                { label: 'Servis', value: 'service' }
            ]}>
                <span className={cn(
                    "px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border",
                    p.project_type === 'military'
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                        : 'bg-slate-500/10 text-slate-600 border-slate-500/20'
                )}>
                    {p.project_type === 'military' ? 'Vojenské' : p.project_type === 'service' ? 'Servis' : 'Civil'}
                </span>
            </StatBox>
            <StatBox label="ID Zakázky" icon={<Hash size={10} />} value={p.id} />
        </div>
    );
}
