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
    StickyNote,
    Hash
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
            <div className="flex h-full items-center justify-center bg-white">
                <Loader2 size={32} className="animate-spin text-primary" strokeWidth={3} />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-6 bg-white">
                <AlertCircle size={64} className="text-rose-500" strokeWidth={3} />
                <h2 className="text-2xl font-black uppercase tracking-widest text-slate-950">Zakázka nenalezena</h2>
                <button onClick={() => router.push('/projekty')} className="px-8 py-3 bg-white border-4 border-slate-950 rounded-xl text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[8px_8px_0px_black] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all shadow-[4px_4px_0px_black]">
                    <ArrowLeft size={20} strokeWidth={3} /> Zpět na seznam
                </button>
            </div>
        );
    }

    const typeColor = project.project_type === 'military' ? '#059669' : project.project_type === 'service' ? '#9333ea' : '#3b82f6';
    const p = isEditing ? editedProject! : project;

    const DateField = ({ label, value, field }: any) => (
        <div className="space-y-2 p-5 rounded-2xl bg-slate-50 border-2 border-slate-950 shadow-[4px_4px_0px_black]">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</label>
            {isEditing ? (
                <input
                    type="date"
                    value={value || ''}
                    onChange={(e) => handleChange(field, e.target.value)}
                    className="w-full text-xs font-black bg-white border-2 border-slate-950 rounded-lg px-3 py-2 outline-none text-slate-950 focus:ring-4 focus:ring-primary/10"
                />
            ) : (
                <div className="text-[14px] font-black text-slate-950">{value ? new Date(value).toLocaleDateString('cs-CZ') : '—'}</div>
            )}
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-slate-50 text-slate-950 overflow-hidden font-sans">
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

            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row w-full max-w-[1800px] mx-auto bg-white border-x-4 border-slate-950 shadow-2xl">

                {/* ── LEVÁ STRANA (Timeline a Detaily) ── */}
                <div className="flex-1 overflow-y-auto px-8 py-8 space-y-12 scroll-smooth custom-scrollbar">

                    {/* MINI TIMELINE - HORNÍ SEKCE */}
                    <ProjectMiniTimeline project={p} />

                    {/* HLAVNÍ INFO MODUL */}
                    <section className="bg-white border-4 border-slate-950 shadow-[12px_12px_0px_black] rounded-[3rem] overflow-hidden">
                        <div className="p-10 border-b-4 border-slate-950 bg-slate-50/50">
                            <div className="flex flex-col gap-6 mb-10">
                                <div className="space-y-4">
                                    <h1 className="text-5xl font-black tracking-tighter text-slate-950 leading-tight">
                                        {isEditing ? (
                                            <input
                                                value={p.name}
                                                onChange={(e) => handleChange('name', e.target.value)}
                                                className="bg-white border-4 border-slate-950 outline-none w-full px-6 py-4 rounded-2xl shadow-[8px_8px_0px_black]"
                                            />
                                        ) : project.name}
                                    </h1>
                                    <div className="flex flex-wrap gap-4">
                                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] bg-white text-slate-950 px-5 py-2 rounded-xl border-4 border-slate-950 shadow-[4px_4px_0px_black]">
                                            <Hash size={16} strokeWidth={4} /> {p.id}
                                        </div>
                                        <div className={cn(
                                            "text-xs font-black uppercase tracking-[0.2em] px-5 py-2 rounded-xl border-4 border-slate-950 shadow-[4px_4px_0px_black]",
                                            p.project_type === 'military' ? 'bg-emerald-400' : p.project_type === 'service' ? 'bg-purple-400' : 'bg-blue-400'
                                        )}>
                                            {p.project_type === 'military' ? 'Vojenské' : p.project_type === 'service' ? 'Servis' : 'Civilní'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <ProjectDetailStats project={p} isEditing={isEditing} onChange={handleChange} />
                        </div>
                    </section>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                        {/* HARMONOGRAM */}
                        <section className="space-y-8">
                            <h3 className="text-[14px] font-black uppercase tracking-[0.3em] flex items-center gap-3 text-slate-950 pl-2">
                                <CalendarDays size={20} className="text-primary" strokeWidth={3} /> Harmonogram realizace
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <DateField label="Příjem do výroby" value={p.deadline} field="deadline" />
                                <DateField label="Dodání podvozku" value={p.chassis_delivery} field="chassis_delivery" />
                                <DateField label="Dodání nástavby" value={p.body_delivery} field="body_delivery" />
                                <DateField label="Předání zákazníkovi" value={p.customer_handover} field="customer_handover" />
                                <DateField label="Uzavření / Archiv" value={p.closed_at} field="closed_at" />
                            </div>
                        </section>

                        {/* SPECIFIKACE */}
                        <section className="space-y-8">
                            <h3 className="text-[14px] font-black uppercase tracking-[0.3em] flex items-center gap-3 text-slate-950 pl-2">
                                <ClipboardList size={20} className="text-primary" strokeWidth={3} /> Technická specifikace
                            </h3>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="p-6 rounded-2xl bg-white border-2 border-slate-950 shadow-[4px_4px_0px_black] space-y-3">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Typ nástavby</label>
                                    <input
                                        readOnly={!isEditing}
                                        value={p.body_type || ''}
                                        onChange={(e) => handleChange('body_type', e.target.value)}
                                        className="w-full text-base font-black bg-slate-50 border-2 border-slate-950 rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-primary/10 transition-all text-slate-950"
                                        placeholder="Např. CTS 20-66"
                                    />
                                </div>
                                <div className="p-6 rounded-2xl bg-white border-2 border-slate-950 shadow-[4px_4px_0px_black] space-y-3">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Výrobní číslo (S/N)</label>
                                    <input
                                        readOnly={!isEditing}
                                        value={p.serial_number || ''}
                                        onChange={(e) => handleChange('serial_number', e.target.value)}
                                        className="w-full text-base font-black bg-slate-50 border-2 border-slate-950 rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-primary/10 transition-all text-slate-950"
                                        placeholder="S/N"
                                    />
                                </div>
                            </div>
                        </section>
                    </div>

                    <section className="p-10 rounded-[2.5rem] bg-amber-50 border-4 border-slate-950 shadow-[8px_8px_0px_black] space-y-6">
                        <label className="text-[14px] font-black uppercase tracking-[0.3em] text-slate-950 flex items-center gap-3">
                            <StickyNote size={20} className="text-slate-950" strokeWidth={3} /> Interní poznámka
                        </label>
                        <textarea
                            readOnly={!isEditing}
                            value={p.note || ''}
                            onChange={(e) => handleChange('note', e.target.value)}
                            className="w-full text-lg font-bold bg-white border-4 border-slate-950 rounded-3xl px-8 py-8 outline-none min-h-[200px] focus:ring-8 focus:ring-primary/5 transition-all resize-none text-slate-800 leading-relaxed shadow-inner"
                            placeholder="Zde uveďte doplňující informace..."
                        />
                    </section>
                </div>

                {/* ── PRAVÁ STRANA (Objednávky) ── */}
                <div className="lg:w-[450px] xl:w-[500px] px-8 py-8 lg:border-l-4 border-slate-950 bg-slate-50">
                    <ProjectDetailOrdering projectId={project.id} isEditing={isEditing} />
                </div>

            </div>
        </div>
    );
}
