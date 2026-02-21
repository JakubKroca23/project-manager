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
            <div className="flex h-full items-center justify-center bg-slate-50">
                <Loader2 size={32} className="animate-spin text-primary opacity-50" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-6 bg-slate-50">
                <AlertCircle size={64} className="text-rose-400 opacity-50" />
                <h2 className="text-2xl font-bold uppercase tracking-widest text-slate-800">Nenalezeno</h2>
                <button onClick={() => router.push('/projekty')} className="px-8 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center gap-3 hover:bg-slate-50 transition-all shadow-sm">
                    <ArrowLeft size={20} /> Zpět
                </button>
            </div>
        );
    }

    const typeColor = project.project_type === 'military' ? '#059669' : project.project_type === 'service' ? '#9333ea' : '#3b82f6';
    const p = isEditing ? editedProject! : project;

    const DateField = ({ label, value, field }: any) => (
        <div className="space-y-1.5 p-5 rounded-2xl bg-white/60 border border-white/60 shadow-sm flex-1 min-w-[140px]">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</label>
            {isEditing ? (
                <input
                    type="date"
                    value={value || ''}
                    onChange={(e) => handleChange(field, e.target.value)}
                    className="w-full text-xs font-bold bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none text-slate-900 focus:ring-4 focus:ring-primary/10"
                />
            ) : (
                <div className="text-[14px] font-bold text-slate-900">{value ? new Date(value).toLocaleDateString('cs-CZ') : '—'}</div>
            )}
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-slate-50 text-slate-900 overflow-hidden font-sans">
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
                <div className="flex-1 overflow-y-auto px-8 py-8 space-y-10 scroll-smooth custom-scrollbar">

                    {/* MINI TIMELINE - GLASS SECTION */}
                    <ProjectMiniTimeline project={p} />

                    {/* HLAVNÍ INFO MODUL */}
                    <section className="bg-white/80 backdrop-blur-2xl border border-white/60 shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden">
                        <div className="p-10 border-b border-white/20 bg-gradient-to-br from-white/90 to-white/40">
                            <div className="flex flex-col gap-6 mb-10">
                                <div className="space-y-3">
                                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 leading-tight">
                                        {isEditing ? (
                                            <input
                                                value={p.name}
                                                onChange={(e) => handleChange('name', e.target.value)}
                                                className="bg-white/80 border border-slate-200 outline-none w-full px-5 py-3 rounded-2xl shadow-inner"
                                            />
                                        ) : project.name}
                                    </h1>
                                    <div className="flex flex-wrap gap-3">
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full border border-slate-200 shadow-sm">
                                            <Hash size={12} className="opacity-50" /> {p.id}
                                        </div>
                                        <div className={cn(
                                            "text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border shadow-sm",
                                            p.project_type === 'military' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                                                p.project_type === 'service' ? 'bg-purple-50 border-purple-200 text-purple-700' :
                                                    'bg-blue-50 border-blue-200 text-blue-700'
                                        )}>
                                            {p.project_type === 'military' ? 'Vojenské' : p.project_type === 'service' ? 'Servis' : 'Civilní'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <ProjectDetailStats project={p} isEditing={isEditing} onChange={handleChange} />
                        </div>
                    </section>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {/* HARMONOGRAM */}
                        <section className="space-y-6">
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-3 text-slate-400 pl-2">
                                <CalendarDays size={18} className="text-primary opacity-60" /> Harmonogram realizace
                            </h3>
                            <div className="flex flex-wrap gap-4">
                                <DateField label="Příjem do výroby" value={p.deadline} field="deadline" />
                                <DateField label="Dodání podvozku" value={p.chassis_delivery} field="chassis_delivery" />
                                <DateField label="Dodání nástavby" value={p.body_delivery} field="body_delivery" />
                                <DateField label="Předání zákazníkovi" value={p.customer_handover} field="customer_handover" />
                                <DateField label="Zahájení (Uzavření obchodu)" value={p.closed_at} field="closed_at" />
                            </div>
                        </section>

                        {/* SPECIFIKACE */}
                        <section className="space-y-6">
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-3 text-slate-400 pl-2">
                                <ClipboardList size={18} className="text-primary opacity-60" /> Technická specifikace
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-5 rounded-2xl bg-white/60 border border-white/60 shadow-sm space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 opacity-60">Typ nástavby</label>
                                    <input
                                        readOnly={!isEditing}
                                        value={p.body_type || ''}
                                        onChange={(e) => handleChange('body_type', e.target.value)}
                                        className="w-full text-sm font-bold bg-white/80 border border-slate-100 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-primary/10 transition-all text-slate-900"
                                        placeholder="Např. CTS 20-66"
                                    />
                                </div>
                                <div className="p-5 rounded-2xl bg-white/60 border border-white/60 shadow-sm space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 opacity-60">Výrobní číslo (S/N)</label>
                                    <input
                                        readOnly={!isEditing}
                                        value={p.serial_number || ''}
                                        onChange={(e) => handleChange('serial_number', e.target.value)}
                                        className="w-full text-sm font-bold bg-white/80 border border-slate-100 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-primary/10 transition-all text-slate-900"
                                        placeholder="S/N"
                                    />
                                </div>
                            </div>
                        </section>
                    </div>

                    <section className="p-8 rounded-[2.5rem] bg-amber-50/50 backdrop-blur-md border border-amber-200/50 shadow-xl shadow-amber-200/20 space-y-4">
                        <label className="text-xs font-bold uppercase tracking-[0.2em] text-amber-800/60 flex items-center gap-3 pl-2">
                            <StickyNote size={18} /> Interní poznámka
                        </label>
                        <textarea
                            readOnly={!isEditing}
                            value={p.note || ''}
                            onChange={(e) => handleChange('note', e.target.value)}
                            className="w-full text-base font-medium bg-white/60 border border-white outline-none min-h-[160px] rounded-3xl px-8 py-8 focus:ring-8 focus:ring-amber-500/5 transition-all resize-none text-slate-700 leading-relaxed shadow-inner"
                            placeholder="Doplňující informace..."
                        />
                    </section>
                </div>

                {/* ── PRAVÁ STRANA (Objednávky) ── */}
                <div className="lg:w-[420px] xl:w-[480px] px-8 py-8 bg-slate-100/30 lg:border-l border-slate-200/50 backdrop-blur-3xl">
                    <ProjectDetailOrdering projectId={project.id} isEditing={isEditing} />
                </div>

            </div>
        </div>
    );
}
