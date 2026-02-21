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
            case 'S podvozkem': return <Truck size={12} strokeWidth={3} />;
            case 'S nástavbou': return <Box size={12} strokeWidth={3} />;
            default: return <ShoppingCart size={12} strokeWidth={3} />;
        }
    };

    return (
        <div className="bg-white border-2 border-slate-950 rounded-2xl overflow-hidden flex flex-col h-full shadow-[8px_8px_0px_rgba(0,0,0,1)] font-sans">
            <div className="px-6 py-5 border-b-2 border-slate-950 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-slate-950 text-white rounded-xl">
                        <ShoppingCart size={20} strokeWidth={3} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-950">Procurement / Položky</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Technická kontrola objednávek</p>
                    </div>
                </div>
                <div>
                    <span className="text-xs font-black text-slate-950 bg-white border-2 border-slate-950 px-3 py-1 rounded-full shadow-[2px_2px_0px_black]">
                        {items.filter(i => i.status === 'Dodáno').length} / {items.length}
                    </span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-[400px]">
                {loading ? (
                    <div className="flex items-center justify-center h-20 text-slate-950 animate-pulse text-[11px] uppercase font-black tracking-[0.2em]">
                        Načítám seznam...
                    </div>
                ) : items.length === 0 && !isAdding ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
                        <div className="w-16 h-16 bg-slate-50 border-2 border-slate-200 border-dashed rounded-full flex items-center justify-center">
                            <Package size={32} className="text-slate-300" />
                        </div>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Žádné položky k objednání</p>
                    </div>
                ) : (
                    <>
                        {items.map(item => (
                            <div
                                key={item.id}
                                className="group flex items-center justify-between p-4 rounded-2xl bg-white border-2 border-slate-950 hover:bg-slate-50 transition-all shadow-[4px_4px_0px_black] active:translate-y-1 active:shadow-none"
                            >
                                <div className="flex items-center gap-5">
                                    <button
                                        onClick={() => {
                                            const nextStatus = item.status === 'K objednání' ? 'Objednáno' : item.status === 'Objednáno' ? 'Dodáno' : 'K objednání';
                                            updateItem(item.id, { status: nextStatus });
                                        }}
                                        className={cn(
                                            "w-8 h-8 rounded-xl flex items-center justify-center transition-all border-2",
                                            item.status === 'Dodáno'
                                                ? "bg-emerald-500 text-white border-slate-950"
                                                : item.status === 'Objednáno'
                                                    ? "bg-blue-500 text-white border-slate-950"
                                                    : "bg-white border-slate-950 text-slate-950 hover:bg-slate-100"
                                        )}
                                    >
                                        {item.status === 'Dodáno' ? <CheckCircle2 size={18} strokeWidth={3} /> : <div className="w-3 h-3 rounded-full border-[3px] border-current" />}
                                    </button>

                                    <div className="flex flex-col">
                                        <span className={cn(
                                            "text-sm font-black tracking-tight",
                                            item.status === 'Dodáno' ? "text-slate-400 line-through" : "text-slate-950"
                                        )}>
                                            {item.name}
                                        </span>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className={cn(
                                                "text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded border-2 border-slate-950 shadow-[2px_2px_0px_black]",
                                                item.status === 'Dodáno' ? "bg-emerald-100 text-emerald-700" :
                                                    item.status === 'Objednáno' ? "bg-blue-100 text-blue-700" :
                                                        "bg-amber-100 text-amber-700"
                                            )}>
                                                {item.status}
                                            </span>
                                            <button
                                                onClick={() => {
                                                    const nextSource = item.source === 'Samostatně' ? 'S podvozkem' : item.source === 'S podvozkem' ? 'S nástavbou' : 'Samostatně';
                                                    updateItem(item.id, { source: nextSource });
                                                }}
                                                className="text-[9px] font-black uppercase tracking-widest text-slate-950 flex items-center gap-2 hover:bg-white transition-colors bg-slate-100 px-2.5 py-0.5 rounded border-2 border-slate-950 shadow-[2px_2px_0px_black]"
                                            >
                                                {getSourceIcon(item.source)}
                                                {item.source}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => deleteItem(item.id)}
                                        className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                    >
                                        <Trash2 size={18} strokeWidth={3} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </>
                )}

                {isAdding ? (
                    <div className="flex flex-col gap-4 p-5 bg-slate-50 border-2 border-slate-950 rounded-2xl animate-in fade-in slide-in-from-top-2 shadow-[6px_6px_0px_rgba(0,0,0,0.1)]">
                        <input
                            autoFocus
                            type="text"
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addItem()}
                            onBlur={() => !newItemName && setIsAdding(false)}
                            placeholder="Zadejte název součástky..."
                            className="text-sm font-black bg-white border-2 border-slate-950 text-slate-950 rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                        />
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Enter pro uložení</span>
                            <div className="flex items-center gap-3">
                                <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-950 transition-colors">Zrušit</button>
                                <button onClick={addItem} className="px-5 py-2.5 bg-slate-950 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 active:translate-y-0.5 transition-all shadow-[4px_4px_0px_black]">Přidat položku</button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="w-full py-5 border-4 border-dashed border-slate-200 hover:border-slate-950 hover:bg-slate-50 rounded-3xl flex items-center justify-center gap-3 text-slate-300 hover:text-slate-950 transition-all group"
                    >
                        <Plus size={24} strokeWidth={4} className="group-hover:rotate-90 transition-transform duration-300" />
                        <span className="text-xs font-black uppercase tracking-[0.2em]">Nová položka k objednání</span>
                    </button>
                )}
            </div>

            <div className="p-6 bg-slate-50 border-t-2 border-slate-950 flex items-center justify-center gap-8">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-950">
                    <div className="w-3 h-3 rounded-md bg-amber-400 border-2 border-slate-950" /> K objednání
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-950">
                    <div className="w-3 h-3 rounded-md bg-blue-500 border-2 border-slate-950" /> Objednáno
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-950">
                    <div className="w-3 h-3 rounded-md bg-emerald-500 border-2 border-slate-950" /> Dodáno
                </div>
            </div>
        </div>
    );
}
