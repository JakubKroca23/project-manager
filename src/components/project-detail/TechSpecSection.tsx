import { ClipboardList, Truck, FileText, Tag, Hash, Sparkles, Plus, Trash2, ChevronDown, Upload, Download, Loader2, Eye, X } from 'lucide-react';
import { Project } from '@/types/project';
import { Section } from './DetailComponents';
import { extractModelDesignation, formatDate, cn } from '@/lib/utils';
import { useEffect, useState, useMemo, useRef } from 'react';
import { getCategoryStyle } from '@/components/CategoryChip';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface TechSpecSectionProps {
    project: Project;
    editedProject: Project;
    isEditing: boolean;
    onChange: (field: keyof Project, value: any) => void;
    handleCustomFieldChange: (field: string, value: any) => void;
    className?: string;
}

export function TechSpecSection({
    project,
    editedProject,
    isEditing,
    onChange,
    handleCustomFieldChange,
    className
}: TechSpecSectionProps) {
    const p = isEditing ? editedProject : project;

    const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isUploadingTrailerwin, setIsUploadingTrailerwin] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const trailerwinInputRef = useRef<HTMLInputElement>(null);

    // Synchronizace a migrace dat pro více nástaveb
    const bodies = useMemo(() => {
        const bodiesArray = p.custom_fields?.bodies || [];
        if (bodiesArray.length === 0 && (p.category || p.custom_fields?.body_type || p.serial_number || p.body_delivery)) {
            return [{
                id: 'primary',
                category: p.category || '',
                model: p.custom_fields?.body_type || '',
                serial_number: p.serial_number || '',
                delivery_date: p.body_delivery ? new Date(p.body_delivery).toISOString().split('T')[0] : ''
            }];
        }
        return bodiesArray;
    }, [p.category, p.custom_fields?.body_type, p.serial_number, p.body_delivery, p.custom_fields?.bodies]);

    const updateBodies = (newBodies: any[]) => {
        if (newBodies.length > 0) {
            const first = newBodies[0];
            onChange('category', first.category);
            handleCustomFieldChange('body_type', first.model);
            onChange('serial_number', first.serial_number);
            onChange('body_delivery', first.delivery_date);
        }
        handleCustomFieldChange('bodies', newBodies);
    };

    const handleAddBody = () => {
        const newBody = {
            id: Math.random().toString(36).substr(2, 9),
            category: 'JINÉ',
            model: '',
            serial_number: '',
            delivery_date: ''
        };
        updateBodies([...bodies, newBody]);
    };

    const handleRemoveBody = (id: string) => {
        if (bodies.length <= 1) return;
        updateBodies(bodies.filter((b: any) => b.id !== id));
    };

    const handleBodyChange = (id: string, field: string, value: any) => {
        const newBodies = bodies.map((b: any) =>
            b.id === id ? { ...b, [field]: value } : b
        );
        updateBodies(newBodies);
    };

    const handleDrawingUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.type !== 'application/pdf') {
            toast.error('Povoleny jsou pouze soubory ve formátu PDF.');
            return;
        }
        setIsUploading(true);
        try {
            const fileName = `${p.id}_drawing_${Date.now()}.pdf`;
            const filePath = `${p.id}/${fileName}`;
            const { error: uploadError } = await supabase.storage.from('drawings').upload(filePath, file);
            if (uploadError) throw uploadError;
            const { data: signedData, error: signedError } = await supabase.storage.from('drawings').createSignedUrl(filePath, 31536000);
            if (signedError) throw signedError;
            handleCustomFieldChange('drawing_url', signedData.signedUrl);
            handleCustomFieldChange('drawing_path', filePath);
            handleCustomFieldChange('drawing_name', file.name);
            toast.success('Výkres byl úspěšně nahrán.');
        } catch (error: any) {
            console.error('Upload error:', error);
            toast.error(`Chyba při nahrávání: ${error.message}`);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const removeDrawing = async () => {
        if (!confirm('Opravdu chcete odstranit tento výkres?')) return;
        try {
            const path = p.custom_fields?.drawing_path;
            if (path) await supabase.storage.from('drawings').remove([path]);
            handleCustomFieldChange('drawing_url', null);
            handleCustomFieldChange('drawing_path', null);
            handleCustomFieldChange('drawing_name', null);
            toast.success('Výkres byl odstraněn.');
        } catch (error: any) {
            toast.error('Chyba při odstraňování souboru.');
        }
    };

    const handleTrailerwinUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploadingTrailerwin(true);
        try {
            const fileName = `${p.id}_trailerwin_${Date.now()}.trw`;
            const filePath = `${p.id}/${fileName}`;
            const { error: uploadError } = await supabase.storage.from('drawings').upload(filePath, file);
            if (uploadError) throw uploadError;
            const { data: signedData, error: signedError } = await supabase.storage.from('drawings').createSignedUrl(filePath, 31536000);
            if (signedError) throw signedError;
            handleCustomFieldChange('trailerwin_url', signedData.signedUrl);
            handleCustomFieldChange('trailerwin_path', filePath);
            handleCustomFieldChange('trailerwin_name', file.name);
            toast.success('Soubor Trailerwin byl úspěšně nahrán.');
        } catch (error: any) {
            console.error('Trailerwin upload error:', error);
            toast.error(`Chyba při nahrávání: ${error.message}`);
        } finally {
            setIsUploadingTrailerwin(false);
            if (trailerwinInputRef.current) trailerwinInputRef.current.value = '';
        }
    };

    const removeTrailerwin = async () => {
        if (!confirm('Opravdu chcete odstranit tento soubor Trailerwin?')) return;
        try {
            const path = p.custom_fields?.trailerwin_path;
            if (path) await supabase.storage.from('drawings').remove([path]);
            handleCustomFieldChange('trailerwin_url', null);
            handleCustomFieldChange('trailerwin_path', null);
            handleCustomFieldChange('trailerwin_name', null);
            toast.success('Soubor Trailerwin byl odstraněn.');
        } catch (error: any) {
            toast.error('Chyba při odstraňování souboru.');
        }
    };

    return (
        <Section icon={<ClipboardList size={15} />} title="Technická specifikace" color="blue" fullWidth className={className}>
            <div className="flex flex-col gap-4 p-0.5">

                {/* 0. Dokumentace */}
                <div className="space-y-2">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 border-b border-border/40 pb-1.5">Dokumentace</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">

                        {/* Trailerwin */}
                        <div className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border transition-all group/item ${!isEditing && !p.custom_fields?.trailerwin_url
                            ? 'bg-rose-500/5 border-rose-500/40 hover:bg-rose-500/10'
                            : 'bg-muted/20 border-border/50 hover:bg-muted/30'
                            }`}>
                            <div className="flex flex-col gap-0.5 min-w-0">
                                <span className={`text-xs font-black flex items-center gap-1.5 transition-colors ${!isEditing && !p.custom_fields?.trailerwin_url ? 'text-rose-500' : 'group-hover/item:text-primary'
                                    }`}>
                                    <Truck size={13} className={`shrink-0 ${!isEditing && !p.custom_fields?.trailerwin_url ? 'text-rose-400' : 'text-primary/60'}`} />
                                    Trailerwin
                                </span>
                                <span className={`text-[10px] font-semibold pl-[21px] truncate ${!isEditing && !p.custom_fields?.trailerwin_url ? 'text-rose-400' : 'text-muted-foreground/60'
                                    }`}>
                                    {p.custom_fields?.trailerwin_name
                                        ? p.custom_fields.trailerwin_name
                                        : (!isEditing ? 'Chybí soubor!' : 'Výpočet zatížení (.trw)')}
                                </span>
                            </div>
                            <div className="shrink-0 flex items-center gap-1">
                                {p.custom_fields?.trailerwin_url ? (
                                    <>
                                        <a
                                            href={p.custom_fields.trailerwin_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-background border border-border/50 rounded-lg text-[10px] font-black uppercase tracking-widest hover:border-primary/50 hover:bg-primary/5 transition-all"
                                        >
                                            <Download size={12} className="text-primary" />
                                            <span>Otevřít</span>
                                        </a>
                                        {isEditing && (
                                            <button onClick={removeTrailerwin} className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all" title="Smazat">
                                                <Trash2 size={13} />
                                            </button>
                                        )}
                                    </>
                                ) : isEditing ? (
                                    <>
                                        <input type="file" accept=".trw" className="hidden" onChange={handleTrailerwinUpload} ref={trailerwinInputRef} />
                                        <button
                                            onClick={() => trailerwinInputRef.current?.click()}
                                            disabled={isUploadingTrailerwin}
                                            className="flex items-center gap-1.5 px-2.5 py-1.5 border border-dashed border-border/50 rounded-lg text-[10px] font-black uppercase tracking-widest hover:border-primary/40 hover:bg-primary/5 transition-all text-muted-foreground hover:text-primary active:scale-95"
                                        >
                                            {isUploadingTrailerwin ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                                            <span>{isUploadingTrailerwin ? 'Nahrávám...' : 'Nahrát .trw'}</span>
                                        </button>
                                    </>
                                ) : null}
                            </div>
                        </div>

                        {/* Výkres sestavy */}
                        <div className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border transition-all group/item ${!isEditing && !p.custom_fields?.drawing_url
                            ? 'bg-rose-500/5 border-rose-500/40 hover:bg-rose-500/10'
                            : 'bg-muted/20 border-border/50 hover:bg-muted/30'
                            }`}>
                            <div className="flex flex-col gap-0.5 min-w-0">
                                <span className={`text-xs font-black flex items-center gap-1.5 transition-colors ${!isEditing && !p.custom_fields?.drawing_url ? 'text-rose-500' : 'group-hover/item:text-primary'
                                    }`}>
                                    <FileText size={13} className={`shrink-0 ${!isEditing && !p.custom_fields?.drawing_url ? 'text-rose-400' : 'text-primary/60'}`} />
                                    Výkres sestavy
                                </span>
                                <span className={`text-[10px] font-semibold pl-[21px] truncate ${!isEditing && !p.custom_fields?.drawing_url ? 'text-rose-400' : 'text-muted-foreground/60'
                                    }`}>
                                    {p.custom_fields?.drawing_name
                                        ? p.custom_fields.drawing_name
                                        : (!isEditing ? 'Chybí výkres!' : 'Dokumentace PDF')}
                                </span>
                            </div>
                            <div className="shrink-0 flex items-center gap-1">
                                {p.custom_fields?.drawing_url ? (
                                    <>
                                        <a
                                            href={p.custom_fields!.drawing_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-background border border-border/50 rounded-lg text-[10px] font-black uppercase tracking-widest hover:border-primary/50 hover:bg-primary/5 transition-all"
                                        >
                                            <Eye size={12} className="text-primary" />
                                            <span>Otevřít</span>
                                        </a>
                                        {isEditing && (
                                            <button onClick={removeDrawing} className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all" title="Smazat">
                                                <Trash2 size={13} />
                                            </button>
                                        )}
                                    </>
                                ) : isEditing ? (
                                    <>
                                        <input type="file" accept=".pdf" className="hidden" onChange={handleDrawingUpload} ref={fileInputRef} />
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploading}
                                            className="flex items-center gap-1.5 px-2.5 py-1.5 border border-dashed border-border/50 rounded-lg text-[10px] font-black uppercase tracking-widest hover:border-primary/40 hover:bg-primary/5 transition-all text-muted-foreground hover:text-primary active:scale-95"
                                        >
                                            {isUploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                                            <span>{isUploading ? 'Nahrávám...' : 'Nahrát PDF'}</span>
                                        </button>
                                    </>
                                ) : null}
                            </div>
                        </div>

                    </div>
                </div>

                {/* 1. Nástavba Section */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-border/40 pb-1.5">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Nástavba / Zařízení</h4>
                        {isEditing && (
                            <button
                                type="button"
                                onClick={handleAddBody}
                                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
                            >
                                <Plus size={12} /> Přidat nástavbu
                            </button>
                        )}
                    </div>

                    <div className="space-y-3">
                        {bodies.map((body: any, index: number) => (
                            <div key={body.id} className={cn(
                                "relative p-3 rounded-2xl border transition-all",
                                isEditing ? "bg-muted/5 border-border/40" : "bg-transparent border-transparent p-0"
                            )}>
                                {isEditing && bodies.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveBody(body.id)}
                                        className="absolute -top-2 -right-2 p-1.5 rounded-full bg-destructive text-white shadow-lg hover:scale-110 active:scale-90 transition-all z-20"
                                        title="Odstranit tuto nástavbu"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                )}

                                {bodies.length > 1 && (
                                    <div className="absolute -left-2 top-4 px-2 py-0.5 rounded-full bg-muted text-[8px] font-black uppercase text-muted-foreground border border-border/40">
                                        #{index + 1}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                    {/* Kategorie */}
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">Kategorie</label>
                                        {isEditing ? (
                                            <div className="relative">
                                                <button
                                                    type="button"
                                                    onClick={() => setExpandedCategoryId(expandedCategoryId === body.id ? null : body.id)}
                                                    className={cn(
                                                        "w-full flex items-center justify-between px-3 py-2 rounded-xl border text-[11px] font-black transition-all",
                                                        body.category
                                                            ? `${getCategoryStyle(body.category)?.bg} ${getCategoryStyle(body.category)?.text} ${getCategoryStyle(body.category)?.border}`
                                                            : "bg-muted/20 border-border/60 text-muted-foreground"
                                                    )}
                                                >
                                                    <span className="uppercase tracking-wider">{body.category || 'Vybrat...'}</span>
                                                    <ChevronDown size={14} className={cn("transition-transform duration-300", expandedCategoryId === body.id ? "rotate-180" : "")} />
                                                </button>

                                                {expandedCategoryId === body.id && (
                                                    <div className="absolute top-full left-0 right-0 mt-2 p-1.5 bg-card border border-border/60 rounded-2xl shadow-2xl z-[100] flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-200">
                                                        {['HIAB', 'MULTILIFT', 'ZEPRO', 'LOGLIFT', 'MOFFETT', 'COMET', 'JONSERED', 'CORTEX', 'JINÉ'].map(cat => {
                                                            const style = getCategoryStyle(cat);
                                                            return (
                                                                <button
                                                                    key={cat}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        handleBodyChange(body.id, 'category', cat);
                                                                        setExpandedCategoryId(null);
                                                                    }}
                                                                    className={cn(
                                                                        "px-3 py-2 rounded-lg text-[9px] font-black transition-all border uppercase text-left flex items-center justify-between",
                                                                        body.category === cat
                                                                            ? `${style?.bg} ${style?.text} ${style?.border}`
                                                                            : "bg-muted/30 text-muted-foreground/60 border-transparent hover:border-border/60 hover:bg-muted/50"
                                                                    )}
                                                                >
                                                                    {cat}
                                                                    {body.category === cat && <Sparkles size={10} />}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className={cn(
                                                "text-[10px] font-black px-2.5 py-1 rounded-lg border flex items-center gap-2 w-fit",
                                                getCategoryStyle(body.category)?.bg,
                                                getCategoryStyle(body.category)?.text,
                                                getCategoryStyle(body.category)?.border
                                            )}>
                                                <Tag size={12} className="opacity-70" />
                                                {body.category || '—'}
                                            </div>
                                        )}
                                    </div>

                                    {/* Typové označení */}
                                    <div className="flex flex-col gap-1.5 relative">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">Typové označení</label>
                                        {isEditing ? (
                                            <div className="relative group/input flex items-center">
                                                {extractModelDesignation(p.name || '', body.category) && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleBodyChange(body.id, 'model', extractModelDesignation(p.name || '', body.category))}
                                                        className={cn(
                                                            "absolute left-1.5 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-lg transition-all flex items-center gap-1",
                                                            body.model === extractModelDesignation(p.name || '', body.category)
                                                                ? "bg-emerald-500 text-white shadow-none opacity-40 cursor-default"
                                                                : "bg-primary text-white shadow-lg hover:scale-110 active:scale-95"
                                                        )}
                                                        disabled={body.model === extractModelDesignation(p.name || '', body.category)}
                                                        title="Použít detekovaný model"
                                                    >
                                                        <Sparkles size={12} />
                                                    </button>
                                                )}
                                                <input
                                                    type="text"
                                                    value={body.model || ''}
                                                    onChange={(e) => handleBodyChange(body.id, 'model', e.target.value)}
                                                    className={cn(
                                                        "w-full text-[10px] font-black bg-muted/20 border border-border/60 rounded-xl py-2 outline-none focus:ring-4 focus:ring-primary/5 transition-all text-black",
                                                        extractModelDesignation(p.name || '', body.category) ? "pl-10 pr-3" : "px-3"
                                                    )}
                                                    placeholder="Typ..."
                                                />
                                            </div>
                                        ) : (
                                            <div className="text-sm font-black text-black">
                                                {body.model || '—'}
                                            </div>
                                        )}
                                    </div>

                                    {/* Datum dodání */}
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">Datum dodání</label>
                                        {isEditing ? (
                                            <input
                                                type="date"
                                                value={body.delivery_date || ''}
                                                onChange={(e) => handleBodyChange(body.id, 'delivery_date', e.target.value)}
                                                onKeyDown={(e) => e.preventDefault()}
                                                className="w-full text-[10px] font-black bg-muted/20 border border-border/60 rounded-xl px-3 py-2 outline-none focus:ring-4 focus:ring-primary/5 transition-all cursor-pointer"
                                            />
                                        ) : (
                                            <div className="text-sm font-black text-black">
                                                {formatDate(body.delivery_date)}
                                            </div>
                                        )}
                                    </div>

                                    {/* Sériové číslo */}
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">Sériové číslo</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={body.serial_number || ''}
                                                onChange={(e) => handleBodyChange(body.id, 'serial_number', e.target.value)}
                                                className="w-full text-xs font-black bg-muted/20 border border-border/60 rounded-xl px-3 py-2 outline-none focus:ring-4 focus:ring-primary/5 transition-all font-mono"
                                                placeholder="S/N..."
                                            />
                                        ) : (
                                            <div className="text-sm font-black text-foreground font-mono bg-muted/30 px-2 py-1 rounded-lg border border-border/40 inline-flex w-fit max-w-full truncate">
                                                {body.serial_number || '—'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. Podvozek Section */}
                <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 border-b border-border/40 pb-1.5">Podvozek</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Model podvozku */}
                        <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">Vozidlo / Podvozek</label>
                            {isEditing ? (
                                <div className="flex flex-col gap-2">
                                    <select
                                        value={p.custom_fields?.chassis_brand || ''}
                                        onChange={(e) => handleCustomFieldChange('chassis_brand', e.target.value)}
                                        className="w-full text-[10px] font-black bg-muted/20 border border-border/60 rounded-xl px-3 py-2 outline-none focus:ring-4 focus:ring-primary/5 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="" disabled>Vybrat výrobce...</option>
                                        {['SCANIA', 'VOLVO', 'MAN', 'MERCEDES-BENZ', 'TATRA', 'DAF', 'IVECO', 'RENAULT', 'FORD', 'FUSO', 'ISUZU', 'JINÉ'].map(brand => (
                                            <option key={brand} value={brand}>{brand}</option>
                                        ))}
                                    </select>
                                    <input
                                        type="text"
                                        value={p.custom_fields?.chassis_model || ''}
                                        onChange={(e) => handleCustomFieldChange('chassis_model', e.target.value)}
                                        className="w-full text-[10px] font-black bg-muted/20 border border-border/60 rounded-xl px-3 py-2 outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                                        placeholder="Model (např. R450, FH16...)"
                                    />
                                </div>
                            ) : (
                                <div className="flex flex-col gap-0.5">
                                    {p.custom_fields?.chassis_brand && (
                                        <span className="text-[10px] font-black text-primary/70 uppercase tracking-tight">
                                            {p.custom_fields.chassis_brand}
                                        </span>
                                    )}
                                    <div className="text-sm font-black text-black">
                                        {p.custom_fields?.chassis_model || (p.custom_fields?.chassis_brand ? '' : '—')}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* VIN */}
                        <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">VIN</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={p.custom_fields?.vin || ''}
                                    onChange={(e) => handleCustomFieldChange('vin', e.target.value)}
                                    className="w-full text-[10px] font-black bg-muted/20 border border-border/60 rounded-xl px-3 py-2 outline-none focus:ring-4 focus:ring-primary/5 transition-all font-mono"
                                    placeholder="VIN..."
                                />
                            ) : (
                                <div className="text-sm font-black text-foreground font-mono bg-muted/30 px-2 py-1 rounded-lg border border-border/40 inline-flex w-fit max-w-full truncate">
                                    {p.custom_fields?.vin || '—'}
                                </div>
                            )}
                        </div>

                        {/* SPZ */}
                        <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">SPZ</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={p.custom_fields?.license_plate || ''}
                                    onChange={(e) => handleCustomFieldChange('license_plate', e.target.value)}
                                    className="w-full text-[10px] font-black bg-muted/20 border border-border/60 rounded-xl px-3 py-2 outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                                    placeholder="SPZ..."
                                />
                            ) : (
                                <div className="text-sm font-black text-black uppercase tracking-wider">
                                    {p.custom_fields?.license_plate || '—'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. Příslušenství Section */}
                {(() => {
                    const ACCESSORIES = [
                        { key: 'blatniky', label: 'Blatníky' },
                        { key: 'bocni_podjezd', label: 'Boční podjezdová zábrana' },
                        { key: 'zadni_podjezd', label: 'Zadní podjezdová zábrana' },
                        { key: 'drzak_rezervy', label: 'Držák rezervy' },
                        { key: 'cerpadlo', label: 'Čerpadlo' },
                        { key: 'budlik', label: 'Box na nářadí (budlík)' },
                        { key: 'nadoba_voda', label: 'Nádoba na vodu' },
                        { key: 'hydraulicka_nadrz', label: 'Hydraulická nádrž' },
                        { key: 'uzivatelsky_konektor', label: 'Uživatelský konektor' },
                        { key: 'kamera', label: 'Kamera' },
                        { key: 'pracovni_svetlo', label: 'Pracovní světlo' },
                        { key: 'majak', label: 'Maják' },
                        { key: 'kos_plachta', label: 'Koš na plachtu' },
                        { key: 'navarovaci_oko', label: 'Navařovací oko' },
                        { key: 'hasicak', label: 'Hasičák' },
                    ];

                    const SOURCE_OPTIONS = [
                        { key: 'podvozek', label: 'Podvozek', color: 'bg-sky-500/10 text-sky-600 border-sky-500/30' },
                        { key: 'nastavba', label: 'Nástavba', color: 'bg-violet-500/10 text-violet-600 border-violet-500/30' },
                        { key: 'montazni', label: 'Mont. firma', color: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
                        { key: 'objednat', label: 'Objednat', color: 'bg-rose-500/10 text-rose-600 border-rose-500/30' },
                        { key: 'vypalky', label: 'Výpalky', color: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
                    ];

                    // Migrace: starý formát byl string[], nový je object
                    const rawAcc = p.custom_fields?.accessories;
                    const accData: Record<string, any> = (Array.isArray(rawAcc) || !rawAcc)
                        ? (Array.isArray(rawAcc) ? Object.fromEntries(rawAcc.map((k: string) => [k, {}])) : {})
                        : rawAcc;

                    const isSelected = (key: string) => key in accData;

                    const toggleItem = (key: string) => {
                        const next = { ...accData };
                        if (isSelected(key)) { delete next[key]; }
                        else { next[key] = {}; }
                        handleCustomFieldChange('accessories', next);
                    };

                    const updateField = (key: string, field: string, value: any) => {
                        handleCustomFieldChange('accessories', {
                            ...accData,
                            [key]: { ...(accData[key] || {}), [field]: value }
                        });
                    };

                    const selectedItems = ACCESSORIES.filter(a => isSelected(a.key));

                    return (
                        <div className="space-y-2">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 border-b border-border/40 pb-1.5">Příslušenství a výbava</h4>

                            {isEditing ? (
                                <div className="flex flex-col gap-1">
                                    {ACCESSORIES.map(item => {
                                        const active = isSelected(item.key);
                                        const data = accData[item.key] || {};
                                        const srcOption = SOURCE_OPTIONS.find(s => s.key === data.source);
                                        return (
                                            <div key={item.key} className={`rounded-xl border overflow-hidden transition-all ${active ? 'border-primary/25 bg-primary/[0.03]' : 'border-border/30 bg-muted/10'}`}>
                                                {/* Hlavní řádek */}
                                                <button
                                                    type="button"
                                                    onClick={() => toggleItem(item.key)}
                                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left transition-all group"
                                                >
                                                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${active ? 'bg-primary border-primary' : 'border-border/50 group-hover:border-primary/40'}`}>
                                                        {active && <span className="text-white text-[8px] font-black leading-none">✓</span>}
                                                    </div>
                                                    <span className={`text-[11px] font-black uppercase tracking-widest transition-colors flex-1 ${active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}>
                                                        {item.label}
                                                    </span>
                                                    {/* Kompaktní preview aktivních hodnot */}
                                                    {active && (
                                                        <div className="flex items-center gap-1.5 shrink-0">
                                                            {srcOption && <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase border ${srcOption.color}`}>{srcOption.label}</span>}
                                                            {data.vyrobce && <span className="text-[9px] text-muted-foreground font-semibold truncate max-w-[80px]">{data.vyrobce}</span>}
                                                            {(data.pocet && data.pocet > 1) && <span className="text-[9px] font-black text-muted-foreground">{data.pocet}×</span>}
                                                        </div>
                                                    )}
                                                </button>

                                                {/* Detail pole – zobrazí se jen když je aktivní */}
                                                {active && (
                                                    <div className="px-3 pb-2.5 pt-1 border-t border-border/15 flex flex-wrap items-center gap-2">
                                                        {/* 1. Zdroj */}
                                                        <div className="flex gap-1 flex-wrap">
                                                            {SOURCE_OPTIONS.map(s => (
                                                                <button
                                                                    key={s.key}
                                                                    type="button"
                                                                    onClick={() => updateField(item.key, 'source', data.source === s.key ? undefined : s.key)}
                                                                    className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border transition-all ${data.source === s.key ? s.color : 'bg-background border-border/40 text-muted-foreground/60 hover:border-border/70'}`}
                                                                >
                                                                    {s.label}
                                                                </button>
                                                            ))}
                                                        </div>

                                                        {/* 2. Výrobce */}
                                                        <input
                                                            type="text"
                                                            value={data.vyrobce || ''}
                                                            onChange={(e) => updateField(item.key, 'vyrobce', e.target.value)}
                                                            placeholder="Výrobce / prodejce"
                                                            className="text-[10px] font-semibold bg-background border border-border/40 rounded-lg px-2.5 py-1 outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 transition-all min-w-[130px] flex-1 placeholder:text-muted-foreground/30"
                                                        />

                                                        {/* 3. Označení */}
                                                        <input
                                                            type="text"
                                                            value={data.oznaceni || ''}
                                                            onChange={(e) => updateField(item.key, 'oznaceni', e.target.value)}
                                                            placeholder="Označení / rozměry"
                                                            className="text-[10px] font-semibold bg-background border border-border/40 rounded-lg px-2.5 py-1 outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 transition-all min-w-[130px] flex-1 placeholder:text-muted-foreground/30"
                                                        />

                                                        {/* 4. Počet ks */}
                                                        <div className="flex items-center gap-1 shrink-0">
                                                            <button
                                                                type="button"
                                                                onClick={() => updateField(item.key, 'pocet', Math.max(1, (data.pocet || 1) - 1))}
                                                                className="w-6 h-6 rounded-md border border-border/40 flex items-center justify-center text-xs font-black text-muted-foreground hover:bg-muted transition-all active:scale-90"
                                                            >−</button>
                                                            <span className="text-[10px] font-black min-w-[20px] text-center">{data.pocet || 1}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => updateField(item.key, 'pocet', (data.pocet || 1) + 1)}
                                                                className="w-6 h-6 rounded-md border border-border/40 flex items-center justify-center text-xs font-black text-muted-foreground hover:bg-muted transition-all active:scale-90"
                                                            >+</button>
                                                            <span className="text-[9px] text-muted-foreground/60 font-bold ml-0.5">ks</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                selectedItems.length > 0 ? (
                                    <div className="flex flex-col gap-1.5">
                                        {selectedItems.map(item => {
                                            const data = accData[item.key] || {};
                                            const srcOption = SOURCE_OPTIONS.find(s => s.key === data.source);
                                            return (
                                                <div key={item.key} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-muted/15 border border-border/30">
                                                    <span className="text-[11px] font-black text-foreground/80 min-w-0 flex-1">{item.label}</span>
                                                    {srcOption && <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border shrink-0 ${srcOption.color}`}>{srcOption.label}</span>}
                                                    {data.vyrobce && <span className="text-[10px] font-semibold text-muted-foreground truncate max-w-[120px]">{data.vyrobce}</span>}
                                                    {data.oznaceni && <span className="text-[10px] font-semibold text-muted-foreground/70 truncate max-w-[120px]">{data.oznaceni}</span>}
                                                    {(data.pocet && data.pocet > 1) && <span className="text-[10px] font-black text-muted-foreground shrink-0">{data.pocet} ks</span>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <span className="text-xs text-muted-foreground/40 font-semibold italic">Žádné příslušenství nevybráno</span>
                                )
                            )}
                        </div>
                    );
                })()}

            </div>
        </Section>
    );
}
