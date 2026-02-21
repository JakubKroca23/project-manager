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
        <div className="flex flex-col gap-1.5 px-5 py-4 rounded-2xl bg-white border-2 border-slate-950 shadow-[4px_4px_0px_rgba(0,0,0,1)] group hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all">
            <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500 flex items-center gap-2">
                    <span className="text-slate-950">{icon}</span>
                    {label}
                </label>
            </div>
            <div className="min-h-[1.5rem] flex items-center">
                {isEditing && isEditable ? (
                    options ? (
                        <select
                            value={value || ''}
                            onChange={(e) => onChange(field, e.target.value)}
                            className="w-full text-xs font-black bg-slate-50 border-2 border-slate-950 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-primary/20"
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
                            className="w-full text-xs font-black bg-slate-50 border-2 border-slate-950 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    )
                ) : (
                    children || <span className="text-[13px] font-black text-slate-950 truncate tracking-tight">{value || '—'}</span>
                )}
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <StatBox label="Zákazník" icon={<Building2 size={12} strokeWidth={3} />} value={p.customer} field="customer" isEditable />
            <StatBox label="Vedoucí projektu" icon={<User size={12} strokeWidth={3} />} value={p.manager} field="manager" isEditable />
            <StatBox label="Abra Project" icon={<Hash size={12} strokeWidth={3} />} value={p.abra_project} field="abra_project" isEditable />
            <StatBox label="Kategorie" icon={<LayoutGrid size={12} strokeWidth={3} />} field="category" isEditable>
                <CategoryChip value={p.category} className="text-[10px] px-3 py-1 font-black bg-slate-100 border-2 border-slate-950 text-slate-950 rounded-lg" />
            </StatBox>

            <StatBox
                label="Priorita"
                icon={<AlertTriangle size={12} strokeWidth={3} />}
                field="priority"
                isEditable
                options={[
                    { label: 'Urgentní', value: 1 },
                    { label: 'Normální', value: 2 },
                    { label: 'Nízká', value: 3 }
                ]}
            >
                <div className={cn(
                    "flex items-center gap-2 px-3 py-1 rounded-lg border-2 border-slate-950 font-black text-[10px] uppercase tracking-wider",
                    p.priority === 1 ? "bg-rose-100 text-rose-600 shadow-[2px_2px_0px_#e11d48]" :
                        p.priority === 3 ? "bg-slate-100 text-slate-600 shadow-[2px_2px_0px_#475569]" :
                            "bg-blue-100 text-blue-600 shadow-[2px_2px_0px_#2563eb]"
                )}>
                    <div className={cn(
                        "w-2 h-2 rounded-full",
                        p.priority === 1 ? "bg-rose-600" : p.priority === 3 ? "bg-slate-600" : "bg-blue-600"
                    )} />
                    {p.priority === 1 ? 'Urgentní' : p.priority === 3 ? 'Nízká' : 'Normální'}
                </div>
            </StatBox>

            <StatBox label="Typ" icon={<Shield size={12} strokeWidth={3} />} field="project_type" isEditable options={[
                { label: 'Civil', value: 'civil' },
                { label: 'Vojenské', value: 'military' },
                { label: 'Servis', value: 'service' }
            ]}>
                <span className={cn(
                    "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border-2 border-slate-950 shadow-[2px_2px_0px_black]",
                    p.project_type === 'military'
                        ? 'bg-emerald-100 text-emerald-700'
                        : p.project_type === 'service'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                )}>
                    {p.project_type === 'military' ? 'Vojenské' : p.project_type === 'service' ? 'Servis' : 'Civil'}
                </span>
            </StatBox>

            <StatBox label="Status" icon={<Info size={12} strokeWidth={3} />} field="status" isEditable>
                <span className="text-[10px] font-black uppercase text-slate-950 bg-slate-100 px-3 py-1 rounded-lg border-2 border-slate-950 shadow-[2px_2px_0px_black]">
                    {p.status || 'Aktivní'}
                </span>
            </StatBox>

            <StatBox label="ID Zakázky" icon={<Fingerprint size={12} strokeWidth={3} />} value={p.id} />
        </div>
    );
}
