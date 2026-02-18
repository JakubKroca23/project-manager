'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabase/client';
import {
    Upload,
    Loader2,
    CheckCircle,
    AlertCircle,
    Lock,
    X,
    Table as TableIcon,
    Settings2,
    Save,
    FileSpreadsheet,
    PlusCircle,
    AlertTriangle,
    ArrowRight,
    Edit2,
    Clock,
    Briefcase,
    Shield,
    Wrench,
    Check
} from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { useActions } from '@/providers/ActionProvider';
import { cn } from '@/lib/utils';

const cleanNaN = (val: any) => val === "NaN" || val === null || val === undefined ? undefined : val;

const parseDate = (val: any) => {
    if (!val) return null;
    if (typeof val === 'number') {
        const date = new Date(Math.round((val - 25569) * 86400 * 1000));
        return date.toISOString().split('T')[0];
    }
    if (typeof val === 'string') {
        const date = new Date(val);
        if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
        }
    }
    return val;
};

interface ProjectField {
    key: string;
    label: string;
    required?: boolean;
    defaultAliases: string[];
}

interface DiffItem {
    id: string;
    name: string;
    changes: { field: string; old: any; new: any }[];
    isNew: boolean;
}

const PROJECT_FIELDS: ProjectField[] = [
    { key: 'id', label: 'Kód (ID)', required: true, defaultAliases: ['kód', 'code', 'id', 'předmět a číslo op', 'identifikátor'] },
    { key: 'name', label: 'Název / Předmět', required: true, defaultAliases: ['předmět', 'název', 'name', 'subject', 'titul'] },
    { key: 'customer', label: 'Klient', defaultAliases: ['klient', 'zákazník', 'customer', 'klient náz', 'odběratel'] },
    { key: 'manager', label: 'Manažer / Vlastník', defaultAliases: ['vlastník', 'manažer', 'owner', 'manager'] },
    { key: 'category', label: 'Kategorie', defaultAliases: ['kategorie', 'category'] },
    { key: 'abra_order', label: 'Abra Objednávka', defaultAliases: ['abra objednávka', 'objednávka', 'číslo objednávky'] },
    { key: 'abra_project', label: 'Abra Zakázka', defaultAliases: ['abra zakázka', 'zakázka', 'číslo zakázky'] },
    { key: 'body_delivery', label: 'Dodání nástavby', defaultAliases: ['dodání nástavby', 'termín nástavba'] },
    { key: 'customer_handover', label: 'Předání zákazníkovi', defaultAliases: ['předání', 'předání zákazníkovi', 'termín předání'] },
    { key: 'chassis_delivery', label: 'Dodání podvozku', defaultAliases: ['dodání podvozku', 'termín podvozek'] },
    { key: 'production_status', label: 'Status Výroby', defaultAliases: ['status výroby', 'stav výroby'] },
    { key: 'mounting_company', label: 'Montážní společnost', defaultAliases: ['montážní společnost', 'montáž', 'zhotovitel'] },
    { key: 'body_setup', label: 'Nástavba nastavení', defaultAliases: ['nástavba nastavení', 'konfigurace'] },
    { key: 'body_type', label: 'Typ nástavby', defaultAliases: ['typ nástavby', 'body type', 'nastavba typ'] },
    { key: 'closed_at', label: 'Uzavřeno', defaultAliases: ['uzavřeno', 'closed', 'datum uzavření', 'datum ukončení'] },
    { key: 'serial_number', label: 'Výrobní číslo / VIN', defaultAliases: ['výrobní číslo', 'vč', 'vin', 'výr. č.'] },
];

type ImportSource = 'raynet' | 'group' | 'custom';
type ProjectType = 'civil' | 'military' | 'service';

export default function ImportWizard() {
    const { isImportWizardOpen, setIsImportWizardOpen } = useActions();
    const { canImport, isLoading: permsLoading } = usePermissions();

    const [step, setStep] = useState<'type' | 'source' | 'mapping' | 'duplicates' | 'conflicts' | 'diff' | 'success'>('type');
    const [projectType, setProjectType] = useState<ProjectType | null>(null);
    const [importSource, setImportSource] = useState<ImportSource>('raynet');

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [excelColumns, setExcelColumns] = useState<string[]>([]);
    const [mapping, setMapping] = useState<Record<string, string>>({});
    const [customFields, setCustomFields] = useState<string[]>([]);
    const [renamedFields, setRenamedFields] = useState<Record<string, string>>({});
    const [rawData, setRawData] = useState<any[]>([]);
    const [currentFile, setCurrentFile] = useState<File | null>(null);

    // Diff/Duplicate state
    const [showDiff, setShowDiff] = useState(false);
    const [diffData, setDiffData] = useState<DiffItem[]>([]);
    const [preparedProjects, setPreparedProjects] = useState<any[]>([]);
    const [duplicateGroups, setDuplicateGroups] = useState<Record<string, any[]>>({});
    const [resolutionStrategy, setResolutionStrategy] = useState<'keepLast' | 'keepFirst' | 'manual'>('keepLast');
    const [typeConflictGroups, setTypeConflictGroups] = useState<any[]>([]);
    const [typeConflictAction, setTypeConflictAction] = useState<'skip' | 'overwrite'>('skip');

    // Reset wizard when opened
    useEffect(() => {
        if (isImportWizardOpen) {
            setStep('type');
            setProjectType(null);
            setMessage(null);
            setRawData([]);
            setCurrentFile(null);
        }
    }, [isImportWizardOpen]);

    const handleTypeSelect = (type: ProjectType) => {
        setProjectType(type);
        setStep('source');
    };

    const handleSourceSelect = (source: ImportSource) => {
        setImportSource(source);
        fileInputRef.current?.click();
    };

    const findBestMatch = (field: ProjectField, columns: string[]) => {
        const normalizedAliases = field.defaultAliases.map(a => a.toLowerCase().replace(/[^\w\s]/gi, ''));
        return columns.find(col => {
            const normalizedCol = col.toLowerCase().replace(/[^\w\s]/gi, '');
            return normalizedAliases.includes(normalizedCol);
        }) || "";
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setCurrentFile(file);

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data, { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonArray = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

            if (jsonArray.length === 0) throw new Error('Soubor neobsahuje žádná data.');

            // Header detection logic
            let headerRowIndex = -1;
            let maxCols = 0;
            let bestRow = 0;
            for (let i = 0; i < Math.min(jsonArray.length, 20); i++) {
                const row = jsonArray[i] || [];
                const nonEmptyCount = row.filter((c: any) => c && typeof c === 'string' && c.trim() !== '').length;
                if (nonEmptyCount > maxCols) { maxCols = nonEmptyCount; bestRow = i; }
                if (row.some((cell: any) => cell && typeof cell === 'string' && /kód|code|předmět|zakázka|id|klient/i.test(cell))) {
                    headerRowIndex = i; break;
                }
            }
            if (headerRowIndex === -1) headerRowIndex = bestRow;

            const cols = (jsonArray[headerRowIndex] as any[]).map(c => String(c || '').trim()).filter(c => c !== '');
            setExcelColumns(cols);
            setRawData(XLSX.utils.sheet_to_json(worksheet, { range: headerRowIndex }));

            // Initial mapping
            const savedMapping = localStorage.getItem(`excel_mapping_${importSource}`);
            let initialMapping: Record<string, string> = {};
            if (savedMapping) {
                try { initialMapping = JSON.parse(savedMapping); } catch { }
            }
            PROJECT_FIELDS.forEach(field => {
                if (!initialMapping[field.key] || !cols.includes(initialMapping[field.key])) {
                    initialMapping[field.key] = findBestMatch(field, cols);
                }
            });

            setMapping(initialMapping);
            setStep('mapping');
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Chyba při čtení souboru.' });
        } finally {
            setLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const prepareAndAnalyze = async () => {
        const missingRequired = PROJECT_FIELDS.filter(f => f.required && !mapping[f.key] && f.key !== 'id');
        if (missingRequired.length > 0) {
            alert(`Chybí mapování pro povinná pole: ${missingRequired.map(f => f.label).join(', ')}`);
            return;
        }

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const userName = user?.email?.split('@')[0] || 'Neznámý';

            const rawProjects = rawData.map((item: any, index: number) => {
                const importNotes: string[] = [];
                const getSafeDate = (val: any, fieldLabel: string) => {
                    const parsed = parseDate(val);
                    if (parsed && typeof parsed === 'string' && parsed.match(/^\d{4}-\d{2}-\d{2}$/)) return parsed;
                    if (val && String(val).trim() !== '') importNotes.push(`${fieldLabel}: ${val}`);
                    return null;
                };

                let projectId = item[mapping['id']]?.toString();
                if (!projectId || projectId.trim() === '') {
                    projectId = `NO-OP-${new Date().getTime().toString().slice(-6)}-${index}`;
                    importNotes.push(`ID vygenerováno automaticky`);
                }

                const project: any = {
                    id: projectId,
                    name: item[mapping['name']],
                    customer: item[mapping['customer']] || "-",
                    manager: item[mapping['manager']] || "-",
                    status: "Aktivní",
                    deadline: "-",
                    closed_at: getSafeDate(item[mapping['closed_at']], "Uzavřeno"),
                    category: cleanNaN(item[mapping['category']]),
                    abra_order: cleanNaN(item[mapping['abra_order']]),
                    abra_project: cleanNaN(item[mapping['abra_project']]),
                    body_delivery: getSafeDate(item[mapping['body_delivery']], "Dodání nástavby"),
                    customer_handover: getSafeDate(item[mapping['customer_handover']], "Předání zákazníkovi"),
                    chassis_delivery: getSafeDate(item[mapping['chassis_delivery']], "Dodání podvozku"),
                    production_status: cleanNaN(item[mapping['production_status']]),
                    mounting_company: cleanNaN(item[mapping['mounting_company']]),
                    body_setup: cleanNaN(item[mapping['body_setup']]),
                    body_type: cleanNaN(item[mapping['body_type']]),
                    serial_number: cleanNaN(item[mapping['serial_number']]),
                    project_type: projectType,
                    custom_fields: {},
                    last_modified_by: userName,
                    updated_at: new Date().toISOString()
                };

                if (importNotes.length > 0) project.note = importNotes.join('\n');
                customFields.forEach(col => {
                    const targetKey = renamedFields[col] || col;
                    project.custom_fields[targetKey] = item[col];
                });

                return (project.name) ? project : null;
            }).filter(p => p !== null);

            if (rawProjects.length === 0) throw new Error('Žádné platné projekty k importu.');

            // Check internal duplicates
            const idGroups: Record<string, any[]> = {};
            const duplicates: Record<string, any[]> = {};
            let hasDuplicates = false;
            rawProjects.forEach(p => {
                if (!idGroups[p.id]) idGroups[p.id] = [];
                idGroups[p.id].push(p);
                if (idGroups[p.id].length > 1) { duplicates[p.id] = idGroups[p.id]; hasDuplicates = true; }
            });

            if (hasDuplicates) {
                setDuplicateGroups(duplicates);
                setPreparedProjects(rawProjects);
                setStep('duplicates');
                return;
            }

            // Check cross-type conflicts
            const ids = rawProjects.map(p => p.id);
            const { data: existingData } = await supabase.from('projects').select('id, project_type').in('id', ids);
            const conflicts = existingData?.filter(e => e.project_type && e.project_type !== projectType) || [];

            if (conflicts.length > 0) {
                setTypeConflictGroups(conflicts);
                setPreparedProjects(rawProjects);
                setStep('conflicts');
                return;
            }

            await analyzeDiffs(rawProjects);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const analyzeDiffs = async (projectsToAnalyze: any[]) => {
        setLoading(true);
        try {
            const ids = projectsToAnalyze.map(p => p.id);
            const { data: existingData } = await supabase.from('projects').select('*').in('id', ids);
            const existingMap = new Map(existingData?.map(p => [p.id, p]));

            const diffs: DiffItem[] = [];
            projectsToAnalyze.forEach(newP => {
                const oldP = existingMap.get(newP.id);
                if (!oldP) {
                    diffs.push({ id: newP.id, name: newP.name, changes: [], isNew: true });
                } else {
                    const changes: { field: string; old: any; new: any }[] = [];
                    ['name', 'customer', 'manager', 'status', 'production_status', 'project_type', 'body_delivery', 'customer_handover', 'chassis_delivery'].forEach(key => {
                        if (String(newP[key] || '') !== String(oldP[key] || '')) {
                            if (!oldP.custom_fields?.manual_overrides?.[key]) {
                                changes.push({ field: key, old: oldP[key], new: newP[key] });
                            }
                        }
                    });
                    if (changes.length > 0 || projectsToAnalyze.length > 0) {
                        diffs.push({ id: newP.id, name: newP.name, changes, isNew: false });
                    }
                }
            });

            setPreparedProjects(projectsToAnalyze);
            setDiffData(diffs);
            setStep('diff');
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const finishImport = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.from('projects').upsert(preparedProjects);
            if (error) throw error;
            localStorage.setItem(`excel_mapping_${importSource}`, JSON.stringify(mapping));
            setStep('success');
            // Notify other pages
            window.dispatchEvent(new CustomEvent('projects-updated'));
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isImportWizardOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => !loading && setIsImportWizardOpen(false)} />

            <div className="relative w-full max-w-5xl bg-background border border-border rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border bg-muted/20">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                            <FileSpreadsheet size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tight">Import Wizard</h2>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold border transition-colors",
                                    step === 'type' ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border")}>1. TYP</span>
                                <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold border transition-colors",
                                    (step === 'source' || step === 'mapping') ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border")}>2. ZDROJ</span>
                                <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold border transition-colors",
                                    step === 'diff' ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border")}>3. ANALÝZA</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setIsImportWizardOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors group">
                        <X size={20} className="text-muted-foreground group-hover:text-foreground" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    {/* STEP 1: SELECT TYPE */}
                    {step === 'type' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                            <div className="text-center space-y-2">
                                <h3 className="text-2xl font-black uppercase tracking-tight text-foreground">Kam chcete data importovat?</h3>
                                <p className="text-muted-foreground text-sm">Zvolte cílovou kategorii projektů pro tento import.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                                {[
                                    { id: 'civil' as ProjectType, label: 'Civilní', icon: Briefcase, color: 'blue', desc: 'Standardní obchodní zakázky' },
                                    { id: 'military' as ProjectType, label: 'Vojenské', icon: Shield, color: 'emerald', desc: 'Armádní a speciální projekty' },
                                    { id: 'service' as ProjectType, label: 'Servis', icon: Wrench, color: 'purple', desc: 'Opravy a servisní činnost' }
                                ].map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => handleTypeSelect(t.id)}
                                        className={cn(
                                            "group relative flex flex-col items-center p-8 rounded-[2rem] border-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm",
                                            "hover:shadow-xl hover:border-primary/50 bg-card border-border/60"
                                        )}
                                    >
                                        <div className={cn("w-16 h-16 rounded-[1.25rem] flex items-center justify-center mb-6 transition-transform group-hover:scale-110",
                                            t.color === 'blue' ? "bg-blue-500/10 text-blue-600" :
                                                t.color === 'emerald' ? "bg-emerald-500/10 text-emerald-600" :
                                                    "bg-purple-500/10 text-purple-600")}>
                                            <t.icon size={32} strokeWidth={2.5} />
                                        </div>
                                        <div className="text-center">
                                            <span className="block text-lg font-black uppercase tracking-tight text-foreground">{t.label}</span>
                                            <span className="block text-xs text-muted-foreground mt-1 font-medium px-4">{t.desc}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STEP 2: SOURCE SELECT */}
                    {step === 'source' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                            <button onClick={() => setStep('type')} className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors">
                                <ArrowRight size={14} className="rotate-180" /> Změnit kategorii ({projectType})
                            </button>
                            <div className="text-center space-y-2">
                                <h3 className="text-2xl font-black uppercase tracking-tight text-foreground">Formát dat</h3>
                                <p className="text-muted-foreground text-sm">Vyberte zdrojový soubor a jeho formátování.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                                {[
                                    { id: 'raynet' as ImportSource, label: 'Raynet CRM', desc: 'Export z obchodního systému' },
                                    { id: 'group' as ImportSource, label: 'Tabulka Group', desc: 'Interní formátování zakázek' },
                                    { id: 'custom' as ImportSource, label: 'Vlastní', desc: 'Libovolná tabulka s mapováním' }
                                ].map((s) => (
                                    <button
                                        key={s.id}
                                        onClick={() => handleSourceSelect(s.id)}
                                        className="p-6 rounded-2xl bg-muted/30 border border-border hover:border-primary hover:bg-muted/50 transition-all text-left flex flex-col gap-2 group"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                            <Upload size={18} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-black uppercase tracking-tight">{s.label}</div>
                                            <div className="text-[10px] text-muted-foreground font-medium">{s.desc}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFileChange} />
                        </div>
                    )}

                    {/* STEP 3: MAPPING */}
                    {step === 'mapping' && (
                        <div className="space-y-6 animate-in fade-in">
                            <div className="flex items-center justify-between border-b border-border pb-4">
                                <h3 className="text-lg font-black uppercase tracking-tight">Napárování sloupců ({projectType})</h3>
                                <span className="text-xs font-mono text-muted-foreground">{currentFile?.name}</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {PROJECT_FIELDS.map((field) => (
                                    <div key={field.key} className="p-4 rounded-2xl bg-muted/20 border border-border/50 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                {field.label} {field.required && <span className="text-destructive">*</span>}
                                            </label>
                                            {mapping[field.key] && (
                                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-500/20">NAPÁROVÁNO</span>
                                            )}
                                        </div>
                                        <select
                                            value={mapping[field.key] || ""}
                                            onChange={(e) => setMapping(prev => ({ ...prev, [field.key]: e.target.value }))}
                                            className="w-full h-10 bg-background border border-border rounded-xl px-3 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
                                        >
                                            <option value="">-- Vybrat sloupec --</option>
                                            {excelColumns.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end gap-3 pt-6">
                                <button onClick={() => setStep('source')} className="px-6 py-2.5 text-[11px] font-bold uppercase tracking-widest hover:bg-muted rounded-xl transition-all">Zpět</button>
                                <button onClick={prepareAndAnalyze} disabled={loading} className="px-8 py-2.5 bg-primary text-primary-foreground text-[11px] font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2">
                                    {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                    Pokračovat
                                </button>
                            </div>
                        </div>
                    )}

                    {/* SUCCESS */}
                    {step === 'success' && (
                        <div className="flex flex-col items-center justify-center space-y-6 py-12 animate-in zoom-in-95">
                            <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                <Check size={48} strokeWidth={3} />
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="text-3xl font-black uppercase tracking-tight">Import Úspěšný!</h3>
                                <p className="text-muted-foreground">Projekty byly úspěšně nahrány do systému.</p>
                            </div>
                            <button onClick={() => setIsImportWizardOpen(false)} className="px-10 py-3 bg-foreground text-background text-[11px] font-black uppercase tracking-widest rounded-full hover:scale-105 transition-all">
                                Hotovo
                            </button>
                        </div>
                    )}

                    {/* DIFF VIEW (Minimalized logic for brevity in this step) */}
                    {step === 'diff' && (
                        <div className="space-y-6 animate-in fade-in">
                            <div className="text-center space-y-2 mb-8">
                                <h3 className="text-2xl font-black uppercase tracking-tight">Analýza změn</h3>
                                <p className="text-muted-foreground text-sm">Nalezeno {diffData.length} změn k uložení.</p>
                            </div>
                            <div className="bg-muted/10 border border-border rounded-2xl overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-muted/30 border-b border-border">
                                        <tr>
                                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Stav</th>
                                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Projekt/ID</th>
                                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Změny</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {diffData.slice(0, 50).map((d) => (
                                            <tr key={d.id} className="hover:bg-muted/5">
                                                <td className="px-4 py-3">
                                                    {d.isNew ?
                                                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 font-bold border border-blue-500/20">NOVÝ</span> :
                                                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-bold border border-amber-500/20">Změna</span>
                                                    }
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="font-bold text-xs">{d.name}</div>
                                                    <div className="text-[9px] font-mono text-muted-foreground">{d.id}</div>
                                                </td>
                                                <td className="px-4 py-3 text-[10px]">
                                                    {d.changes.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {d.changes.slice(0, 3).map((c, i) => (
                                                                <span key={i} className="bg-muted px-1.5 py-0.5 rounded border border-border/50">{c.field}</span>
                                                            ))}
                                                            {d.changes.length > 3 && <span>+{d.changes.length - 3}</span>}
                                                        </div>
                                                    ) : <span className="text-muted-foreground">Bez změn polí</span>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex justify-end gap-3 pt-6 pb-4">
                                <button onClick={() => setStep('mapping')} className="px-6 py-2.5 text-[11px] font-bold uppercase tracking-widest hover:bg-muted rounded-xl">Upravit mapování</button>
                                <button onClick={finishImport} disabled={loading} className="px-10 py-3 bg-primary text-primary-foreground text-[11px] font-black uppercase tracking-[0.2em] rounded-xl shadow-xl shadow-primary/30 hover:scale-[1.05] transition-all flex items-center gap-3">
                                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    Potvrdit Import
                                </button>
                            </div>
                        </div>
                    )}

                    {/* DUPLICATES Resolution */}
                    {step === 'duplicates' && (
                        <div className="space-y-6 text-center max-w-lg mx-auto py-8">
                            <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-600 mx-auto">
                                <AlertTriangle size={32} />
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-tight">V souboru jsou duplicity</h3>
                            <p className="text-sm text-muted-foreground">Některá ID se v tabulce vyskytují vícekrát ({Object.keys(duplicateGroups).length} kolizí).</p>
                            <div className="flex flex-col gap-2 pt-4">
                                <button onClick={() => { setResolutionStrategy('keepLast'); setStep('diff'); analyzeDiffs(preparedProjects); }} className="p-4 bg-muted/30 border border-border rounded-xl hover:border-primary text-xs font-bold uppercase tracking-wider text-left flex justify-between items-center group">
                                    <span>Ponechat poslední výskyt</span>
                                    <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
                                </button>
                                <button onClick={() => { setResolutionStrategy('keepFirst'); setStep('diff'); analyzeDiffs(preparedProjects); }} className="p-4 bg-muted/30 border border-border rounded-xl hover:border-primary text-xs font-bold uppercase tracking-wider text-left flex justify-between items-center group">
                                    <span>Ponechat první výskyt</span>
                                    <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            `}</style>
        </div>
    );
}
