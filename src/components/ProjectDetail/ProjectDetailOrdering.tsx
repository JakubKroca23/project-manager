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
    MoreVertical,
    Trash2,
    CheckCircle2,
    Clock,
    AlertCircle,
    ShoppingCart,
    Link as LinkIcon
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

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Dodáno': return <CheckCircle2 size={12} className="text-emerald-500" />;
            case 'Objednáno': return <Clock size={12} className="text-blue-500" />;
            default: return <AlertCircle size={12} className="text-amber-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Dodáno': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
            case 'Objednáno': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
            default: return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
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
        <div className="bg-muted/30 border border-border/50 rounded-xl overflow-hidden flex flex-col h-full shadow-sm">
            <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between bg-background/50">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-500/10 text-blue-600 rounded-lg">
                        <ShoppingCart size={16} />
                    </div>
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest">Položky k objednání</h3>
                        <p className="text-[10px] text-muted-foreground font-medium">Správa komponentů a příslušenství</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full border border-border/50">
                        {items.filter(i => i.status === 'Dodáno').length} / {items.length}
                    </span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-[300px]">
                {loading ? (
                    <div className="flex items-center justify-center h-20 text-muted-foreground animate-pulse text-[10px] uppercase font-black tracking-widest">
                        Načítám seznam...
                    </div>
                ) : items.length === 0 && !isAdding ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center space-y-2 opacity-50">
                        <Package size={24} className="text-muted-foreground" />
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Žádné položky</p>
                    </div>
                ) : (
                    <>
                        {items.map(item => (
                            <div
                                key={item.id}
                                className="group flex items-center justify-between p-2.5 rounded-lg bg-background border border-border/50 hover:border-primary/30 transition-all shadow-sm"
                            >
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => {
                                            const nextStatus = item.status === 'K objednání' ? 'Objednáno' : item.status === 'Objednáno' ? 'Dodáno' : 'K objednání';
                                            updateItem(item.id, { status: nextStatus });
                                        }}
                                        className={cn(
                                            "w-6 h-6 rounded-md flex items-center justify-center transition-all",
                                            item.status === 'Dodáno' ? "bg-emerald-500/20 text-emerald-600" : "bg-muted hover:bg-muted/80 text-muted-foreground"
                                        )}
                                    >
                                        {item.status === 'Dodáno' ? <CheckCircle2 size={14} /> : <div className="w-2.5 h-2.5 rounded-full border-2 border-current opacity-30" />}
                                    </button>

                                    <div className="flex flex-col">
                                        <span className={cn(
                                            "text-xs font-bold",
                                            item.status === 'Dodáno' && "line-through text-muted-foreground"
                                        )}>
                                            {item.name}
                                        </span>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className={cn(
                                                "text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border",
                                                getStatusColor(item.status)
                                            )}>
                                                {item.status}
                                            </span>
                                            <button
                                                onClick={() => {
                                                    const nextSource = item.source === 'Samostatně' ? 'S podvozkem' : item.source === 'S podvozkem' ? 'S nástavbou' : 'Samostatně';
                                                    updateItem(item.id, { source: nextSource });
                                                }}
                                                className="text-[8px] font-bold text-muted-foreground/70 flex items-center gap-1 hover:text-foreground transition-colors bg-muted/50 px-1.5 py-0.5 rounded"
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
                                        className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </>
                )}

                {isAdding ? (
                    <div className="flex flex-col gap-2 p-3 bg-muted/20 border border-primary/20 rounded-lg animate-in fade-in slide-in-from-top-2">
                        <input
                            autoFocus
                            type="text"
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addItem()}
                            onBlur={() => !newItemName && setIsAdding(false)}
                            placeholder="Název položky..."
                            className="text-xs font-bold bg-background border border-border rounded px-2 py-1.5 outline-none focus:ring-2 focus:ring-primary/10"
                        />
                        <div className="flex items-center justify-between">
                            <span className="text-[9px] text-muted-foreground font-medium">Stiskni Enter pro přidání</span>
                            <div className="flex items-center gap-1">
                                <button onClick={() => setIsAdding(false)} className="px-2 py-1 text-[9px] font-black uppercase tracking-widest hover:bg-muted rounded">Zrušit</button>
                                <button onClick={addItem} className="px-2 py-1 bg-primary text-primary-foreground text-[9px] font-black uppercase tracking-widest rounded shadow-sm">Přidat</button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="w-full py-2 border border-dashed border-border/60 hover:border-primary/40 hover:bg-primary/5 rounded-lg flex items-center justify-center gap-1.5 text-muted-foreground hover:text-primary transition-all group"
                    >
                        <Plus size={14} className="group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Přidat položku</span>
                    </button>
                )}
            </div>

            <div className="p-3 bg-muted/20 border-t border-border/30 flex items-center justify-between">
                <div className="flex gap-2">
                    <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> K objednání
                    </div>
                    <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Objednáno
                    </div>
                    <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Dodáno
                    </div>
                </div>
            </div>
        </div>
    );
}
