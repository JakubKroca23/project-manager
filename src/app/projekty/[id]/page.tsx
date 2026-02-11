'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Project } from '@/types/project';
import {
    ArrowLeft,
    Calendar,
    User,
    Building2,
    Tag,
    ClipboardList,
    Truck,
    CheckCircle2,
    Clock,
    Shield,
    Globe,
    FileText,
    Hash,
    Edit2,
    Save,
    X,
    Loader2,
    PlusCircle,
    Trash2,
    AlertCircle,
    Factory,
    CalendarDays
} from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';

export default function ProjectDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editedProject, setEditedProject] = useState<Project | null>(null);
    const [saving, setSaving] = useState(false);
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

        if (id) fetchProject();
    }, [id]);

    const handleSave = async () => {
        if (!editedProject) return;
        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const userName = user?.email?.split('@')[0] || 'Neznámý';

            const updates = {
                ...editedProject,
                last_modified_by: userName,
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

    const handleCancel = () => {
        setEditedProject(project);
        setIsEditing(false);
    };

    const handleChange = (field: keyof Project, value: any) => {
        if (!editedProject) return;
        setEditedProject({ ...editedProject, [field]: value });
    };

    const handleCustomFieldChange = (key: string, value: any) => {
        if (!editedProject) return;
        setEditedProject({
            ...editedProject,
            custom_fields: {
                ...editedProject.custom_fields,
                [key]: value
            }
        });
    };

    const addCustomField = () => {
        const name = prompt("Název nového pole:");
        if (name && editedProject) {
            handleCustomFieldChange(name, "-");
        }
    };

    const removeCustomField = (key: string) => {
        if (!editedProject || !confirm(`Opravdu smazat pole "${key}"?`)) return;
        const newFields = { ...editedProject.custom_fields };
        delete newFields[key];
        setEditedProject({ ...editedProject, custom_fields: newFields });
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Factory size={20} className="text-primary/40 animate-pulse" />
                        </div>
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Načítám detail projektu...</p>
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-8 p-6 bg-background">
                <div className="p-8 bg-destructive/5 rounded-[2rem] border border-destructive/10 text-destructive flex flex-col items-center gap-4 shadow-xl shadow-destructive/5">
                    <AlertCircle size={64} strokeWidth={1.5} />
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-destructive to-destructive/60">Projekt nenalezen</h2>
                        <p className="text-sm text-destructive/80 font-medium">Projekt s ID <span className="font-mono bg-destructive/10 px-2 py-0.5 rounded text-destructive">{id}</span> neexistuje.</p>
                    </div>
                </div>
                <button onClick={() => router.push('/projekty')} className="px-8 py-3 bg-muted hover:bg-muted/80 text-foreground rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all hover:scale-105 active:scale-95">
                    <ArrowLeft size={16} /> Zpět na přehled
                </button>
            </div>
        );
    }

    const isMilitary = project.project_type === 'military';

    return (
        <div className="h-full overflow-y-auto bg-background text-foreground animate-in fade-in duration-500">
            {/* Top Navigation Bar */}
            <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/40">
                <div className="max-w-[1600px] mx-auto px-4 h-11 flex items-center justify-between">
                    <button onClick={() => router.push('/projekty')} className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-xl hover:bg-muted/50">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Zpět</span>
                    </button>

                    <div className="flex items-center gap-3">
                        {isEditing ? (
                            <>
                                <button onClick={handleCancel} disabled={saving} className="px-5 py-2 rounded-xl border border-destructive/20 text-destructive hover:bg-destructive/5 font-bold uppercase text-[10px] tracking-wider transition-all flex items-center gap-2">
                                    <X size={14} /> Zrušit
                                </button>
                                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2 rounded-xl bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20 font-bold uppercase text-[10px] tracking-wider transition-all hover:scale-105 active:scale-95">
                                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                    <span>Uložit změny</span>
                                </button>
                            </>
                        ) : (
                            canEdit && (
                                <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-muted/50 hover:bg-primary/10 hover:text-primary border border-border/50 hover:border-primary/20 font-bold uppercase text-[10px] tracking-wider transition-all">
                                    <Edit2 size={14} />
                                    <span>Upravit</span>
                                </button>
                            )
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto px-4 py-4 space-y-4 pb-16">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-border/40">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                            <ProjectBadge isMilitary={isMilitary} />
                            <span className="px-2.5 py-1 rounded-lg bg-muted/40 border border-border/60 text-[10px] font-mono text-muted-foreground">{project.id}</span>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 shadow-sm">
                                <span className={`w-1.5 h-1.5 rounded-full ${project.status === 'Aktivní' ? 'bg-emerald-500 animate-pulse' : 'bg-muted'}`} />
                                <span className="text-[10px] font-bold uppercase tracking-wider">{project.status}</span>
                            </div>
                        </div>
                        {isEditing ? (
                            <textarea
                                value={editedProject?.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                className="text-xl sm:text-2xl font-black tracking-tight leading-snug w-full bg-muted/30 border border-primary/20 rounded-xl p-3 focus:ring-2 focus:ring-primary/20 outline-none resize-none min-h-[60px]"
                            />
                        ) : (
                            <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-snug text-foreground max-w-4xl">
                                {project.name}
                            </h1>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
                    {/* Main Content - Left Column (8 cols) */}
                    <div className="xl:col-span-8 space-y-4">

                        {/* Key Info Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <InfoCard
                                icon={<User size={18} />}
                                label="Manažer Projektu"
                                value={isEditing ? editedProject?.manager : project.manager}
                                isEditing={isEditing}
                                onChange={(v) => handleChange('manager', v)}
                                accent="blue"
                            />
                            <InfoCard
                                icon={<Building2 size={18} />}
                                label="Klient / Zákazník"
                                value={isEditing ? editedProject?.customer : project.customer}
                                isEditing={isEditing}
                                onChange={(v) => handleChange('customer', v)}
                                accent="emerald"
                            />
                            <InfoCard
                                icon={<Tag size={18} />}
                                label="Kategorie"
                                value={isEditing ? editedProject?.category : project.category}
                                isEditing={isEditing}
                                onChange={(v) => handleChange('category', v)}
                                accent="purple"
                            />
                            <InfoCard
                                icon={<Shield size={18} />}
                                label="Výrobní číslo / VIN"
                                value={isEditing ? editedProject?.serial_number : project.serial_number}
                                isEditing={isEditing}
                                onChange={(v) => handleChange('serial_number', v)}
                                accent="amber"
                            />
                        </div>

                        {/* Timeline Section */}
                        <div className="bg-card rounded-xl border border-border/60 p-4 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-[100%] z-0 pointer-events-none" />
                            <div className="relative z-10 space-y-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                                        <CalendarDays size={20} />
                                    </div>
                                    <h3 className="text-lg font-bold uppercase tracking-widest text-foreground">Harmonogram</h3>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                                    <TimelineItem
                                        side="left"
                                        label="Dodání Podvozku"
                                        date={isEditing ? editedProject?.chassis_delivery : project.chassis_delivery}
                                        isEditing={isEditing}
                                        onChange={(v) => handleChange('chassis_delivery', v)}
                                    />
                                    <TimelineItem
                                        side="right"
                                        label="Dodání Nástavby"
                                        date={isEditing ? editedProject?.body_delivery : project.body_delivery}
                                        isEditing={isEditing}
                                        onChange={(v) => handleChange('body_delivery', v)}
                                    />
                                    <TimelineItem
                                        side="left"
                                        label="Předání Zákazníkovi"
                                        date={isEditing ? editedProject?.customer_handover : project.customer_handover}
                                        isEditing={isEditing}
                                        onChange={(v) => handleChange('customer_handover', v)}
                                        highlight
                                    />
                                    <TimelineItem
                                        side="right"
                                        label="Datum Uzavření"
                                        date={isEditing ? editedProject?.closed_at : project.closed_at}
                                        isEditing={isEditing}
                                        onChange={(v) => handleChange('closed_at', v)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Notes Section */}
                        <div className="bg-muted/10 rounded-xl border border-border/60 p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 bg-muted text-muted-foreground rounded-lg">
                                    <ClipboardList size={18} />
                                </div>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Poznámky k projektu</h3>
                            </div>
                            {isEditing ? (
                                <textarea
                                    value={editedProject?.note || ''}
                                    onChange={(e) => handleChange('note', e.target.value)}
                                    className="w-full h-40 bg-background border border-border rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 leading-relaxed resize-none shadow-inner"
                                    placeholder="Zde můžete připsat libovolné poznámky..."
                                />
                            ) : (
                                <p className="text-sm text-muted-foreground/80 leading-relaxed whitespace-pre-wrap">
                                    {project.note || 'Žádné poznámky nebyly přidány.'}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Sidebar - Right Column (4 cols) */}
                    <div className="xl:col-span-4 space-y-4">

                        {/* Production Status Box */}
                        <div className="bg-primary/5 rounded-xl border border-primary/10 p-4 space-y-4 relative overflow-hidden">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary text-primary-foreground rounded-lg shadow-lg shadow-primary/20">
                                    <Truck size={18} />
                                </div>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Výroba</h3>
                            </div>

                            <div className="space-y-4">
                                <SidebarField label="Aktuální Status" value={isEditing ? editedProject?.production_status : project.production_status} isEditing={isEditing} onChange={(v) => handleChange('production_status', v)} highlight />
                                <SidebarField label="Montážní Společnost" value={isEditing ? editedProject?.mounting_company : project.mounting_company} isEditing={isEditing} onChange={(v) => handleChange('mounting_company', v)} />
                                <SidebarField label="Konfigurace Nástavby" value={isEditing ? editedProject?.body_setup : project.body_setup} isEditing={isEditing} onChange={(v) => handleChange('body_setup', v)} />
                            </div>
                        </div>

                        {/* Abra Info */}
                        <div className="bg-card rounded-xl border border-border/60 p-4 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-500/10 text-amber-600 rounded-lg">
                                    <Hash size={18} />
                                </div>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/70">ABRA Propojení</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <SidebarField label="Číslo Zakázky" value={isEditing ? editedProject?.abra_project : project.abra_project} isEditing={isEditing} onChange={(v) => handleChange('abra_project', v)} />
                                <SidebarField label="Číslo Objednávky" value={isEditing ? editedProject?.abra_order : project.abra_order} isEditing={isEditing} onChange={(v) => handleChange('abra_order', v)} />
                            </div>
                        </div>

                        {/* Custom Fields */}
                        <div className="bg-card rounded-xl border border-border/60 p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg">
                                        <Globe size={18} />
                                    </div>
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/70">Ostatní Data</h3>
                                </div>
                                {isEditing && (
                                    <button onClick={addCustomField} className="text-[10px] font-bold uppercase bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-1">
                                        <PlusCircle size={12} /> Přidat
                                    </button>
                                )}
                            </div>

                            <div className="space-y-3 pt-2">
                                {((project.custom_fields && Object.keys(project.custom_fields).length > 0) || (isEditing && editedProject?.custom_fields)) ? (
                                    (isEditing ? Object.entries(editedProject?.custom_fields || {}) : Object.entries(project.custom_fields || {})).map(([key, val]) => (
                                        <div key={key} className="group relative bg-muted/20 hover:bg-muted/40 p-3 rounded-xl border border-transparent hover:border-border/50 transition-all">
                                            <div className="flex justify-between items-start mb-1">
                                                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/70">{key}</p>
                                                {isEditing && (
                                                    <button onClick={() => removeCustomField(key)} className="text-destructive opacity-0 group-hover:opacity-100 hover:bg-destructive/10 p-1 rounded transition-all">
                                                        <Trash2 size={12} />
                                                    </button>
                                                )}
                                            </div>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={val as string}
                                                    onChange={(e) => handleCustomFieldChange(key, e.target.value)}
                                                    className="w-full bg-transparent border-none text-sm font-medium text-foreground focus:ring-0 p-0"
                                                />
                                            ) : (
                                                <p className="text-sm font-medium text-foreground pl-0.5">{val?.toString() || '-'}</p>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-muted-foreground italic text-center py-4">Žádná doplňující data.</p>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

// --- SUBCOMPONENTS ---

interface ProjectBadgeProps {
    isMilitary: boolean;
}

function ProjectBadge({ isMilitary }: ProjectBadgeProps) {
    return (
        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-sm flex items-center gap-1.5 ${isMilitary
            ? 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20'
            : 'bg-emerald-600/10 text-emerald-600 border-emerald-600/20'
            }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isMilitary ? 'bg-indigo-600' : 'bg-emerald-600'}`} />
            {isMilitary ? 'Armádní Projekt' : 'Civilní Projekt'}
        </span>
    );
}

interface InfoCardProps {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
    isEditing?: boolean;
    onChange?: (value: string) => void;
    accent?: "primary" | "blue" | "emerald" | "purple" | "amber";
}

function InfoCard({ icon, label, value, isEditing, onChange, accent = "primary" }: InfoCardProps) {
    const accents = {
        primary: "group-hover:text-primary group-hover:bg-primary/10",
        blue: "group-hover:text-blue-600 group-hover:bg-blue-500/10",
        emerald: "group-hover:text-emerald-600 group-hover:bg-emerald-500/10",
        purple: "group-hover:text-purple-600 group-hover:bg-purple-500/10",
        amber: "group-hover:text-amber-600 group-hover:bg-amber-500/10",
    };

    return (
        <div className="bg-card border border-border/60 p-3 rounded-xl flex items-start gap-3 transition-all duration-300 hover:shadow-md hover:shadow-black/5 group">
            <div className={`p-2 bg-muted text-muted-foreground rounded-lg transition-colors duration-300 ${accents[accent]}`}>
                {icon}
            </div>
            <div className="flex-1 space-y-0.5 min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/70">{label}</p>
                {isEditing && onChange ? (
                    <input type="text" value={String(value || '')} onChange={(e) => onChange(e.target.value)} className="w-full bg-muted/30 -ml-1 px-1.5 py-0.5 rounded-md text-xs font-bold border-none focus:ring-2 focus:ring-primary/20" />
                ) : (
                    <p className="text-xs font-bold text-foreground truncate" title={String(value || '')}>{value || '-'}</p>
                )}
            </div>
        </div>
    );
}

interface TimelineItemProps {
    side: 'left' | 'right';
    label: string;
    date: string | null | undefined;
    isEditing?: boolean;
    onChange?: (value: string) => void;
    highlight?: boolean;
}

function TimelineItem({ side, label, date, isEditing, onChange, highlight }: TimelineItemProps) {
    return (
        <div className="flex flex-col gap-1">
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
            {isEditing && onChange ? (
                <input type="date" value={date || ''} onChange={(e) => onChange(e.target.value)} className="bg-muted/30 px-2 py-1 rounded-lg border border-border text-xs font-bold focus:outline-none focus:border-primary" />
            ) : (
                <div className={`text-sm font-black tracking-tight ${highlight ? 'text-primary' : 'text-foreground'}`}>
                    {date ? new Date(date).toLocaleDateString('cs-CZ') : '—'}
                </div>
            )}
        </div>
    );
}

interface SidebarFieldProps {
    label: string;
    value: React.ReactNode;
    isEditing?: boolean;
    onChange?: (value: string) => void;
    highlight?: boolean;
}

function SidebarField({ label, value, isEditing, onChange, highlight }: SidebarFieldProps) {
    return (
        <div className={`space-y-1.5 p-3 rounded-xl border transition-all ${highlight ? 'bg-background/80 border-primary/20 shadow-sm' : 'border-transparent hover:bg-muted/30'}`}>
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">{label}</p>
            {isEditing && onChange ? (
                <input type="text" value={String(value || '')} onChange={(e) => onChange(e.target.value)} className="w-full bg-white/50 border border-border/50 rounded-lg px-2 py-1 text-sm font-semibold" />
            ) : (
                <p className={`text-sm font-semibold ${highlight ? 'text-primary' : 'text-foreground'}`}>{value || '-'}</p>
            )}
        </div>
    );
}
