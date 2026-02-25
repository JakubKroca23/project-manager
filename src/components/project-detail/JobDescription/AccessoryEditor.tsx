'use client';

import React from 'react';
import { Plus, Trash2, Info, ShoppingCart } from 'lucide-react';
import { ACCESSORIES, SOURCE_OPTIONS } from './constants';
import { cn } from '@/lib/utils';

interface AccessoryEditorProps {
    project: any;
    handleCustomFieldChange: (field: string, value: any) => void;
}

export function AccessoryEditor({ project, handleCustomFieldChange }: AccessoryEditorProps) {
    // We expect accessories to be in project.custom_fields.accessories
    // Structure: { key: { oznaceni: string, pocet: number, source: string, poznamka: string } }
    const rawAcc = project.custom_fields?.accessories;
    const accData: Record<string, any> = (Array.isArray(rawAcc) || !rawAcc)
        ? (Array.isArray(rawAcc) ? Object.fromEntries(rawAcc.map((k: string) => [k, {}])) : {})
        : rawAcc;

    const toggleItem = (key: string) => {
        const next = { ...accData };
        if (key in next) {
            delete next[key];
        } else {
            next[key] = {
                pocet: 1,
                source: 'podvozek'
            };
        }
        handleCustomFieldChange('accessories', next);
    };

    const updateItem = (key: string, field: string, val: any) => {
        const next = { ...accData };
        if (!next[key]) next[key] = {};
        next[key] = { ...next[key], [field]: val };
        handleCustomFieldChange('accessories', next);
    };

    return (
        <div className="space-y-6">
            {/* Quick Select Grid */}
            <div className="flex flex-wrap gap-2">
                {ACCESSORIES.map(item => {
                    const isActive = item.key in accData;
                    return (
                        <button
                            key={item.key}
                            onClick={() => toggleItem(item.key)}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all",
                                isActive
                                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105"
                                    : "bg-muted/30 border-border/40 text-muted-foreground hover:bg-muted/50"
                            )}
                        >
                            <item.icon size={12} />
                            {item.label}
                        </button>
                    );
                })}
            </div>

            {/* Active Items Editor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(accData).map(([key, data]) => {
                    const config = ACCESSORIES.find(a => a.key === key);
                    return (
                        <div key={key} className="p-4 rounded-2xl bg-muted/20 border border-border/40 space-y-3 relative group">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                        {config ? <config.icon size={14} /> : <Plus size={14} />}
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-wider">{config?.label || key}</span>
                                </div>
                                <button onClick={() => toggleItem(key)} className="text-muted-foreground/30 hover:text-rose-500 transition-colors">
                                    <Trash2 size={14} />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase text-muted-foreground/40 ml-1">Specifikace</label>
                                    <input
                                        value={data.oznaceni || ''}
                                        onChange={(e) => updateItem(key, 'oznaceni', e.target.value)}
                                        className="w-full bg-background/50 border border-border/20 rounded-lg px-2 py-1.5 text-[10px] font-bold outline-none focus:ring-1 focus:ring-primary/30"
                                        placeholder="např. 600x400..."
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase text-muted-foreground/40 ml-1">Počet (ks)</label>
                                    <input
                                        type="number"
                                        value={data.pocet || 1}
                                        onChange={(e) => updateItem(key, 'pocet', parseInt(e.target.value))}
                                        className="w-full bg-background/50 border border-border/20 rounded-lg px-2 py-1.5 text-[10px] font-bold outline-none focus:ring-1 focus:ring-primary/30 text-center"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase text-muted-foreground/40 ml-1">Zdroj materiálu</label>
                                <div className="flex flex-wrap gap-1">
                                    {SOURCE_OPTIONS.map(opt => (
                                        <button
                                            key={opt.key}
                                            onClick={() => updateItem(key, 'source', opt.key)}
                                            className={cn(
                                                "px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-tighter border transition-all",
                                                data.source === opt.key
                                                    ? opt.color.replace('/10', '/30')
                                                    : "bg-transparent border-transparent text-muted-foreground/40 hover:bg-muted/30"
                                            )}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-1 text-foreground">
                                <label className="text-[9px] font-black uppercase text-muted-foreground/40 ml-1">Poznámka k montáži</label>
                                <input
                                    value={data.poznamka || ''}
                                    onChange={(e) => updateItem(key, 'poznamka', e.target.value)}
                                    className="w-full bg-background/50 border border-border/20 rounded-lg px-2 py-1.5 text-[10px] font-medium italic outline-none focus:ring-1 focus:ring-primary/30"
                                    placeholder="..."
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {Object.keys(accData).length === 0 && (
                <div className="py-12 flex flex-col items-center justify-center text-muted-foreground/20 italic border-2 border-dashed border-border/20 rounded-3xl">
                    <ShoppingCart size={40} strokeWidth={1} className="mb-2" />
                    <p className="text-sm font-medium">Žádné vybrané příslušenství</p>
                </div>
            )}
        </div>
    );
}
