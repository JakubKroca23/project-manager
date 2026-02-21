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
    LayoutGrid
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
            <div className="flex h-full items-center justify-center bg-background">
                <Loader2 size={28} className="animate-spin text-primary" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-4 bg-background">
                <AlertCircle size={40} className="text-destructive" />
                <h2 className="text-lg font-bold">Projekt nenalezen</h2>
                <button onClick={() => router.push('/projekty')} className="px-4 py-2 bg-muted rounded-md text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    <ArrowLeft size={14} /> Zpět
                </button>
            </div>
        );
    }

    const typeColor = project.project_type === 'military' ? '#a5d6a7' : project.project_type === 'service' ? '#ce93d8' : '#90caf9';
    const p = isEditing ? editedProject! : project;

    const DateField = ({ label, value, field }: any) => (
        <div className="space-y-1">
            <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">{label}</label>
            {isEditing ? (
                <input
                    type="date"
                    value={value || ''}
                    onChange={(e) => handleChange(field, e.target.value)}
                    className="w-full text-[10px] font-bold bg-background border border-border rounded px-1.5 py-1 outline-none"
                />
            ) : (
                <div className="text-[11px] font-bold">{value ? new Date(value).toLocaleDateString('cs-CZ') : '—'}</div>
            )}
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-background text-foreground overflow-hidden">
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

            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row max-w-[1600px] mx-auto w-full">

                {/* ── LEVÁ STRANA (Detaily a Timeline) ── */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">

                    {/* HLAVNÍ INFO MODUL (Sloučené detaily) */}
                    <section className="bg-muted/10 border border-border/50 rounded-2xl overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-border/50 bg-background/50 flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <span className={cn(
                                    "px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border",
                                    p.project_type === 'military'
                                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                        : 'bg-slate-500/10 text-slate-600 border-slate-500/20'
                                )}>
                                    {p.project_type === 'military' ? 'Vojenské' : p.project_type === 'service' ? 'Servis' : 'Civil'}
                                </span>
                                <h1 className="text-xl font-black tracking-tight">
                                    {isEditing ? (
                                        <input
                                            value={p.name}
                                            onChange={(e) => handleChange('name', e.target.value)}
                                            className="bg-transparent border-b border-primary/20 outline-none w-full"
                                        />
                                    ) : project.name}
                                </h1>
                            </div>
                            <ProjectDetailStats project={p} isEditing={isEditing} onChange={handleChange} />
                        </div>
                    </section>

                    {/* MINI TIMELINE */}
                    <ProjectMiniTimeline project={p} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* HARMONOGRAM (Detailed) */}
                        <section className="bg-muted/10 border border-border/50 rounded-xl p-4 space-y-4 shadow-sm">
                            <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-primary">
                                <CalendarDays size={14} /> Harmonogram
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <DateField label="Příjem" value={p.deadline} field="deadline" />
                                <DateField label="Podvozek" value={p.chassis_delivery} field="chassis_delivery" />
                                <DateField label="Nástavba" value={p.body_delivery} field="body_delivery" />
                                <DateField label="Předání" value={p.customer_handover} field="customer_handover" />
                                <DateField label="Uzavření" value={p.closed_at} field="closed_at" />
                            </div>
                        </section>

                        {/* SPECIFIKACE */}
                        <section className="bg-muted/10 border border-border/50 rounded-xl p-4 space-y-4 shadow-sm">
                            <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-primary">
                                <ClipboardList size={14} /> Specifikace
                            </h3>
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Typ nástavby</label>
                                    <input
                                        readOnly={!isEditing}
                                        value={p.body_type || ''}
                                        onChange={(e) => handleChange('body_type', e.target.value)}
                                        className="w-full text-xs font-bold bg-background/50 border border-border/50 rounded px-2 py-1 outline-none"
                                        placeholder="Např. CTS 20-66"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Výrobní číslo</label>
                                    <input
                                        readOnly={!isEditing}
                                        value={p.serial_number || ''}
                                        onChange={(e) => handleChange('serial_number', e.target.value)}
                                        className="w-full text-xs font-bold bg-background/50 border border-border/50 rounded px-2 py-1 outline-none"
                                        placeholder="S/N"
                                    />
                                </div>
                            </div>
                        </section>
                    </div>

                    <section className="bg-muted/10 border border-border/50 rounded-xl p-4 space-y-2 shadow-sm">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                            <Info size={12} /> Poznámka
                        </label>
                        <textarea
                            readOnly={!isEditing}
                            value={p.note || ''}
                            onChange={(e) => handleChange('note', e.target.value)}
                            className="w-full text-xs font-medium bg-background/50 border border-border/50 rounded px-2 py-1.5 outline-none min-h-[100px]"
                            placeholder="Interní poznámka k zakázce..."
                        />
                    </section>
                </div>

                {/* ── PRAVÁ STRANA (Objednávky) ── */}
                <div className="lg:w-[400px] xl:w-[450px] p-4 lg:p-6 lg:border-l border-border/50 bg-background/50">
                    <ProjectDetailOrdering projectId={project.id} isEditing={isEditing} />
                </div>

            </div>
        </div>
    );
}
