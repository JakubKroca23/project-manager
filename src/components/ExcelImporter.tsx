'use client';

import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabase/client';
import { Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const cleanNaN = (val: any) => val === "NaN" || val === null || val === undefined ? undefined : val;

const getVal = (obj: any, searchKey: string) => {
    if (obj[searchKey] !== undefined) return obj[searchKey];
    const normalizedSearch = searchKey.toLowerCase().replace(/[^\w\s]/gi, '');
    const key = Object.keys(obj).find(k => {
        const normalizedK = k.toLowerCase().replace(/[^\w\s]/gi, '');
        return normalizedK === normalizedSearch;
    });
    return key ? obj[key] : undefined;
};

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

export default function ExcelImporter({ onImportSuccess }: { onImportSuccess: () => void }) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [lastImport, setLastImport] = useState<ImportInfo | null>(null);

    // Load last import info on mount
    useEffect(() => {
        const stored = localStorage.getItem('lastImportInfo');
        if (stored) {
            try {
                setLastImport(JSON.parse(stored));
            } catch { /* ignore */ }
        }
    }, []);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setMessage(null);

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonArray = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

            if (jsonArray.length === 0) {
                throw new Error('Soubor neobsahuje žádná data.');
            }

            let headerRowIndex = -1;
            for (let i = 0; i < Math.min(jsonArray.length, 20); i++) {
                const row = jsonArray[i];
                if (row.some((cell: any) => cell && typeof cell === 'string' && (cell.toLowerCase().includes('kód') || cell.toLowerCase().includes('code')))) {
                    headerRowIndex = i;
                    break;
                }
            }

            if (headerRowIndex === -1) {
                console.warn('Header row not found, using first row.');
                headerRowIndex = 0;
            }

            const jsonData = XLSX.utils.sheet_to_json(worksheet, { range: headerRowIndex });

            const projects = jsonData.map((item: any) => ({
                id: getVal(item, "Kód")?.toString(),
                name: getVal(item, "Předmět"),
                customer: getVal(item, "Klient") || "-",
                manager: getVal(item, "Vlastník") || "-",
                status: "Aktivní",
                deadline: "-",
                closed_at: parseDate(getVal(item, "Uzavřeno")),
                category: cleanNaN(getVal(item, "Kategorie")),
                abra_order: cleanNaN(getVal(item, "Abra Objednávka")),
                abra_project: cleanNaN(getVal(item, "Abra Zakázka")),
                body_delivery: parseDate(getVal(item, "Dodání nástavby")),
                customer_handover: parseDate(getVal(item, "Předání zákazníkovi")),
                chassis_delivery: parseDate(getVal(item, "Dodání podvozku")),
                production_status: cleanNaN(getVal(item, "Status Výroby")),
                mounting_company: cleanNaN(getVal(item, "Montážní společnost")),
                body_setup: cleanNaN(getVal(item, "Nástavba nastavení")),
                serial_number: cleanNaN(getVal(item, "Výrobní číslo")),
                created_at: new Date().toISOString()
            })).filter((p: any) => p.name && p.id);

            if (projects.length === 0) {
                throw new Error('Nepodařilo se načíst žádné platné projekty.');
            }

            const { error } = await supabase.from('projects').upsert(projects);

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            // Get current user for import info
            const { data: { user } } = await supabase.auth.getUser();
            const excelFileDate = new Date(file.lastModified).toLocaleDateString('cs-CZ');
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
            e.target.value = '';

        } catch (err: any) {
            console.error('Import error:', err);
            setMessage({ type: 'error', text: err.message || 'Chyba při importu.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
                <div className="relative">
                    <input
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={handleFileUpload}
                        disabled={loading}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        id="excel-upload"
                    />
                    <label
                        htmlFor="excel-upload"
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${loading
                            ? 'bg-muted text-muted-foreground'
                            : 'bg-green-600 hover:bg-green-700 text-white shadow-sm'
                            }`}
                    >
                        {loading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                        {loading ? 'Importuji...' : 'Import z Raynetu'}
                    </label>
                </div>

                {message && (
                    <span className={`flex items-center gap-1 text-xs ${message.type === 'success' ? 'text-green-600' : 'text-destructive'}`}>
                        {message.type === 'success' ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                        {message.text}
                    </span>
                )}
            </div>

            {lastImport && !message && (
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {lastImport.count} záznamů | Poslední import: {lastImport.user} · {lastImport.date} · Excel: {lastImport.excelDate}
                </span>
            )}
        </div>
    );
}
