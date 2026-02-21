'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { ProjectItem } from '@/types/project';
import {
    Package,
    Plus,
    Truck,
    Box,
    Trash2,
    CheckCircle2,
    Clock,
    ShoppingCart,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectDetailOrderingProps {
    projectId: string;
    isEditing: boolean;
}

export function ProjectDetailOrdering({ projectId, isEditing }: ProjectDetailOrderingProps) {
    const [items, setItems] = useState<ProjectItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [newItemName, setNewItemName] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        fetchItems();
    }, [projectId]);

    async function fetchItems() {
        setLoading(true);
        const { data, error } = await supabase
            .from('project_items')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: true });

        if (!error) {
            setItems(data || []);
        }
        setLoading(false);
    }

    async function addItem() {
        if (!newItemName.trim()) return;

        const { data, error } = await supabase
            .from('project_items')
            .insert({
                project_id: projectId,
                name: newItemName.trim(),
                status: 'K objednání',
                category: 'Příslušenství',
                source: 'Samostatně'
            })
            .select()
            .single();

        if (!error && data) {
            setItems([...items, data]);
            setNewItemName('');
            setIsAdding(false);
        }
    }

    async function updateItem(id: string, updates: Partial<ProjectItem>) {
        const { error } = await supabase
            .from('project_items')
            .update(updates)
            .eq('id', id);

        if (!error) {
            setItems(items.map(item => item.id === id ? { ...item, ...updates } : item));
        }
    }

    async function deleteItem(id: string) {
        if (!confirm('Opravdu smazat tuto položku?')) return;
        const { error } = await supabase
            .from('project_items')
            .delete()
            .eq('id', id);

        if (!error) {
            setItems(items.filter(item => item.id !== id));
        }
    }

    const getSourceIcon = (source: string) => {
        switch (source) {
            case 'S podvozkem': return <Truck size={12} />;
            case 'S nástavbou': return <Box size={12} />;
            default: return <ShoppingCart size={12} />;
        }
    };

    return (
        <div className="bg-white/40 backdrop-blur-3xl border border-white/50 rounded-3xl overflow-hidden flex flex-col h-full shadow-2xl shadow-slate-200/50">
            <div className="px-6 py-5 border-b border-slate-200/50 flex items-center justify-between bg-white/40">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 text-primary rounded-2xl border border-primary/10 shadow-inner">
                        <ShoppingCart size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Procurement / Položky</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Správa komponentů</p>
                    </div>
                </div>
                <div>
                    <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-sm">
                        {items.filter(i => i.status === 'Dodáno').length} / {items.length}
                    </span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3 min-h-[400px] scrollbar-thin scrollbar-thumb-slate-200">
                {loading ? (
                    <div className="flex items-center justify-center h-20 text-slate-400 animate-pulse text-[11px] uppercase font-bold tracking-widest">
                        Načítám...
                    </div>
                ) : items.length === 0 && !isAdding ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
                        <Package size={32} className="text-slate-300 mb-4" />
                        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Žádné položky</p>
                    </div>
                ) : (
                    <>
                        {items.map(item => (
                            <div
                                key={item.id}
                                className="group flex items-center justify-between p-4 rounded-2xl bg-white/80 border border-white/40 hover:border-primary/30 transition-all shadow-sm hover:shadow-md"
                            >
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => {
                                            const nextStatus = item.status === 'K objednání' ? 'Objednáno' : item.status === 'Objednáno' ? 'Dodáno' : 'K objednání';
                                            updateItem(item.id, { status: nextStatus });
                                        }}
                                        className={cn(
                                            "w-8 h-8 rounded-xl flex items-center justify-center transition-all",
                                            item.status === 'Dodáno'
                                                ? "bg-emerald-500/20 text-emerald-600 shadow-inner shadow-emerald-500/10"
                                                : item.status === 'Objednáno'
                                                    ? "bg-blue-500/20 text-blue-600 shadow-inner shadow-blue-500/10"
                                                    : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                                        )}
                                    >
                                        {item.status === 'Dodáno' ? <CheckCircle2 size={18} /> :
                                            item.status === 'Objednáno' ? <Clock size={18} /> :
                                                <div className="w-2 h-2 rounded-full border-2 border-current opacity-30" />}
                                    </button>

                                    <div className="flex flex-col">
                                        <span className={cn(
                                            "text-sm font-bold tracking-tight",
                                            item.status === 'Dodáno' ? "text-slate-400 line-through" : "text-slate-800"
                                        )}>
                                            {item.name}
                                        </span>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className={cn(
                                                "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border",
                                                item.status === 'Dodáno' ? "bg-emerald-50 border-emerald-100 text-emerald-700" :
                                                    item.status === 'Objednáno' ? "bg-blue-50 border-blue-100 text-blue-700" :
                                                        "bg-amber-50 border-amber-100 text-amber-700"
                                            )}>
                                                {item.status}
                                            </span>
                                            <button
                                                onClick={() => {
                                                    const nextSource = item.source === 'Samostatně' ? 'S podvozkem' : item.source === 'S podvozkem' ? 'S nástavbou' : 'Samostatně';
                                                    updateItem(item.id, { source: nextSource });
                                                }}
                                                className="text-[9px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5 hover:text-slate-700 transition-colors bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-lg"
                                            >
                                                {getSourceIcon(item.source)}
                                                {item.source}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => deleteItem(item.id)}
                                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </>
                )}

                {isAdding ? (
                    <div className="flex flex-col gap-3 p-4 bg-white/80 border border-primary/20 rounded-2xl animate-in fade-in slide-in-from-top-2 shadow-lg shadow-primary/5">
                        <input
                            autoFocus
                            type="text"
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addItem()}
                            onBlur={() => !newItemName && setIsAdding(false)}
                            placeholder="Název položky..."
                            className="text-sm font-bold bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                        />
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Enter pro uložení</span>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setIsAdding(false)} className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">Zrušit</button>
                                <button onClick={addItem} className="px-5 py-2 bg-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all">Přidat</button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="w-full py-5 border-2 border-dashed border-slate-200 hover:border-primary/40 hover:bg-primary/5 rounded-3xl flex items-center justify-center gap-3 text-slate-300 hover:text-primary transition-all group"
                    >
                        <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                        <span className="text-xs font-bold uppercase tracking-[0.2em]">Přidat položku</span>
                    </button>
                )}
            </div>

            <div className="p-6 bg-white/40 border-t border-slate-200/50 flex items-center justify-center gap-8">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" /> K objednání
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Objednáno
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Dodáno
                </div>
            </div>
        </div>
    );
}
