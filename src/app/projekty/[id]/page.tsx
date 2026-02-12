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
    FileText
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

    // --- Loading State ---
    if (loading) {
        return (
            <div className="flex h-full items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={28} className="animate-spin text-primary" />
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Načítám detail projektu...</p>
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
    const typeColor = isMilitary ? '#a5d6a7' : isService ? '#ce93d8' : isCivil ? '#90caf9' : '#94a3b8';

    const p = isEditing ? editedProject! : project;

    const formatDate = (date: string | null | undefined) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('cs-CZ');
    };

    return (
        <div className="h-full overflow-y-auto bg-background text-foreground">
            {/* ── Sticky Top Bar ── */}
            <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border/50">
                <div
                    className="absolute top-0 left-0 right-0 h-[3px] transition-colors duration-500"
                    style={{ backgroundColor: typeColor, boxShadow: `0 0 10px ${typeColor}44` }}
                />
                <div className="max-w-[1400px] mx-auto px-4 h-11 flex items-center justify-between">
                    <button
                        onClick={() => router.push('/projekty')}
                        className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors"
                        style={{ color: typeColor }}
                    >
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        Zpět
                    </button>

                    <div className="flex items-center gap-2">
                        {isEditing ? (
                            <>
                                <button onClick={handleCancel} disabled={saving} className="px-4 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5">
                                    <X size={12} /> Zrušit
                                </button>
                                <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider transition-all hover:opacity-90">
                                    {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                                    Uložit
                                </button>
                            </>
                        ) : (
                            canEdit && (
                                <button onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary text-[10px] font-bold uppercase tracking-wider transition-all">
                                    <Edit2 size={12} /> Upravit
                                </button>
                            )
                        )}
                    </div>
                </div>
            </div>

            {/* ── Main Content ── */}
            <div className="max-w-[1400px] mx-auto px-4 py-4 pb-16 space-y-4">

                {/* ── HEADER ── */}
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${p.project_type === 'military'
                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                : p.project_type === 'service'
                                    ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                                    : 'bg-slate-500/10 text-slate-600 border-slate-500/20'
                                }`}>
                                {p.project_type === 'military' ? 'Armáda' : p.project_type === 'service' ? 'Servis' : 'Civil'}
                            </span>
                            {isEditing && (
                                <select
                                    value={p.project_type}
                                    onChange={(e) => handleChange('project_type', e.target.value)}
                                    className="text-[10px] bg-muted border border-border rounded px-2 py-0.5 outline-none"
                                >
                                    <option value="civil">Civil</option>
                                    <option value="military">Armáda</option>
                                    <option value="service">Servis</option>
                                </select>
                            )}
                            <span className="text-[10px] font-mono text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">{project.id}</span>
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                                <span className={`w-1.5 h-1.5 rounded-full ${project.status === 'Aktivní' ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/40'}`} />
                                {project.status}
                            </span>
                        </div>
                        {isEditing ? (
                            <input
                                type="text"
                                value={p.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                className="text-lg font-bold w-full bg-muted/30 border border-border rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                        ) : (
                            <h1 className="text-lg font-bold text-foreground leading-snug">{project.name}</h1>
                        )}
                    </div>
                </div>

                {/* ── SECTIONS GRID ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">

                    {/* ═══ 1. ZÁKLADNÍ INFORMACE ═══ */}
                    <Section icon={<FileText size={15} />} title="Základní informace" color="blue">
                        <FieldGrid>
                            <Field label="Manažer" icon={<User size={13} />} value={p.manager} field="manager" isEditing={isEditing} onChange={handleChange} />
                            <Field label="Zákazník" icon={<Building2 size={13} />} value={p.customer} field="customer" isEditing={isEditing} onChange={handleChange} />
                            <Field label="Kategorie" icon={<Tag size={13} />} value={p.category} field="category" isEditing={isEditing} onChange={handleChange} />
                            <Field label="Výrobní číslo" icon={<Hash size={13} />} value={p.serial_number} field="serial_number" isEditing={isEditing} onChange={handleChange} />
                        </FieldGrid>
                    </Section>

                    {/* ═══ 2. HARMONOGRAM ═══ */}
                    <Section icon={<CalendarDays size={15} />} title="Harmonogram" color="amber">
                        {p.project_type === 'service' ? (
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                <DateField label="Zahájení servisu" value={p.deadline} field="deadline" isEditing={isEditing} onChange={handleChange} />
                                <DateField label="Předání zákazníkovi" value={p.customer_handover} field="customer_handover" isEditing={isEditing} onChange={handleChange} highlight />
                                <DateField label="Datum uzavření" value={p.closed_at} field="closed_at" isEditing={isEditing} onChange={handleChange} />
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                <DateField label="Dodání podvozku" value={p.chassis_delivery} field="chassis_delivery" isEditing={isEditing} onChange={handleChange} />
                                <DateField label="Dodání nástavby" value={p.body_delivery} field="body_delivery" isEditing={isEditing} onChange={handleChange} />
                                <DateField label="Předání zákazníkovi" value={p.customer_handover} field="customer_handover" isEditing={isEditing} onChange={handleChange} highlight />
                                <DateField label="Datum uzavření" value={p.closed_at} field="closed_at" isEditing={isEditing} onChange={handleChange} />
                            </div>
                        )}
                    </Section>

                    {/* ═══ 3. VÝROBA / NÁSTAVBA ═══ */}
                    <Section icon={<Truck size={15} />} title="Výroba a nástavba" color="emerald">
                        <FieldGrid>
                            <Field label="Stav výroby" icon={<Factory size={13} />} value={p.production_status} field="production_status" isEditing={isEditing} onChange={handleChange} highlight />
                            <Field label="Montážní společnost" icon={<Wrench size={13} />} value={p.mounting_company} field="mounting_company" isEditing={isEditing} onChange={handleChange} />
                            <Field label="Konfigurace nástavby" icon={<Shield size={13} />} value={p.body_setup} field="body_setup" isEditing={isEditing} onChange={handleChange} />
                        </FieldGrid>
                    </Section>

                    {/* ═══ 4. ABRA PROPOJENÍ ═══ */}
                    <Section icon={<Globe size={15} />} title="ABRA propojení" color="purple">
                        <FieldGrid>
                            <Field label="Číslo zakázky" icon={<Hash size={13} />} value={p.abra_project} field="abra_project" isEditing={isEditing} onChange={handleChange} />
                            <Field label="Číslo objednávky" icon={<Hash size={13} />} value={p.abra_order} field="abra_order" isEditing={isEditing} onChange={handleChange} />
                        </FieldGrid>
                    </Section>
                </div>

                {/* ═══ 5. POPIS ZAKÁZKY / POZNÁMKY ═══ */}
                <Section icon={<ClipboardList size={15} />} title="Popis zakázky" color="slate" fullWidth>
                    {isEditing ? (
                        <textarea
                            value={p.note || ''}
                            onChange={(e) => handleChange('note', e.target.value)}
                            className="w-full h-28 bg-muted/20 border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 leading-relaxed resize-none"
                            placeholder="Zde můžete připsat popis zakázky nebo poznámky..."
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
                        icon={<Globe size={15} />}
                        title="Ostatní data"
                        color="slate"
                        fullWidth
                        action={isEditing ? (
                            <button onClick={addCustomField} className="text-[10px] font-bold uppercase bg-primary/10 text-primary px-2 py-1 rounded-md hover:bg-primary/20 transition-colors flex items-center gap-1">
                                <PlusCircle size={11} /> Přidat
                            </button>
                        ) : undefined}
                    >
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                            {(isEditing
                                ? Object.entries(p.custom_fields || {})
                                : Object.entries(project.custom_fields || {})
                            ).map(([key, val]) => (
                                <div key={key} className="group relative bg-muted/20 hover:bg-muted/30 p-2.5 rounded-lg border border-transparent hover:border-border/50 transition-all">
                                    <div className="flex justify-between items-start mb-0.5">
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/70">{key}</p>
                                        {isEditing && (
                                            <button onClick={() => removeCustomField(key)} className="text-destructive opacity-0 group-hover:opacity-100 hover:bg-destructive/10 p-0.5 rounded transition-all">
                                                <Trash2 size={10} />
                                            </button>
                                        )}
                                    </div>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={val as string}
                                            onChange={(e) => handleCustomFieldChange(key, e.target.value)}
                                            className="w-full bg-transparent border-none text-xs font-medium text-foreground focus:ring-0 p-0"
                                        />
                                    ) : (
                                        <p className="text-xs font-medium text-foreground">{val?.toString() || '-'}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Section>
                )}

                {/* ═══ 7. HISTORIE ZMĚN ═══ */}
                <Section icon={<ClipboardList size={15} />} title="Historie změn" color="slate" fullWidth>
                    <ProjectHistory projectId={project.id} />
                </Section>
            </div>
        </div>
    );
}

// ─── SUBCOMPONENTS ───────────────────────────────────────────────

// Color accent maps
const colorMap: Record<string, { border: string; bg: string; icon: string; text: string }> = {
    blue: { border: 'border-blue-500/20', bg: 'bg-blue-500/5', icon: 'text-blue-500', text: 'text-blue-600' },
    amber: { border: 'border-amber-500/20', bg: 'bg-amber-500/5', icon: 'text-amber-500', text: 'text-amber-600' },
    emerald: { border: 'border-emerald-500/20', bg: 'bg-emerald-500/5', icon: 'text-emerald-500', text: 'text-emerald-600' },
    purple: { border: 'border-purple-500/20', bg: 'bg-purple-500/5', icon: 'text-purple-500', text: 'text-purple-600' },
    slate: { border: 'border-border/60', bg: 'bg-muted/5', icon: 'text-muted-foreground', text: 'text-muted-foreground' },
};

interface SectionProps {
    icon: React.ReactNode;
    title: string;
    color: string;
    children: React.ReactNode;
    fullWidth?: boolean;
    action?: React.ReactNode;
}

function Section({ icon, title, color, children, fullWidth, action }: SectionProps) {
    const c = colorMap[color] || colorMap.slate;
    return (
        <div className={`rounded-xl border ${c.border} ${c.bg} p-4 ${fullWidth ? '' : ''}`}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className={`${c.icon}`}>{icon}</div>
                    <h3 className={`text-[11px] font-bold uppercase tracking-widest ${c.text}`}>{title}</h3>
                </div>
                {action}
            </div>
            {children}
        </div>
    );
}

function FieldGrid({ children }: { children: React.ReactNode }) {
    return <div className="grid grid-cols-2 gap-x-4 gap-y-2">{children}</div>;
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
                />
            ) : (
                <p className={`text-sm font-bold ${highlight ? 'text-primary' : 'text-foreground'}`}>
                    {formatted}
                </p>
            )}
        </div>
    );
}

function ProjectHistory({ projectId }: { projectId: string }) {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLogs() {
            const { data, error } = await supabase
                .from('project_action_logs')
                .select('*')
                .eq('project_id', projectId)
                .order('performed_at', { ascending: false });

            if (error) {
                console.error('Error fetching logs:', error);
            } else {
                setLogs(data || []);
            }
            setLoading(false);
        }
        fetchLogs();
    }, [projectId]);

    if (loading) return <div className="text-[10px] text-muted-foreground animate-pulse px-4 py-2">Načítám historii...</div>;
    if (logs.length === 0) return <div className="text-[10px] text-muted-foreground px-4 py-2">Žádné záznamy o změnách.</div>;

    return (
        <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar p-1">
            {logs.map((log) => (
                <div key={log.id} className="p-2.5 bg-background/40 rounded-lg border border-border/40 text-[10px] hover:bg-background/60 transition-colors">
                    <div className="flex justify-between items-center mb-1.5">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${log.action_type === 'create' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' :
                                log.action_type === 'delete' ? 'bg-destructive/10 text-destructive border border-destructive/20' :
                                    'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                            }`}>
                            {log.action_type === 'create' ? 'Vytvořeno' : log.action_type === 'delete' ? 'Smazáno' : 'Změna'}
                        </span>
                        <span className="text-[9px] text-muted-foreground font-mono opacity-60">
                            {new Date(log.performed_at).toLocaleString('cs-CZ')}
                        </span>
                    </div>
                    <div className="text-foreground/70 mb-2 flex items-center gap-1.5 italic">
                        <span className="opacity-50">Provedl:</span>
                        <span className="font-bold underline decoration-primary/30 underline-offset-2">{log.performed_by || 'Systém'}</span>
                    </div>
                    {log.action_type === 'update' && log.old_value && log.new_value && (
                        <div className="mt-2 space-y-1.5 border-t border-border/30 pt-1.5">
                            {Object.keys(log.new_value).map(key => {
                                const oldVal = log.old_value[key];
                                const newVal = log.new_value[key];
                                if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
                                    if (['updated_at', 'last_modified_by', 'id', 'created_at'].includes(key)) return null;
                                    return (
                                        <div key={key} className="flex gap-2 items-baseline border-b border-border/10 pb-1 last:border-0 hover:bg-primary/5 px-1 rounded transition-colors group">
                                            <span className="font-black text-muted-foreground/80 uppercase text-[8px] min-w-[60px]">{key}:</span>
                                            <div className="flex flex-col gap-0.5 flex-1">
                                                <span className="text-destructive line-through opacity-40 italic">{String(oldVal === null || oldVal === undefined ? '—' : (typeof oldVal === 'object' ? JSON.stringify(oldVal) : oldVal))}</span>
                                                <span className="text-emerald-600 font-bold bg-emerald-500/5 px-1 rounded">{String(newVal === null || newVal === undefined ? '—' : (typeof newVal === 'object' ? JSON.stringify(newVal) : newVal))}</span>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            })}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
