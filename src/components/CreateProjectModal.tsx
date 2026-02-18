'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { X, Loader2, Plus } from 'lucide-react';
import { Project } from '@/types/project';

interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    projectType: 'civil' | 'military' | 'service';
}

/**
 * Komponenta pro vytvoření nové zakázky nebo servisu.
 */
export default function CreateProjectModal({ isOpen, onClose, onSuccess, projectType }: CreateProjectModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        customer: '',
        manager: '',
        status: 'Nový',
        category: '',
        serial_number: '',
        body_type: '',
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const newProject: Partial<Project> = {
            ...formData,
            project_type: projectType,
            quantity: 1,
            action_needed_by: 'internal',
            created_at: new Date().toISOString()
        };

        const { error } = await supabase
            .from('projects')
            .insert([newProject]);

        if (error) {
            console.error('Error creating project:', error);
            alert('Nepodařilo se vytvořit záznam: ' + error.message);
        } else {
            onSuccess();
            onClose();
            setFormData({
                id: '',
                name: '',
                customer: '',
                manager: '',
                status: 'Nový',
                category: '',
                serial_number: '',
                body_type: '',
            });
        }
        setIsLoading(false);
    };

    const title = projectType === 'service' ? 'Nový servis' : 'Nová zakázka';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-background border border-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Plus className="text-primary" size={18} />
                        </div>
                        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Kód / ID</label>
                            <input
                                required
                                value={formData.id}
                                onChange={e => setFormData({ ...formData, id: e.target.value })}
                                className="w-full bg-muted/50 border border-border/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all font-medium"
                                placeholder="např. Z2024001"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Název / Předmět</label>
                            <input
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-muted/50 border border-border/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all font-medium"
                                placeholder="..."
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Klient</label>
                        <input
                            required
                            value={formData.customer}
                            onChange={e => setFormData({ ...formData, customer: e.target.value })}
                            className="w-full bg-muted/50 border border-border/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all font-medium"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Vedoucí projektu</label>
                            <input
                                required
                                value={formData.manager}
                                onChange={e => setFormData({ ...formData, manager: e.target.value })}
                                className="w-full bg-muted/50 border border-border/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all font-medium"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Kategorie</label>
                            <input
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                className="w-full bg-muted/50 border border-border/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all font-medium"
                                placeholder="např. Hydropohony"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Stav</label>
                            <select
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                                className="w-full bg-muted/50 border border-border/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all font-medium"
                            >
                                <option value="Nový">Nový</option>
                                <option value="Rozpracováno">Rozpracováno</option>
                                <option value="Cenová nabídka">Cenová nabídka</option>
                                <option value="Čeká na díly">Čeká na díly</option>
                                <option value="Hotovo">Hotovo</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">VIN / Výrobní číslo</label>
                            <input
                                value={formData.serial_number}
                                onChange={e => setFormData({ ...formData, serial_number: e.target.value })}
                                className="w-full bg-muted/50 border border-border/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all font-medium"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Typ nástavby</label>
                        <input
                            value={formData.body_type}
                            onChange={e => setFormData({ ...formData, body_type: e.target.value })}
                            className="w-full bg-muted/50 border border-border/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all font-medium"
                            placeholder="např. Sklápěč, Valník..."
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 bg-muted hover:bg-muted/80 text-foreground rounded-xl font-bold text-[11px] uppercase tracking-wider transition-all"
                        >
                            Zrušit
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-[11px] uppercase tracking-wider shadow-lg shadow-primary/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                            Vytvořit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
