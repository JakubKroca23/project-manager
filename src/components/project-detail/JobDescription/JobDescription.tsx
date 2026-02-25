'use client';

import React from 'react';
import { Project } from '@/types/project';
import {
    ClipboardList,
    Truck,
    Calendar,
    User,
    ShieldCheck,
    Clock,
    AlertTriangle,
    FileText,
    CheckCircle2,
    Package,
    Settings,
    MessageSquare,
    Plus
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { Section } from '../DetailComponents';
import { ACCESSORIES, SOURCE_OPTIONS } from './constants';
import { useAdmin } from '@/hooks/useAdmin';
import { usePermissions } from '@/hooks/usePermissions';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { AccessoryEditor } from './AccessoryEditor';

interface JobDescriptionProps {
    project: Project;
    editedProject: Project;
    isEditing: boolean;
    onChange: (field: keyof Project, value: any) => void;
    handleCustomFieldChange: (field: string, value: any) => void;
    addCustomField: () => void;
    removeCustomField: (key: string) => void;
    onSave: () => Promise<void>;
}

export function JobDescription({
    project,
    editedProject,
    isEditing,
    onChange,
    handleCustomFieldChange,
    onSave
}: JobDescriptionProps) {
    const p = isEditing ? editedProject : project;
    const { isAdmin, currentUserProfile } = useAdmin();
    const { canEditProject } = usePermissions();

    const userEmail = currentUserProfile?.email;
    const userNameToken = userEmail?.split('@')[0] || '';
    const isProjectManager = p.manager?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(userNameToken.toLowerCase());

    const handleApproval = async (role: 'manager' | 'admin') => {
        try {
            const updates: Partial<Project> = {};
            const now = new Date().toISOString();

            if (role === 'manager' && userEmail) {
                updates.approved_by_manager = userEmail;
                updates.approval_date_manager = now;
                updates.job_description_status = 'approved_pending';
            } else if (role === 'admin' && userEmail) {
                updates.approved_by_admin = userEmail;
                updates.approval_date_admin = now;
                updates.job_description_status = 'approved';
            }

            const { error } = await supabase
                .from('projects')
                .update(updates)
                .eq('id', project.id);

            if (error) throw error;
            toast.success(role === 'manager' ? 'Popis zakázky byl schválen vedoucím.' : 'Popis zakázky byl finálně schválen admitem.');
            window.location.reload();
        } catch (error: any) {
            toast.error('Chyba při schvalování: ' + error.message);
        }
    };

    const getStatusBadge = () => {
        const status = p.job_description_status || 'draft';
        switch (status) {
            case 'approved':
                return <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest">
                    <CheckCircle2 size={12} /> Schváleno
                </div>;
            case 'approved_pending':
                return <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px] font-black uppercase tracking-widest">
                    <Clock size={12} /> Čeká na admina
                </div>;
            default:
                return <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-500/10 text-slate-500 border border-slate-500/20 text-[10px] font-black uppercase tracking-widest">
                    <FileText size={12} /> Rozpracováno
                </div>;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">

            {/* 1. HLAVICKA / STATUS BAR */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 bg-card/40 backdrop-blur-xl border border-border/40 rounded-3xl shadow-2xl shadow-primary/5">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                        <ClipboardList size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black uppercase tracking-tight text-foreground flex items-center gap-2">
                            Popis zakázky
                            <span className="text-primary opacity-40">#{p.id}</span>
                        </h1>
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            {isEditing ? (
                                <input
                                    value={p.name}
                                    onChange={(e) => onChange('name', e.target.value)}
                                    className="bg-muted/20 border border-border/40 rounded-lg px-2 py-0.5 focus:ring-0 text-foreground w-full outline-none"
                                />
                            ) : p.name}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {getStatusBadge()}
                </div>
            </div>

            {/* 2. ZAKLADNI INFO GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <InfoCard icon={<Truck />} label="Zákazník" value={p.customer} />
                <InfoCard icon={<User />} label="Vedoucí zakázky" value={p.manager} />
                <InfoCard
                    icon={<Calendar />}
                    label="Termín podvozku"
                    value={formatDate(p.chassis_delivery)}
                    highlight={!!p.custom_fields?.chassis_delivery_confirmed}
                />
                <InfoCard
                    icon={<Calendar />}
                    label="Termín nástavby"
                    value={formatDate(p.body_delivery)}
                    highlight={!!p.custom_fields?.body_delivery_confirmed}
                />
            </div>

            {/* 3. TECHNICKA SPECIFIKACE (PODVOZEK & NASTAVBA) */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <Section icon={<Truck size={18} />} title="Podvozek" color="blue">
                    <div className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                            {isEditing ? (
                                <>
                                    <EditField label="Značka" value={p.custom_fields?.chassis_brand} onChange={(val) => handleCustomFieldChange('chassis_brand', val)} />
                                    <EditField label="Model" value={p.custom_fields?.chassis_model} onChange={(val) => handleCustomFieldChange('chassis_model', val)} />
                                    <EditField label="VIN" value={p.custom_fields?.vin} onChange={(val) => handleCustomFieldChange('vin', val)} />
                                    <EditField label="SPZ" value={p.custom_fields?.license_plate} onChange={(val) => handleCustomFieldChange('license_plate', val)} />
                                </>
                            ) : (
                                <>
                                    <DataField label="Vozidlo" value={p.custom_fields?.chassis_brand || ''} subValue={p.custom_fields?.chassis_model} />
                                    <DataField label="VIN" value={p.custom_fields?.vin} font="mono" />
                                    <DataField label="SPZ" value={p.custom_fields?.license_plate} />
                                    <DataField label="Pohon" value={p.custom_fields?.drive_type || '—'} />
                                </>
                            )}
                        </div>

                        {/* Dokumentace */}
                        <div className="pt-6 border-t border-border/20">
                            <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-3">Technická dokumentace</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <DocButton
                                    label="Trailerwin (.trw)"
                                    url={p.custom_fields?.trailerwin_url}
                                    name={p.custom_fields?.trailerwin_name}
                                />
                                <DocButton
                                    label="Výkres sestavy (PDF)"
                                    url={p.custom_fields?.drawing_url}
                                    name={p.custom_fields?.drawing_name}
                                />
                            </div>
                        </div>
                    </div>
                </Section>

                <Section icon={<Package size={18} />} title="Nástavba / Zařízení" color="purple">
                    <div className="p-6 space-y-4">
                        {(p.custom_fields?.bodies || [{}]).map((body: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border border-border/40 text-foreground">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">{body.category || p.category || 'Nástavba'}</span>
                                    <span className="text-sm font-black">{body.model || p.custom_fields?.body_type || '—'}</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black uppercase text-muted-foreground/40">Sériové číslo</p>
                                    <p className="text-xs font-mono font-bold">{body.serial_number || p.serial_number || '—'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Section>
            </div>

            {/* 4. PRISLUSENSTVI TABLE */}
            <Section
                icon={<Settings size={18} />}
                title="Příslušenství a výbava"
                color="slate"
                action={isEditing && <span className="text-[9px] font-bold text-muted-foreground/50">Upravte v editoru níže</span>}
            >
                {isEditing ? (
                    <div className="p-6">
                        <AccessoryEditor project={p} handleCustomFieldChange={handleCustomFieldChange} />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-border/40 bg-muted/20">
                                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Příslušenství</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Specifikace / Rozměry</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 text-center">Počet</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Zdroj</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Poznámka</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/20">
                                {ACCESSORIES.map(item => {
                                    const accData = p.custom_fields?.accessories?.[item.key];
                                    if (!accData) return null;
                                    return (
                                        <tr key={item.key} className="hover:bg-muted/5 transition-colors text-foreground">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-primary/5 text-primary">
                                                        <item.icon size={14} />
                                                    </div>
                                                    <span className="text-xs font-black uppercase tracking-wider">{item.label}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-bold">{accData?.oznaceni || '—'}</td>
                                            <td className="px-6 py-4 text-xs font-black text-center">{accData?.pocet || 1} ks</td>
                                            <td className="px-6 py-4">
                                                {accData?.source && (
                                                    <span className={cn("px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border", SOURCE_OPTIONS.find(s => s.key === accData.source)?.color)}>
                                                        {SOURCE_OPTIONS.find(s => s.key === accData.source)?.label}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-xs font-medium text-muted-foreground italic truncate max-w-[200px]">{accData?.poznamka || '—'}</td>
                                        </tr>
                                    );
                                })}
                                {Object.entries(p.custom_fields?.accessories || {})
                                    .filter(([key]) => !ACCESSORIES.find(a => a.key === key))
                                    .map(([key, data]: [string, any]) => (
                                        <tr key={key} className="hover:bg-muted/5 transition-colors text-foreground">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-amber-500/5 text-amber-600">
                                                        <Plus size={14} />
                                                    </div>
                                                    <span className="text-xs font-black uppercase tracking-wider">{key}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-bold">{data?.oznaceni || '—'}</td>
                                            <td className="px-6 py-4 text-xs font-black text-center">{data?.pocet || 1} ks</td>
                                            <td className="px-6 py-4">
                                                {data?.source && (
                                                    <span className={cn("px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border", SOURCE_OPTIONS.find(s => s.key === data.source)?.color)}>
                                                        {SOURCE_OPTIONS.find(s => s.key === data.source)?.label}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-xs font-medium text-muted-foreground italic truncate max-w-[200px]">{data?.poznamka || '—'}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Section>

            {/* 5. POZNAMKY A POZADAVKY */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Section icon={<MessageSquare size={18} />} title="Poznámky k montáži" color="slate">
                    {isEditing ? (
                        <textarea
                            value={p.note || ''}
                            onChange={(e) => onChange('note', e.target.value)}
                            className="w-full h-32 p-6 bg-transparent border-none focus:ring-0 text-sm font-medium leading-relaxed resize-none text-foreground outline-none"
                            placeholder="Zde uveďte poznámky k montáži..."
                        />
                    ) : (
                        <div className="p-6 min-h-[120px] text-sm font-medium leading-relaxed whitespace-pre-wrap text-muted-foreground">
                            {p.note || '—'}
                        </div>
                    )}
                </Section>
                <Section icon={<ShieldCheck size={18} />} title="Speciální požadavky" color="amber">
                    {isEditing ? (
                        <textarea
                            value={p.custom_fields?.special_requirements || ''}
                            onChange={(e) => handleCustomFieldChange('special_requirements', e.target.value)}
                            className="w-full h-32 p-6 bg-transparent border-none focus:ring-0 text-sm font-medium leading-relaxed text-amber-900/70 resize-none outline-none"
                            placeholder="Speciální požadavky zákazníka..."
                        />
                    ) : (
                        <div className="p-6 min-h-[120px] text-sm font-medium leading-relaxed whitespace-pre-wrap text-amber-900/70">
                            {p.custom_fields?.special_requirements || '—'}
                        </div>
                    )}
                </Section>
            </div>

            {/* 6. SCHVALOVANI SECTION */}
            <div className="p-8 bg-card/60 backdrop-blur-2xl border border-border/40 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] select-none pointer-events-none text-foreground">
                    <ShieldCheck size={200} />
                </div>

                <h3 className="text-[13px] font-black uppercase tracking-[0.3em] text-center mb-10 text-muted-foreground/40">Závazné schválení popisu zakázky</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
                    {/* Manager Approval */}
                    <ApprovalBox
                        label="Vedoucí zakázky"
                        approvedBy={p.approved_by_manager}
                        approvalDate={p.approval_date_manager}
                        canApprove={isProjectManager}
                        onApprove={() => handleApproval('manager')}
                        requiredRoleName={p.manager}
                    />

                    {/* Admin Approval */}
                    <ApprovalBox
                        label="Finální schválení (Admin)"
                        approvedBy={p.approved_by_admin}
                        approvalDate={p.approval_date_admin}
                        canApprove={isAdmin}
                        onApprove={() => handleApproval('admin')}
                        disabledTip={!p.approved_by_manager ? "Nejdříve musí schválit vedoucí" : undefined}
                        isDisabled={!p.approved_by_manager}
                    />
                </div>
            </div>

        </div>
    );
}

function InfoCard({ icon, label, value, highlight }: { icon: React.ReactNode, label: string, value?: string, highlight?: boolean }) {
    return (
        <div className={cn(
            "p-5 rounded-3xl border transition-all flex flex-col gap-1.5",
            highlight ? "bg-emerald-500/5 border-emerald-500/20 shadow-emerald-500/5" : "bg-card/40 border-border/40"
        )}>
            <div className="flex items-center gap-2 text-muted-foreground/40">
                {React.cloneElement(icon as React.ReactElement, { size: 14 })}
                <span className="text-[9px] font-black uppercase tracking-widest leading-none mt-1">{label}</span>
            </div>
            <p className={cn("text-sm font-black truncate text-foreground", highlight && "text-emerald-700")}>
                {value || '—'}
            </p>
        </div>
    );
}

function DataField({ label, value, subValue, font }: { label: string, value?: string, subValue?: string, font?: 'sans' | 'mono' }) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">{label}</span>
            <div className="flex flex-col">
                <span className={cn("text-sm font-black text-foreground", font === 'mono' && "font-mono")}>{value || '—'}</span>
                {subValue && <span className="text-[10px] font-bold text-muted-foreground/60">{subValue}</span>}
            </div>
        </div>
    );
}

function EditField({ label, value, onChange }: { label: string, value?: string, onChange: (val: string) => void }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">{label}</label>
            <input
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-muted/20 border border-border/40 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all text-foreground"
            />
        </div>
    );
}

function DocButton({ label, url, name }: { label: string, url?: string, name?: string }) {
    if (!url) {
        return (
            <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border border-rose-500/20 bg-rose-500/5 opacity-50">
                <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">{label}</span>
                    <span className="text-[9px] font-bold text-rose-500/40">Chybí dokument!</span>
                </div>
                <AlertTriangle size={14} className="text-rose-500/40" />
            </div>
        );
    }

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border border-border/40 bg-muted/20 hover:bg-primary/5 hover:border-primary/20 transition-all group text-foreground"
        >
            <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[10px] font-black text-muted-foreground/60 group-hover:text-primary transition-colors uppercase tracking-widest">{label}</span>
                <span className="text-[9px] font-bold truncate">{name || 'Dokument'}</span>
            </div>
            <FileText size={14} className="text-primary/40 group-hover:text-primary transition-colors" />
        </a>
    );
}

function ApprovalBox({ label, approvedBy, approvalDate, canApprove, onApprove, requiredRoleName, disabledTip, isDisabled }: any) {
    return (
        <div className="flex flex-col items-center gap-6 p-8 rounded-3xl bg-background/40 border border-border/20 shadow-inner w-full">
            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">{label}</div>
            <div className="flex flex-col items-center gap-2 text-center min-h-[140px] justify-center w-full">
                {approvedBy ? (
                    <>
                        <div className="text-xl font-signature text-primary py-2 px-6 border-b-2 border-primary/20">{approvedBy.split('@')[0]}</div>
                        <p className="text-[9px] font-bold text-muted-foreground/60">{formatDate(approvalDate)}</p>
                        <div className="mt-4 flex items-center gap-1.5 text-emerald-600 text-[10px] font-black uppercase">
                            <CheckCircle2 size={14} /> Schváleno
                        </div>
                    </>
                ) : (
                    <>
                        <div className="italic text-muted-foreground/20 text-sm">Čeká na podpis</div>
                        {canApprove ? (
                            <button
                                onClick={onApprove}
                                disabled={isDisabled}
                                className={cn(
                                    "mt-6 px-8 py-3 text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl",
                                    isDisabled
                                        ? "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
                                        : "bg-primary text-white hover:scale-105 active:scale-95 shadow-primary/20"
                                )}
                            >
                                Schválit a potvrdit
                            </button>
                        ) : (
                            <div className="mt-4 flex flex-col items-center gap-1">
                                <p className="text-[9px] font-bold text-rose-500/50 uppercase">
                                    {requiredRoleName ? `Jen pro: ${requiredRoleName}` : (disabledTip || "Nedostatečná oprávnění")}
                                </p>
                                <AlertTriangle size={12} className="text-rose-500/30" />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
