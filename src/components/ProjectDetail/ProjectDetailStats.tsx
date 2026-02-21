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
        <div className="flex flex-col gap-1 px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 shadow-lg group hover:border-zinc-700 transition-all">
            <div className="flex items-center justify-between">
                <label className="text-[9px] font-black uppercase tracking-[0.1em] text-zinc-500 flex items-center gap-1.5">
                    <span className="text-primary/70">{icon}</span>
                    {label}
                </label>
                {isEditing && isEditable && <Tag size={8} className="text-primary/40" />}
            </div>
            <div className="min-h-[1.5rem] flex items-center">
                {isEditing && isEditable ? (
                    options ? (
                        <select
                            value={value || ''}
                            onChange={(e) => onChange(field, e.target.value)}
                            className="w-full text-xs font-bold bg-zinc-800 border-zinc-700 text-zinc-100 rounded px-2 py-0.5 outline-none focus:ring-1 focus:ring-primary/50"
                        >
                            {options.map((opt: any) => (
                                <option key={opt.value} value={opt.value} className="bg-zinc-900">{opt.label}</option>
                            ))}
                        </select>
                    ) : (
                        <input
                            type="text"
                            value={value || ''}
                            onChange={(e) => onChange(field, e.target.value)}
                            className="w-full text-xs font-bold bg-zinc-800 border-zinc-700 text-zinc-100 rounded px-2 py-0.5 outline-none focus:ring-1 focus:ring-primary/50"
                        />
                    )
                ) : (
                    children || <span className="text-[12px] font-black text-zinc-100 truncate tracking-tight">{value || '—'}</span>
                )}
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <StatBox label="Zákazník" icon={<Building2 size={11} />} value={p.customer} field="customer" isEditable />
            <StatBox label="Vedoucí projektu" icon={<User size={11} />} value={p.manager} field="manager" isEditable />
            <StatBox label="Abra Project" icon={<Hash size={11} />} value={p.abra_project} field="abra_project" isEditable />
            <StatBox label="Kategorie" icon={<LayoutGrid size={11} />} field="category" isEditable>
                <CategoryChip value={p.category} className="text-[9px] px-2.5 py-1 font-black bg-zinc-800 border-zinc-700 text-zinc-300" />
            </StatBox>

            <StatBox
                label="Priorita"
                icon={<AlertTriangle size={11} />}
                field="priority"
                isEditable
                options={[
                    { label: 'Urgentní', value: 1 },
                    { label: 'Normální', value: 2 },
                    { label: 'Nízká', value: 3 }
                ]}
            >
                <div className={cn(
                    "flex items-center gap-2 px-2 py-0.5 rounded-md border",
                    p.priority === 1 ? "bg-rose-500/10 border-rose-500/30 text-rose-500" :
                        p.priority === 3 ? "bg-zinc-800 border-zinc-700 text-zinc-400" :
                            "bg-blue-500/10 border-blue-500/30 text-blue-500"
                )}>
                    <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        p.priority === 1 ? "bg-rose-500" : p.priority === 3 ? "bg-zinc-500" : "bg-blue-500"
                    )} />
                    <span className="text-[10px] font-black uppercase tracking-wider">
                        {p.priority === 1 ? 'Urgentní' : p.priority === 3 ? 'Nízká' : 'Normální'}
                    </span>
                </div>
            </StatBox>

            <StatBox label="Typ" icon={<Shield size={11} />} field="project_type" isEditable options={[
                { label: 'Civil', value: 'civil' },
                { label: 'Vojenské', value: 'military' },
                { label: 'Servis', value: 'service' }
            ]}>
                <span className={cn(
                    "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border",
                    p.project_type === 'military'
                        ? 'bg-emerald-600/20 text-emerald-500 border-emerald-500/30'
                        : p.project_type === 'service'
                            ? 'bg-purple-600/20 text-purple-500 border-purple-500/30'
                            : 'bg-blue-600/20 text-blue-500 border-blue-500/30'
                )}>
                    {p.project_type === 'military' ? 'Vojenské' : p.project_type === 'service' ? 'Servis' : 'Civil'}
                </span>
            </StatBox>

            <StatBox label="Status" icon={<Info size={11} />} field="status" isEditable>
                <span className="text-[10px] font-black uppercase text-zinc-400 bg-zinc-800/50 px-2 py-0.5 rounded border border-zinc-700/50">
                    {p.status || 'Aktivní'}
                </span>
            </StatBox>

            <StatBox label="ID Zakázky" icon={<Fingerprint size={11} />} value={p.id} />
        </div>
    );
}
