import React from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
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
    return (
        <section className={cn(
            "mb-8 overflow-hidden bg-white border-[3px] border-slate-900 shadow-xl",
            className
        )}>
            <header className="px-5 py-3 border-b-[3px] border-slate-900 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-3">
                    {icon && <span className="text-slate-500">{icon}</span>}
                    <h3 className="text-[12px] font-black uppercase tracking-[0.25em] text-slate-900">{title}</h3>
                </div>
                {action}
            </header>
            <div className="bg-white">
                {children}
            </div>
        </section>
    );
}

export function AccessoriesTable({
    rows = [],
    isEditing,
    onAddRow,
    onRemoveRow,
    onRowChange
}: {
    rows?: any[];
    isEditing?: boolean;
    onAddRow?: () => void;
    onRemoveRow?: (index: number) => void;
    onRowChange?: (index: number, field: string, value: string) => void;
}) {
    const dataRows = rows;

    return (
        <div className="w-full border-t-[3px] border-slate-900 overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-slate-100 border-b-[3px] border-slate-900">
                        <th className="border-r-[3px] border-slate-900 px-3 py-2 text-[10px] font-black uppercase text-slate-500 text-left w-1/4">Příslušenství</th>
                        <th className="border-r-[3px] border-slate-900 px-3 py-2 text-[10px] font-black uppercase text-slate-500 text-left w-1/4">Popis / Specifikace</th>
                        <th className="border-r-[3px] border-slate-900 px-3 py-2 text-[10px] font-black uppercase text-slate-500 text-left">Dodavatel</th>
                        <th className="border-r-[3px] border-slate-900 px-3 py-2 text-[10px] font-black uppercase text-slate-500 text-left">Montáž</th>
                        <th className="px-3 py-2 text-[10px] font-black uppercase text-slate-500 text-left flex justify-between items-center">
                            <span>Poznámka</span>
                            {isEditing && (
                                <button
                                    onClick={onAddRow}
                                    className="bg-slate-900 text-white p-1 rounded hover:bg-slate-700 transition-all"
                                    title="Přidat řádek"
                                >
                                    <PlusCircle size={14} />
                                </button>
                            )}
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y-[2px] divide-slate-200">
                    {dataRows.length > 0 ? dataRows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-indigo-50/30 transition-colors group">
                            <td className="border-r-[3px] border-slate-900 px-3 py-2.5 text-[11px] font-black uppercase bg-slate-50/50 text-slate-900">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={row.label || ''}
                                        onChange={(e) => onRowChange?.(idx, 'label', e.target.value)}
                                        className="w-full bg-transparent border-b border-slate-300 focus:border-indigo-500 outline-none"
                                        placeholder="Název..."
                                    />
                                ) : row.label}
                            </td>
                            <td className="border-r-[3px] border-slate-900 px-3 py-2.5 text-[12px] font-bold italic text-indigo-900">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={row.desc || ''}
                                        onChange={(e) => onRowChange?.(idx, 'desc', e.target.value)}
                                        className="w-full bg-transparent border-b border-indigo-200 focus:border-indigo-500 outline-none"
                                        placeholder="Specifikace..."
                                    />
                                ) : row.desc}
                            </td>
                            <td className="border-r-[3px] border-slate-900 px-3 py-2.5 text-[11px] font-black text-slate-700">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={row.provider || ''}
                                        onChange={(e) => onRowChange?.(idx, 'provider', e.target.value)}
                                        className="w-full bg-transparent border-b border-slate-300 outline-none"
                                    />
                                ) : row.provider}
                            </td>
                            <td className="border-r-[3px] border-slate-900 px-3 py-2.5 text-[11px] font-black text-slate-700">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={row.installer || ''}
                                        onChange={(e) => onRowChange?.(idx, 'installer', e.target.value)}
                                        className="w-full bg-transparent border-b border-slate-300 outline-none"
                                    />
                                ) : row.installer}
                            </td>
                            <td className="px-3 py-2.5 text-[11px] font-medium text-slate-600 relative">
                                {isEditing ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={row.note || ''}
                                            onChange={(e) => onRowChange?.(idx, 'note', e.target.value)}
                                            className="w-full bg-transparent border-b border-slate-300 outline-none"
                                        />
                                        <button
                                            onClick={() => onRemoveRow?.(idx)}
                                            className="text-rose-500 hover:bg-rose-50 p-1 rounded"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ) : row.note}
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-slate-400 text-xs font-bold uppercase tracking-widest italic">
                                Žádné příslušenství nebylo definováno
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export function SimpleMemo({ title, content, isEditing, onChange }: { title: string, content: string, isEditing?: boolean, onChange?: (val: string) => void }) {
    return (
        <div className="mb-8 border-[3px] border-slate-900 overflow-hidden shadow-md group">
            <div className="bg-amber-400 border-b-[3px] border-slate-900 px-3 py-1.5 flex justify-between items-center transition-colors group-hover:bg-amber-300">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900">{title}</h4>
            </div>
            <div className="p-5 min-h-[120px] flex items-center bg-amber-50/30">
                {isEditing ? (
                    <textarea
                        className="w-full h-full min-h-[120px] outline-none text-[15px] font-black p-3 bg-transparent border-2 border-amber-200 focus:border-amber-400 rounded-xl transition-all resize-none"
                        value={content}
                        onChange={(e) => onChange?.(e.target.value)}
                        placeholder="Zadejte text..."
                    />
                ) : (
                    <p className="text-xl font-black italic text-slate-800 leading-relaxed indent-4 select-all">{content || '—'}</p>
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
