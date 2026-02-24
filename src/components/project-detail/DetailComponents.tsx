import React from 'react';
import { Project } from '@/types/project';
import { cn } from '@/lib/utils';

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

export function Section({ icon, title, color, children, fullWidth, action, className }: SectionProps) {
    const c = colorMap[color] || colorMap.slate;
    return (
        <div className={cn(
            "rounded-xl border p-4 transition-all duration-300",
            c.border,
            c.bg,
            fullWidth ? "w-full" : "",
            className
        )}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className={cn("transition-transform duration-300", c.icon)}>{icon}</div>
                    <h3 className={cn("text-[11px] font-black uppercase tracking-widest", c.text)}>{title}</h3>
                </div>
                {action}
            </div>
            {children}
        </div>
    );
}

export function FieldGrid({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3", className)}>{children}</div>;
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
        <div className="flex items-start gap-2 group">
            <div className="text-muted-foreground/40 mt-0.5 shrink-0 group-hover:text-primary/60 transition-colors">{icon}</div>
            <div className="flex-1 min-w-0">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 mb-0.5">{label}</p>
                {isEditing ? (
                    options ? (
                        <select
                            value={String(value || '')}
                            onChange={(e) => {
                                const val = e.target.value;
                                const numericVal = parseInt(val);
                                onChange(field, isNaN(numericVal) ? val : numericVal);
                            }}
                            className="w-full bg-background/50 border border-border/60 rounded px-1.5 py-1 text-xs font-bold focus:ring-1 focus:ring-primary/20 outline-none transition-all"
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
                            className="w-full bg-background/50 border border-border/60 rounded px-1.5 py-1 text-xs font-bold focus:ring-1 focus:ring-primary/20 outline-none transition-all"
                        />
                    )
                ) : (
                    <p className={cn(
                        "text-xs font-bold truncate leading-tight transition-colors",
                        highlight ? 'text-primary' : 'text-foreground/90'
                    )} title={String(value || '')}>
                        {value || '—'}
                    </p>
                )}
            </div>
        </div>
    );
}

interface DateFieldProps {
    label: string;
    value: any;
    field: keyof Project;
    isEditing: boolean;
    onChange: (field: keyof Project, value: any) => void;
    highlight?: boolean;
}

export function DateField({ label, value, field, isEditing, onChange, highlight }: DateFieldProps) {
    return (
        <div className="flex flex-col gap-1 group">
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">{label}</p>
            {isEditing ? (
                <input
                    type="date"
                    value={value ? new Date(value).toISOString().split('T')[0] : ''}
                    onChange={(e) => onChange(field, e.target.value)}
                    className="w-full bg-background/50 border border-border/60 rounded px-2 py-1 text-xs font-bold focus:ring-1 focus:ring-primary/20 outline-none transition-all"
                />
            ) : (
                <p className={cn(
                    "text-xs font-black transition-colors",
                    highlight ? 'text-amber-600' : 'text-foreground/80'
                )}>
                    {value ? new Date(value).toLocaleDateString('cs-CZ') : '—'}
                </p>
            )}
        </div>
    );
}

interface CustomDateFieldProps {
    label: string;
    value: any;
    field: string;
    isEditing: boolean;
    onChange: (field: string, value: any) => void;
    highlight?: boolean;
}

export function CustomDateField({ label, value, field, isEditing, onChange, highlight }: CustomDateFieldProps) {
    return (
        <div className="flex flex-col gap-1 group">
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">{label}</p>
            {isEditing ? (
                <input
                    type="date"
                    value={value && value !== '-' ? new Date(value).toISOString().split('T')[0] : ''}
                    onChange={(e) => onChange(field, e.target.value)}
                    className="w-full bg-background/50 border border-border/60 rounded px-2 py-1 text-xs font-bold focus:ring-1 focus:ring-primary/20 outline-none transition-all"
                />
            ) : (
                <p className={cn(
                    "text-xs font-black transition-colors",
                    highlight ? 'text-amber-600' : 'text-foreground/80'
                )}>
                    {value && value !== '-' ? new Date(value).toLocaleDateString('cs-CZ') : '—'}
                </p>
            )}
        </div>
    );
}
