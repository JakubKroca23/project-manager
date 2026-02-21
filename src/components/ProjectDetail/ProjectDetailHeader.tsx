'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit2, Save, X, Trash2, Loader2 } from 'lucide-react';
import { Project } from '@/types/project';

interface ProjectDetailHeaderProps {
    project: Project;
    typeColor: string;
    isEditing: boolean;
    saving: boolean;
    onEdit: () => void;
    onCancel: () => void;
    onSave: () => void;
    onDelete: () => void;
}

export function ProjectDetailHeader({
    project,
    typeColor,
    isEditing,
    saving,
    onEdit,
    onCancel,
    onSave,
    onDelete
}: ProjectDetailHeaderProps) {
    const router = useRouter();

    return (
        <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border/50">
            <div
                className="absolute top-0 left-0 right-0 h-[2px] transition-colors duration-500"
                style={{ backgroundColor: typeColor, boxShadow: `0 0 8px ${typeColor}33` }}
            />
            <div className="max-w-[1400px] mx-auto px-4 h-10 flex items-center justify-between">
                <button
                    onClick={() => router.push('/projekty')}
                    className="group flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-muted/50 hover:bg-muted transition-all border border-transparent hover:border-border/50 text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
                    Zpět
                </button>

                <div className="flex items-center gap-2">
                    {isEditing && (
                        <button
                            onClick={onDelete}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-500/20 text-[10px] font-bold uppercase tracking-wider transition-all"
                        >
                            <Trash2 size={12} /> Smazat
                        </button>
                    )}
                    {isEditing ? (
                        <>
                            <button
                                onClick={onCancel}
                                disabled={saving}
                                className="px-3 py-1 rounded-md border border-border text-muted-foreground hover:text-foreground text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5"
                            >
                                <X size={12} /> Zrušit
                            </button>
                            <button
                                onClick={onSave}
                                disabled={saving}
                                className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider transition-all hover:opacity-90 shadow-sm"
                            >
                                {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                                Uložit
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onEdit}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-primary/10 hover:bg-primary/20 text-primary border border-primary/10 text-[10px] font-bold uppercase tracking-wider transition-all"
                        >
                            <Edit2 size={12} /> Upravit
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
