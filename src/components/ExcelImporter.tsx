'use client';

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabase/client';
import { Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

// Helper to clean data similar to original data-utils
const cleanNaN = (val: any) => val === "NaN" || val === null || val === undefined ? undefined : val;

// Helper to find key case-insensitively
const getVal = (obj: any, searchKey: string) => {
    if (obj[searchKey] !== undefined) return obj[searchKey];
    const normalizedSearch = searchKey.toLowerCase().replace(/[^\w\s]/gi, '');
    const key = Object.keys(obj).find(k => {
        const normalizedK = k.toLowerCase().replace(/[^\w\s]/gi, '');
        return normalizedK === normalizedSearch;
    });
    return key ? obj[key] : undefined;
};

// Date parser for Excel serial dates or string dates
const parseDate = (val: any) => {
    if (!val) return null;
    if (typeof val === 'number') {
        // Excel serial date
        const date = new Date(Math.round((val - 25569) * 86400 * 1000));
        return date.toISOString().split('T')[0]; // YYYY-MM-DD
    }
    if (typeof val === 'string') {
        // Try parsing string date
        const date = new Date(val);
        if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
        }
    }
    return val; // Return as is if can't parse, or maybe null? Keeping as is for text fields
};


export default function ExcelImporter({ onImportSuccess }: { onImportSuccess: () => void }) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setMessage(null);

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];

            // Convert to array of arrays to find the header row
            const jsonArray = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

            if (jsonArray.length === 0) {
                throw new Error('Soubor neobsahuje žádná data.');
            }

            // Find header row index
            let headerRowIndex = -1;
            for (let i = 0; i < Math.min(jsonArray.length, 20); i++) {
                const row = jsonArray[i];
                // Check if row contains "Kód" or "Code" (case insensitive)
                if (row.some((cell: any) => cell && typeof cell === 'string' && (cell.toLowerCase().includes('kód') || cell.toLowerCase().includes('code')))) {
                    headerRowIndex = i;
                    break;
                }
            }

            if (headerRowIndex === -1) {
                // Fallback to 0 if not found, but log it
                console.warn('Header row not found, using first row.');
                headerRowIndex = 0;
            }

            // Re-parse using the found header row
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { range: headerRowIndex });

            console.log('Detected Header Row Index:', headerRowIndex);
            console.log('First row of data:', jsonData[0]);

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
            })).filter((p: any) => p.name && p.id); // Filter out invalid rows

            if (projects.length === 0) {
                throw new Error('Nepodařilo se načíst žádné platné projekty. Zkontrolujte názvy sloupců (Kód, Předmět).');
            }

            const { error } = await supabase.from('projects').upsert(projects);

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            setMessage({ type: 'success', text: `Úspěšně importováno ${projects.length} projektů.` });
            onImportSuccess();

            // Clear input
            e.target.value = '';

        } catch (err: any) {
            console.error('Import error:', err);
            setMessage({ type: 'error', text: err.message || 'Chyba při importu dat.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 p-4 border border-dashed border-border rounded-lg bg-muted/30">
            <div className="flex items-center gap-4">
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
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${loading
                            ? 'bg-muted text-muted-foreground'
                            : 'bg-green-600 hover:bg-green-700 text-white shadow-sm'
                            }`}
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                        {loading ? 'Zpracovávám...' : 'Importovat z Excelu'}
                    </label>
                </div>
                <div className="text-sm text-muted-foreground">
                    Podporuje .xlsx exporty z Raynetu
                </div>
            </div>

            {message && (
                <div className={`p-3 rounded-md text-sm flex items-center gap-2 ${message.type === 'success' ? 'bg-green-500/10 text-green-600 border border-green-500/20' : 'bg-destructive/10 text-destructive border border-destructive/20'
                    }`}>
                    {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    {message.text}
                </div>
            )}
        </div>
    );
}
