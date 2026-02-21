'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { ProjectItem } from '@/types/project';
import {
    Package,
    Plus,
    Truck,
    Box,
    Zap,
    Trash2,
    CheckCircle2,
    Clock,
    AlertCircle,
    ShoppingCart
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Dodáno': return 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30';
            case 'Objednáno': return 'bg-blue-600/20 text-blue-400 border-blue-500/30';
            default: return 'bg-amber-600/20 text-amber-400 border-amber-500/30';
        }
    };

    const getSourceIcon = (source: string) => {
        switch (source) {
            case 'S podvozkem': return <Truck size={10} />;
            case 'S nástavbou': return <Box size={10} />;
            default: return <ShoppingCart size={10} />;
        }
    };

    return (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col h-full shadow-2xl">
            <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 text-primary rounded-xl border border-primary/20">
                        <ShoppingCart size={18} />
                    </div>
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-zinc-100">Procurement / Položky</h3>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">Správa komponentů</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-zinc-400 bg-zinc-800 px-2.5 py-1 rounded-full border border-zinc-700">
                        {items.filter(i => i.status === 'Dodáno').length} / {items.length}
                    </span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3 min-h-[400px]">
                {loading ? (
                    <div className="flex items-center justify-center h-20 text-zinc-600 animate-pulse text-[10px] uppercase font-black tracking-widest">
                        Načítám seznam...
                    </div>
                ) : items.length === 0 && !isAdding ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-30">
                        <Package size={32} className="text-zinc-500" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Žádné položky k objednání</p>
                    </div>
                ) : (
                    <>
                        {items.map(item => (
                            <div
                                key={item.id}
                                className="group flex items-center justify-between p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all shadow-md"
                            >
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => {
                                            const nextStatus = item.status === 'K objednání' ? 'Objednáno' : item.status === 'Objednáno' ? 'Dodáno' : 'K objednání';
                                            updateItem(item.id, { status: nextStatus });
                                        }}
                                        className={cn(
                                            "w-7 h-7 rounded-lg flex items-center justify-center transition-all border",
                                            item.status === 'Dodáno'
                                                ? "bg-emerald-600/30 text-emerald-400 border-emerald-500/40"
                                                : "bg-zinc-800 border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700"
                                        )}
                                    >
                                        {item.status === 'Dodáno' ? <CheckCircle2 size={16} /> : <div className="w-2.5 h-2.5 rounded-full border-2 border-current opacity-30" />}
                                    </button>

                                    <div className="flex flex-col">
                                        <span className={cn(
                                            "text-[13px] font-black tracking-tight",
                                            item.status === 'Dodáno' ? "text-zinc-500 line-through" : "text-zinc-100"
                                        )}>
                                            {item.name}
                                        </span>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className={cn(
                                                "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border",
                                                getStatusColor(item.status)
                                            )}>
                                                {item.status}
                                            </span>
                                            <button
                                                onClick={() => {
                                                    const nextSource = item.source === 'Samostatně' ? 'S podvozkem' : item.source === 'S podvozkem' ? 'S nástavbou' : 'Samostatně';
                                                    updateItem(item.id, { source: nextSource });
                                                }}
                                                className="text-[8px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-1.5 hover:text-zinc-300 transition-colors bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700"
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
                                        className="p-2 text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </>
                )}

                {isAdding ? (
                    <div className="flex flex-col gap-3 p-4 bg-zinc-900 border border-primary/30 rounded-xl animate-in fade-in slide-in-from-top-2">
                        <input
                            autoFocus
                            type="text"
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addItem()}
                            onBlur={() => !newItemName && setIsAdding(false)}
                            placeholder="Název položky..."
                            className="text-xs font-bold bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <div className="flex items-center justify-between">
                            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Enter pro potvrzení</span>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setIsAdding(false)} className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-300 transition-colors">Zrušit</button>
                                <button onClick={addItem} className="px-3 py-1.5 bg-primary text-primary-foreground text-[9px] font-black uppercase tracking-widest rounded-lg shadow-lg hover:opacity-90 transition-all">Přidat</button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="w-full py-4 border border-dashed border-zinc-800 hover:border-primary/50 hover:bg-primary/5 rounded-xl flex items-center justify-center gap-2.5 text-zinc-500 hover:text-primary transition-all group"
                    >
                        <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Nová položka</span>
                    </button>
                )}
            </div>

            <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex items-center justify-center gap-6">
                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-zinc-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" /> K objednání
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-zinc-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]" /> Objednáno
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-zinc-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" /> Dodáno
                </div>
            </div>
        </div>
    );
}
