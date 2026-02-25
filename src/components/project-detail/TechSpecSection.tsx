import React from 'react';
import { ClipboardList, Truck, FileText, Tag, Hash, Sparkles } from 'lucide-react';
import { Project } from '@/types/project';
import { Section } from './DetailComponents';
import { extractModelDesignation } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface TechSpecSectionProps {
    project: Project;
    editedProject: Project;
    isEditing: boolean;
    handleCustomFieldChange: (field: string, value: any) => void;
    className?: string;
}

export function TechSpecSection({
    project,
    editedProject,
    isEditing,
    handleCustomFieldChange,
    className
}: TechSpecSectionProps) {
    const p = isEditing ? editedProject : project;

    const [suggestedModel, setSuggestedModel] = useState<string | null>(null);

    // Inteligentní extrakce modelu
    useEffect(() => {
        if (p.name && p.category) {
            const extracted = extractModelDesignation(p.name, p.category);
            setSuggestedModel(extracted);

            // Automatické předvyplnění v režimu editace (pouze pokud je prázdné)
            if (isEditing && extracted && !p.body_setup) {
                handleCustomFieldChange('body_setup', extracted);
            }
        } else {
            setSuggestedModel(null);
        }
    }, [p.name, p.category, isEditing]);

    return (
        <Section icon={<ClipboardList size={15} />} title="Technická specifikace" color="blue" fullWidth className={className}>
            <div className="flex flex-col gap-8 p-1">
                {/* 1. Nástavba */}
                <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 border-b border-border/40 pb-2">Nástavba</h4>

                    <div className="grid grid-cols-3 gap-3">
                        {/* Kategorie */}
                        <div className="flex flex-col gap-1.5 px-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">Kategorie</label>
                            {isEditing ? (
                                <select
                                    value={p.category || ''}
                                    onChange={(e) => handleCustomFieldChange('category', e.target.value)}
                                    className="w-full text-xs font-bold bg-muted/20 border border-border/60 rounded-xl px-3 py-2 outline-none focus:ring-4 focus:ring-primary/5 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="" disabled>Vyberte...</option>
                                    {['HIAB', 'MULTILIFT', 'HIAB + MULTILIFT', 'LOGLIFT', 'MOFFETT', 'ZEPRO', 'CORTEX', 'JONSERED', 'COMET', 'JINÉ'].map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            ) : (
                                <div className="text-sm font-black text-primary flex items-center gap-2">
                                    <Tag size={13} className="text-primary/60" />
                                    {p.category || '—'}
                                </div>
                            )}
                        </div>

                        {/* Typové označení */}
                        <div className="flex flex-col gap-1.5 px-1 relative">
                            <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 flex items-center gap-1.5">
                                Typové označení
                                {suggestedModel && !p.body_setup && (
                                    <span className="flex items-center gap-1 text-[8px] text-primary animate-pulse font-black">
                                        <Sparkles size={10} /> NÁVRH K DISPOZICI
                                    </span>
                                )}
                            </label>
                            {isEditing ? (
                                <div className="relative group/input">
                                    <input
                                        type="text"
                                        value={p.body_setup || ''}
                                        onChange={(e) => handleCustomFieldChange('body_setup', e.target.value)}
                                        className="w-full text-xs font-black bg-muted/20 border border-border/60 rounded-xl px-3 py-2 outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                                        placeholder={suggestedModel || "Typ..."}
                                    />
                                    {suggestedModel && p.body_setup !== suggestedModel && (
                                        <button
                                            onClick={() => handleCustomFieldChange('body_setup', suggestedModel)}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-primary/10 text-primary opacity-0 group-hover/input:opacity-100 hover:bg-primary hover:text-white transition-all"
                                            title={`Použít návrh: ${suggestedModel}`}
                                        >
                                            <Sparkles size={12} />
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="text-sm font-black text-foreground">
                                    {p.body_setup ? p.body_setup : (
                                        suggestedModel ? (
                                            <span className="text-muted-foreground/40 italic flex items-center gap-2">
                                                <Sparkles size={12} className="text-primary/30" />
                                                {suggestedModel}
                                            </span>
                                        ) : '—'
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Sériové číslo */}
                        <div className="flex flex-col gap-1.5 px-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">Sériové číslo</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={p.serial_number || ''}
                                    onChange={(e) => handleCustomFieldChange('serial_number', e.target.value)}
                                    className="w-full text-xs font-black bg-muted/20 border border-border/60 rounded-xl px-3 py-2 outline-none focus:ring-4 focus:ring-primary/5 transition-all font-mono"
                                    placeholder="S/N..."
                                />
                            ) : (
                                <div className="text-sm font-black text-foreground font-mono bg-muted/30 px-2 py-1 rounded-lg border border-border/40 inline-flex w-fit">
                                    {p.serial_number || '—'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. Dokumentace */}
                <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 border-b border-border/40 pb-2">Dokumentace</h4>
                    <div className="space-y-3">
                        {/* Trailerwin */}
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border border-border/50 hover:bg-muted/30 transition-all group/item">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-sm font-black flex items-center gap-2 group-hover/item:text-primary transition-colors">
                                    <Truck size={15} className="text-primary/60" /> Trailerwin
                                </span>
                                <span className="text-[10px] font-bold text-muted-foreground/80">Výpočet zatížení</span>
                            </div>
                            {isEditing ? (
                                <button
                                    onClick={() => handleCustomFieldChange('trailerwin_done', !p.custom_fields?.trailerwin_done)}
                                    className={`w-10 h-6 rounded-full p-1 transition-all duration-300 ${p.custom_fields?.trailerwin_done ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                                >
                                    <div className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-300 ${p.custom_fields?.trailerwin_done ? 'translate-x-4' : 'translate-x-0'}`} />
                                </button>
                            ) : (
                                <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${p.custom_fields?.trailerwin_done ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-muted text-muted-foreground/60 border border-border/50'}`}>
                                    {p.custom_fields?.trailerwin_done ? 'Hotovo' : 'Ne'}
                                </div>
                            )}
                        </div>

                        {/* Výkresová dokumentace */}
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border border-border/50 hover:bg-muted/30 transition-all group/item">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-sm font-black flex items-center gap-2 group-hover/item:text-primary transition-colors">
                                    <FileText size={15} className="text-primary/60" /> Výkresy
                                </span>
                                <span className="text-[10px] font-bold text-muted-foreground/80">Schváleno</span>
                            </div>
                            {isEditing ? (
                                <button
                                    onClick={() => handleCustomFieldChange('drawings_done', !p.custom_fields?.drawings_done)}
                                    className={`w-10 h-6 rounded-full p-1 transition-all duration-300 ${p.custom_fields?.drawings_done ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                                >
                                    <div className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-300 ${p.custom_fields?.drawings_done ? 'translate-x-4' : 'translate-x-0'}`} />
                                </button>
                            ) : (
                                <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${p.custom_fields?.drawings_done ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-muted text-muted-foreground/60 border border-border/50'}`}>
                                    {p.custom_fields?.drawings_done ? 'Hotovo' : 'Ne'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. Příslušenství */}
                <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 border-b border-border/40 pb-2">Příslušenství a výbava</h4>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 px-1">Příslušenství k nástavbě</label>
                            {isEditing ? (
                                <textarea
                                    value={p.custom_fields?.body_accessories || ''}
                                    onChange={(e) => handleCustomFieldChange('body_accessories', e.target.value)}
                                    className="w-full text-xs font-bold bg-muted/10 border border-border/60 rounded-xl p-3 h-32 outline-none focus:ring-4 focus:ring-primary/5 transition-all resize-none placeholder:font-medium placeholder:text-muted-foreground/30"
                                    placeholder="- Majáky&#10;- Pracovní světla&#10;- Box na nářadí..."
                                />
                            ) : (
                                <div className="text-xs font-bold whitespace-pre-line text-foreground/80 min-h-[1.5rem] p-3 bg-muted/5 rounded-xl border border-border/30 group-hover:bg-muted/10 transition-colors">
                                    {p.custom_fields?.body_accessories || '—'}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 px-1">Příslušenství na podvozek</label>
                            {isEditing ? (
                                <textarea
                                    value={p.custom_fields?.chassis_accessories || ''}
                                    onChange={(e) => handleCustomFieldChange('chassis_accessories', e.target.value)}
                                    className="w-full text-xs font-bold bg-muted/10 border border-border/60 rounded-xl p-3 h-32 outline-none focus:ring-4 focus:ring-primary/5 transition-all resize-none placeholder:font-medium placeholder:text-muted-foreground/30"
                                    placeholder="- Tažné zařízení&#10;- Zakládací klíny..."
                                />
                            ) : (
                                <div className="text-xs font-bold whitespace-pre-line text-foreground/80 min-h-[1.5rem] p-3 bg-muted/5 rounded-xl border border-border/30 group-hover:bg-muted/10 transition-colors">
                                    {p.custom_fields?.chassis_accessories || '—'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Section>
    );
}
