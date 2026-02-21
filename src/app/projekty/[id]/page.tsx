'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Project, Milestone } from '@/types/project';
import { cn } from '@/lib/utils';
import {
    Loader2,
    CalendarDays,
    Truck,
    ClipboardList,
    AlertCircle,
    ArrowLeft,
    Info,
    LayoutGrid,
    StickyNote
} from 'lucide-react';

import { usePermissions } from '@/hooks/usePermissions';
import { ProjectDetailHeader } from '@/components/ProjectDetail/ProjectDetailHeader';
import { ProjectDetailStats } from '@/components/ProjectDetail/ProjectDetailStats';
import { ProjectDetailOrdering } from '@/components/ProjectDetail/ProjectDetailOrdering';
import { ProjectMiniTimeline } from '@/components/ProjectDetail/ProjectMiniTimeline';

export default function ProjectDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editedProject, setEditedProject] = useState<Project | null>(null);
    const [saving, setSaving] = useState(false);
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [loadingMilestones, setLoadingMilestones] = useState(true);
    const { canEdit } = usePermissions();

    useEffect(() => {
        async function fetchProject() {
            setLoading(true);
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error('Error fetching project:', error);
            } else {
                setProject(data);
                setEditedProject(data);
            }
            setLoading(false);
        }

        async function fetchMilestones() {
            setLoadingMilestones(true);
            const { data, error } = await supabase
                .from('project_milestones')
                .select('*')
                .eq('project_id', id)
                .order('date', { ascending: true });

            if (error) {
                console.error('Error fetching milestones:', error);
            } else {
                setMilestones(data || []);
            }
            setLoadingMilestones(false);
        }

        if (id) {
            fetchProject();
            fetchMilestones();
        }
    }, [id]);

    const handleSave = async () => {
        if (!editedProject) return;
        setSaving(true);
        try {
            const updates = {
                ...editedProject,
                updated_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from('projects')
                .update(updates)
                .eq('id', project?.id);

            if (error) throw error;
            setProject(updates);
            setIsEditing(false);
        } catch (err) {
            console.error('Error saving project:', err);
            alert('Chyba při ukládání změn.');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteProject = async () => {
        if (!confirm('Opravdu smazat tuto zakázku?')) return;
        const { error } = await supabase.from('projects').delete().eq('id', id);
        if (!error) router.push('/projekty');
    };

    const handleChange = (field: keyof Project, value: any) => {
        if (!editedProject) return;
        setEditedProject({ ...editedProject, [field]: value });
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center bg-zinc-950">
                <Loader2 size={28} className="animate-spin text-primary" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-4 bg-zinc-950">
                <AlertCircle size={40} className="text-rose-500" />
                <h2 className="text-lg font-black uppercase tracking-widest text-zinc-100">Zakázka nenalezena</h2>
                <button onClick={() => router.push('/projekty')} className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-zinc-800 transition-all">
                    <ArrowLeft size={14} /> Zpět na seznam
                </button>
            </div>
        );
    }

    const typeColor = project.project_type === 'military' ? '#059669' : project.project_type === 'service' ? '#9333ea' : '#3b82f6';
    const p = isEditing ? editedProject! : project;

    const DateField = ({ label, value, field }: any) => (
        <div className="space-y-1.5 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
            <label className="text-[9px] font-black uppercase tracking-[0.1em] text-zinc-500">{label}</label>
            {isEditing ? (
                <input
                    type="date"
                    value={value || ''}
                    onChange={(e) => handleChange(field, e.target.value)}
                    className="w-full text-xs font-bold bg-zinc-900 border border-zinc-700 rounded px-2 py-1 outline-none text-zinc-100"
                />
            ) : (
                <div className="text-[11px] font-black text-zinc-100">{value ? new Date(value).toLocaleDateString('cs-CZ') : '—'}</div>
            )}
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden">
            <ProjectDetailHeader
                project={p}
                typeColor={typeColor}
                isEditing={isEditing}
                saving={saving}
                onEdit={() => setIsEditing(true)}
                onCancel={() => { setIsEditing(false); setEditedProject(project); }}
                onSave={handleSave}
                onDelete={handleDeleteProject}
            />

            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row w-full max-w-[1700px] mx-auto">

                {/* ── LEVÁ STRANA (Timeline a Detaily) ── */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 scroll-smooth custom-scrollbar">

                    {/* MINI TIMELINE - TEĎ UPLNĚ NAHOŘE */}
                    <ProjectMiniTimeline project={p} />

                    {/* HLAVNÍ INFO MODUL */}
                    <section className="bg-zinc-900/40 border border-zinc-800 shadow-2xl rounded-[2rem] overflow-hidden">
                        <div className="p-8 border-b border-zinc-800 bg-gradient-to-br from-zinc-900/80 to-zinc-950/80">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                                <div className="space-y-4">
                                    <h1 className="text-3xl font-black tracking-tighter text-white">
                                        {isEditing ? (
                                            <input
                                                value={p.name}
                                                onChange={(e) => handleChange('name', e.target.value)}
                                                className="bg-zinc-800 border-b-2 border-primary outline-none w-full px-2 py-1 rounded-t"
                                            />
                                        ) : project.name}
                                    </h1>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full border border-zinc-700 shadow-sm">
                                            {p.id}
                                        </span>
                                        <span className={cn(
                                            "text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border shadow-sm",
                                            p.project_type === 'military'
                                                ? 'bg-emerald-900/20 text-emerald-500 border-emerald-500/30'
                                                : p.project_type === 'service'
                                                    ? 'bg-purple-900/20 text-purple-500 border-purple-500/30'
                                                    : 'bg-blue-900/20 text-blue-500 border-blue-500/30'
                                        )}>
                                            {p.project_type === 'military' ? 'Vojenské' : p.project_type === 'service' ? 'Servis' : 'Civilní'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <ProjectDetailStats project={p} isEditing={isEditing} onChange={handleChange} />
                        </div>
                    </section>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {/* HARMONOGRAM (Detailed) */}
                        <section className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 space-y-6 shadow-xl">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2 text-zinc-400">
                                <CalendarDays size={14} className="text-primary" /> Harmonogram Realizace
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                <DateField label="Příjem do výroby" value={p.deadline} field="deadline" />
                                <DateField label="Dodání podvozku" value={p.chassis_delivery} field="chassis_delivery" />
                                <DateField label="Dodání nástavby" value={p.body_delivery} field="body_delivery" />
                                <DateField label="Předání zákazníkovi" value={p.customer_handover} field="customer_handover" />
                                <DateField label="Uzavření / Archiv" value={p.closed_at} field="closed_at" />
                            </div>
                        </section>

                        {/* SPECIFIKACE */}
                        <section className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 space-y-6 shadow-xl">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2 text-zinc-400">
                                <ClipboardList size={14} className="text-primary" /> Technická Specifikace
                            </h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2 opacity-60">
                                        <div className="w-1 h-1 bg-primary rounded-full" /> Typ nástavby
                                    </label>
                                    <input
                                        readOnly={!isEditing}
                                        value={p.body_type || ''}
                                        onChange={(e) => handleChange('body_type', e.target.value)}
                                        className="w-full text-sm font-black bg-zinc-900/80 border border-zinc-800 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-zinc-100"
                                        placeholder="Např. CTS 20-66"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2 opacity-60">
                                        <div className="w-1 h-1 bg-primary rounded-full" /> Výrobní číslo (S/N)
                                    </label>
                                    <input
                                        readOnly={!isEditing}
                                        value={p.serial_number || ''}
                                        onChange={(e) => handleChange('serial_number', e.target.value)}
                                        className="w-full text-sm font-black bg-zinc-900/80 border border-zinc-800 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-zinc-100"
                                        placeholder="S/N"
                                    />
                                </div>
                            </div>
                        </section>
                    </div>

                    <section className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-xl">
                        <label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
                            <StickyNote size={14} className="text-zinc-500" /> Interní Poznámka
                        </label>
                        <textarea
                            readOnly={!isEditing}
                            value={p.note || ''}
                            onChange={(e) => handleChange('note', e.target.value)}
                            className="w-full text-sm font-medium bg-zinc-900/80 border border-zinc-800 rounded-2xl px-4 py-4 outline-none min-h-[160px] focus:ring-2 focus:ring-primary/20 transition-all resize-none text-zinc-300 leading-relaxed shadow-inner"
                            placeholder="Zde můžete uvést doplňující informace k projektu..."
                        />
                    </section>
                </div>

                {/* ── PRAVÁ STRANA (Objednávky) ── */}
                <div className="lg:w-[420px] xl:w-[480px] px-6 py-6 lg:border-l border-zinc-800 bg-zinc-950/50 backdrop-blur-sm">
                    <ProjectDetailOrdering projectId={project.id} isEditing={isEditing} />
                </div>

            </div>
        </div>
    );
}
