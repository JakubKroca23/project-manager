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
    LayoutGrid,
    Tag,
    Fingerprint
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
        <div className="flex flex-col gap-1.5 px-5 py-4 rounded-2xl bg-white/60 backdrop-blur-md border border-white/60 shadow-sm group hover:border-primary/30 transition-all">
            <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <span className="text-primary/60">{icon}</span>
                    {label}
                </label>
            </div>
            <div className="min-h-[1.5rem] flex items-center">
                {isEditing && isEditable ? (
                    options ? (
                        <select
                            value={value || ''}
                            onChange={(e) => onChange(field, e.target.value)}
                            className="w-full text-xs font-bold bg-white/80 border border-slate-200 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-primary/20"
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
                            className="w-full text-xs font-bold bg-white/80 border border-slate-200 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    )
                ) : (
                    children || <span className="text-[13px] font-bold text-slate-900 truncate tracking-tight">{value || '—'}</span>
                )}
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <StatBox label="Zákazník" icon={<Building2 size={13} />} value={p.customer} field="customer" isEditable />
            <StatBox label="Vedoucí projektu" icon={<User size={13} />} value={p.manager} field="manager" isEditable />
            <StatBox label="Abra Project" icon={<Hash size={13} />} value={p.abra_project} field="abra_project" isEditable />
            <StatBox label="Kategorie" icon={<LayoutGrid size={13} />} field="category" isEditable>
                <CategoryChip value={p.category} className="text-[10px] px-3 py-1 font-bold bg-primary/5 border border-primary/20 text-primary rounded-lg" />
            </StatBox>

            <StatBox
                label="Priorita"
                icon={<AlertTriangle size={13} />}
                field="priority"
                isEditable
                options={[
                    { label: 'Urgentní', value: 1 },
                    { label: 'Normální', value: 2 },
                    { label: 'Nízká', value: 3 }
                ]}
            >
                <div className={cn(
                    "flex items-center gap-2 px-3 py-1 rounded-lg border text-[11px] font-bold uppercase tracking-wide",
                    p.priority === 1 ? "bg-rose-50 border-rose-200 text-rose-600" :
                        p.priority === 3 ? "bg-slate-50 border-slate-200 text-slate-600" :
                            "bg-blue-50 border-blue-200 text-blue-600"
                )}>
                    <div className={cn(
                        "w-2 h-2 rounded-full",
                        p.priority === 1 ? "bg-rose-500 animate-pulse" : p.priority === 3 ? "bg-slate-500" : "bg-blue-500"
                    )} />
                    {p.priority === 1 ? 'Urgentní' : p.priority === 3 ? 'Nízká' : 'Normální'}
                </div>
            </StatBox>

            <StatBox label="Typ" icon={<Shield size={13} />} field="project_type" isEditable options={[
                { label: 'Civil', value: 'civil' },
                { label: 'Vojenské', value: 'military' },
                { label: 'Servis', value: 'service' }
            ]}>
                <span className={cn(
                    "px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border shadow-sm",
                    p.project_type === 'military'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : p.project_type === 'service'
                            ? 'bg-purple-50 border-purple-200 text-purple-700'
                            : 'bg-blue-50 border-blue-200 text-blue-700'
                )}>
                    {p.project_type === 'military' ? 'Vojenské' : p.project_type === 'service' ? 'Servis' : 'Civil'}
                </span>
            </StatBox>

            <StatBox label="Status" icon={<Info size={13} />} field="status" isEditable>
                <span className="text-[11px] font-bold uppercase text-slate-700 bg-white border border-slate-200 px-3 py-1 rounded-lg shadow-sm">
                    {p.status || 'Aktivní'}
                </span>
            </StatBox>

            <StatBox label="ID Zakázky" icon={<Fingerprint size={13} />} value={p.id} />
        </div>
    );
}
