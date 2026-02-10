'use client';

import React, { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabase/client';
import { Upload, Loader2, CheckCircle, AlertCircle, Lock, X, Table as TableIcon, Settings2, Save } from 'lucide-react';
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

type ImportSource = 'raynet' | 'group';

export default function ExcelImporter({ onImportSuccess }: { onImportSuccess: () => void }) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [lastImport, setLastImport] = useState<ImportInfo | null>(null);

    // Mapping state
    const [showMapping, setShowMapping] = useState(false);
    const [showSourceSelect, setShowSourceSelect] = useState(false);
    const [importSource, setImportSource] = useState<ImportSource>(() => {
        if (typeof window !== 'undefined') {
            return (localStorage.getItem('last_import_source') as ImportSource) || 'raynet';
        }
        return 'raynet';
    });
    const [projectType, setProjectType] = useState<'civil' | 'military'>('civil');
    const [excelColumns, setExcelColumns] = useState<string[]>([]);
    const [mapping, setMapping] = useState<Record<string, string>>({});
    const [customFields, setCustomFields] = useState<string[]>([]);
    const [rawData, setRawData] = useState<any[]>([]);
    const [currentFile, setCurrentFile] = useState<File | null>(null);

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

    const handleProcessFile = async (source: ImportSource, pType: 'civil' | 'military') => {
        if (!currentFile) return;

        setLoading(true);
        setMessage(null);
        setImportSource(source);
        setProjectType(pType);
        localStorage.setItem('last_import_source', source);
        setShowSourceSelect(false);

        try {
            const data = await currentFile.arrayBuffer();
            const workbook = XLSX.read(data, { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonArray = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

            if (jsonArray.length === 0) {
                throw new Error('Soubor neobsahuje žádná data.');
            }

            // Find header row (first row that looks like it has headers)
            let headerRowIndex = -1;
            for (let i = 0; i < Math.min(jsonArray.length, 20); i++) {
                const row = jsonArray[i];
                if (row.some((cell: any) => cell && typeof cell === 'string' && (
                    cell.toLowerCase().includes('kód') ||
                    cell.toLowerCase().includes('code') ||
                    cell.toLowerCase().includes('předmět') ||
                    cell.toLowerCase().includes('zakázka') ||
                    cell.toLowerCase().includes('id')
                ))) {
                    headerRowIndex = i;
                    break;
                }
            }

            if (headerRowIndex === -1) headerRowIndex = 0;

            const cols = (jsonArray[headerRowIndex] as any[]).map(c => String(c || '').trim()).filter(c => c !== '');
            setExcelColumns(cols);

            const dataRows = XLSX.utils.sheet_to_json(worksheet, { range: headerRowIndex });
            setRawData(dataRows);

            // Initial mapping: try to find saved mapping for THIS SOURCE specifically
            const savedMapping = localStorage.getItem(`excel_mapping_${source}`);
            let initialMapping: Record<string, string> = {};

            if (savedMapping) {
                try {
                    const parsed = JSON.parse(savedMapping);
                    initialMapping = parsed;
                } catch { /* ignore */ }
            }

            // Fill missing fields with best matches
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

    const executeImport = async () => {
        // Validation
        const missingRequired = PROJECT_FIELDS.filter(f => f.required && !mapping[f.key]);
        if (missingRequired.length > 0) {
            alert(`Chybí mapování pro povinná pole: ${missingRequired.map(f => f.label).join(', ')}`);
            return;
        }

        setLoading(true);
        try {
            const projects = rawData.map((item: any) => {
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
                    created_at: new Date().toISOString()
                };

                // Add selected custom fields
                customFields.forEach(col => {
                    project.custom_fields[col] = item[col];
                });

                // Final validation of data row
                if (!project.id || !project.name) {
                    throw new Error(`Data neobsahují povinné hodnoty (Kód/Název) na některém z řádků.`);
                }

                return project;
            }).filter((p: any) => p.name && p.id);

            if (projects.length === 0) {
                throw new Error('Nepodařilo se načíst žádné platné projekty.');
            }

            const { error } = await supabase.from('projects').upsert(projects);

            if (error) throw error;

            // Save mapping for THIS SOURCE
            localStorage.setItem(`excel_mapping_${importSource}`, JSON.stringify(mapping));

            // Import Info
            const { data: { user } } = await supabase.auth.getUser();
            const excelFileDate = currentFile ? new Date(currentFile.lastModified).toLocaleDateString('cs-CZ') : '-';
            const importInfo: ImportInfo = {
                date: new Date().toLocaleString('cs-CZ'),
                user: user?.email?.split('@')[0] || 'Neznámý',
                count: projects.length,
                excelDate: excelFileDate,
            };
            localStorage.setItem('lastImportInfo', JSON.stringify(importInfo));
            setLastImport(importInfo);

            setMessage({ type: 'success', text: `Importováno ${projects.length} projektů.` });
            onImportSuccess();
            setShowMapping(false);
            setCustomFields([]); // Reset

        } catch (err: any) {
            console.error('Import execution error:', err);
            alert(`Chyba při importu: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (permsLoading) return <div className="h-10 w-32 bg-muted animate-pulse rounded-md" />;

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
                {canImport ? (
                    <div className="relative group/btn">
                        <button
                            onClick={() => setShowSourceSelect(true)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap uppercase tracking-wider ${loading
                                ? 'bg-muted text-muted-foreground'
                                : 'bg-[#0099ee] hover:bg-[#00aaff] text-white shadow-lg shadow-blue-500/10 hover:scale-[1.02] active:scale-[0.98]'
                                }`}
                            disabled={loading}
                        >
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                            <span>{loading ? 'Zpracovávám...' : 'Importovat Excel'}</span>
                        </button>
                    </div>
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

            {lastImport && !message && (
                <div className="flex items-center gap-2 text-[9px] text-muted-foreground font-medium uppercase tracking-tighter">
                    <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-bold">{lastImport.count} PROJEKTŮ</span>
                    <span>Poslední: {lastImport.user} · {lastImport.date}</span>
                </div>
            )}

            {/* Source Selection Modal */}
            {showSourceSelect && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowSourceSelect(false)} />
                    <div className="relative w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl p-8 animate-in zoom-in-95 duration-300">
                        <div className="text-center space-y-2 mb-8">
                            <h3 className="text-2xl font-bold text-foreground">Konfigurace Importu</h3>
                            <p className="text-sm text-muted-foreground">Vyberte cílovou kategorii a formát dat</p>
                        </div>

                        <div className="space-y-6">
                            {/* Category Selection */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Kategorie Projektů</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setProjectType('civil')}
                                        className={`px-4 py-3 rounded-2xl border-2 transition-all font-bold text-xs uppercase tracking-wider ${projectType === 'civil'
                                            ? 'border-primary bg-primary/10 text-primary shadow-lg shadow-primary/10'
                                            : 'border-border bg-muted/20 text-muted-foreground hover:bg-muted/40'
                                            }`}
                                    >
                                        Civilní
                                    </button>
                                    <button
                                        onClick={() => setProjectType('military')}
                                        className={`px-4 py-3 rounded-2xl border-2 transition-all font-bold text-xs uppercase tracking-wider ${projectType === 'military'
                                            ? 'border-indigo-600 bg-indigo-600/10 text-indigo-600 shadow-lg shadow-indigo-600/10'
                                            : 'border-border bg-muted/20 text-muted-foreground hover:bg-muted/40'
                                            }`}
                                    >
                                        Armáda
                                    </button>
                                </div>
                            </div>

                            {/* Source Selection */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Formát Tabulky</label>
                                <div className="grid grid-cols-1 gap-3">
                                    <button
                                        onClick={() => handleProcessFile('raynet', projectType)}
                                        className="flex items-center justify-between px-5 py-4 rounded-2xl bg-green-600 hover:bg-green-700 text-white transition-all group active:scale-[0.98] shadow-lg shadow-green-600/20"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Upload size={18} />
                                            <div className="text-left">
                                                <div className="text-xs font-bold uppercase tracking-wider">Raynet Export</div>
                                                <div className="text-[10px] opacity-80 font-medium">Standardní export z CRM</div>
                                            </div>
                                        </div>
                                        <CheckCircle size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>

                                    <button
                                        onClick={() => handleProcessFile('group', projectType)}
                                        className="flex items-center justify-between px-5 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white transition-all group active:scale-[0.98] shadow-lg shadow-blue-600/20"
                                    >
                                        <div className="flex items-center gap-3">
                                            <TableIcon size={18} />
                                            <div className="text-left">
                                                <div className="text-xs font-bold uppercase tracking-wider">Tabulka Group</div>
                                                <div className="text-[10px] opacity-80 font-medium">Zakázkový formát Tabulka Group</div>
                                            </div>
                                        </div>
                                        <CheckCircle size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowSourceSelect(false)}
                            className="w-full mt-6 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                        >
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
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-border bg-muted/5">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-2xl ${importSource === 'raynet' ? 'bg-green-500/10 text-green-600' : 'bg-blue-500/10 text-blue-600'}`}>
                                    {importSource === 'raynet' ? <Upload size={24} /> : <TableIcon size={24} />}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                                        Mapování sloupců
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${importSource === 'raynet'
                                            ? 'bg-green-500/10 text-green-600 border-green-500/20'
                                            : 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                                            }`}>
                                            {importSource === 'raynet' ? 'RAYNET EXPORT' : 'TABULKA GROUP'}
                                        </span>
                                    </h3>
                                    <p className="text-xs text-muted-foreground">Přiřaďte sloupce z Excelu polím v aplikaci pro správný import dat.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => !loading && setShowMapping(false)}
                                className="p-2 hover:bg-muted rounded-full transition-colors group"
                            >
                                <X size={20} className="text-muted-foreground group-hover:text-foreground" />
                            </button>
                        </div>

                        {/* Body - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="bg-muted/30 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-border/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-background rounded-xl border border-border/50 text-muted-foreground">
                                        <Settings2 size={16} />
                                    </div>
                                    <div className="text-[11px] font-bold uppercase tracking-widest">
                                        <span className="text-muted-foreground">Nalezeno:</span>
                                        <span className="ml-1.5 text-foreground">{rawData.length} řádků</span>
                                    </div>
                                </div>
                                <div className="text-[11px] font-bold uppercase tracking-widest text-right">
                                    <span className="text-muted-foreground">Soubor:</span>
                                    <span className="ml-1.5 text-foreground truncate max-w-[200px] inline-block align-bottom">{currentFile?.name}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {PROJECT_FIELDS.map((field) => (
                                    <div key={field.key} className="group space-y-2 p-4 rounded-2xl bg-muted/10 border border-border/60 hover:border-primary/40 hover:bg-muted/20 transition-all duration-300">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">
                                                {field.label}
                                                {field.required && <span className="text-destructive ml-1">*</span>}
                                            </label>
                                            <div className="flex items-center gap-2">
                                                {mapping[field.key] ? (
                                                    <div className="flex items-center gap-1 text-[9px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                                        <CheckCircle size={8} />
                                                        <span>OK</span>
                                                    </div>
                                                ) : (
                                                    field.required && <div className="text-[9px] text-destructive font-bold bg-destructive/10 px-2 py-0.5 rounded-full border border-destructive/20 animate-pulse">CHYBÍ</div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <select
                                                value={mapping[field.key] || ""}
                                                onChange={(e) => setMapping(prev => ({ ...prev, [field.key]: e.target.value }))}
                                                className="w-full h-10 bg-background border border-border/80 rounded-xl px-3 text-xs font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none transition-all cursor-pointer hover:border-border"
                                            >
                                                <option value="" className="text-muted-foreground italic">-- Vyberte sloupec z Excelu --</option>
                                                {excelColumns.map(col => (
                                                    <option key={col} value={col}>{col}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                                <Settings2 size={12} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Dynamic Fields Section */}
                            <div className="space-y-4 pt-4 border-t border-border/50">
                                <div className="flex flex-col gap-1">
                                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
                                        Nenapárované sloupce
                                        <span className="text-[9px] font-medium text-muted-foreground normal-case bg-muted px-2 py-0.5 rounded-md border border-border/50">
                                            Volitelné (uloží se jako doplňující data)
                                        </span>
                                    </h4>
                                    <p className="text-[10px] text-muted-foreground">Vyberte další sloupce z Excelu, které chcete u projektů sledovat.</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {excelColumns
                                        .filter(col => !Object.values(mapping).includes(col))
                                        .map(col => (
                                            <button
                                                key={col}
                                                onClick={() => {
                                                    setCustomFields(prev =>
                                                        prev.includes(col)
                                                            ? prev.filter(c => c !== col)
                                                            : [...prev, col]
                                                    );
                                                }}
                                                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border flex items-center gap-2 ${customFields.includes(col)
                                                    ? 'bg-primary/20 border-primary/40 text-primary shadow-sm'
                                                    : 'bg-muted/30 border-border/60 text-muted-foreground hover:bg-muted/50 hover:border-border'
                                                    }`}
                                            >
                                                {customFields.includes(col) ? <CheckCircle size={10} /> : <Settings2 size={10} />}
                                                {col}
                                            </button>
                                        ))
                                    }
                                    {excelColumns.filter(col => !Object.values(mapping).includes(col)).length === 0 && (
                                        <p className="text-[10px] italic text-muted-foreground">Všechny sloupce byly napárovány.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/5">
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <Save size={16} className="text-primary/60" />
                                <p className="text-[10px] font-medium leading-relaxed uppercase tracking-tighter">
                                    Mapování bude uloženo pro další importy typu <span className="font-bold text-foreground underline underline-offset-4">{importSource.toUpperCase()}</span>.
                                </p>
                            </div>
                            <div className="flex gap-3 w-full sm:w-auto">
                                <button
                                    onClick={() => setShowMapping(false)}
                                    disabled={loading}
                                    className="flex-1 sm:flex-none px-6 py-2.5 text-[11px] font-bold uppercase tracking-widest hover:bg-muted rounded-2xl transition-all border border-border active:scale-[0.98]"
                                >
                                    Zrušit
                                </button>
                                <button
                                    onClick={executeImport}
                                    disabled={loading}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-2.5 bg-primary text-primary-foreground text-[11px] font-bold uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
                                >
                                    {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                    <span>{loading ? 'Importuji...' : 'Spustit import'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
