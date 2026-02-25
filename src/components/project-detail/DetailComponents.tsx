import React from 'react';
import { Project } from '@/types/project';
import { cn, formatDate } from '@/lib/utils';

export const colorMap: Record<string, { border: string; bg: string; icon: string; text: string }> = {
    blue: { border: 'border-blue-500/20', bg: 'bg-blue-500/5', icon: 'text-blue-500', text: 'text-blue-600' },
    amber: { border: 'border-amber-500/20', bg: 'bg-amber-500/5', icon: 'text-amber-500', text: 'text-amber-600' },
    emerald: { border: 'border-emerald-500/20', bg: 'bg-emerald-500/5', icon: 'text-emerald-500', text: 'text-emerald-600' },
    purple: { border: 'border-purple-500/20', bg: 'bg-purple-500/5', icon: 'text-purple-500', text: 'text-purple-600' },
    slate: { border: 'border-border/60', bg: 'bg-muted/5', icon: 'text-muted-foreground', text: 'text-muted-foreground' },
};

interface SectionProps {
    icon: React.ReactNode;
    title: string;
    color: string;
    children: React.ReactNode;
    fullWidth?: boolean;
    action?: React.ReactNode;
    className?: string;
}

export function Section({ icon, title, color, children, action, className }: SectionProps) {
    const c = colorMap[color] || colorMap.slate;
    return (
        <section className={cn(
            "mb-8 overflow-hidden bg-white border-[3px] border-black shadow-lg",
            className
        )}>
            <header className={cn(
                "px-4 py-2 border-b-[3px] border-black flex items-center justify-between bg-slate-100",
            )}>
                <div className="flex items-center gap-3">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-black">{title}</h3>
                </div>
                {action}
            </header>
            <div className="bg-white">
                {children}
            </div>
        </section>
    );
}

export function AccessoriesTable({ rows = [] }: { rows?: any[] }) {
    const defaultRows = [
        { label: 'BLATNÍKY', desc: '', provider: 'CONTSYSTEM', installer: 'CONTSYSTEM', note: '' },
        { label: 'BOČNÍ PODJEZDOVÉ ZÁBRANY', desc: '', provider: 'CONTSYSTEM', installer: 'CONTSYSTEM', note: '' },
        { label: 'ZADNÍ PODJEZDOVÁ ZÁBRANA', desc: 'HIAB URBH 810', provider: 'CONTSYSTEM', installer: 'CONTSYSTEM', note: '' },
        { label: 'DRŽÁK REZERVY', desc: 'ALSAP', provider: 'CONT', installer: 'CONT', note: '' },
        { label: 'ČERPADLO', desc: 'SAP 84I R', provider: 'Contsystem', installer: 'Contsystem', note: '' },
        { label: 'SKŘÍNĚ NA NÁŘADÍ', desc: '', provider: 'CONTSYSTEM', installer: 'CONTSYSTEM', note: '' },
        { label: 'NÁDOBA NA VODU', desc: '', provider: 'CONTSYSTEM', installer: 'CONTSYSTEM', note: '' },
        { label: 'MEZIRÁM', desc: '-', provider: '-', installer: '-', note: '' },
        { label: 'NÁDRŽ', desc: '150l BOČNÍ v rámu', provider: 'Contsystem', installer: 'Contsystem', note: 'PADOAN' },
    ];

    const dataRows = rows.length > 0 ? rows : defaultRows;

    return (
        <div className="w-full border-t-[3px] border-black overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-slate-200 border-b-[3px] border-black">
                        <th className="border-r-[3px] border-black px-2 py-1.5 text-[9px] font-black uppercase text-slate-600 text-left w-1/4">Příslušenství</th>
                        <th className="border-r-[3px] border-black px-2 py-1.5 text-[9px] font-black uppercase text-slate-600 text-left w-1/4">Popis</th>
                        <th className="border-r-[3px] border-black px-2 py-1.5 text-[9px] font-black uppercase text-slate-600 text-left">Kdo dodává</th>
                        <th className="border-r-[3px] border-black px-2 py-1.5 text-[9px] font-black uppercase text-slate-600 text-left">Kdo montuje</th>
                        <th className="px-2 py-1.5 text-[9px] font-black uppercase text-slate-600 text-left">Poznámka</th>
                    </tr>
                </thead>
                <tbody className="divide-y-[2px] divide-slate-300">
                    {dataRows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                            <td className="border-r-[3px] border-black px-2 py-1.5 text-[10px] font-black uppercase bg-slate-50/50">{row.label}</td>
                            <td className="border-r-[3px] border-black px-2 py-1.5 text-[11px] font-bold italic text-blue-900">{row.desc}</td>
                            <td className="border-r-[3px] border-black px-2 py-1.5 text-[10px] font-bold text-slate-700">{row.provider}</td>
                            <td className="border-r-[3px] border-black px-2 py-1.5 text-[10px] font-bold text-slate-700">{row.installer}</td>
                            <td className="px-2 py-1.5 text-[10px] font-bold text-slate-700">{row.note}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export function SimpleMemo({ title, content, isEditing, onChange }: { title: string, content: string, isEditing?: boolean, onChange?: (val: string) => void }) {
    return (
        <div className="mb-8 border-[3px] border-black overflow-hidden">
            <div className="bg-yellow-400 border-b-[3px] border-black px-2 py-1">
                <h4 className="text-[9px] font-black uppercase tracking-tight text-slate-800">{title}</h4>
            </div>
            <div className="p-4 min-h-[100px] flex items-center justify-center text-center">
                {isEditing ? (
                    <textarea
                        className="w-full h-full min-h-[100px] outline-none text-base font-black p-2 bg-yellow-50"
                        value={content}
                        onChange={(e) => onChange?.(e.target.value)}
                    />
                ) : (
                    <p className="text-lg font-black italic text-slate-800">{content || '—'}</p>
                )}
            </div>
        </div>
    );
}

export function DocumentFooter({ salesperson, approvedBy }: { salesperson: string, approvedBy: string }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-12 border-[3px] border-black mt-8">
            <div className="md:col-span-3 border-r-[3px] border-black divide-y-[3px] divide-black">
                <div className="flex bg-sky-200">
                    <span className="w-24 border-r-[3px] border-black px-2 py-1 text-[8px] font-black uppercase flex items-center shrink-0">Obchodník:</span>
                    <span className="px-2 py-1 text-[11px] font-black">{salesperson}</span>
                </div>
                <div className="flex">
                    <span className="w-24 border-r-[3px] border-black px-2 py-1 text-[8px] font-black uppercase text-blue-800 italic shrink-0">podpis:</span>
                    <div className="flex-1 h-8 flex items-center px-4">
                        <div className="w-16 h-4 border-b border-blue-400 rotate-[-5deg] opacity-50" />
                    </div>
                </div>
                <div className="flex bg-sky-100">
                    <span className="w-24 border-r-[3px] border-black px-2 py-1 text-[8px] font-black uppercase flex items-center shrink-0">Datum:</span>
                    <span className="px-2 py-1 text-[10px] font-black italic">{new Date().toLocaleDateString('cs-CZ')}</span>
                </div>
            </div>
            <div className="md:col-span-3 border-r-[3px] border-black divide-y-[3px] divide-black">
                <div className="flex bg-sky-200">
                    <span className="w-24 border-r-[2px] border-black px-2 py-1 text-[8px] font-black uppercase flex items-center shrink-0">Schválil:</span>
                    <span className="px-2 py-1 text-[11px] font-black">{approvedBy}</span>
                </div>
                <div className="flex">
                    <span className="w-24 border-r-[2px] border-black px-2 py-1 text-[8px] font-black uppercase text-blue-800 italic shrink-0">podpis:</span>
                    <div className="flex-1 h-8 flex items-center px-4">
                        <div className="w-16 h-4 border-b border-blue-400 rotate-[5deg] opacity-50" />
                    </div>
                </div>
                <div className="flex bg-sky-100">
                    <span className="w-24 border-r-[2px] border-black px-2 py-1 text-[8px] font-black uppercase flex items-center shrink-0">Datum:</span>
                    <span className="px-2 py-1 text-[10px] font-black italic">{new Date().toLocaleDateString('cs-CZ')}</span>
                </div>
            </div>
            <div className="md:col-span-6 p-4 flex items-center justify-center bg-white">
                <div className="text-3xl font-black italic text-slate-800 flex items-baseline gap-1">
                    ContSystem<span className="text-sky-500 text-sm not-italic">Group</span>
                </div>
            </div>
        </div>
    );
}

export function FieldGrid({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn(
            "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-x-[3px] divide-y-[3px] md:divide-y-0 divide-black border-b-[3px] border-black last:border-b-0",
            className
        )}>
            {children}
        </div>
    );
}

interface FieldProps {
    label: string;
    icon: React.ReactNode;
    value: any;
    field: keyof Project;
    isEditing: boolean;
    onChange: (field: keyof Project, value: any) => void;
    highlight?: boolean;
    options?: (string | { label: string; value: any })[];
}

export function Field({ label, icon, value, field, isEditing, onChange, highlight, options }: FieldProps) {
    return (
        <div className={cn(
            "p-3 flex items-center gap-2",
            highlight && "bg-yellow-100"
        )}>
            <label className="text-[9px] font-black uppercase tracking-tight text-slate-500 border-r-2 border-slate-200 pr-2 min-w-[100px] shrink-0">{label}</label>
            <div className="flex-1 flex items-center">
                {isEditing ? (
                    options ? (
                        <select
                            value={String(value || '')}
                            onChange={(e) => {
                                const val = e.target.value;
                                const numericVal = parseInt(val);
                                onChange(field, isNaN(numericVal) ? val : numericVal);
                            }}
                            className="w-full bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 text-xs font-black outline-none"
                        >
                            <option value="">Vyberte...</option>
                            {options.map(opt => {
                                const label = typeof opt === 'string' ? opt : opt.label;
                                const val = typeof opt === 'string' ? opt : opt.value;
                                return <option key={String(val)} value={String(val)}>{label}</option>;
                            })}
                        </select>
                    ) : (
                        <input
                            type="text"
                            value={String(value || '')}
                            onChange={(e) => onChange(field, e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 text-xs font-black outline-none"
                        />
                    )
                ) : (
                    <span className={cn(
                        "text-[11px] font-black leading-normal truncate text-black",
                        highlight ? 'text-rose-700' : ''
                    )} title={String(value || '')}>
                        {value || '—'}
                    </span>
                )}
            </div>
        </div>
    );
}

interface DateFieldProps {
    label: string;
    value: any;
    confirmedValue?: any;
    field: keyof Project;
    isEditing: boolean;
    onChange: (field: keyof Project, value: any) => void;
    onConfirmedChange?: (field: string, value: any) => void;
    highlight?: boolean;
}

export function DateField({ label, value, confirmedValue, field, isEditing, onChange, onConfirmedChange, highlight }: DateFieldProps) {
    const confirmationField = `${String(field)}_confirmed`;
    return (
        <div className={cn(
            "p-3 flex items-center gap-2",
            highlight && "bg-yellow-100"
        )}>
            <label className="text-[9px] font-black uppercase tracking-tight text-slate-500 border-r-2 border-slate-200 pr-2 min-w-[100px] shrink-0">{label}</label>
            {isEditing ? (
                <div className="flex-1 flex gap-2">
                    <input
                        type="date"
                        value={value ? new Date(value).toISOString().split('T')[0] : ''}
                        onChange={(e) => onChange(field, e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 text-xs font-black outline-none"
                    />
                </div>
            ) : (
                <div className="flex-1 flex items-center gap-2">
                    <span className={cn(
                        "text-[11px] font-black text-black",
                        highlight && "text-rose-700"
                    )}>
                        {formatDate(value)}
                    </span>
                    {confirmedValue && confirmedValue !== '-' && (
                        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-100 border border-emerald-300 rounded text-[8px] font-black text-emerald-800 uppercase">
                            OK: {formatDate(confirmedValue)}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

interface CustomDateFieldProps {
    label: string;
    value: any;
    confirmedValue?: any;
    field: string;
    isEditing: boolean;
    onChange: (field: string, value: any) => void;
    highlight?: boolean;
    onConfirmedChange?: (field: string, value: any) => void;
}

export function CustomDateField({ label, value, confirmedValue, field, isEditing, onChange, onConfirmedChange, highlight }: CustomDateFieldProps) {
    const confirmationField = `${field}_confirmed`;
    return (
        <div className={cn(
            "p-3 flex items-center gap-2",
            highlight && "bg-yellow-100"
        )}>
            <label className="text-[9px] font-black uppercase tracking-tight text-slate-500 border-r-2 border-slate-200 pr-2 min-w-[100px] shrink-0">{label}</label>
            {isEditing ? (
                <div className="flex-1 flex gap-2">
                    <input
                        type="date"
                        value={value && value !== '-' ? new Date(value).toISOString().split('T')[0] : ''}
                        onChange={(e) => onChange(field, e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 text-xs font-black outline-none"
                    />
                </div>
            ) : (
                <div className="flex-1 flex items-center gap-2">
                    <span className={cn(
                        "text-[11px] font-black text-black",
                        highlight && "text-rose-700"
                    )}>
                        {formatDate(value)}
                    </span>
                    {confirmedValue && confirmedValue !== '-' && (
                        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-100 border border-emerald-300 rounded text-[8px] font-black text-emerald-800 uppercase">
                            OK: {formatDate(confirmedValue)}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
