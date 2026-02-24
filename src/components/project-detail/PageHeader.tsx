import React from 'react';
import { ArrowLeft, Hash, Edit2, Save, X, Trash2, Loader2, Building2, User } from 'lucide-react';
import { Project } from '@/types/project';
import { CategoryChip } from '@/components/CategoryChip';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

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
    onChange
}: PageHeaderProps) {
    const router = useRouter();
    const p = isEditing ? editedProject : project;

    return (
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/50 transition-all duration-500">
            <div
                className="absolute top-0 left-0 right-0 h-[3px] transition-colors duration-700"
                style={{ backgroundColor: typeColor, boxShadow: `0 0 12px ${typeColor}44` }}
            />
            <div className="max-w-[1400px] mx-auto px-4 h-12 flex items-center justify-between">
                <button
                    onClick={() => router.push('/projekty')}
                    className="group flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-muted/30 hover:bg-muted transition-all border border-transparent hover:border-border/40 text-muted-foreground hover:text-foreground active:scale-95"
                >
                    <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
                    Zpět do seznamu
                </button>

                <div className="flex items-center gap-2.5">
                    {isEditing && (
                        <button
                            onClick={onDelete}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-500/10 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                        >
                            <Trash2 size={13} /> Smazat
                        </button>
                    )}
                    {isEditing ? (
                        <>
                            <button
                                onClick={onCancel}
                                disabled={saving}
                                className="px-4 py-1.5 rounded-lg border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/50 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2"
                            >
                                <X size={13} /> Zrušit
                            </button>
                            <button
                                onClick={onSave}
                                disabled={saving}
                                className="flex items-center gap-2 px-5 py-1.5 rounded-lg bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest transition-all hover:opacity-95 shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-50"
                            >
                                {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                                Uložit změny
                            </button>
                        </>
                    ) : (
                        canEdit && (
                            <button
                                onClick={() => onEdit(true)}
                                className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-[10px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95"
                            >
                                <Edit2 size={13} /> Upravit zakázku
                            </button>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}

interface ProjectInfoCardProps {
    project: Project;
    editedProject: Project;
    isEditing: boolean;
    onChange: (field: keyof Project, value: any) => void;
}

export function ProjectInfoCard({ project, editedProject, isEditing, onChange }: ProjectInfoCardProps) {
    const p = isEditing ? editedProject : project;

    return (
        <div className="bg-muted/30 border border-border/50 rounded-2xl p-5 mb-6 shadow-sm group hover:shadow-md hover:border-border/80 transition-all duration-300">
            <div className="space-y-4">
                {/* Row 1: Badges & Status */}
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative">
                        <span className={cn(
                            "px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-colors",
                            p.project_type === 'military'
                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                : 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                        )}>
                            {p.project_type === 'military' ? 'Vojenské' : 'Civilní'}
                        </span>
                        {isEditing && (
                            <select
                                value={p.project_type}
                                onChange={(e) => onChange('project_type', e.target.value as any)}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            >
                                <option value="civil">Civilní</option>
                                <option value="military">Vojenské</option>
                            </select>
                        )}
                    </div>

                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-background/50 border border-border/50 rounded-lg text-[10px] font-mono text-muted-foreground/80 shadow-sm">
                        <Hash size={10} />
                        {project.id}
                    </div>

                    <div className="flex items-center gap-2 px-2.5 py-0.5 bg-background/50 border border-border/50 rounded-lg shadow-sm ml-auto sm:ml-0">
                        <span className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            project.status === 'Aktivní' ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/40'
                        )} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground/70">
                            {project.status}
                        </span>
                    </div>
                </div>

                {/* Row 2: Title */}
                <div className="max-w-5xl">
                    {isEditing ? (
                        <input
                            type="text"
                            value={p.name}
                            onChange={(e) => onChange('name', e.target.value)}
                            className="text-2xl font-black w-full bg-background border border-primary/30 rounded-xl px-3 py-2 focus:ring-4 focus:ring-primary/5 transition-all outline-none shadow-sm"
                            placeholder="Název zakázky"
                        />
                    ) : (
                        <h1 className="text-2xl font-black text-foreground leading-tight tracking-tight group-hover:text-primary transition-colors duration-300">
                            {project.name}
                        </h1>
                    )}
                </div>

                {/* Row 3: Metadata Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-4 pt-4 border-t border-border/30">
                    <MetaItem label="Abra Zakázka" value={p.abra_project} field="abra_project" isEditing={isEditing} onChange={onChange} icon={<Hash size={12} />} />
                    <MetaItem label="Abra Objednávka" value={p.abra_order} field="abra_order" isEditing={isEditing} onChange={onChange} icon={<Hash size={12} />} />
                    <MetaItem label="Zákazník" value={p.customer} field="customer" isEditing={isEditing} onChange={onChange} icon={<Building2 size={12} />} />
                    <MetaItem label="Vedoucí projektu" value={p.manager} field="manager" isEditing={isEditing} onChange={onChange} icon={<User size={12} />} />
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 block">Kategorie</label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={p.category || ''}
                                onChange={(e) => onChange('category', e.target.value)}
                                className="w-full text-xs font-bold bg-background/50 border border-border/50 rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-primary/20"
                            />
                        ) : (
                            <CategoryChip value={p.category} className="text-[9px] px-2 py-0.5" />
                        )}
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 block">Priorita</label>
                        {isEditing ? (
                            <select
                                value={p.priority || 2}
                                onChange={(e) => onChange('priority', parseInt(e.target.value))}
                                className="w-full text-xs font-bold bg-background/50 border border-border/50 rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-primary/20 cursor-pointer"
                            >
                                <option value={1}>Urgentní</option>
                                <option value={2}>Normální</option>
                                <option value={3}>Nízká</option>
                            </select>
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className={cn(
                                    "w-2 h-2 rounded-full shadow-sm",
                                    p.priority === 1 ? "bg-rose-500 shadow-rose-500/20" : p.priority === 3 ? "bg-slate-400" : "bg-blue-500 shadow-blue-500/20"
                                )} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/80">
                                    {p.priority === 1 ? 'Urgentní' : p.priority === 3 ? 'Nízká' : 'Normální'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetaItem({ label, value, field, isEditing, onChange, icon }: { label: string, value: any, field: keyof Project, isEditing: boolean, onChange: (field: keyof Project, value: any) => void, icon?: React.ReactNode }) {
    return (
        <div className="space-y-1 group/item">
            <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 block group-hover/item:text-primary/60 transition-colors">{label}</label>
            {isEditing ? (
                <input
                    type="text"
                    value={String(value || '')}
                    onChange={(e) => onChange(field, e.target.value)}
                    className="w-full text-xs font-bold bg-background/50 border border-border/50 rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-primary/20"
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
