import React, { useEffect } from 'react';
import { ArrowLeft, Hash, Edit2, Save, X, Trash2, Loader2, Building2, User, Flag, Tag, Factory, Wrench, Shield, Calendar, Globe } from 'lucide-react';
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
        <div className="w-full mb-6">
            <div className="bg-white border-[3px] border-slate-300 rounded-2xl overflow-hidden shadow-xl transition-all duration-300">
                <div className="grid grid-cols-1 md:grid-cols-6 border-b-[3px] border-slate-300">
                    {/* Řada 1: Klíčové identifikátory */}
                    <div className="p-2.5 border-r-2 border-slate-200 flex flex-col gap-1 bg-slate-50/80">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                            <Hash size={10} /> OP
                        </label>
                        <span className="text-sm font-black text-slate-900 leading-none">{project.id}</span>
                    </div>

                    <div className="p-2.5 border-r-2 border-slate-200 flex flex-col gap-1 md:col-span-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                            <Building2 size={10} /> Název zakázky
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={p.name}
                                onChange={(e) => onChange('name', e.target.value)}
                                className="text-sm font-black bg-slate-50 border-b-2 border-primary/40 outline-none focus:border-primary transition-all w-full leading-none py-0.5"
                                placeholder="Název..."
                            />
                        ) : (
                            <h1 className="text-sm font-black text-slate-900 leading-none truncate" title={project.name}>{project.name}</h1>
                        )}
                    </div>

                    <div className="p-2.5 border-r-2 border-slate-200 flex flex-col gap-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                            <User size={10} /> Zákazník
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={p.customer || ''}
                                onChange={(e) => onChange('customer', e.target.value)}
                                className="text-xs font-black bg-slate-50 border-b border-primary/20 outline-none focus:border-primary transition-all w-full py-0.5"
                            />
                        ) : (
                            <span className="text-xs font-black text-slate-800 leading-none truncate" title={project.customer || ''}>{project.customer || '—'}</span>
                        )}
                    </div>

                    <div className="p-2.5 border-r-2 border-slate-200 flex flex-col gap-1 bg-slate-50/40">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                            <Globe size={10} /> Abra Proj
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={p.abra_project || ''}
                                onChange={(e) => onChange('abra_project', e.target.value)}
                                className="text-xs font-black bg-white border border-slate-300 rounded px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-primary/20"
                            />
                        ) : (
                            <span className="text-xs font-black text-slate-700 leading-none">{project.abra_project || '—'}</span>
                        )}
                    </div>

                    <div className="p-2.5 flex flex-col gap-1 bg-slate-50/40">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                            <Hash size={10} /> Abra Obj
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={p.abra_order || ''}
                                onChange={(e) => onChange('abra_order', e.target.value)}
                                className="text-xs font-black bg-white border border-slate-300 rounded px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-primary/20"
                            />
                        ) : (
                            <span className="text-xs font-black text-slate-700 leading-none">{project.abra_order || '—'}</span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-6">
                    {/* Řada 2: Detaily a statusy */}
                    <div className="p-2.5 border-r-2 border-slate-200 flex flex-col gap-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                            <User size={10} /> Vedoucí
                        </label>
                        {isEditing ? (
                            <select
                                value={p.manager || ''}
                                onChange={(e) => onChange('manager', e.target.value)}
                                className="text-xs font-black bg-slate-50 border-b border-primary/20 outline-none focus:border-primary transition-all w-full py-0.5 appearance-none cursor-pointer"
                            >
                                <option value="" disabled>Vyberte...</option>
                                {managers.map(m => (
                                    <option key={m.id} value={m.email}>{formatManager(m.email)}</option>
                                ))}
                            </select>
                        ) : (
                            <span className="text-xs font-black text-slate-800 leading-none">{formatManager(project.manager)}</span>
                        )}
                    </div>

                    <div className="p-2.5 border-r-2 border-slate-200 flex flex-col gap-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                            <Wrench size={10} /> Montáž
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={p.mounting_company || ''}
                                onChange={(e) => onChange('mounting_company', e.target.value)}
                                className="text-xs font-black bg-slate-50 border-b border-primary/20 outline-none focus:border-primary transition-all w-full py-0.5"
                            />
                        ) : (
                            <span className="text-xs font-black text-slate-700 leading-none truncate" title={project.mounting_company || ''}>{project.mounting_company || '—'}</span>
                        )}
                    </div>

                    <div className="p-2.5 border-r-2 border-slate-200 md:col-span-2 flex flex-col gap-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                            <Shield size={10} /> Nastavení nástavby
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={p.body_setup || ''}
                                onChange={(e) => onChange('body_setup', e.target.value)}
                                className="text-xs font-black bg-slate-50 border-b border-primary/20 outline-none focus:border-primary transition-all w-full py-0.5"
                            />
                        ) : (
                            <span className="text-xs font-black text-slate-700 leading-none truncate" title={project.body_setup || ''}>{project.body_setup || '—'}</span>
                        )}
                    </div>

                    <div className="p-2.5 border-r-2 border-slate-200 flex flex-col gap-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                            <Flag size={10} /> Priorita
                        </label>
                        {isEditing ? (
                            <select
                                value={p.priority || 2}
                                onChange={(e) => onChange('priority', parseInt(e.target.value))}
                                className="text-[10px] font-black bg-white border border-slate-300 rounded px-1.5 h-6 outline-none"
                            >
                                <option value={1}>Urgentní</option>
                                <option value={2}>Normální</option>
                                <option value={3}>Nízká</option>
                            </select>
                        ) : (
                            <div className={cn(
                                "flex items-center gap-1.5 px-2 py-0.5 border-2 rounded-md w-fit h-6 shadow-sm",
                                p.priority === 1 ? 'border-rose-500 bg-rose-50 text-rose-700' :
                                    p.priority === 3 ? 'border-slate-300 bg-slate-50 text-slate-500' :
                                        'border-blue-500 bg-blue-50 text-blue-700'
                            )}>
                                <span className={cn(
                                    "w-1.5 h-1.5 rounded-full",
                                    p.priority === 1 ? 'bg-rose-500 animate-pulse' :
                                        p.priority === 3 ? 'bg-slate-400' :
                                            'bg-blue-500'
                                )} />
                                <span className="text-[9px] font-black uppercase tracking-tighter">
                                    {p.priority === 1 ? 'Urgentní' : p.priority === 3 ? 'Nízká' : 'Normální'}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="p-2.5 flex flex-col gap-1.5 bg-slate-50/20">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                            <Factory size={10} /> Výroba
                        </label>
                        {isEditing ? (
                            <select
                                value={p.production_status || 'V procesu'}
                                onChange={(e) => onChange('production_status', e.target.value)}
                                className="text-[10px] font-black bg-white border border-slate-300 rounded px-1.5 h-6 outline-none"
                            >
                                <option value="V procesu">V procesu</option>
                                <option value="Čeká na díly">Čeká na díly</option>
                                <option value="Dokončeno">Dokončeno</option>
                                <option value="-">-</option>
                            </select>
                        ) : (
                            <div className={cn(
                                "flex items-center gap-1.5 px-2 py-0.5 border-2 rounded-md w-fit h-6 shadow-sm",
                                p.production_status === 'Dokončeno' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' :
                                    p.production_status === 'Čeká na díly' ? 'border-amber-500 bg-amber-50 text-amber-700' :
                                        p.production_status === 'V procesu' ? 'border-blue-500 bg-blue-50 text-blue-700' :
                                            'border-slate-300 bg-slate-50 text-slate-600'
                            )}>
                                <span className={cn(
                                    "w-1.5 h-1.5 rounded-full",
                                    p.production_status === 'Dokončeno' ? 'bg-emerald-500' :
                                        p.production_status === 'Čeká na díly' ? 'bg-amber-500' :
                                            p.production_status === 'V procesu' ? 'bg-blue-500 animate-pulse' :
                                                'bg-slate-400'
                                )} />
                                <span className="text-[9px] font-black uppercase tracking-tighter">
                                    {p.production_status || '—'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Velmi diskrétní patička systému */}
                <div className="bg-slate-50 border-t-2 border-slate-200 px-3 py-1 flex justify-between items-center text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">
                    <div className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                        System Ready
                    </div>
                    <div>
                        Last Sync: {new Date().toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            </div>
        </div>
    );
}
