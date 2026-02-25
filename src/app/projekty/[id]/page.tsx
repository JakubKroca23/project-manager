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
    ArrowRightCircle
} from 'lucide-react';
import {
    Hammer,
    ThumbsUp,
    AlertTriangle,
    Check,
    Zap,
    Package,
    Factory as FactoryIcon,
    ShieldCheck,
    Box,
    Play,
    Settings,
    Flag
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
        <div className="min-h-screen bg-slate-100/50 pb-20 print:bg-white print:pb-0">
            <main className="max-w-[1100px] mx-auto px-4 py-8 md:py-12">

                {/* ════ HLAVNÍ DOKUMENT "POPIS ZAKÁZKY" ════ */}
                <div className="space-y-0 shadow-[0_20px_50px_rgba(0,0,0,0.1)] print:shadow-none">

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
                    <div className="bg-white border-x-[3px] border-black p-0">
                        {/* Tabulka příslušenství */}
                        <AccessoriesTable rows={accessories.length > 0 ? accessories : undefined} />

                        {/* Přídavná tabulka pro detaily (Harmonogram / Specifikace) */}
                        <div className="border-y-[3px] border-black bg-slate-100/50 px-4 py-3">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                                <CalendarDays size={14} /> Harmonogram a termíny
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-[3px] border-black bg-white">
                                <DateField label="Zahájení" value={p.start_at || p.created_at} field="start_at" isEditing={isEditing} onChange={handleChange} />
                                <DateField label="Dodání podvozku" value={p.chassis_delivery} field="chassis_delivery" isEditing={isEditing} onChange={handleChange} />
                                <DateField label="Dodání nástavby" value={p.body_delivery} field="body_delivery" isEditing={isEditing} onChange={handleChange} />
                                <CustomDateField label="Montáž (Konec)" value={p.custom_fields?.mounting_end_date} field="mounting_end_date" isEditing={isEditing} onChange={handleCustomFieldChange} />
                                <CustomDateField label="Revize (Konec)" value={p.custom_fields?.revision_end_date} field="revision_end_date" isEditing={isEditing} onChange={handleCustomFieldChange} />
                                <DateField label="Předání" value={p.customer_handover || p.deadline} field="customer_handover" isEditing={isEditing} onChange={handleChange} highlight />
                            </div>
                        </div>

                        {/* Další příslušenství / Milníky jako součást dokumentu */}
                        <div className="px-6 py-6 border-b-[3px] border-black">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                                <Flag size={14} /> Specifické milníky a kroky
                            </h3>
                            <div className="grid grid-cols-1 gap-2">
                                {milestones.map((m, idx) => (
                                    <div key={idx} className="flex items-center gap-3 border-b border-slate-100 py-1.5 last:border-0 px-2 group">
                                        <div className={cn(
                                            "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0",
                                            m.status === 'done' ? "bg-emerald-500 border-emerald-500" : "bg-white border-slate-300"
                                        )}>
                                            {m.status === 'done' && <Check size={10} className="text-white" />}
                                        </div>
                                        <span className={cn("text-xs font-bold", m.status === 'done' ? "text-slate-400 line-through" : "text-slate-800")}>{m.name}</span>
                                        <span className="ml-auto text-[10px] font-black text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">{formatDate(m.date)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Velká textová pole (Memos) */}
                        <div className="p-6 bg-white space-y-6">
                            <SimpleMemo
                                title="Poznámky k zakázce / montáži / oživení:"
                                content={p.note || "Montáž, oživení, nastavení, školení"}
                                isEditing={isEditing}
                                onChange={(val) => handleChange('note', val)}
                            />

                            <SimpleMemo
                                title="Speciální požadavky zákazníka:"
                                content={p.custom_fields?.special_requirements || ""}
                                isEditing={isEditing}
                                onChange={(val) => handleCustomFieldChange('special_requirements', val)}
                            />
                        </div>

                        {/* Dokumentní patička (Podpisy) */}
                        <DocumentFooter
                            salesperson={formatManager(p.manager)}
                            approvedBy="Jakub Kroča"
                        />
                    </div>
                </div>

                {/* Sekce pro Military sady (mimo hlavní dokument) */}
                {isMilitary && !project.parent_id && subProjects.length > 0 && (
                    <div className="mt-12 no-print">
                        <Section icon={<Truck size={18} />} title="Evidence vozidel v sadě" color="emerald">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 p-4">
                                {subProjects.map(sub => (
                                    <div key={sub.id} onClick={() => router.push(`/projekty/${sub.id}`)} className="cursor-pointer p-3 rounded-xl border-2 border-slate-200 bg-white hover:border-emerald-500 transition-all">
                                        <p className="text-[10px] font-black uppercase text-slate-400 mb-1">{sub.id}</p>
                                        <p className="text-xs font-black text-slate-800 truncate">{sub.name}</p>
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
