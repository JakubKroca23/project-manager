import React, { useEffect } from 'react';
import { ArrowLeft, Hash, Edit2, Save, X, Trash2, Loader2, Building2, User, Flag, Tag, Factory, Wrench, Shield, Calendar } from 'lucide-react';
import { Project } from '@/types/project';
import { CategoryChip } from '@/components/CategoryChip';
import { cn, formatManager } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useActions } from '@/providers/ActionProvider';

interface PageHeaderProps {
    project: Project;
    editedProject: Project;
    isEditing: boolean;
    saving: boolean;
    canEdit: boolean;
    typeColor: string;
    onEdit: (editing: boolean) => void;
    onCancel: () => void;
    onSave: () => void;
    onDelete: () => void;
    onChange: (field: keyof Project, value: any) => void;
    managers?: { id: string, email: string }[];
}

export function PageHeader({
    project,
    editedProject,
    isEditing,
    saving,
    canEdit,
    typeColor,
    onEdit,
    onCancel,
    onSave,
    onDelete,
    onChange,
    managers = []
}: PageHeaderProps) {
    const router = useRouter();
    const { setDetailInfo, setDetailActions } = useActions();
    const p = isEditing ? editedProject : project;

    useEffect(() => {
        // NAVBAR LEFT: Back button + Actions
        setDetailInfo(
            <div className="flex items-center gap-4">
                <button
                    onClick={() => {
                        const type = project.project_type || 'civil';
                        router.push(`/projekty?type=${type}`);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-foreground/5 hover:bg-foreground/10 transition-all text-xs font-black uppercase tracking-widest active:scale-95 text-foreground/80 border border-transparent hover:border-border/40"
                >
                    <ArrowLeft size={16} />
                    <span>Zpět</span>
                </button>
                <div className="h-4 w-px bg-border/40" />

                <div className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-300">
                    {isEditing ? (
                        <>
                            <button
                                onClick={onCancel}
                                disabled={saving}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all active:scale-95 flex items-center gap-1"
                                title="Zrušit"
                            >
                                <X size={16} />
                            </button>
                            <button
                                onClick={onSave}
                                disabled={saving}
                                className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest transition-all hover:opacity-95 shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-50"
                            >
                                {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                                <span>Uložit</span>
                            </button>
                            <button
                                onClick={onDelete}
                                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-all active:scale-95"
                                title="Smazat zakázku"
                            >
                                <Trash2 size={16} />
                            </button>
                        </>
                    ) : (
                        canEdit && (
                            <button
                                onClick={() => onEdit(true)}
                                className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 group"
                            >
                                <Edit2 size={13} className="group-hover:rotate-12 transition-transform" />
                                <span>Upravit</span>
                            </button>
                        )
                    )}
                </div>
            </div>
        );

        // NAVBAR CENTER/RIGHT: Clear
        setDetailActions(null);

        return () => {
            setDetailInfo(null);
            setDetailActions(null);
        };
    }, [project, editedProject, isEditing, saving, canEdit, p.name, p.project_type, onChange, onEdit, onCancel, onSave, onDelete, setDetailInfo, setDetailActions, router]);

    return (
        <div className="w-full mb-6 text-left">
            <div className="flex flex-col items-start p-6 bg-card/30 backdrop-blur-sm border border-border/50 rounded-2xl shadow-sm hover:border-border/80 transition-all duration-300 overflow-hidden group">
                {/* Horní část: Nadpis a ID */}
                <div className="w-full space-y-6">
                    <div className="flex flex-col gap-1">
                        <div className="flex flex-wrap items-end gap-x-12 px-1">


                            <div className="flex flex-col gap-1.5 min-w-0">
                                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 flex items-center gap-1.5">
                                    <Hash size={11} className="text-muted-foreground/30" />
                                    Číslo OP
                                </label>
                                <div className="h-10 flex items-center">
                                    <span className="text-lg font-black text-foreground tracking-tight leading-none">{project.id}</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5 min-w-0">
                                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 flex items-center gap-1.5">
                                    <Building2 size={11} className="text-muted-foreground/30" />
                                    Název zakázky
                                </label>
                                <div className="h-10 flex items-center">
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={p.name}
                                            onChange={(e) => onChange('name', e.target.value)}
                                            className="text-lg font-black bg-transparent border-b-2 border-primary/30 outline-none focus:border-primary transition-colors min-w-[300px] leading-none py-1"
                                            placeholder="Zadejte název zakázky..."
                                            autoFocus
                                        />
                                    ) : (
                                        <h1 className="text-lg font-black text-foreground tracking-tight leading-none">{project.name}</h1>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5 min-w-0">
                                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 flex items-center gap-1.5">
                                    <Building2 size={11} className="text-muted-foreground/30" />
                                    Zákazník
                                </label>
                                <div className="h-10 flex items-center">
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={p.customer || ''}
                                            onChange={(e) => onChange('customer', e.target.value)}
                                            className="text-lg font-black bg-transparent border-b-2 border-primary/30 outline-none focus:border-primary transition-colors min-w-[200px] leading-none py-1"
                                            placeholder="Zadejte zákazníka..."
                                        />
                                    ) : (
                                        <span className="text-lg font-black text-foreground tracking-tight leading-none">{project.customer || '—'}</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5 min-w-0">
                                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 flex items-center gap-1.5">
                                    <User size={11} className="text-muted-foreground/30" />
                                    Vedoucí zakázky
                                </label>
                                <div className="h-10 flex items-center">
                                    {isEditing ? (
                                        <select
                                            value={p.manager || ''}
                                            onChange={(e) => onChange('manager', e.target.value)}
                                            className="text-lg font-black bg-transparent border-b-2 border-primary/30 outline-none focus:border-primary transition-colors min-w-[200px] leading-none py-1 appearance-none cursor-pointer"
                                        >
                                            <option value="" disabled>Vyberte...</option>
                                            {managers.map(m => (
                                                <option key={m.id} value={m.email}>{formatManager(m.email)}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <span className="text-lg font-black text-foreground tracking-tight leading-none">
                                            {formatManager(project.manager)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Spodní část: Metadata */}
                <div className="w-full mt-5 pt-5 border-t border-border/40">
                    <div className="flex flex-wrap items-center gap-x-10 gap-y-6 flex-1">
                        {/* Priority Column */}
                        <div className="flex flex-col gap-2 min-w-0">
                            <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 flex items-center gap-1.5">
                                <Flag size={11} className="text-muted-foreground/30" />
                                Priorita
                            </label>
                            {isEditing ? (
                                <select
                                    value={p.priority || 2}
                                    onChange={(e) => onChange('priority', parseInt(e.target.value))}
                                    className="text-sm font-black bg-background border border-border/50 rounded-xl px-3 h-10 outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                                >
                                    <option value={1}>Urgentní</option>
                                    <option value={2}>Normální</option>
                                    <option value={3}>Nízká</option>
                                </select>
                            ) : (
                                <div className={cn(
                                    "flex items-center gap-2.5 px-3 py-1.5 border rounded-xl shadow-sm h-10 transition-all duration-300",
                                    p.priority === 1 ? 'bg-rose-500/5 border-rose-500/20 text-rose-600' :
                                        p.priority === 3 ? 'bg-slate-500/5 border-slate-500/20 text-slate-500' :
                                            'bg-blue-500/5 border-blue-500/20 text-blue-600'
                                )}>
                                    <span className={cn(
                                        "w-2.5 h-2.5 rounded-full shadow-sm",
                                        p.priority === 1 ? 'bg-rose-500 animate-pulse' :
                                            p.priority === 3 ? 'bg-slate-400' :
                                                'bg-blue-500'
                                    )} />
                                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                                        {p.priority === 1 ? 'Urgentní' : p.priority === 3 ? 'Nízká' : 'Normální'}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Production Status Column */}
                        <div className="flex flex-col gap-2 min-w-0">
                            <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 flex items-center gap-1.5">
                                <Factory size={11} className="text-muted-foreground/30" />
                                Stav výroby
                            </label>
                            {isEditing ? (
                                <select
                                    value={p.production_status || 'V procesu'}
                                    onChange={(e) => onChange('production_status', e.target.value)}
                                    className="text-sm font-black bg-background border border-border/50 rounded-xl px-3 h-10 outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm cursor-pointer"
                                >
                                    <option value="V procesu">V procesu</option>
                                    <option value="Čeká na díly">Čeká na díly</option>
                                    <option value="Dokončeno">Dokončeno</option>
                                    <option value="-">-</option>
                                </select>
                            ) : (
                                <div className={cn(
                                    "flex items-center gap-2.5 px-3 py-1.5 border rounded-xl shadow-sm h-10 transition-all duration-300",
                                    p.production_status === 'Dokončeno' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600' :
                                        p.production_status === 'Čeká na díly' ? 'bg-amber-500/5 border-amber-500/20 text-amber-600' :
                                            p.production_status === 'V procesu' ? 'bg-blue-500/5 border-blue-500/20 text-blue-600' :
                                                'bg-muted/30 border-border/50 text-foreground/70'
                                )}>
                                    <span className={cn(
                                        "w-2.5 h-2.5 rounded-full",
                                        p.production_status === 'Dokončeno' ? 'bg-emerald-500' :
                                            p.production_status === 'Čeká na díly' ? 'bg-amber-500 animate-pulse' :
                                                p.production_status === 'V procesu' ? 'bg-blue-500 animate-pulse' :
                                                    'bg-muted-foreground/40'
                                    )} />
                                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                                        {p.production_status || '—'}
                                    </span>
                                </div>
                            )}
                        </div>

                        <MetaItem label="Montážní firma" value={p.mounting_company} field="mounting_company" isEditing={isEditing} onChange={onChange} icon={<Wrench size={11} />} />
                        <MetaItem label="Nastavení nástavby" value={p.body_setup} field="body_setup" isEditing={isEditing} onChange={onChange} icon={<Shield size={11} />} />
                        <MetaItem label="Abra Zakázka" value={p.abra_project} field="abra_project" isEditing={isEditing} onChange={onChange} icon={<Hash size={11} />} />
                        <MetaItem label="Abra Objednávka" value={p.abra_order} field="abra_order" isEditing={isEditing} onChange={onChange} icon={<Hash size={11} />} />



                    </div>
                </div>
            </div>
        </div>
    );
}

function MetaItem({ label, value, field, isEditing, onChange, icon }: { label: string, value: any, field: keyof Project, isEditing: boolean, onChange: (field: keyof Project, value: any) => void, icon?: React.ReactNode }) {
    return (
        <div className="space-y-1.5 group/item">
            <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 block group-hover/item:text-primary/60 transition-colors">{label}</label>
            {isEditing ? (
                <input
                    type="text"
                    value={String(value || '')}
                    onChange={(e) => onChange(field, e.target.value)}
                    className="w-full text-xs font-bold bg-background border border-border/50 rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-primary/20"
                />
            ) : (
                <div className="flex items-center gap-2 text-xs font-bold text-foreground/90 truncate">
                    {icon && <span className="text-muted-foreground/40">{icon}</span>}
                    <span className="truncate" title={String(value || '')}>{value || '—'}</span>
                </div>
            )}
        </div>
    );
}
