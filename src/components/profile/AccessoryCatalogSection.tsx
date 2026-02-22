'use client';

import React, { useState } from 'react';
import { useAccessoryCatalog } from '@/hooks/useAccessoryCatalog';
import {
    Plus,
    Trash2,
    Edit2,
    Save,
    X,
    Loader2,
    Package,
    Tag,
    Info,
    Smartphone
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AccessoryCatalogItem } from '@/types/project';

export function AccessoryCatalogSection() {
    const { items, loading, addItem, updateItem, deleteItem } = useAccessoryCatalog();
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        category: 'Příslušenství',
        description: '',
        variants_raw: '',
        is_smart: false
    });

    const handleAdd = async () => {
        if (!formData.name.trim()) return;
        const variants = formData.variants_raw.split(',').map(v => v.trim()).filter(Boolean);
        await addItem({ ...formData, variants });
        setIsAdding(false);
        setFormData({ name: '', category: 'Příslušenství', description: '', variants_raw: '', is_smart: false });
    };

    const handleUpdate = async (id: string) => {
        if (!formData.name.trim()) return;
        const variants = formData.variants_raw.split(',').map(v => v.trim()).filter(Boolean);
        await updateItem(id, { ...formData, variants });
        setEditingId(null);
    };

    const startEdit = (item: AccessoryCatalogItem) => {
        setEditingId(item.id);
        setFormData({
            name: item.name,
            category: item.category,
            description: item.description || '',
            variants_raw: (item.variants || []).join(', '),
            is_smart: item.is_smart
        });
    };

    if (loading && items.length === 0) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 size={24} className="animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Katalog Příslušenství</h3>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Spravujte globální seznam položek</p>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all"
                    >
                        <Plus size={14} />
                        Nový záznam
                    </button>
                )}
            </div>

            {isAdding && (
                <div className="p-5 bg-card border border-primary/20 rounded-2xl animate-in fade-in slide-in-from-top-2 shadow-xl shadow-primary/5 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-black text-muted-foreground ml-1">Název položky</label>
                            <input
                                autoFocus
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2 text-sm outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                placeholder="Např. Bluetooth modul"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-black text-muted-foreground ml-1">Kategorie</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2 text-sm outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold"
                            >
                                <option value="Příslušenství">Příslušenství</option>
                                <option value="Hydraulika">Hydraulika</option>
                                <option value="Elektro">Elektro</option>
                                <option value="Kabinové doplňky">Kabinové doplňky</option>
                                <option value="Smart">Smart / Chytré</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-black text-muted-foreground ml-1">Popis / Poznámka</label>
                            <input
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2 text-sm outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                placeholder="Doplňující info k položce..."
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-black text-muted-foreground ml-1">Varianty / Typy (oddělené čárkou)</label>
                            <input
                                value={formData.variants_raw}
                                onChange={(e) => setFormData({ ...formData, variants_raw: e.target.value })}
                                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2 text-sm outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-primary"
                                placeholder="Např. 12V, 24V, Externí"
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-border/50 pt-4">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setFormData({ ...formData, is_smart: !formData.is_smart })}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all border",
                                    formData.is_smart ? "bg-amber-500/10 border-amber-500/30 text-amber-600 shadow-sm" : "bg-muted border-border text-muted-foreground"
                                )}
                            >
                                {formData.is_smart ? <Smartphone size={12} /> : <Package size={12} />}
                                SMART DOPLNĚK
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsAdding(false)}
                                className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Zrušit
                            </button>
                            <button
                                onClick={handleAdd}
                                className="px-6 py-2 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
                            >
                                Uložit do katalogu
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-3">
                {items.length === 0 ? (
                    <div className="text-center p-12 bg-muted/5 border-2 border-dashed border-border/60 rounded-3xl opacity-40">
                        <Package size={48} className="mx-auto mb-4 text-muted-foreground/30" />
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Katalog je prázdný</p>
                    </div>
                ) : (
                    items.map(item => (
                        <div
                            key={item.id}
                            className={cn(
                                "group p-4 rounded-2xl border transition-all flex items-center justify-between",
                                editingId === item.id
                                    ? "bg-card border-primary/40 shadow-xl ring-4 ring-primary/5"
                                    : "bg-muted/10 border-border/50 hover:bg-muted/20"
                            )}
                        >
                            {editingId === item.id ? (
                                <div className="flex-1 flex flex-col gap-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="bg-card border border-border rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="bg-card border border-border rounded-lg px-3 py-1.5 text-xs font-bold outline-none"
                                        >
                                            <option value="Příslušenství">Příslušenství</option>
                                            <option value="Hydraulika">Hydraulika</option>
                                            <option value="Elektro">Elektro</option>
                                            <option value="Kabinové doplňky">Kabinové doplňky</option>
                                            <option value="Smart">Smart / Chytré</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] uppercase font-black text-muted-foreground ml-1">Varianty (oddělené čárkou)</label>
                                        <input
                                            value={formData.variants_raw}
                                            onChange={(e) => setFormData({ ...formData, variants_raw: e.target.value })}
                                            className="w-full bg-card border border-border rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 text-primary"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setFormData({ ...formData, is_smart: !formData.is_smart })}
                                                className={cn(
                                                    "px-2 py-1 rounded text-[9px] font-bold uppercase border",
                                                    formData.is_smart ? "bg-amber-500 text-white" : "bg-muted text-muted-foreground"
                                                )}
                                            >
                                                Smart
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => setEditingId(null)} className="p-1.5 text-muted-foreground hover:bg-muted rounded-lg"><X size={14} /></button>
                                            <button onClick={() => handleUpdate(item.id)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"><Save size={14} /></button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center border shadow-inner transition-colors",
                                            item.is_smart ? "bg-amber-500/10 border-amber-500/20 text-amber-600" : "bg-slate-100 border-slate-200 text-slate-400"
                                        )}>
                                            {item.is_smart ? <Smartphone size={20} /> : <Package size={20} />}
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-foreground">{item.name}</span>
                                                {item.is_smart && <span className="text-[8px] font-black bg-amber-500 text-white px-1.5 rounded uppercase">Smart</span>}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[9px] font-bold uppercase text-muted-foreground/60 flex items-center gap-1">
                                                    <Tag size={10} className="text-primary/50" /> {item.category}
                                                </span>
                                                {item.variants && item.variants.length > 0 && (
                                                    <span className="text-[9px] font-bold text-primary/60 flex items-center gap-1 border-l pl-2 border-border/50">
                                                        <Package size={10} /> {item.variants.length} varianty
                                                    </span>
                                                )}
                                                {item.description && (
                                                    <span className="text-[9px] text-muted-foreground/50 italic flex items-center gap-1 border-l pl-2 border-border/50">
                                                        <Info size={10} /> {item.description}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => startEdit(item)}
                                            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => deleteItem(item.id)}
                                            className="p-2 text-muted-foreground hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
