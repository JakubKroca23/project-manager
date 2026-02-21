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
    Plus,
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
    customer: string;
    date: string | null;
    changes: { field: string; old: any; new: any }[];
    isNew: boolean;
}

const PROJECT_FIELDS: ProjectField[] = [
    { key: 'id', label: 'Kód (ID)', required: true, defaultAliases: ['kód', 'code', 'id', 'předmět a číslo op', 'identifikátor'] },
    { key: 'name', label: 'Název / Předmět', required: true, defaultAliases: ['předmět', 'název', 'name', 'subject', 'titul'] },
    { key: 'customer', label: 'Klient', defaultAliases: ['klient', 'zákazník', 'customer', 'klient náz', 'odběratel'] },
    { key: 'manager', label: 'Vedoucí projektu', defaultAliases: ['vlastník', 'manažer', 'owner', 'manager'] },
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
    { key: 'closed_at', label: 'Zahájení (Uzavření obchodu)', defaultAliases: ['uzavřeno', 'closed', 'datum uzavření', 'datum ukončení', 'zahájení'] },
    { key: 'serial_number', label: 'Výrobní číslo / VIN', defaultAliases: ['výrobní číslo', 'vč', 'vin', 'výr. č.'] },
];

type ImportSource = 'excel' | 'pdf' | 'dxf' | 'glb' | 'word' | 'image';
type ProjectType = 'civil' | 'military' | 'service' | 'specific';

export default function ImportWizard() {
    const { isImportWizardOpen, setIsImportWizardOpen } = useActions();
    const { canImport, isLoading: permsLoading } = usePermissions();

    const [step, setStep] = useState<'type' | 'source' | 'header-selection' | 'mapping' | 'duplicates' | 'conflicts' | 'diff' | 'success'>('type');
    const [projectType, setProjectType] = useState<ProjectType | null>(null);
    const [importSource, setImportSource] = useState<ImportSource>('excel');

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [excelColumns, setExcelColumns] = useState<string[]>([]);
    const [mapping, setMapping] = useState<Record<string, string>>({});
    const [customFields, setCustomFields] = useState<string[]>([]);
    const [renamedFields, setRenamedFields] = useState<Record<string, string>>({});
    const [rawData, setRawData] = useState<any[]>([]);
    const [rawMatrix, setRawMatrix] = useState<any[][]>([]);
    const [headerRowIndex, setHeaderRowIndex] = useState<number>(0);
    const [currentFile, setCurrentFile] = useState<File | null>(null);

    // Diff/Duplicate state
    const [showDiff, setShowDiff] = useState(false);
    const [diffData, setDiffData] = useState<DiffItem[]>([]);
    const [preparedProjects, setPreparedProjects] = useState<any[]>([]);
    const [duplicateGroups, setDuplicateGroups] = useState<Record<string, any[]>>({});
    const [resolutionStrategy, setResolutionStrategy] = useState<'keepLast' | 'keepFirst' | 'manual'>('manual');
    const [manualResolutions, setManualResolutions] = useState<Record<string, number>>({}); // id -> selected index
    const [typeConflictGroups, setTypeConflictGroups] = useState<any[]>([]);
    const [typeConflictAction, setTypeConflictAction] = useState<'skip' | 'overwrite'>('skip');

    // Selection state
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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

            setRawMatrix(jsonArray);

            // Initial auto-detection for default suggestion
            let detectedIndex = 0;
            let maxCols = 0;
            for (let i = 0; i < Math.min(jsonArray.length, 20); i++) {
                const row = jsonArray[i] || [];
                const nonEmptyCount = row.filter((c: any) => c !== null && c !== undefined && String(c).trim() !== '').length;
                if (nonEmptyCount > maxCols) { maxCols = nonEmptyCount; detectedIndex = i; }
                if (row.some((cell: any) => cell && typeof cell === 'string' && /kód|code|předmět|zakázka|id|klient/i.test(cell))) {
                    detectedIndex = i; break;
                }
            }

            setHeaderRowIndex(detectedIndex);
            setStep('header-selection');
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Chyba při čtení souboru.' });
        } finally {
            setLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const confirmHeaderAndContinue = (index: number) => {
        try {
            const rawHeaderRow = (rawMatrix[index] as any[]) || [];

            // Map: trimmed name -> column index
            const colMap = new Map<string, number>();
            const cols: string[] = [];

            rawHeaderRow.forEach((cell, idx) => {
                if (cell !== null && cell !== undefined) {
                    const trimmed = String(cell).trim();
                    if (trimmed) {
                        colMap.set(trimmed, idx);
                        cols.push(trimmed);
                    }
                }
            });

            setExcelColumns(cols);

            // Generate rawData manually from matrix to ensure key consistency
            const dataRows = rawMatrix.slice(index + 1);
            const jsonData = dataRows.map(row => {
                const obj: any = {};
                cols.forEach(colName => {
                    const colIdx = colMap.get(colName);
                    if (colIdx !== undefined) {
                        obj[colName] = row[colIdx];
                    }
                });
                return obj;
            });

            setRawData(jsonData);
            console.log("Parsed data:", jsonData.slice(0, 3)); // Debug log

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
        } catch (err) {
            console.error("Error parsing header:", err);
            alert("Chyba při zpracování hlavičky.");
        }
    };

    // Helper for chunking arrays
    const chunkArray = <T,>(array: T[], size: number): T[][] => {
        const chunked: T[][] = [];
        for (let i = 0; i < array.length; i += size) {
            chunked.push(array.slice(i, i + size));
        }
        return chunked;
    };

    const prepareAndAnalyze = async () => {
        console.log("Starting prepareAndAnalyze");
        console.log("Current mapping:", mapping);
        console.log("Raw data length:", rawData.length);

        const missingRequired = PROJECT_FIELDS.filter(f => f.required && !mapping[f.key] && f.key !== 'id');
        if (missingRequired.length > 0) {
            console.log("Missing required fields:", missingRequired);
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

                // ID handling
                let projectId = item[mapping['id']]?.toString();
                if (!projectId || projectId.trim() === '') {
                    // Generate temp ID
                    projectId = `NO-OP-${new Date().getTime().toString().slice(-6)}-${index}`;
                    importNotes.push(`ID vygenerováno automaticky`);
                } else {
                    projectId = projectId.trim();
                }

                // Name is required
                const nameVal = item[mapping['name']];
                if (!nameVal || String(nameVal).trim() === '') {
                    console.log(`Skipping row ${index}: Missing name. Value:`, nameVal);
                    return null;
                }

                const project: any = {
                    id: projectId,
                    name: String(nameVal).trim(),
                    customer: item[mapping['customer']] || "-",
                    manager: item[mapping['manager']] || "-",
                    status: "Aktivní",
                    deadline: "-",
                    closed_at: getSafeDate(item[mapping['closed_at']], "Zahájení (Uzavření obchodu)"),
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
                    project_type: projectType || 'civil',
                    custom_fields: {},
                    last_modified_by: userName,
                    updated_at: new Date().toISOString()
                };

                if (importNotes.length > 0) project.note = importNotes.join('\n');
                customFields.forEach(col => {
                    const targetKey = renamedFields[col] || col;
                    project.custom_fields[targetKey] = item[col];
                });

                return project;
            }).filter(p => p !== null);

            console.log("Valid projects count:", rawProjects.length);

            if (rawProjects.length === 0) {
                console.error("No valid projects found!");
                throw new Error('Žádné platné projekty k importu. Zkontrolujte sloupec "Název".');
            }

            // 1. Check internal duplicates
            console.log("Checking duplicates...");
            const idGroups: Record<string, any[]> = {};
            const duplicates: Record<string, any[]> = {};
            let hasDuplicates = false;
            rawProjects.forEach(p => {
                if (!idGroups[p.id]) idGroups[p.id] = [];
                idGroups[p.id].push(p);
                if (idGroups[p.id].length > 1) { duplicates[p.id] = idGroups[p.id]; hasDuplicates = true; }
            });
            console.log("Has duplicates:", hasDuplicates);

            if (hasDuplicates) {
                setDuplicateGroups(duplicates);
                const initialResolutions: Record<string, number> = {};
                Object.keys(duplicates).forEach(id => { initialResolutions[id] = 0; });
                setManualResolutions(initialResolutions);
                setPreparedProjects(rawProjects);
                setStep('duplicates');
                return;
            }

            // 2. Check cross-type conflicts (Batched)
            console.log("Checking conflicts... Project Type:", projectType);
            const ids = rawProjects.map(p => p.id);
            const idChunks = chunkArray(ids, 100); // 100 IDs per request
            let conflicts: any[] = [];

            for (const chunk of idChunks) {
                const { data: existingChunk, error } = await supabase
                    .from('projects')
                    .select('id, project_type')
                    .in('id', chunk);

                if (error) {
                    console.error("Conflict check error:", error);
                    throw error;
                }
                if (existingChunk) {
                    const chunkConflicts = existingChunk.filter(e => e.project_type && e.project_type !== projectType);
                    conflicts = [...conflicts, ...chunkConflicts];
                }
            }

            console.log("Conflicts found:", conflicts.length);
            if (conflicts.length > 0) {
                setTypeConflictGroups(conflicts);
                setPreparedProjects(rawProjects);
                setStep('conflicts');
                return;
            }

            // 3. Analyze Diffs
            console.log("Calling analyzeDiffs...");
            await analyzeDiffs(rawProjects);

        } catch (err: any) {
            console.error(err);
            alert(`Chyba přípravy dat: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const analyzeDiffs = async (projectsToAnalyze: any[]) => {
        console.log("Inside analyzeDiffs...");
        setLoading(true);
        try {
            const ids = projectsToAnalyze.map(p => p.id);
            const idChunks = chunkArray(ids, 100);

            const existingMap = new Map<string, any>();

            // Fetch existing data in chunks
            for (const chunk of idChunks) {
                console.log("Fetching existing data chunk:", chunk);
                const { data: chunkData, error } = await supabase
                    .from('projects')
                    .select('*')
                    .in('id', chunk);

                if (error) {
                    console.error("Fetch existing data error:", error);
                    throw error;
                }
                chunkData?.forEach(p => existingMap.set(p.id, p));
            }
            console.log("Existing data fetched. Map size:", existingMap.size);

            const diffs: DiffItem[] = [];
            projectsToAnalyze.forEach(newP => {
                const oldP = existingMap.get(newP.id);
                const mainDate = newP.customer_handover || newP.deadline || newP.body_delivery;

                if (!oldP) {
                    diffs.push({
                        id: newP.id,
                        name: newP.name,
                        customer: newP.customer,
                        date: mainDate,
                        changes: [],
                        isNew: true
                    });
                } else {
                    const changes: { field: string; old: any; new: any }[] = [];
                    ['name', 'customer', 'manager', 'status', 'production_status', 'project_type', 'body_delivery', 'customer_handover', 'chassis_delivery'].forEach(key => {
                        if (String(newP[key] || '') !== String(oldP[key] || '')) {
                            if (!oldP.custom_fields?.manual_overrides?.[key]) {
                                changes.push({ field: key, old: oldP[key], new: newP[key] });
                            }
                        }
                    });

                    diffs.push({
                        id: newP.id,
                        name: newP.name,
                        customer: newP.customer,
                        date: mainDate,
                        changes,
                        isNew: false
                    });
                }
            });

            console.log("Diffs analyzed:", diffs.length);
            setPreparedProjects(projectsToAnalyze);
            setDiffData(diffs);
            setSelectedIds(new Set(diffs.map(d => d.id)));
            console.log("Setting step to 'diff'");
            setStep('diff');
        } catch (err: any) {
            console.error(err);
            alert(`Chyba analýzy změn: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const finishImport = async () => {
        setLoading(true);
        try {
            const projectsToUpsert = preparedProjects.filter(p => selectedIds.has(p.id));
            if (projectsToUpsert.length === 0) {
                alert('Nebyly vybrány žádné projekty k importu.');
                return;
            }
            const { error } = await supabase.from('projects').upsert(projectsToUpsert);
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
                                    (step === 'source' || step === 'header-selection') ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border")}>2. SOUBOR</span>
                                <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold border transition-colors",
                                    step === 'mapping' ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border")}>3. MAPOVÁNÍ</span>
                                <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold border transition-colors",
                                    (step === 'diff' || step === 'success') ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border")}>4. ANALÝZA</span>
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

                            {/* Option for specific project - smaller and distinct */}
                            <div className="flex justify-center pt-8 border-t border-border/30">
                                <button
                                    onClick={() => handleTypeSelect('specific')}
                                    className={cn(
                                        "flex items-center gap-2.5 px-4 py-2 rounded-xl border border-border bg-card transition-all group",
                                        "hover:border-primary/40 hover:bg-muted/20 hover:shadow-lg"
                                    )}
                                >
                                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center transition-transform group-hover:scale-110">
                                        <PlusCircle size={18} />
                                    </div>
                                    <div className="text-left">
                                        <span className="block text-xs font-black uppercase tracking-widest text-foreground group-hover:text-primary transition-colors italic">DOPLNĚNÍ K ZAKÁZCE</span>
                                        <span className="block text-[10px] text-muted-foreground font-medium">Import dokumentů nebo dat ke konkrétní existující zakázce</span>
                                    </div>
                                </button>
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
                                    { id: 'excel' as ImportSource, label: 'Excel Tabulka', desc: 'Import dat z Excelu (.xlsx, .xls, .csv)' },
                                    // { id: 'pdf' as ImportSource, label: 'PDF Dokument', desc: 'TBA' },
                                    // { id: 'dxf' as ImportSource, label: 'DXF Výkres', desc: 'TBA' },
                                    // { id: 'glb' as ImportSource, label: '3D Model (GLB)', desc: 'TBA' },
                                    // { id: 'word' as ImportSource, label: 'Word Dokument', desc: 'TBA' },
                                    // { id: 'image' as ImportSource, label: 'Obrázek', desc: 'TBA' },
                                ].map((s) => (
                                    <button
                                        key={s.id}
                                        onClick={() => handleSourceSelect(s.id)}
                                        className="p-6 rounded-2xl bg-muted/30 border border-border hover:border-primary hover:bg-muted/50 transition-all text-left flex flex-col gap-2 group w-full"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                            <FileSpreadsheet size={18} />
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

                    {/* STEP 2.5: HEADER SELECTION */}
                    {step === 'header-selection' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            <div className="text-center space-y-2">
                                <h3 className="text-2xl font-black uppercase tracking-tight text-foreground">Vyberte řádek s hlavičkou</h3>
                                <p className="text-muted-foreground text-sm">Kliknutím na řádek v tabulce zvolte ten, který obsahuje názvy sloupců.</p>
                            </div>

                            <div className="bg-muted/10 border border-border rounded-2xl overflow-hidden shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="bg-muted/30 border-b border-border">
                                                <th className="px-4 py-2 w-12 text-[10px] font-black uppercase text-muted-foreground">Řádek</th>
                                                {Array.from({ length: Math.max(...rawMatrix.slice(0, 10).map(r => r.length)) }).map((_, i) => (
                                                    <th key={i} className="px-4 py-2 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Sloupec {i + 1}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/50">
                                            {rawMatrix.slice(0, 15).map((row, rIdx) => (
                                                <tr
                                                    key={rIdx}
                                                    onClick={() => setHeaderRowIndex(rIdx)}
                                                    className={cn(
                                                        "cursor-pointer transition-all hover:bg-primary/5 group",
                                                        headerRowIndex === rIdx ? "bg-primary/10" : ""
                                                    )}
                                                >
                                                    <td className="px-4 py-3 font-mono text-muted-foreground/60 border-r border-border/50">{rIdx + 1}</td>
                                                    {row.map((cell, cIdx) => (
                                                        <td key={cIdx} className={cn("px-4 py-3 truncate max-w-[200px]", headerRowIndex === rIdx ? "font-bold text-primary" : "text-muted-foreground")}>
                                                            {cell !== null && cell !== undefined ? String(cell) : ""}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button onClick={() => setStep('source')} className="px-6 py-2.5 text-[11px] font-bold uppercase tracking-widest hover:bg-muted rounded-xl transition-all">Zpět</button>
                                <button
                                    onClick={() => confirmHeaderAndContinue(headerRowIndex)}
                                    className="px-8 py-2.5 bg-primary text-primary-foreground text-[11px] font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                                >
                                    Potvrdit hlavičku
                                    <ArrowRight size={14} />
                                </button>
                            </div>
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
                                            {mapping[field.key] ? (
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-500/20">NAPÁROVÁNO</span>
                                                    <button
                                                        onClick={() => setMapping(prev => {
                                                            const n = { ...prev };
                                                            delete n[field.key];
                                                            return n;
                                                        })}
                                                        className="text-muted-foreground hover:text-destructive transition-colors"
                                                    >
                                                        <X size={10} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-bold border border-amber-500/20">CHYBÍ</span>
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

                            {/* Unmapped pile */}
                            {excelColumns.filter(c => !Object.values(mapping).includes(c)).length > 0 && (
                                <div className="p-6 rounded-[2rem] bg-muted/10 border border-dashed border-border space-y-4">
                                    <div className="flex items-center gap-2">
                                        <TableIcon size={16} className="text-muted-foreground" />
                                        <h4 className="text-xs font-black uppercase tracking-widest">Hromádka nespárovaných sloupců</h4>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {excelColumns.filter(c => !Object.values(mapping).includes(c)).map(col => (
                                            <div key={col} className="group relative">
                                                <button
                                                    onClick={() => {
                                                        // Auto-map to first empty required field or just highlight?
                                                        // For now just a badge
                                                    }}
                                                    className="px-3 py-1.5 bg-background border border-border rounded-lg text-[10px] font-bold hover:border-primary/50 transition-all flex items-center gap-2 pr-2"
                                                >
                                                    {col}
                                                    <div className="w-4 h-4 rounded-md bg-muted flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Plus size={10} />
                                                    </div>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground italic">Tyto sloupce nebudou do systému nahrány.</p>
                                </div>
                            )}
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
                                            <th className="px-4 py-3 w-10">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                    checked={selectedIds.size === diffData.length && diffData.length > 0}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedIds(new Set(diffData.map(d => d.id)));
                                                        } else {
                                                            setSelectedIds(new Set());
                                                        }
                                                    }}
                                                />
                                            </th>
                                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Stav</th>
                                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Klient</th>
                                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Projekt/ID</th>
                                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Termín</th>
                                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Změny</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {diffData.slice(0, 100).map((d) => (
                                            <tr key={d.id} className={cn("hover:bg-muted/5 transition-colors", !selectedIds.has(d.id) && "opacity-50")}>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                        checked={selectedIds.has(d.id)}
                                                        onChange={() => {
                                                            const newSet = new Set(selectedIds);
                                                            if (newSet.has(d.id)) newSet.delete(d.id);
                                                            else newSet.add(d.id);
                                                            setSelectedIds(newSet);
                                                        }}
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    {d.isNew ?
                                                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 font-bold border border-blue-500/20">NOVÝ</span> :
                                                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-bold border border-amber-500/20">Změna</span>
                                                    }
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="text-xs font-bold whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{d.customer}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="font-bold text-xs">{d.name}</div>
                                                    <div className="text-[9px] font-mono text-muted-foreground">{d.id}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="text-[10px] font-medium text-muted-foreground">
                                                        {d.date ? new Date(d.date).toLocaleDateString('cs-CZ') : '-'}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-[10px]">
                                                    {d.changes.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {d.changes.slice(0, 3).map((c, i) => (
                                                                <span key={i} className="bg-muted px-1.5 py-0.5 rounded border border-border/50">{c.field}</span>
                                                            ))}
                                                            {d.changes.length > 3 && <span>+{d.changes.length - 3}</span>}
                                                        </div>
                                                    ) : <span className="text-muted-foreground">Beze změn</span>}
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
                        <div className="space-y-6 animate-in fade-in">
                            <div className="text-center space-y-2">
                                <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-600 mx-auto mb-4">
                                    <AlertTriangle size={32} />
                                </div>
                                <h3 className="text-2xl font-black uppercase tracking-tight">Ošetření duplicit v souboru</h3>
                                <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                                    Nalezeno {Object.keys(duplicateGroups).length} skupin duplicitních ID. Vyberte, který záznam chcete ponechat, nebo upravte ID u konkrétního řádku.
                                </p>
                            </div>

                            <div className="space-y-8 max-h-[50vh] overflow-y-auto px-2 custom-scrollbar">
                                {Object.entries(duplicateGroups).map(([id, items]) => (
                                    <div key={id} className="p-6 rounded-[2rem] border border-border bg-muted/5 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-600 text-[10px] font-black uppercase tracking-widest border border-amber-500/20">
                                                    ID: {id}
                                                </div>
                                                <span className="text-xs font-medium text-muted-foreground">nalezeno {items.length}x</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-2">
                                            {items.map((item, idx) => (
                                                <div
                                                    key={idx}
                                                    className={cn(
                                                        "p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between",
                                                        manualResolutions[id] === idx ? "bg-primary/5 border-primary shadow-sm" : "bg-background border-border hover:bg-muted/30"
                                                    )}
                                                    onClick={() => setManualResolutions(prev => ({ ...prev, [id]: idx }))}
                                                >
                                                    <div className="flex items-center gap-4 flex-1">
                                                        <div className={cn(
                                                            "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                                                            manualResolutions[id] === idx ? "border-primary bg-primary text-white" : "border-muted-foreground/30"
                                                        )}>
                                                            {manualResolutions[id] === idx && <Check size={12} strokeWidth={4} />}
                                                        </div>
                                                        <div className="space-y-0.5">
                                                            <div className="text-xs font-bold">{item.name}</div>
                                                            <div className="text-[10px] text-muted-foreground">{item.customer} • {item.manager}</div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <label className="text-[9px] font-black text-muted-foreground uppercase">Upravit ID:</label>
                                                        <input
                                                            type="text"
                                                            value={item.id}
                                                            onChange={(e) => {
                                                                const newId = e.target.value;
                                                                setPreparedProjects(prev => prev.map(p => {
                                                                    if (p === item) return { ...p, id: newId };
                                                                    return p;
                                                                }));
                                                                // If ID changed, it might no longer be a duplicate in this group
                                                                // For UX simplicity, we edit the reference and user will see refresh
                                                            }}
                                                            onClick={e => e.stopPropagation()}
                                                            className="h-7 w-24 bg-background border border-border rounded-md px-2 text-[10px] font-mono outline-none focus:ring-1 focus:ring-primary"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-center gap-3 pt-6 border-t border-border">
                                <button
                                    onClick={() => setStep('mapping')}
                                    className="px-6 py-2.5 text-[11px] font-bold uppercase tracking-widest hover:bg-muted rounded-xl transition-all"
                                >
                                    Zpět k mapování
                                </button>
                                <button
                                    onClick={() => {
                                        // Finalize preparedProjects based on manualResolutions
                                        const finalProjects: any[] = [];
                                        const processedIds = new Set<string>();

                                        // 1. Add unique ones or manually selected duplicates
                                        preparedProjects.forEach(p => {
                                            const isDuplicate = duplicateGroups[p.id];
                                            if (!isDuplicate) {
                                                finalProjects.push(p);
                                            } else {
                                                if (!processedIds.has(p.id)) {
                                                    const selectedIdx = manualResolutions[p.id];
                                                    const chosenOne = duplicateGroups[p.id][selectedIdx];
                                                    finalProjects.push(chosenOne);
                                                    processedIds.add(p.id);
                                                }
                                            }
                                        });

                                        setPreparedProjects(finalProjects);
                                        setStep('diff');
                                        analyzeDiffs(finalProjects);
                                    }}
                                    className="px-10 py-3 bg-primary text-primary-foreground text-[11px] font-black uppercase tracking-[0.2em] rounded-xl shadow-xl shadow-primary/30 hover:scale-[1.05] transition-all flex items-center gap-3"
                                >
                                    Potvrdit a analyzovat změny
                                    <ArrowRight size={14} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* CONFLICTS Resolution */}
                    {step === 'conflicts' && (
                        <div className="space-y-6 animate-in fade-in">
                            <div className="text-center space-y-2">
                                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center text-destructive mx-auto mb-4">
                                    <AlertCircle size={32} />
                                </div>
                                <h3 className="text-2xl font-black uppercase tracking-tight">Konflikt typů projektů</h3>
                                <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                                    Nalezeno {typeConflictGroups.length} projektů, které již existují v systému pod jiným typem než <strong>{projectType}</strong>.
                                </p>
                            </div>

                            <div className="overflow-hidden rounded-2xl border border-border bg-muted/5">
                                <div className="bg-destructive/10 px-6 py-4 flex items-center gap-4">
                                    <AlertCircle className="text-destructive shrink-0" size={20} />
                                    <div className="text-xs text-destructive font-medium">
                                        Tyto projekty nebudou importovány, pokud nezvolíte přepsání. Změna typu projektu může ovlivnit dostupná data.
                                    </div>
                                </div>
                                <div className="max-h-[40vh] overflow-y-auto divide-y divide-border/50">
                                    {typeConflictGroups.map((p, idx) => (
                                        <div key={idx} className="px-6 py-3 flex items-center justify-between hover:bg-muted/20 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="font-mono text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">{p.id}</div>
                                                <div className="text-xs font-medium">Existující typ: <span className="font-bold uppercase text-foreground">{p.project_type}</span></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto pt-4">
                                <button
                                    onClick={() => {
                                        setTypeConflictAction('skip');
                                        // Remove conflicting projects from preparedProjects
                                        const conflictingIds = new Set(typeConflictGroups.map(c => c.id));
                                        const filteredProjects = preparedProjects.filter(p => !conflictingIds.has(p.id));
                                        setPreparedProjects(filteredProjects);

                                        if (filteredProjects.length === 0) {
                                            alert("Po přeskočení konfliktů nezbyly žádné projekty k importu.");
                                            setStep('mapping');
                                        } else {
                                            analyzeDiffs(filteredProjects);
                                        }
                                    }}
                                    className={cn(
                                        "p-4 rounded-xl border-2 text-center transition-all flex flex-col items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]",
                                        typeConflictAction === 'skip' ? "border-primary bg-primary/5 shadow-md" : "border-border hover:border-primary/50"
                                    )}
                                >
                                    <div className="w-8 h-8 rounded-full bg-background border flex items-center justify-center text-muted-foreground">
                                        <ArrowRight size={14} className="rotate-45" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-black uppercase tracking-widest">Přeskočit konflikty</div>
                                        <div className="text-[10px] text-muted-foreground mt-1">Nahrát pouze bezproblémové projekty</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => {
                                        setTypeConflictAction('overwrite');
                                        // Update project_type for conflicting projects in preparedProjects
                                        const conflictingIds = new Set(typeConflictGroups.map(c => c.id));
                                        const updatedProjects = preparedProjects.map(p => {
                                            if (conflictingIds.has(p.id) && projectType) {
                                                return { ...p, project_type: projectType };
                                            }
                                            return p;
                                        });
                                        setPreparedProjects(updatedProjects);
                                        analyzeDiffs(updatedProjects);
                                    }}
                                    className={cn(
                                        "p-4 rounded-xl border-2 text-center transition-all flex flex-col items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]",
                                        typeConflictAction === 'overwrite' ? "border-destructive bg-destructive/5 shadow-md" : "border-border hover:border-destructive/50"
                                    )}
                                >
                                    <div className="w-8 h-8 rounded-full bg-background border flex items-center justify-center text-destructive">
                                        <Shield size={14} />
                                    </div>
                                    <div>
                                        <div className="text-xs font-black uppercase tracking-widest text-destructive">Přepsat typ</div>
                                        <div className="text-[10px] text-muted-foreground mt-1">Změnit typ u existujících projektů</div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}

                    <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            `}</style>
                </div>
            </div>
        </div>
    );
}
