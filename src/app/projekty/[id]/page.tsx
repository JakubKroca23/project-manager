'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Project } from '@/types/project';
import {
    ArrowLeft,
    User,
    Building2,
    Tag,
    ClipboardList,
    Truck,
    Shield,
    Globe,
    Hash,
    Edit2,
    Save,
    X,
    Loader2,
    PlusCircle,
    Trash2,
    AlertCircle,
    Factory,
    CalendarDays,
    Wrench,
    FileText,
    Users,
    Clock,
    Briefcase
} from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { toast } from 'sonner';

export default function ProjectDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editedProject, setEditedProject] = useState<Project | null>(null);
    const [saving, setSaving] = useState(false);
    const { canEdit, checkPerm, isLoading: permsLoading } = usePermissions();

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

    // Permissions check
    useEffect(() => {
        if (!permsLoading && project) {
            const hasGeneralAccess = checkPerm('projects');
            // Check specific project type access
            let hasTypeAccess = false;
            if (project.project_type === 'civil') hasTypeAccess = checkPerm('projects_civil');
            else if (project.project_type === 'military') hasTypeAccess = checkPerm('projects_military');
            else if (project.project_type === 'service') hasTypeAccess = checkPerm('service');
            else hasTypeAccess = true; // Other types? default to allow if general projects is true? 

            if (!hasGeneralAccess || !hasTypeAccess) {
                toast.error(`Nemáte oprávnění k prohlížení tohoto ${project.project_type === 'service' ? 'servisu' : 'projektu'}.`);
                router.push(hasGeneralAccess ? '/projekty' : '/');
            }
        }
    }, [permsLoading, project, checkPerm, router]);

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

    // --- Loading State ---
    if (loading || permsLoading) {
        return (
            <div className="flex bg-background h-screen items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-primary" size={40} />
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground animate-pulse">
                        Načítám detaily projektu...
                    </p>
                </div>
            </div>
        );
    }

    // --- Not Found State ---
    if (!project) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-6 p-6 bg-background">
                <div className="p-6 bg-destructive/5 rounded-xl border border-destructive/10 text-destructive flex flex-col items-center gap-3">
                    <AlertCircle size={40} strokeWidth={1.5} />
                    <h2 className="text-lg font-bold">Projekt nenalezen</h2>
                    <p className="text-xs text-destructive/80">ID <span className="font-mono bg-destructive/10 px-1.5 py-0.5 rounded">{id}</span> neexistuje.</p>
                </div>
                <button onClick={() => router.push('/projekty')} className="px-5 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all">
                    <ArrowLeft size={14} /> Zpět
                </button>
            </div>
        );
    }

    const isMilitary = project.project_type === 'military';
    const isService = project.project_type === 'service';
    const isCivil = project.project_type === 'civil';
    const typeColor = isMilitary ? '#2e7d32' : isService ? '#8e24aa' : isCivil ? '#0277bd' : '#64748b';

    const p = isEditing ? editedProject! : project;

    const formatDate = (date: string | null | undefined) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('cs-CZ');
    };

    return (
        <div className="h-full overflow-y-auto bg-background text-foreground scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            {/* ── Modern Premium Header ── */}
            <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/40 overflow-hidden">
                {/* Dynamic Background Glow */}
                <div
                    className="absolute -top-[100px] left-1/2 -translate-x-1/2 w-[600px] h-[200px] blur-[120px] opacity-20 pointer-events-none transition-colors duration-1000"
                    style={{ backgroundColor: typeColor }}
                />

                <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between relative">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => router.push('/projekty')}
                            className="group flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:bg-muted active:scale-95"
                            style={{ color: typeColor }}
                        >
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            <span>Zpět</span>
                        </button>

                        <div className="h-6 w-px bg-border/60" />

                        <div className="flex items-center gap-3">
                            <h2 className="text-sm font-black tracking-tight text-foreground truncate max-w-[300px] lg:max-w-[500px]">
                                {project.id} <span className="text-muted-foreground/60 mx-1">|</span> {project.name}
                            </h2>
                            <div
                                className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md shadow-lg transition-all duration-500"
                                style={{
                                    backgroundColor: `${typeColor}15`,
                                    borderColor: `${typeColor}33`,
                                    color: typeColor,
                                    boxShadow: `0 4px 12px ${typeColor}15`
                                }}
                            >
                                {isMilitary ? 'Armádní' : isService ? 'Servis' : isCivil ? 'Civilní' : 'Neznámý'}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {isEditing ? (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleCancel()}
                                    className="px-4 py-1.5 rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted transition-all"
                                >
                                    Zrušit
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-6 py-1.5 rounded-xl text-xs font-black text-white shadow-lg active:scale-95 transition-all"
                                    style={{ backgroundColor: typeColor, boxShadow: `0 4px 15px ${typeColor}44` }}
                                >
                                    Uložit změny
                                </button>
                            </div>
                        ) : (
                            canEdit && (
                                <button
                                    onClick={() => {
                                        setEditedProject({ ...project });
                                        setIsEditing(true);
                                    }}
                                    className="px-5 py-1.5 rounded-xl text-xs font-black bg-foreground text-background hover:opacity-90 active:scale-95 transition-all shadow-md"
                                >
                                    Upravit zakázku
                                </button>
                            )
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto p-4 lg:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Project Info Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Main Details */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Highlights Row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatCard
                                label="Zákazník"
                                value={p.customer || '-'}
                                icon={<Users size={16} />}
                                color={typeColor}
                            />
                            <StatCard
                                label="Status"
                                value={p.status || 'Probíhá'}
                                icon={<Clock size={16} />}
                                color={typeColor}
                                isStatus
                            />
                            <StatCard
                                label="Množství"
                                value={p.quantity?.toString() || '-'}
                                icon={<Briefcase size={16} />}
                                color={typeColor}
                            />
                            <StatCard
                                label="ID Zakázky"
                                value={p.id}
                                icon={<Hash size={16} />}
                                color={typeColor}
                            />
                        </div>

                        {/* ── SECTIONS GRID ── */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                            {/* ═══ 1. ZÁKLADNÍ INFORMACE ═══ */}
                            <Section icon={<FileText size={18} />} title="Základní informace" color="blue">
                                <FieldGrid>
                                    <Field label="Manažer" icon={<User size={16} />} value={p.manager} field="manager" isEditing={isEditing} onChange={handleChange} />
                                    <Field label="Zákazník" icon={<Building2 size={16} />} value={p.customer} field="customer" isEditing={isEditing} onChange={handleChange} />
                                    <Field label="Kategorie" icon={<Tag size={16} />} value={p.category} field="category" isEditing={isEditing} onChange={handleChange} />
                                    <Field label="Výrobní číslo" icon={<Hash size={16} />} value={p.serial_number} field="serial_number" isEditing={isEditing} onChange={handleChange} />
                                </FieldGrid>
                            </Section>

                            {/* ═══ 2. HARMONOGRAM ═══ */}
                            <Section icon={<CalendarDays size={18} />} title="Harmonogram" color="amber">
                                {p.project_type === 'service' ? (
                                    <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                                        <DateField label="Zahájení servisu" value={p.deadline} field="deadline" isEditing={isEditing} onChange={handleChange} />
                                        <DateField label="Předání zákazníkovi" value={p.customer_handover} field="customer_handover" isEditing={isEditing} onChange={handleChange} highlight />
                                        <DateField label="Datum uzavření" value={p.closed_at} field="closed_at" isEditing={isEditing} onChange={handleChange} />
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                                        <DateField label="Dodání podvozku" value={p.chassis_delivery} field="chassis_delivery" isEditing={isEditing} onChange={handleChange} />
                                        <DateField label="Dodání nástavby" value={p.body_delivery} field="body_delivery" isEditing={isEditing} onChange={handleChange} />
                                        <DateField label="Předání zákazníkovi" value={p.customer_handover} field="customer_handover" isEditing={isEditing} onChange={handleChange} highlight />
                                        <DateField label="Datum uzavření" value={p.closed_at} field="closed_at" isEditing={isEditing} onChange={handleChange} />
                                    </div>
                                )}
                            </Section>

                            {/* ═══ 3. VÝROBA / NÁSTAVBA ═══ */}
                            <Section icon={<Truck size={18} />} title="Výroba a nástavba" color="emerald">
                                <FieldGrid>
                                    <Field label="Stav výroby" icon={<Factory size={16} />} value={p.production_status} field="production_status" isEditing={isEditing} onChange={handleChange} highlight />
                                    <Field label="Montážní společnost" icon={<Wrench size={16} />} value={p.mounting_company} field="mounting_company" isEditing={isEditing} onChange={handleChange} />
                                    <Field label="Konfigurace nástavby" icon={<Shield size={16} />} value={p.body_setup} field="body_setup" isEditing={isEditing} onChange={handleChange} />
                                </FieldGrid>
                            </Section>

                            {/* ═══ 4. ABRA PROPOJENÍ ═══ */}
                            <Section icon={<Globe size={18} />} title="ABRA propojení" color="purple">
                                <FieldGrid>
                                    <Field label="Číslo zakázky" icon={<Hash size={16} />} value={p.abra_project} field="abra_project" isEditing={isEditing} onChange={handleChange} />
                                    <Field label="Číslo objednávky" icon={<Hash size={16} />} value={p.abra_order} field="abra_order" isEditing={isEditing} onChange={handleChange} />
                                </FieldGrid>
                            </Section>
                        </div>
                    </div>

                    {/* Right Column - Description & Custom Fields */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* ═══ 5. POPIS ZAKÁZKY / POZNÁMKY ═══ */}
                        <Section icon={<ClipboardList size={18} />} title="Popis zakázky" color="indigo" fullWidth>
                            {isEditing ? (
                                <textarea
                                    value={p.note || ''}
                                    onChange={(e) => handleChange('note', e.target.value)}
                                    className="w-full h-32 bg-background/50 border border-border/60 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 leading-relaxed resize-none shadow-inner"
                                    placeholder="Zde můžete připsat popis zakázky nebo poznámky..."
                                    title="Poznámka k zakázce"
                                />
                            ) : (
                                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap min-h-[2rem]">
                                    {project.note || 'Žádný popis nebyl přidán.'}
                                </p>
                            )}
                        </Section>

                        {/* ═══ 6. OSTATNÍ DATA (Custom Fields) ═══ */}
                        {((project.custom_fields && Object.keys(project.custom_fields).length > 0) || isEditing) && (
                            <Section
                                icon={<Globe size={18} />}
                                title="Ostatní data"
                                color="rose"
                                fullWidth
                                action={isEditing ? (
                                    <button
                                        onClick={addCustomField}
                                        className="text-[10px] font-bold uppercase bg-primary/10 text-primary px-2 py-1 rounded-md hover:bg-primary/20 transition-colors flex items-center gap-1"
                                        title="Přidat vlastní pole"
                                    >
                                        <PlusCircle size={11} /> Přidat
                                    </button>
                                ) : undefined}
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {(isEditing
                                        ? Object.entries(p.custom_fields || {})
                                        : Object.entries(project.custom_fields || {})
                                    ).map(([key, val]) => (
                                        <div key={key} className="group relative bg-background/50 border border-border/60 p-3 rounded-xl shadow-sm hover:shadow-md transition-all">
                                            <div className="flex justify-between items-start mb-1">
                                                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/70">{key}</p>
                                                {isEditing && (
                                                    <button
                                                        onClick={() => removeCustomField(key)}
                                                        className="text-destructive opacity-0 group-hover:opacity-100 hover:bg-destructive/10 p-0.5 rounded transition-all"
                                                        title={`Odstranit pole: ${key}`}
                                                    >
                                                        <Trash2 size={10} />
                                                    </button>
                                                )}
                                            </div>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={val as string}
                                                    onChange={(e) => handleCustomFieldChange(key, e.target.value)}
                                                    className="w-full bg-transparent border-none text-sm font-medium text-foreground focus:ring-0 p-0"
                                                    title={`Hodnota pro pole: ${key}`}
                                                />
                                            ) : (
                                                <p className="text-sm font-medium text-foreground">{val?.toString() || '-'}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </Section>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── SUBCOMPONENTS ───────────────────────────────────────────────

//// ── Helper Components for Premium UI ──

function StatCard({ label, value, icon, color, isStatus }: { label: string; value: string; icon: React.ReactNode; color: string; isStatus?: boolean }) {
    return (
        <div className="bg-card border border-border/60 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
            <div
                className="absolute top-0 right-0 p-3 opacity-[0.03] group-hover:scale-110 transition-transform"
                style={{ color }}
            >
                {React.cloneElement(icon as React.ReactElement, { size: 40 })}
            </div>
            <div className="relative z-10 space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <div style={{ color }}>{icon}</div>
                    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
                </div>
                <div className={`text-sm font-black truncate ${isStatus ? 'text-primary' : 'text-foreground'}`}>
                    {isStatus && <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />}
                    {value}
                </div>
            </div>
        </div>
    );
}

interface SectionProps {
    icon: React.ReactNode;
    title: string;
    color: string;
    children: React.ReactNode;
    fullWidth?: boolean;
    action?: React.ReactNode;
}

function Section({ icon, title, color, children, fullWidth, action }: SectionProps) {
    const colorMap: Record<string, { border: string; bg: string; icon: string; text: string; accent: string }> = {
        blue: { border: 'border-blue-500/10', bg: 'bg-blue-500/[0.02]', icon: 'text-blue-600', text: 'text-blue-700', accent: 'bg-blue-600' },
        emerald: { border: 'border-emerald-500/10', bg: 'bg-emerald-500/[0.02]', icon: 'text-emerald-600', text: 'text-emerald-700', accent: 'bg-emerald-600' },
        purple: { border: 'border-purple-500/10', bg: 'bg-purple-500/[0.02]', icon: 'text-purple-600', text: 'text-purple-700', accent: 'bg-purple-600' },
        amber: { border: 'border-amber-500/10', bg: 'bg-amber-500/[0.02]', icon: 'text-amber-600', text: 'text-amber-700', accent: 'bg-amber-600' },
        rose: { border: 'border-rose-500/10', bg: 'bg-rose-500/[0.02]', icon: 'text-rose-600', text: 'text-rose-700', accent: 'bg-rose-600' },
        indigo: { border: 'border-indigo-500/10', bg: 'bg-indigo-500/[0.02]', icon: 'text-indigo-600', text: 'text-indigo-700', accent: 'bg-indigo-600' },
        slate: { border: 'border-slate-500/10', bg: 'bg-slate-500/[0.02]', icon: 'text-slate-600', text: 'text-slate-700', accent: 'bg-slate-600' },
    };

    const c = colorMap[color] || colorMap.slate;

    return (
        <div className={`rounded-3xl border ${c.border} ${c.bg} p-6 shadow-sm relative overflow-hidden group ${fullWidth ? '' : ''}`}>
            {/* Saturated accent line */}
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${c.accent} opacity-80 group-hover:opacity-100 transition-opacity`} />

            <div className="flex items-center justify-between mb-6 pl-2">
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-2xl ${c.bg} ${c.icon} border ${c.border} shadow-sm group-hover:scale-105 transition-transform`}>
                        {icon}
                    </div>
                    <h3 className={`text-xs font-black uppercase tracking-[0.2em] ${c.text}`}>
                        {title}
                    </h3>
                </div>
                {action}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 pl-2">
                {children}
            </div>
        </div>
    );
}

function FieldGrid({ children }: { children: React.ReactNode }) {
    return <div className="grid grid-cols-1 gap-x-12 gap-y-6">{children}</div>;
}

interface FieldProps {
    label: string;
    icon: React.ReactNode;
    value: any;
    field: keyof Project;
    isEditing: boolean;
    onChange: (field: keyof Project, value: any) => void;
    highlight?: boolean;
}

function Field({ label, icon, value, field, isEditing, onChange, highlight }: FieldProps) {
    return (
        <div className="flex items-start gap-2">
            <div className="text-muted-foreground/50 mt-0.5 shrink-0">{icon}</div>
            <div className="flex-1 min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">{label}</p>
                {isEditing ? (
                    <input
                        type="text"
                        value={String(value || '')}
                        onChange={(e) => onChange(field, e.target.value)}
                        className="w-full bg-background/50 border border-border/50 rounded px-1.5 py-0.5 text-xs font-medium focus:ring-1 focus:ring-primary/20 outline-none"
                        title={`Upravit: ${label}`}
                    />
                ) : (
                    <p className={`text-xs font-semibold truncate ${highlight ? 'text-primary' : 'text-foreground'}`} title={String(value || '')}>
                        {value || '—'}
                    </p>
                )}
            </div>
        </div>
    );
}

interface DateFieldProps {
    label: string;
    value: any;
    field: keyof Project;
    isEditing: boolean;
    onChange: (field: keyof Project, value: any) => void;
    highlight?: boolean;
}

function DateField({ label, value, field, isEditing, onChange, highlight }: DateFieldProps) {
    const formatted = value ? new Date(value).toLocaleDateString('cs-CZ') : '—';
    return (
        <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">{label}</p>
            {isEditing ? (
                <input
                    type="date"
                    value={value || ''}
                    onChange={(e) => onChange(field, e.target.value)}
                    className="bg-background/50 border border-border/50 rounded px-1.5 py-0.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary/20 w-full"
                    title={`Upravit datum: ${label}`}
                />
            ) : (
                <p className={`text-sm font-bold ${highlight ? 'text-primary' : 'text-foreground'}`}>
                    {formatted}
                </p>
            )}
        </div>
    );
}
