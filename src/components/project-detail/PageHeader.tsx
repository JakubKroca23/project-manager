import React, { useEffect } from 'react';
import { ArrowLeft, Hash, Edit2, Save, X, Trash2, Loader2, Building2, User, Flag, Tag, Factory, Wrench, Shield, Calendar, Globe } from 'lucide-react';
import { Project } from '@/types/project';
import { CategoryChip } from '@/components/CategoryChip';
import { cn, formatManager, formatDate } from '@/lib/utils';
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
        <div className="w-full mb-8 print:mb-0">
            <div className="bg-white border-[3px] border-slate-900 overflow-hidden shadow-2xl transition-all duration-300">
                <div className="grid grid-cols-12">
                    {/* Levý sloupec s názvem dokumentu */}
                    <div className="col-span-12 md:col-span-2 border-b-[3px] md:border-b-0 md:border-r-[3px] border-slate-900 p-6 flex flex-col items-center justify-center bg-slate-900 text-white">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] mb-2 opacity-60">Dokumentace</h2>
                        <h1 className="text-xl font-black uppercase tracking-[0.1em] text-center leading-[1.1]">
                            Popis<br /><span className="text-indigo-400">zakázky</span>
                        </h1>
                    </div>

                    {/* Hlavní mřížka s detaily */}
                    <div className="col-span-12 md:col-span-10">
                        {/* Horní řada: ID a Termíny dodání komponent */}
                        <div className="grid grid-cols-1 md:grid-cols-7 border-b-[3px] border-slate-900">
                            <div className="md:col-span-2 border-r-0 md:border-r-[3px] border-b-[3px] md:border-b-0 border-slate-900 flex group hover:bg-slate-50 transition-colors">
                                <span className="bg-slate-100/80 px-3 py-3 text-[10px] font-black uppercase border-r-[3px] border-slate-900 w-36 flex items-center shrink-0 text-slate-500">Číslo zakázky</span>
                                <span className="px-4 py-3 text-base font-black flex items-center text-slate-900">{project.id}</span>
                            </div>
                            <div className="md:col-span-2 border-r-0 md:border-r-[3px] border-b-[3px] md:border-b-0 border-slate-900 flex min-w-0 group hover:bg-slate-50 transition-colors">
                                <span className="bg-slate-100/80 px-3 py-3 text-[10px] font-black uppercase border-r-[3px] border-slate-900 w-36 flex items-center shrink-0 text-slate-500">Dodání<br />podvozku</span>
                                <span className="px-4 py-3 text-[14px] font-black flex items-center text-slate-800">{formatDate(project.chassis_delivery)}</span>
                            </div>
                            <div className="md:col-span-3 flex min-w-0 group hover:bg-slate-50 transition-colors">
                                <span className="bg-slate-100/80 px-3 py-3 text-[10px] font-black uppercase border-r-[3px] border-slate-900 w-36 flex items-center shrink-0 text-slate-500">Dodání<br />nástavby</span>
                                <span className="px-4 py-3 text-[14px] font-black flex items-center text-slate-800">{formatDate(project.body_delivery)}</span>
                            </div>
                        </div>

                        {/* Druhá řada: Počet kusů, Zákazník a Požadovaný termín (Žlutý) */}
                        <div className="grid grid-cols-1 md:grid-cols-7 border-b-[3px] border-slate-900">
                            <div className="md:col-span-2 border-r-0 md:border-r-[3px] border-b-[3px] md:border-b-0 border-slate-900 flex group hover:bg-indigo-50/30 transition-colors">
                                <span className="bg-slate-100/80 px-3 py-3 text-[10px] font-black uppercase border-r-[3px] border-slate-900 w-36 flex items-center shrink-0 text-indigo-700">Počet kusů</span>
                                <span className="px-4 py-3 text-[13px] font-black flex items-center text-indigo-800">{project.quantity || 1} ks</span>
                            </div>
                            <div className="md:col-span-2 border-r-0 md:border-r-[3px] border-b-[3px] md:border-b-0 border-slate-900 flex min-w-0 group hover:bg-slate-50 transition-colors">
                                <span className="bg-slate-100/80 px-3 py-3 text-[10px] font-black uppercase border-r-[3px] border-slate-900 w-36 flex items-center shrink-0 text-slate-500">Zákazník</span>
                                <span className="px-4 py-3 text-[14px] font-black flex items-center truncate text-slate-900" title={p.customer || ''}>{p.customer || '—'}</span>
                            </div>
                            <div className="md:col-span-3 flex min-w-0 bg-yellow-50 hover:bg-yellow-100 transition-colors">
                                <span className="bg-yellow-400 px-3 py-3 text-[10px] font-black uppercase border-r-[3px] border-slate-900 w-36 flex items-center shrink-0 text-rose-900">Požadovaný<br />termín</span>
                                <span className="px-4 py-3 text-lg font-black flex items-center text-rose-600 tracking-tight">{formatDate(project.customer_handover || project.deadline)}</span>
                            </div>
                        </div>

                        {/* Třetí řada: Název projektu */}
                        <div className="flex border-b-[3px] border-slate-900 bg-white group hover:bg-slate-50 transition-colors">
                            <span className="bg-slate-100/80 px-3 py-4 text-[10px] font-black uppercase border-r-[3px] border-slate-900 w-44 flex items-center shrink-0 text-indigo-700">Název projektu</span>
                            <div className="px-5 py-4 flex-1 flex items-center">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={p.name}
                                        onChange={(e) => onChange('name', e.target.value)}
                                        className="w-full text-lg font-black uppercase text-indigo-700 bg-transparent outline-none focus:bg-white p-1 border-b-2 border-indigo-200"
                                    />
                                ) : (
                                    <h1 className="text-xl font-black uppercase text-indigo-900 leading-tight tracking-tight">{project.name}</h1>
                                )}
                            </div>
                        </div>

                        {/* Čtvrtá řada: Podvozek */}
                        <div className="flex border-b-[3px] border-slate-900 bg-white group hover:bg-slate-50 transition-colors">
                            <span className="bg-slate-100/40 px-3 py-3 text-[10px] font-black uppercase border-r-[3px] border-slate-900 w-44 flex items-center shrink-0 text-slate-500">Podvozek</span>
                            <div className="px-5 py-3 flex-1 flex items-center">
                                <span className="text-base font-black uppercase text-slate-800 tracking-wide">
                                    {project.custom_fields?.chassis || 'Specifikace v příloze'}
                                </span>
                            </div>
                        </div>

                        {/* Pátá řada: Typ nástavby */}
                        <div className="flex bg-slate-50 border-slate-900 group">
                            <div className="flex flex-col w-full text-center group-hover:bg-white transition-colors">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 py-2 border-b-2 border-slate-100">Typ nástavby / zařízení</span>
                                <div className="py-4 px-6">
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={p.body_setup || ''}
                                            onChange={(e) => onChange('body_setup', e.target.value)}
                                            className="w-full text-2xl font-black uppercase text-center bg-transparent outline-none italic text-slate-900 border-b-2 border-slate-200"
                                            placeholder="Specifikujte nástavbu..."
                                        />
                                    ) : (
                                        <h3 className="text-3xl font-black uppercase italic text-slate-900 leading-tight tracking-tighter">
                                            {project.body_setup || 'MULTILIFT ULTIMA'}
                                        </h3>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Systémové info v patičce hlavičky (velmi diskrétní) */}
            <div className="flex justify-between items-center px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Aktivní dokument
                    </div>
                    <span>ID: CS-{project.id}-{new Date().getFullYear()}</span>
                </div>
                <div className="flex items-center gap-4">
                    <span>Vytvořeno: {formatDate(project.created_at)}</span>
                    <span className="bg-slate-900 text-white px-3 py-1 rounded">Strana 1 / 1</span>
                </div>
            </div>
        </div>
    );
}
