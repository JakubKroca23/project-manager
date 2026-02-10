'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabase/client';
import { Upload, Loader2, CheckCircle, AlertCircle, Lock, X, Table as TableIcon, Settings2, Save, FileSpreadsheet, PlusCircle, AlertTriangle, ArrowRight, Edit2 } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';

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

interface ImportInfo {
    date: string;
    user: string;
    count: number;
    excelDate: string;
}

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
    { key: 'closed_at', label: 'Uzavřeno', defaultAliases: ['uzavřeno', 'closed', 'datum uzavření', 'datum ukončení'] },
    { key: 'serial_number', label: 'Výrobní číslo / VIN', defaultAliases: ['výrobní číslo', 'vč', 'vin', 'výr. č.'] },
];

type ImportSource = 'raynet' | 'group' | 'custom';

export default function ExcelImporter({ onImportSuccess, projectType }: { onImportSuccess: () => void, projectType: 'civil' | 'military' }) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [lastImport, setLastImport] = useState<ImportInfo | null>(null);

    // Mapping state
    const [showMapping, setShowMapping] = useState(false);
    const [showSourceSelect, setShowSourceSelect] = useState(false);
    const [importSuccess, setImportSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [importSource, setImportSource] = useState<ImportSource>(() => {
        if (typeof window !== 'undefined') {
            return (localStorage.getItem('last_import_source') as ImportSource) || 'raynet';
        }
        return 'raynet';
    });
    const [excelColumns, setExcelColumns] = useState<string[]>([]);
    const [mapping, setMapping] = useState<Record<string, string>>({});
    const [customFields, setCustomFields] = useState<string[]>([]);
    const [renamedFields, setRenamedFields] = useState<Record<string, string>>({});
    const [rawData, setRawData] = useState<any[]>([]);
    const [currentFile, setCurrentFile] = useState<File | null>(null);

    // Diff state
    const [showDiff, setShowDiff] = useState(false);
    const [diffData, setDiffData] = useState<DiffItem[]>([]);
    const [preparedProjects, setPreparedProjects] = useState<any[]>([]);

    const { canImport, isLoading: permsLoading } = usePermissions();

    // Load last import info on mount
    useEffect(() => {
        const stored = localStorage.getItem('lastImportInfo');
        if (stored) {
            try {
                setLastImport(JSON.parse(stored));
            } catch { /* ignore */ }
        }
    }, []);

    const findBestMatch = (field: ProjectField, columns: string[]) => {
        const normalizedAliases = field.defaultAliases.map(a => a.toLowerCase().replace(/[^\w\s]/gi, ''));
        return columns.find(col => {
            const normalizedCol = col.toLowerCase().replace(/[^\w\s]/gi, '');
            return normalizedAliases.includes(normalizedCol);
        }) || "";
    };

    const handleFileSelect = (source: ImportSource) => {
        setImportSource(source);
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCurrentFile(file);
            handleProcessFile(importSource, file);
        }
        e.target.value = '';
    };

    const handleProcessFile = async (source: ImportSource, file: File) => {
        setLoading(true);
        setMessage(null);
        setImportSuccess(false);
        localStorage.setItem('last_import_source', source);
        setShowSourceSelect(false);
        setCustomFields([]);
        setRenamedFields({});

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data, { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonArray = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

            if (jsonArray.length === 0) {
                throw new Error('Soubor neobsahuje žádná data.');
            }

            let headerRowIndex = -1;
            let maxCols = 0;
            let bestRow = 0;

            for (let i = 0; i < Math.min(jsonArray.length, 20); i++) {
                const row = jsonArray[i] || [];
                const nonEmptyCount = row.filter((c: any) => c && typeof c === 'string' && c.trim() !== '').length;

                if (nonEmptyCount > maxCols) {
                    maxCols = nonEmptyCount;
                    bestRow = i;
                }

                if (row.some((cell: any) => cell && typeof cell === 'string' && (
                    cell.toLowerCase().includes('kód') ||
                    cell.toLowerCase().includes('code') ||
                    cell.toLowerCase().includes('předmět') ||
                    cell.toLowerCase().includes('zakázka') ||
                    cell.toLowerCase().includes('číslo zakázky') ||
                    cell.toLowerCase().includes('id') ||
                    cell.toLowerCase().includes('typ') ||
                    cell.toLowerCase().includes('klient')
                ))) {
                    headerRowIndex = i;
                    break;
                }
            }

            // Fallback: If no keyword match, use the row with the most columns
            if (headerRowIndex === -1) headerRowIndex = bestRow;

            const cols = (jsonArray[headerRowIndex] as any[]).map(c => String(c || '').trim()).filter(c => c !== '');
            setExcelColumns(cols);

            const dataRows = XLSX.utils.sheet_to_json(worksheet, { range: headerRowIndex });
            setRawData(dataRows);

            const savedMapping = localStorage.getItem(`excel_mapping_${source}`);
            let initialMapping: Record<string, string> = {};

            if (savedMapping) {
                try {
                    const parsed = JSON.parse(savedMapping);
                    initialMapping = parsed;
                } catch { /* ignore */ }
            }

            PROJECT_FIELDS.forEach(field => {
                const currentVal = initialMapping[field.key];
                if (!currentVal || !cols.includes(currentVal)) {
                    initialMapping[field.key] = findBestMatch(field, cols);
                }
            });

            setMapping(initialMapping);
            setShowMapping(true);
            setLoading(false);

        } catch (err: any) {
            console.error('Import error:', err);
            setMessage({ type: 'error', text: err.message || 'Chyba při nahrávání souboru.' });
            setLoading(false);
        }
    };

    const prepareAndAnalyzeImport = async () => {
        const missingRequired = PROJECT_FIELDS.filter(f => f.required && !mapping[f.key]);
        if (missingRequired.length > 0) {
            alert(`Chybí mapování pro povinná pole: ${missingRequired.map(f => f.label).join(', ')}`);
            return;
        }

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const userName = user?.email?.split('@')[0] || 'Neznámý';

            // Construct new projects
            const newProjects = rawData.map((item: any) => {
                const project: any = {
                    id: item[mapping['id']]?.toString(),
                    name: item[mapping['name']],
                    customer: item[mapping['customer']] || "-",
                    manager: item[mapping['manager']] || "-",
                    status: "Aktivní",
                    deadline: "-",
                    closed_at: parseDate(item[mapping['closed_at']]),
                    category: cleanNaN(item[mapping['category']]),
                    abra_order: cleanNaN(item[mapping['abra_order']]),
                    abra_project: cleanNaN(item[mapping['abra_project']]),
                    body_delivery: parseDate(item[mapping['body_delivery']]),
                    customer_handover: parseDate(item[mapping['customer_handover']]),
                    chassis_delivery: parseDate(item[mapping['chassis_delivery']]),
                    production_status: cleanNaN(item[mapping['production_status']]),
                    mounting_company: cleanNaN(item[mapping['mounting_company']]),
                    body_setup: cleanNaN(item[mapping['body_setup']]),
                    serial_number: cleanNaN(item[mapping['serial_number']]),
                    project_type: projectType,
                    custom_fields: {},
                    last_modified_by: userName,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };

                customFields.forEach(col => {
                    const targetKey = renamedFields[col] || col;
                    project.custom_fields[targetKey] = item[col];
                });

                if (!project.id || !project.name) {
                    return null;
                }

                return project;
            }).filter((p): p is any => p !== null && p.name && p.id);

            if (newProjects.length === 0) {
                throw new Error('Nepodařilo se načíst žádné platné projekty.');
            }

            // Fetch existing projects for comparison
            const ids = newProjects.map(p => p.id);
            const { data: existingData } = await supabase
                .from('projects')
                .select('*')
                .in('id', ids);

            const existingMap = new Map(existingData?.map(p => [p.id, p]));

            // Calculate Diffs
            const diffs: DiffItem[] = [];

            newProjects.forEach(newP => {
                const oldP = existingMap.get(newP.id);
                if (!oldP) {
                    diffs.push({ id: newP.id, name: newP.name, changes: [], isNew: true });
                } else {
                    const changes: { field: string; old: any; new: any }[] = [];

                    // Compare standard fields
                    ['name', 'customer', 'manager', 'status', 'production_status'].forEach(key => {
                        if (String(newP[key] || '') !== String(oldP[key] || '')) {
                            changes.push({ field: key, old: oldP[key], new: newP[key] });
                        }
                    });

                    // Compare custom fields
                    // Compare custom fields (Detailed)
                    const oldCustom = oldP.custom_fields || {};
                    const newCustom = newP.custom_fields || {};
                    const allKeys = Array.from(new Set([...Object.keys(oldCustom), ...Object.keys(newCustom)]));

                    allKeys.forEach(key => {
                        const oldVal = oldCustom[key] ?? "-";
                        const newVal = newCustom[key] ?? "-";

                        if (String(oldVal) !== String(newVal)) {
                            // Helper to format object/array if somehow stored there, though usually string/number
                            const fmtOld = typeof oldVal === 'object' ? JSON.stringify(oldVal) : String(oldVal);
                            const fmtNew = typeof newVal === 'object' ? JSON.stringify(newVal) : String(newVal);
                            changes.push({ field: `[EXT] ${key}`, old: fmtOld, new: fmtNew });
                        }
                    });

                    if (changes.length > 0) {
                        diffs.push({ id: newP.id, name: newP.name, changes, isNew: false });
                    }
                }
            });

            setPreparedProjects(newProjects);
            setDiffData(diffs);
            setShowDiff(true); // Open Diff Modal
            setShowMapping(false); // Close Mapping
            setLoading(false);

        } catch (err: any) {
            console.error('Import analysis error:', err);
            alert(`Chyba při analýze: ${err.message}`);
            setLoading(false);
        }
    };

    const confirmImport = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const userName = user?.email?.split('@')[0] || 'Neznámý';

            const { error } = await supabase.from('projects').upsert(preparedProjects);
            if (error) throw error;

            localStorage.setItem(`excel_mapping_${importSource}`, JSON.stringify(mapping));

            // Create Log Entry
            // Summarize changes for log (count of new vs updated)
            const newCount = diffData.filter(d => d.isNew).length;
            const updatedCount = diffData.filter(d => !d.isNew).length;

            await supabase.from('import_logs').insert({
                project_type: projectType,
                performed_by: userName,
                row_count: preparedProjects.length,
                source: importSource,
                changes_summary: {
                    new: newCount,
                    updated: updatedCount,
                    total: preparedProjects.length
                }
            });

            // Metadata updates
            const excelFileDate = currentFile ? new Date(currentFile.lastModified).toLocaleDateString('cs-CZ') : '-';
            const importInfo: ImportInfo = {
                date: new Date().toLocaleString('cs-CZ'),
                user: userName,
                count: preparedProjects.length,
                excelDate: excelFileDate,
            };

            const metaKey = `last_import_info_${projectType}`;
            await supabase.from('app_metadata').upsert({
                key: metaKey,
                value: importInfo,
                updated_at: new Date().toISOString()
            });

            if (projectType === 'civil') {
                await supabase.from('app_metadata').upsert({
                    key: 'last_import_info',
                    value: importInfo,
                    updated_at: new Date().toISOString()
                });
            }

            localStorage.setItem('lastImportInfo', JSON.stringify(importInfo));
            setLastImport(importInfo);

            setMessage({ type: 'success', text: `Importováno ${preparedProjects.length} projektů.` });
            setImportSuccess(true);

            // Close Diff Modal and show Success in main view
            setShowDiff(false);
            onImportSuccess();

        } catch (err: any) {
            console.error('Import execution error:', err);
            alert(`Chyba při importu: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // UI Helper for renaming field
    const toggleCustomField = (col: string) => {
        setCustomFields(prev => {
            if (prev.includes(col)) {
                const newFields = prev.filter(c => c !== col);
                const newRenamed = { ...renamedFields };
                delete newRenamed[col];
                setRenamedFields(newRenamed);
                return newFields;
            } else {
                return [...prev, col];
            }
        });
    };

    if (permsLoading) return <div className="h-10 w-32 bg-muted animate-pulse rounded-md" />;

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
                {canImport ? (
                    <button
                        onClick={() => setShowSourceSelect(true)}
                        className={`flex items-center gap-2 px-4 py-2 border border-blue-500/20 rounded-xl text-[11px] font-bold uppercase tracking-wider shadow-lg shadow-blue-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all bg-[#0099ee] hover:bg-[#00aaff] text-white
                        ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={loading}
                    >
                        {loading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                        <span>{loading ? 'Zpracovávám...' : 'Importovat Excel'}</span>
                    </button>
                ) : (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-xl text-muted-foreground text-[10px] border border-dashed border-border opacity-60">
                        <Lock size={14} />
                        <span className="font-bold uppercase tracking-widest">Import uzamčen</span>
                    </div>
                )}

                {message && (
                    <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${message.type === 'success' ? 'text-green-600' : 'text-destructive'}`}>
                        {message.type === 'success' ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                        {message.text}
                    </span>
                )}
            </div>

            {/* Source Selection Modal */}
            {showSourceSelect && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowSourceSelect(false)} />
                    <div className="relative w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl p-8 animate-in zoom-in-95 duration-300">
                        <div className="text-center space-y-2 mb-8">
                            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4">
                                <FileSpreadsheet size={24} />
                            </div>
                            <h3 className="text-2xl font-bold text-foreground">Import z Excelu</h3>
                            <p className="text-sm text-muted-foreground">Vyberte formát dat pro import do kategorie <span className="font-bold text-foreground uppercase tracking-wider underline underline-offset-4 decoration-primary/30">{projectType === 'civil' ? 'Civilní' : 'Armáda'}</span></p>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Dostupné formáty</label>
                            <div className="grid grid-cols-1 gap-3">
                                {['raynet', 'group', 'custom'].map((src) => (
                                    <button
                                        key={src}
                                        onClick={() => handleFileSelect(src as ImportSource)}
                                        className="flex items-center justify-between px-5 py-4 rounded-2xl bg-muted/30 hover:bg-muted/50 border border-border/50 hover:border-primary/40 transition-all group active:scale-[0.98] shadow-sm"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 bg-background rounded-xl ${src === 'raynet' ? 'text-green-600' : src === 'group' ? 'text-blue-600' : 'text-primary'}`}>
                                                {src === 'custom' ? <PlusCircle size={18} /> : src === 'group' ? <TableIcon size={18} /> : <Upload size={18} />}
                                            </div>
                                            <div className="text-left">
                                                <div className="text-xs font-bold uppercase tracking-wider">{src === 'raynet' ? 'Raynet Export' : src === 'group' ? 'Tabulka Group' : 'Nový formát'}</div>
                                                <div className="text-[10px] opacity-70 font-medium text-muted-foreground">
                                                    {src === 'custom' ? 'Nahrát a ručně napárovat libovolný soubor' : src === 'group' ? 'Zakázkový formát Tabulka Group' : 'Standardní export z CRM'}
                                                </div>
                                            </div>
                                        </div>
                                        {src === 'custom' ? <Settings2 size={16} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" /> : <CheckCircle size={16} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFileChange} />

                        <button onClick={() => setShowSourceSelect(false)} className="w-full mt-6 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
                            Zrušit
                        </button>
                    </div>
                </div>
            )}

            {/* Mapping Modal */}
            {showMapping && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-md animate-in fade-in duration-300" onClick={() => !loading && setShowMapping(false)} />
                    <div className="relative w-full max-w-4xl bg-card border border-border rounded-3xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300 overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-border bg-muted/5">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-2xl ${importSource === 'raynet' ? 'bg-green-500/10 text-green-600' : 'bg-blue-500/10 text-primary'}`}>
                                    {importSource === 'raynet' ? <Upload size={24} /> : <TableIcon size={24} />}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                                        Mapování sloupců
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${importSource === 'raynet' ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                                            {importSource.toUpperCase()}
                                        </span>
                                    </h3>
                                    <p className="text-xs text-muted-foreground">Přiřaďte sloupce z Excelu polím v aplikaci.</p>
                                </div>
                            </div>
                            <button onClick={() => !loading && setShowMapping(false)} className="p-2 hover:bg-muted rounded-full transition-colors group">
                                <X size={20} className="text-muted-foreground group-hover:text-foreground" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {PROJECT_FIELDS.map((field) => (
                                    <div key={field.key} className="group space-y-2 p-4 rounded-2xl bg-muted/10 border border-border/60 hover:border-primary/40 transition-all">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">
                                                {field.label} {field.required && <span className="text-destructive ml-1">*</span>}
                                            </label>
                                            {mapping[field.key] ? (
                                                <div className="flex items-center gap-1 text-[9px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                                    <CheckCircle size={8} /> <span>OK</span>
                                                </div>
                                            ) : field.required && <div className="text-[9px] text-destructive font-bold bg-destructive/10 px-2 py-0.5 rounded-full border border-destructive/20">CHYBÍ</div>}
                                        </div>
                                        <select
                                            value={mapping[field.key] || ""}
                                            onChange={(e) => setMapping(prev => ({ ...prev, [field.key]: e.target.value }))}
                                            className="w-full h-10 bg-background border border-border/80 rounded-xl px-3 text-xs font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        >
                                            <option value="" className="text-muted-foreground italic">-- Vyberte sloupec --</option>
                                            {excelColumns.map(col => <option key={col} value={col}>{col}</option>)}
                                        </select>
                                    </div>
                                ))}
                            </div>

                            {/* Dynamic Fields with Renaming */}
                            <div className="space-y-4 pt-4 border-t border-border/50">
                                <div className="flex flex-col gap-1">
                                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
                                        Volitelné sloupce
                                        <span className="text-[9px] font-medium text-muted-foreground normal-case bg-muted px-2 py-0.5 rounded-md border border-border/50">Uloží se jako extra data</span>
                                    </h4>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {excelColumns.filter(col => !Object.values(mapping).includes(col)).map(col => {
                                        const isSelected = customFields.includes(col);
                                        return (
                                            <div key={col} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${isSelected ? 'bg-primary/5 border-primary/30' : 'bg-muted/10 border-border/50'}`}>
                                                <div className="flex items-center gap-3">
                                                    <button onClick={() => toggleCustomField(col)} className={`p-1.5 rounded-lg transition-colors ${isSelected ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                                                        {isSelected ? <CheckCircle size={14} /> : <PlusCircle size={14} />}
                                                    </button>
                                                    <span className={`text-xs font-medium ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>{col}</span>
                                                </div>

                                                {isSelected && (
                                                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                                                        <ArrowRight size={12} className="text-muted-foreground" />
                                                        <div className="flex items-center gap-2 bg-background border border-primary/20 rounded-lg px-2 py-1">
                                                            <Edit2 size={10} className="text-primary" />
                                                            <input
                                                                type="text"
                                                                className="w-32 text-xs bg-transparent border-none outline-none font-medium placeholder:text-muted-foreground/50"
                                                                placeholder="Přejmenovat na..."
                                                                value={renamedFields[col] || col}
                                                                onChange={(e) => setRenamedFields(prev => ({ ...prev, [col]: e.target.value }))}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-border flex justify-end gap-3 bg-muted/5">
                            <button onClick={() => setShowMapping(false)} disabled={loading} className="px-6 py-2.5 text-[11px] font-bold uppercase tracking-widest hover:bg-muted rounded-2xl transition-all border border-border">Zrušit</button>
                            <button onClick={prepareAndAnalyzeImport} disabled={loading} className="flex items-center justify-center gap-2 px-8 py-2.5 bg-primary text-primary-foreground text-[11px] font-bold uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all">
                                {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                <span>Analyzovat změny</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Diff Modal */}
            {showDiff && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" />
                    <div className="relative w-full max-w-5xl bg-card border border-border rounded-3xl shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-5 duration-300 overflow-hidden">
                        <div className="p-6 border-b border-border bg-muted/5 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold flex items-center gap-3">
                                    <AlertTriangle className="text-amber-500" />
                                    <span>Kontrola změn před importem</span>
                                </h3>
                                <p className="text-xs text-muted-foreground mt-1">Zkontrolujte změny, které budou provedeny v databázi.</p>
                            </div>
                            <div className="flex gap-4 text-xs font-bold uppercase tracking-wider">
                                <div className="flex items-center gap-2 text-green-600 bg-green-500/10 px-3 py-1 rounded-lg">
                                    <PlusCircle size={14} /> Nové: {diffData.filter(d => d.isNew).length}
                                </div>
                                <div className="flex items-center gap-2 text-amber-600 bg-amber-500/10 px-3 py-1 rounded-lg">
                                    <Edit2 size={14} /> Aktualizované: {diffData.filter(d => !d.isNew).length}
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-0">
                            {diffData.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground">Žádné změny k importu. Všechna data jsou aktuální.</div>
                            ) : (
                                <div className="divide-y divide-border/50">
                                    {diffData.map(item => (
                                        <div key={item.id} className={`p-4 hover:bg-muted/5 transition-colors ${item.isNew ? 'bg-green-50/5' : ''}`}>
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    {item.isNew ? <span className="bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">NOVÝ</span> : <span className="bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">UPDATE</span>}
                                                    <span className="font-bold text-sm">{item.id}</span>
                                                    <span className="text-sm text-muted-foreground">— {item.name}</span>
                                                </div>
                                            </div>
                                            {!item.isNew && item.changes.map((change, idx) => (
                                                <div key={idx} className="ml-8 text-xs grid grid-cols-[150px_1fr_20px_1fr] gap-2 items-center py-1 text-muted-foreground">
                                                    <span className="font-medium uppercase">{change.field}</span>
                                                    <span className="line-through opacity-70 truncate">{String(change.old)}</span>
                                                    <ArrowRight size={10} />
                                                    <span className="text-foreground font-medium truncate">{String(change.new)}</span>
                                                </div>
                                            ))}
                                            {item.isNew && <div className="ml-8 text-xs text-green-600/70 italic">Bude vytvořen nový záznam.</div>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-border flex justify-end gap-3 bg-muted/5">
                            <button onClick={() => { setShowDiff(false); setShowMapping(true); }} className="px-6 py-2.5 text-[11px] font-bold uppercase tracking-widest hover:bg-muted rounded-2xl transition-all border border-border">Zpět</button>
                            <button onClick={confirmImport} className="flex items-center justify-center gap-2 px-8 py-2.5 bg-green-600 text-white text-[11px] font-bold uppercase tracking-widest rounded-2xl shadow-xl shadow-green-600/20 hover:bg-green-700 active:scale-[0.98] transition-all">
                                <CheckCircle size={14} />
                                <span>Potvrdit a Importovat</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
