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
            <div className="bg-white border-[3px] border-black overflow-hidden shadow-2xl transition-all duration-300">
                <div className="grid grid-cols-12">
                    {/* Levý sloupec s názvem dokumentu */}
                    <div className="col-span-12 md:col-span-2 border-b-[3px] md:border-b-0 md:border-r-[3px] border-black p-4 flex items-center justify-center bg-white">
                        <h2 className="text-sm font-black text-black uppercase tracking-[0.2em] text-center leading-tight">
                            Popis<br />zakázky
                        </h2>
                    </div>

                    {/* Hlavní mřížka s detaily */}
                    <div className="col-span-12 md:col-span-10">
                        {/* Horní řada: ID a Termíny dodání komponent */}
                        <div className="grid grid-cols-1 md:grid-cols-7 border-b-[3px] border-black">
                            <div className="md:col-span-2 border-b-[3px] md:border-b-0 md:border-r-[3px] border-black flex">
                                <span className="bg-slate-100/80 px-2 py-2 text-[9px] font-black uppercase border-r-[3px] border-black w-32 flex items-center shrink-0">Číslo zakázky :</span>
                                <span className="px-3 py-2 text-sm font-black flex items-center">{project.id}</span>
                            </div>
                            <div className="md:col-span-2 border-b-[3px] md:border-b-0 md:border-r-[3px] border-black flex min-w-0">
                                <span className="bg-slate-100/80 px-2 py-2 text-[9px] font-black uppercase border-r-[3px] border-black w-32 flex items-center shrink-0">Termín dodání<br />podvozku</span>
                                <span className="px-3 py-2 text-[13px] font-black flex items-center">{formatDate(project.chassis_delivery)}</span>
                            </div>
                            <div className="md:col-span-3 flex min-w-0">
                                <span className="bg-slate-100/80 px-2 py-2 text-[9px] font-black uppercase border-r-[3px] border-black w-32 flex items-center shrink-0">Termín dodání<br />nástavby</span>
                                <span className="px-3 py-2 text-[13px] font-black flex items-center">{formatDate(project.body_delivery)}</span>
                            </div>
                        </div>

                        {/* Druhá řada: Počet kusů, Zákazník a Požadovaný termín (Žlutý) */}
                        <div className="grid grid-cols-1 md:grid-cols-7 border-b-[3px] border-black">
                            <div className="md:col-span-2 border-b-[3px] md:border-b-0 md:border-r-[3px] border-black flex">
                                <span className="bg-slate-100/80 px-2 py-2 text-[9px] font-black uppercase border-r-[3px] border-black w-32 flex items-center shrink-0 text-blue-800">Počet kusů</span>
                                <span className="px-3 py-2 text-[11px] font-black flex items-center text-blue-800">{project.quantity || 1}</span>
                            </div>
                            <div className="md:col-span-2 border-b-[3px] md:border-b-0 md:border-r-[3px] border-black flex min-w-0">
                                <span className="bg-slate-100/80 px-2 py-2 text-[9px] font-black uppercase border-r-[3px] border-black w-32 flex items-center shrink-0">Zákazník :</span>
                                <span className="px-3 py-2 text-[13px] font-black flex items-center truncate" title={p.customer || ''}>{p.customer || '—'}</span>
                            </div>
                            <div className="md:col-span-3 flex min-w-0 bg-yellow-200">
                                <span className="bg-yellow-400 px-2 py-2 text-[9px] font-black uppercase border-r-[3px] border-black w-32 flex items-center shrink-0 text-rose-800">Požadovaný termín dokončení</span>
                                <span className="px-3 py-2 text-[13px] font-black flex items-center text-rose-600">{formatDate(project.customer_handover || project.deadline)}</span>
                            </div>
                        </div>

                        {/* Třetí řada: Název projektu */}
                        <div className="flex border-b-[3px] border-black bg-white">
                            <span className="bg-slate-100/80 px-2 py-2 text-[9px] font-black uppercase border-r-[3px] border-black w-40 flex items-center shrink-0 text-blue-800">Název projektu</span>
                            <div className="px-3 py-2 flex-1 flex items-center">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={p.name}
                                        onChange={(e) => onChange('name', e.target.value)}
                                        className="w-full text-base font-black uppercase text-blue-800 bg-transparent outline-none focus:bg-blue-50/50"
                                    />
                                ) : (
                                    <h1 className="text-[15px] font-black uppercase text-blue-800 leading-tight">{project.name}</h1>
                                )}
                            </div>
                        </div>

                        {/* Čtvrtá řada: Podvozek */}
                        <div className="flex border-b-[3px] border-black bg-white">
                            <span className="bg-slate-100/40 px-2 py-1.5 text-[9px] font-black uppercase border-r-[3px] border-black w-40 flex items-center shrink-0">Podvozek</span>
                            <div className="px-3 py-1.5 flex-1 flex items-center">
                                <span className="text-sm font-black uppercase text-slate-800">
                                    {project.custom_fields?.chassis || 'MERCEDES 6x4'}
                                </span>
                            </div>
                        </div>

                        {/* Pátá řada: Typ nástavby */}
                        <div className="flex bg-slate-50">
                            <div className="flex flex-col w-full text-center">
                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 py-1 border-b border-slate-200">Typ nástavby</span>
                                <div className="py-2 px-3">
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={p.body_setup || ''}
                                            onChange={(e) => onChange('body_setup', e.target.value)}
                                            className="w-full text-base font-black uppercase text-center bg-transparent outline-none italic"
                                        />
                                    ) : (
                                        <h3 className="text-[17px] font-black uppercase italic text-black leading-tight">
                                            {project.body_setup || 'MULTILIFT ULTIMA 21Z59'}
                                        </h3>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Systémové info v patičce hlavičky (velmi diskrétní) */}
            <div className="flex justify-between items-center px-4 py-2 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Dokument ID: CS-{project.id}-{new Date().getFullYear()}
                </div>
                <div>
                    Strana 1 / 1
                </div>
            </div>
        </div>
    );
}
