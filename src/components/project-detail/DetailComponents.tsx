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
            "mb-8 overflow-hidden bg-white border-[3px] border-slate-300 rounded-2xl shadow-lg",
            className
        )}>
            <header className={cn(
                "px-6 py-3 border-b-2 flex items-center justify-between",
                c.bg,
                c.border.replace('border-', 'border-b-')
            )}>
                <div className="flex items-center gap-3">
                    <div className={cn("p-1.5 bg-white rounded-lg shadow-sm", c.icon)}>{icon}</div>
                    <h3 className={cn("text-[11px] font-black uppercase tracking-[0.2em]", c.text)}>{title}</h3>
                </div>
                {action}
            </header>
            <div className="bg-white">
                {children}
            </div>
        </section>
    );
}

export function FieldGrid({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn(
            "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-x-2 divide-y-2 divide-slate-200 border-b-2 border-slate-200 last:border-b-0",
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
            "p-5 flex flex-col gap-1.5 transition-colors hover:bg-slate-50/50",
            highlight && "bg-amber-50/30"
        )}>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <span className="opacity-40">{icon}</span> {label}
            </label>
            <div className="min-h-[1.5rem] flex items-center">
                {isEditing ? (
                    options ? (
                        <select
                            value={String(value || '')}
                            onChange={(e) => {
                                const val = e.target.value;
                                const numericVal = parseInt(val);
                                onChange(field, isNaN(numericVal) ? val : numericVal);
                            }}
                            className="w-full bg-slate-50 border-2 border-slate-200 rounded-lg px-2 py-1 text-xs font-bold focus:border-primary outline-none transition-all"
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
                            className="w-full bg-slate-50 border-2 border-slate-200 rounded-lg px-2 py-1 text-xs font-bold focus:border-primary outline-none transition-all"
                        />
                    )
                ) : (
                    <span className={cn(
                        "text-[13px] font-bold leading-normal truncate",
                        highlight ? 'text-primary' : 'text-slate-800'
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
            "p-5 flex flex-col gap-1.5 transition-colors hover:bg-slate-50/50",
            highlight && "bg-amber-50/30"
        )}>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">{label}</label>
            {isEditing ? (
                <div className="space-y-2 pt-1">
                    <input
                        type="date"
                        value={value ? new Date(value).toISOString().split('T')[0] : ''}
                        onChange={(e) => onChange(field, e.target.value)}
                        className="w-full bg-slate-50 border-2 border-slate-200 rounded-lg px-2 py-1 text-xs font-bold focus:border-primary outline-none transition-all"
                    />
                    {onConfirmedChange && (
                        <div className="flex flex-col gap-1 pt-2 border-t-2 border-slate-100">
                            <label className="text-[9px] font-black uppercase tracking-tight text-emerald-800/80 italic">Potvrdit splnění (skutečnost)</label>
                            <input
                                type="date"
                                value={confirmedValue ? new Date(confirmedValue).toISOString().split('T')[0] : ''}
                                onChange={(e) => onConfirmedChange?.(confirmationField, e.target.value)}
                                className="w-full bg-emerald-500/5 border-2 border-emerald-500/20 rounded-lg px-2 py-1 text-[10px] font-black text-emerald-800 outline-none focus:border-emerald-500 transition-all"
                            />
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-1.5 flex flex-col justify-center min-h-[1.5rem]">
                    <p className={cn(
                        "text-[13px] font-black transition-colors leading-none",
                        highlight ? 'text-amber-800' : 'text-slate-900'
                    )}>
                        {formatDate(value)}
                    </p>
                    {confirmedValue && confirmedValue !== '-' && (
                        <div className="flex items-center gap-2 px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded-md w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-tight">
                                Splněno: {formatDate(confirmedValue)}
                            </span>
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
            "p-5 flex flex-col gap-1.5 transition-colors hover:bg-slate-50/50",
            highlight && "bg-amber-50/30"
        )}>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">{label}</label>
            {isEditing ? (
                <div className="space-y-2 pt-1">
                    <input
                        type="date"
                        value={value && value !== '-' ? new Date(value).toISOString().split('T')[0] : ''}
                        onChange={(e) => onChange(field, e.target.value)}
                        className="w-full bg-slate-50 border-2 border-slate-200 rounded-lg px-2 py-1 text-xs font-bold focus:border-primary outline-none transition-all"
                    />
                    {onConfirmedChange && (
                        <div className="flex flex-col gap-1 pt-2 border-t-2 border-slate-100">
                            <label className="text-[9px] font-black uppercase tracking-tight text-emerald-800/80 italic">Potvrdit splnění (skutečnost)</label>
                            <input
                                type="date"
                                value={confirmedValue ? new Date(confirmedValue).toISOString().split('T')[0] : ''}
                                onChange={(e) => onConfirmedChange?.(confirmationField, e.target.value)}
                                className="w-full bg-emerald-500/5 border-2 border-emerald-500/20 rounded-lg px-2 py-1 text-[10px] font-black text-emerald-800 outline-none focus:border-emerald-500 transition-all"
                            />
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-1.5 flex flex-col justify-center min-h-[1.5rem]">
                    <p className={cn(
                        "text-[13px] font-black transition-colors leading-none",
                        highlight ? 'text-amber-800' : 'text-slate-900'
                    )}>
                        {formatDate(value)}
                    </p>
                    {confirmedValue && confirmedValue !== '-' && (
                        <div className="flex items-center gap-2 px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded-md w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-tight">
                                Splněno: {formatDate(confirmedValue)}
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
