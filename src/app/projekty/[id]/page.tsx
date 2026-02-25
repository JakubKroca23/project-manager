'use client';

import React from 'react';
import {
    Loader2,
    AlertCircle,
    ArrowLeft,
    CalendarDays,
    Truck,
    Factory,
    Wrench,
    Shield,
    ClipboardList,
    Globe,
    PlusCircle,
    Trash2,
    ArrowRightCircle,
    Hammer,
    ThumbsUp,
    AlertTriangle,
    Check,
    Zap,
    Package,
    ShieldCheck,
    Box,
    Play,
    Settings,
    Flag,
    Printer,
    ArrowRight
} from 'lucide-react';
import Image from 'next/image';
import logo from '@/assets/contsystem-logo.png';

import { useProjectDetail } from '@/hooks/useProjectDetail';
import { PageHeader } from '@/components/project-detail/PageHeader';
import { Section, Field, FieldGrid, DateField, CustomDateField, AccessoriesTable, SimpleMemo, DocumentFooter } from '@/components/project-detail/DetailComponents';
import { TechSpecSection } from '@/components/project-detail/TechSpecSection';
import { ProjectTimelineFlat } from '@/components/project-detail/ProjectTimelineFlat';
import { MilestoneSection } from '@/components/project-detail/MilestoneSection';
import { VehicleGenerator } from '@/components/Military/VehicleGenerator';
import { CategoryChip } from '@/components/CategoryChip';
import { cn, formatDate, formatManager } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/hooks/useAdmin';

export default function ProjectDetailPage() {
    const {
        id,
        project,
        loading,
        isEditing,
        setIsEditing,
        editedProject,
        saving,
        milestones,
        subProjects,
        loadingMilestones,
        isAddingMilestone,
        setIsAddingMilestone,
        newMilestone,
        setNewMilestone,
        canEdit,
        handleDeleteProject,
        handleDeleteSubProject,
        handleAddMilestone,
        handleToggleMilestoneStatus,
        handleDeleteMilestone,
        handleSave,
        handleCancel,
        handleChange,
        handleCustomFieldChange,
        addCustomField,
        removeCustomField,
        fetchSubProjects,
        setMilestones
    } = useProjectDetail();

    const { profiles } = useAdmin();
    const router = useRouter();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#111111]">
                <div className="flex flex-col items-center gap-8">
                    <div className="relative w-64 h-auto animate-gradual-light">
                        <Image
                            src={logo}
                            alt="ContSystem Logo"
                            className="w-full h-auto drop-shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                            priority
                            unoptimized
                        />
                    </div>
                </div>
            </div>
        );
    }

    if (!project || !id) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-8 p-6 bg-background">
                <div className="max-w-md w-full p-8 bg-destructive/5 rounded-3xl border border-destructive/10 text-destructive flex flex-col items-center gap-4 text-center">
                    <AlertCircle size={48} strokeWidth={1} />
                    <h2 className="text-xl font-black uppercase tracking-tight">Projekt nenalezen</h2>
                </div>
                <button onClick={() => router.push('/projekty')} className="px-8 py-3 bg-muted rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3">
                    <ArrowLeft size={14} /> Zpět do seznamu
                </button>
            </div>
        );
    }

    const isMilitary = project.project_type === 'military';
    const typeColor = isMilitary ? '#10b981' : '#3b82f6';
    const p = isEditing ? editedProject! : project;

    const accessories = p.custom_fields?.accessories || [];

    return (
        <div className="min-h-screen bg-slate-200/50 pb-20 print:bg-white print:pb-0 print:p-0">
            {/* Ovládací lišta pro tisk / akce (pouze na obrazovce) */}
            <div className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b-2 border-slate-800 px-6 py-3 mb-8 no-print shadow-2xl">
                <div className="max-w-[1100px] mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.push('/projekty')} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all active:scale-95">
                            <ArrowLeft size={18} />
                        </button>
                        <div className="h-6 w-[2px] bg-slate-700 mx-2" />
                        <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Prohlížeč dokumentace</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => window.print()}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
                        >
                            <Printer size={16} /> Vytisknout dokument
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-[1100px] mx-auto px-4 print:p-0">

                {/* ════ HLAVNÍ DOKUMENT "POPIS ZAKÁZKY" ════ */}
                <div className="space-y-0 shadow-[0_40px_80px_rgba(0,0,0,0.15)] rounded-sm overflow-hidden print:shadow-none print:rounded-none">

                    {/* HLAVIČKA DOKUMENTU */}
                    <PageHeader
                        project={project}
                        editedProject={editedProject!}
                        isEditing={isEditing}
                        saving={saving}
                        canEdit={canEdit}
                        typeColor={typeColor}
                        onEdit={setIsEditing}
                        onCancel={handleCancel}
                        onSave={handleSave}
                        onDelete={handleDeleteProject}
                        onChange={handleChange}
                        managers={profiles}
                    />

                    {/* VLASTNÍ TĚLO DOKUMENTU (BÍLÝ LIST) */}
                    <div className="bg-white border-x-[3px] border-slate-900 p-0">
                        {/* Tabulka příslušenství */}
                        <AccessoriesTable
                            rows={accessories}
                            isEditing={isEditing}
                            onAddRow={() => {
                                const newAccessories = [...accessories, { label: '', desc: '', provider: 'CONTSYSTEM', installer: 'CONTSYSTEM', note: '' }];
                                handleCustomFieldChange('accessories', newAccessories);
                            }}
                            onRemoveRow={(index) => {
                                const newAccessories = accessories.filter((_: any, i: number) => i !== index);
                                handleCustomFieldChange('accessories', newAccessories);
                            }}
                            onRowChange={(index, field, value) => {
                                const newAccessories = accessories.map((row: any, i: number) =>
                                    i === index ? { ...row, [field]: value } : row
                                );
                                handleCustomFieldChange('accessories', newAccessories);
                            }}
                        />

                        {/* Přídavná tabulka pro detaily (Harmonogram / Specifikace) */}
                        <div className="border-y-[3px] border-slate-900 bg-slate-50 px-6 py-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-700 flex items-center gap-2">
                                    <CalendarDays size={16} className="text-indigo-500" /> Časový plán a milníky
                                </h3>
                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Prioritní termíny realizace</div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-[3px] border-slate-900 bg-white shadow-sm">
                                <DateField label="Zahájení" value={p.start_at || p.created_at} field="start_at" isEditing={isEditing} onChange={handleChange} />
                                <DateField label="Dodání podvozku" value={p.chassis_delivery} field="chassis_delivery" isEditing={isEditing} onChange={handleChange} />
                                <DateField label="Dodání nástavby" value={p.body_delivery} field="body_delivery" isEditing={isEditing} onChange={handleChange} />
                                <CustomDateField label="Montáž (Konec)" value={p.custom_fields?.mounting_end_date} field="mounting_end_date" isEditing={isEditing} onChange={handleCustomFieldChange} />
                                <CustomDateField label="Revize (Konec)" value={p.custom_fields?.revision_end_date} field="revision_end_date" isEditing={isEditing} onChange={handleCustomFieldChange} />
                                <DateField label="Předání" value={p.customer_handover || p.deadline} field="customer_handover" isEditing={isEditing} onChange={handleChange} highlight />
                            </div>

                            {/* Vizuální osa (Timeline) přímo v dokumentu */}
                            <div className="mt-8 pt-6 border-t-2 border-slate-200 min-h-24 relative overflow-hidden bg-white/40 rounded-xl p-4">
                                <ProjectTimelineFlat
                                    project={p}
                                    milestones={milestones}
                                    isEditing={isEditing}
                                    onCustomFieldChange={handleCustomFieldChange}
                                />
                            </div>
                        </div>

                        {/* Procesní kroky - milníky */}
                        <div className="px-8 py-8 border-b-[3px] border-slate-900 bg-white">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-900 text-white rounded-lg">
                                        <Flag size={18} />
                                    </div>
                                    <div>
                                        <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-900">Kontrolní body projektu</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Stav plnění klíčových etap</p>
                                    </div>
                                </div>
                                {isEditing && (
                                    <button
                                        onClick={() => setIsAddingMilestone(true)}
                                        className="text-[10px] font-black uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded-lg border-2 border-slate-200 hover:bg-slate-200 transition-all flex items-center gap-2"
                                    >
                                        <PlusCircle size={14} /> Přidat milník
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
                                {milestones.length > 0 ? milestones.map((m, idx) => (
                                    <div key={idx} className="flex items-center gap-4 border-b border-slate-100 py-2.5 group hover:bg-slate-50/50 px-2 transition-colors relative">
                                        <div className={cn(
                                            "w-6 h-6 rounded-md border-[2.5px] flex items-center justify-center shrink-0 transition-all cursor-pointer",
                                            m.status === 'done'
                                                ? "bg-emerald-500 border-emerald-600 shadow-sm"
                                                : "bg-white border-slate-200 hover:border-emerald-400"
                                        )} onClick={() => handleToggleMilestoneStatus(m)}>
                                            {m.status === 'done' && <Check size={14} className="text-white" strokeWidth={4} />}
                                        </div>
                                        <div className="flex flex-col min-w-0 flex-1">
                                            <span className={cn(
                                                "text-xs font-black uppercase tracking-tight truncate transition-all",
                                                m.status === 'done' ? "text-slate-400 line-through" : "text-slate-900"
                                            )}>{m.name}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">{formatDate(m.date)}</span>
                                        </div>
                                        {isEditing && (
                                            <button onClick={() => handleDeleteMilestone(m.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                )) : (
                                    <div className="col-span-2 py-4 text-center text-slate-300 text-[10px] font-black uppercase tracking-widest italic">
                                        Žádné milníky nebyly k tomuto projektu definovány
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Velká textová pole (Memos) */}
                        <div className="p-8 bg-white grid grid-cols-1 gap-8">
                            <SimpleMemo
                                title="Pracovní poznámky a instrukce pro výrobu:"
                                content={p.note || "Bez specifických instrukcí."}
                                isEditing={isEditing}
                                onChange={(val) => handleChange('note', val)}
                            />

                            <SimpleMemo
                                title="Speciální požadavky zákazníka / Příslušenství na přání:"
                                content={p.custom_fields?.special_requirements || "Nebyly definovány žádné speciální požadavky."}
                                isEditing={isEditing}
                                onChange={(val) => handleCustomFieldChange('special_requirements', val)}
                            />
                        </div>

                        {/* Dokumentní patička (Podpisy) */}
                        <DocumentFooter
                            salesperson={formatManager(p.manager)}
                            approvedBy="Vedoucí zakázky"
                        />
                    </div>
                </div>

                {/* Sekce pro Military sady (mimo hlavní dokument) */}
                {isMilitary && !project.parent_id && subProjects.length > 0 && (
                    <div className="mt-16 mb-24 no-print">
                        <Section icon={<Truck size={18} />} title="Evidence vozidel v sadě" color="emerald">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-slate-50">
                                {subProjects.map(sub => (
                                    <div key={sub.id} onClick={() => router.push(`/projekty/${sub.id}`)} className="group cursor-pointer p-4 rounded-2xl border-[3px] border-slate-200 bg-white hover:border-indigo-500 hover:shadow-xl transition-all active:scale-95">
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="text-[10px] font-black uppercase text-slate-400 group-hover:text-indigo-400 transition-colors">{sub.id}</p>
                                            <ArrowRight size={14} className="text-slate-200 group-hover:text-indigo-500 translate-x-0 group-hover:translate-x-1 transition-all" />
                                        </div>
                                        <p className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors truncate">{sub.name}</p>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    </div>
                )}

            </main>
        </div>
    );
}
