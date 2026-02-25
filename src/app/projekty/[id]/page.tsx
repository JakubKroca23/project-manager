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
import { Section, Field, FieldGrid, DateField, CustomDateField } from '@/components/project-detail/DetailComponents';
import { TechSpecSection } from '@/components/project-detail/TechSpecSection';
import { ProjectTimelineFlat } from '@/components/project-detail/ProjectTimelineFlat';
import { MilestoneSection } from '@/components/project-detail/MilestoneSection';
import { VehicleGenerator } from '@/components/Military/VehicleGenerator';
import { CategoryChip } from '@/components/CategoryChip';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/hooks/useAdmin';

const DETAIL_ICON_OPTIONS = {
    Truck: Truck,
    Hammer: Hammer,
    ThumbsUp: ThumbsUp,
    AlertTriangle: AlertTriangle,
    Check: Check,
    Wrench: Wrench,
    Zap: Zap,
    Package: Package,
    Factory: Factory,
    ShieldCheck: ShieldCheck,
    Box: Box,
    Settings: Settings,
    Play: Play,
    Milestone: Flag
};

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
                    <div className="flex flex-col items-center gap-2 relative z-10">
                        <div className="flex items-center gap-3">
                            <Loader2 size={14} className="animate-spin text-primary/60" strokeWidth={3} />
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 mt-1">Načítám Data</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!project || !id) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-8 p-6 bg-background">
                <div className="max-w-md w-full p-8 bg-destructive/5 rounded-3xl border border-destructive/10 text-destructive flex flex-col items-center gap-4 text-center">
                    <AlertCircle size={48} strokeWidth={1} className="animate-bounce" />
                    <div className="space-y-1">
                        <h2 className="text-xl font-black uppercase tracking-tight">Projekt nenalezen</h2>
                        <p className="text-xs text-destructive/70 font-medium">Zakázka s tímto identifikátorem v systému neexistuje nebo byla odstraněna.</p>
                    </div>
                    <div className="font-mono bg-destructive/10 px-3 py-1.5 rounded-xl text-[10px] mt-2">
                        ID: {id || 'unknown'}
                    </div>
                </div>
                <button
                    onClick={() => router.push('/projekty')}
                    className="px-8 py-3 bg-muted hover:bg-muted/80 text-foreground rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-lg"
                >
                    <ArrowLeft size={14} /> Zpět do seznamu
                </button>
            </div>
        );
    }

    const isMilitary = project.project_type === 'military';
    const isCivil = project.project_type === 'civil';
    const typeColor = isMilitary ? '#10b981' : isCivil ? '#3b82f6' : '#64748b';
    const p = isEditing ? editedProject! : project;

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
            <main className="max-w-[1700px] mx-auto px-4 py-8 pb-32">
                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    {/* ════ LEVÁ ČÁST - HLAVNÍ OBSAH ════ */}
                    <div className="flex-1 min-w-0 space-y-8">
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


                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Harmonogram */}
                            <div className="md:col-span-2">
                                <Section icon={<CalendarDays size={18} />} title="Harmonogram Realizace" color="amber">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-6 pt-2">
                                        <DateField
                                            label="Zahájení"
                                            value={p.start_at || p.created_at}
                                            field="start_at"
                                            isEditing={isEditing}
                                            onChange={handleChange}
                                        />
                                        <DateField
                                            label="Dodání podvozku"
                                            value={p.chassis_delivery}
                                            confirmedValue={p.custom_fields?.chassis_delivery_confirmed}
                                            field="chassis_delivery"
                                            isEditing={isEditing}
                                            onChange={handleChange}
                                            onConfirmedChange={handleCustomFieldChange}
                                        />
                                        <DateField
                                            label="Dodání nástavby"
                                            value={p.body_delivery}
                                            confirmedValue={p.custom_fields?.body_delivery_confirmed}
                                            field="body_delivery"
                                            isEditing={isEditing}
                                            onChange={handleChange}
                                            onConfirmedChange={handleCustomFieldChange}
                                        />
                                        <CustomDateField
                                            label="Konec montáže"
                                            value={p.custom_fields?.mounting_end_date}
                                            confirmedValue={p.custom_fields?.mounting_end_date_confirmed}
                                            field="mounting_end_date"
                                            isEditing={isEditing}
                                            onChange={handleCustomFieldChange}
                                            onConfirmedChange={handleCustomFieldChange}
                                        />
                                        <CustomDateField
                                            label="Konec revize"
                                            value={p.custom_fields?.revision_end_date}
                                            confirmedValue={p.custom_fields?.revision_end_date_confirmed}
                                            field="revision_end_date"
                                            isEditing={isEditing}
                                            onChange={handleCustomFieldChange}
                                            onConfirmedChange={handleCustomFieldChange}
                                        />
                                        <DateField
                                            label="Předání zákazníkovi"
                                            value={p.customer_handover || p.deadline}
                                            confirmedValue={p.custom_fields?.customer_handover_confirmed}
                                            field="customer_handover"
                                            isEditing={isEditing}
                                            onChange={handleChange}
                                            onConfirmedChange={handleCustomFieldChange}
                                            highlight
                                        />
                                    </div>

                                    {/* Vizualizace časové osy */}
                                    <div className="mt-8 pt-6 border-t border-amber-500/10 min-h-24 relative">
                                        <ProjectTimelineFlat
                                            project={p}
                                            milestones={milestones}
                                            isEditing={isEditing}
                                            onCustomFieldChange={handleCustomFieldChange}
                                        />
                                    </div>
                                </Section>
                            </div>


                            {/* Milníky */}
                            <div className="md:col-span-2">
                                <MilestoneSection
                                    milestones={milestones}
                                    loadingMilestones={loadingMilestones}
                                    isAddingMilestone={isAddingMilestone}
                                    newMilestone={newMilestone}
                                    canEdit={canEdit}
                                    isEditing={isEditing}
                                    iconOptions={DETAIL_ICON_OPTIONS}
                                    onAddToggle={setIsAddingMilestone}
                                    onNewMilestoneChange={setNewMilestone}
                                    onAddMilestone={handleAddMilestone}
                                    onToggleStatus={handleToggleMilestoneStatus}
                                    onDeleteMilestone={handleDeleteMilestone}
                                    onMilestoneUpdate={setMilestones}
                                />
                            </div>

                            {/* Vozidla (Military) */}
                            {isMilitary && !project.parent_id && (
                                <div className="md:col-span-2">
                                    <Section icon={<Truck size={18} />} title="Jednotlivá Vozidla" color="emerald" fullWidth>
                                        <div className="space-y-4">
                                            {subProjects.length > 0 ? (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                                    {subProjects.map(sub => (
                                                        <div
                                                            key={sub.id}
                                                            onClick={() => router.push(`/projekty/${sub.id}`)}
                                                            className="cursor-pointer group relative p-3 rounded-2xl border border-border/50 bg-background/50 hover:bg-background hover:border-primary/30 hover:shadow-lg transition-all flex items-center justify-between"
                                                        >
                                                            <div className="flex flex-col gap-0.5 min-w-0">
                                                                <span className="text-[11px] font-black text-foreground/80 group-hover:text-primary transition-colors truncate">{sub.name}</span>
                                                                <span className="text-[9px] text-muted-foreground font-mono opacity-50">{sub.id}</span>
                                                            </div>
                                                            <div className="flex items-center gap-3 shrink-0">
                                                                {canEdit && (
                                                                    <button
                                                                        onClick={(e) => handleDeleteSubProject(sub.id, e)}
                                                                        className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 active:scale-90"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                )}
                                                                <ArrowRightCircle size={18} className="text-muted-foreground/20 group-hover:text-primary transition-all group-hover:translate-x-0.5" />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : null}

                                            {subProjects.length > 0 && (
                                                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 text-left pt-3 border-t border-border/20">
                                                    Evidence: {subProjects.length} {project.quantity ? `/ ${project.quantity}` : ''} Vozů
                                                </div>
                                            )}

                                            {(!project.quantity || subProjects.length < project.quantity) && canEdit && !isEditing && (
                                                <div className="mt-2">
                                                    <VehicleGenerator
                                                        project={project}
                                                        existingCount={subProjects.length}
                                                        onSuccess={fetchSubProjects}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </Section>
                                </div>
                            )}

                            {/* Poznámky */}
                            <div className="md:col-span-2">
                                <Section icon={<ClipboardList size={18} />} title="Poznámky a Popis" color="slate" fullWidth>
                                    {isEditing ? (
                                        <textarea
                                            value={p.note || ''}
                                            onChange={(e) => handleChange('note', e.target.value)}
                                            className="w-full h-32 bg-muted/20 border border-border/60 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/5 leading-relaxed resize-none transition-all placeholder:text-muted-foreground/30"
                                            placeholder="Zde můžete připsat detailní popis zakázky..."
                                        />
                                    ) : (
                                        <div className="text-sm text-foreground/70 leading-relaxed font-medium whitespace-pre-wrap min-h-[4rem] p-1">
                                            {project.note || <span className="italic opacity-40 font-normal">Žádný doplňující popis nebyl přidán.</span>}
                                        </div>
                                    )}
                                </Section>
                            </div>

                            {/* Ostatní Konfigurace */}
                            {((project.custom_fields && Object.keys(project.custom_fields).length > 0) || isEditing) && (
                                <div className="md:col-span-2">
                                    <Section
                                        icon={<Globe size={18} />}
                                        title="Ostatní Konfigurační Data"
                                        color="slate"
                                        fullWidth
                                        action={isEditing ? (
                                            <button onClick={addCustomField} className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-all flex items-center gap-1.5 active:scale-95">
                                                <PlusCircle size={12} /> Přidat pole
                                            </button>
                                        ) : undefined}
                                    >
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                            {(isEditing
                                                ? Object.entries(p.custom_fields || {})
                                                : Object.entries(project.custom_fields || {})
                                            ).map(([key, val]) => {
                                                const hiddenKeys = [
                                                    'mounting_end_date',
                                                    'revision_end_date',
                                                    'trailerwin_done',
                                                    'drawings_done',
                                                    'body_accessories',
                                                    'chassis_accessories',
                                                    'drawing_url',
                                                    'drawing_path',
                                                    'drawing_name',
                                                    'chassis_brand',
                                                    'chassis_model',
                                                    'vin',
                                                    'license_plate',
                                                    'bodies',
                                                    'body_type'
                                                ];
                                                if (hiddenKeys.includes(key)) return null;
                                                return (
                                                    <div key={key} className="group relative bg-background/40 hover:bg-background/80 p-3 rounded-xl border border-border/40 hover:border-border transition-all duration-200">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 group-hover:text-primary transition-colors">{key}</p>
                                                            {isEditing && (
                                                                <button onClick={() => removeCustomField(key)} className="text-rose-500 opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 p-1 rounded-lg transition-all active:scale-90">
                                                                    <Trash2 size={12} />
                                                                </button>
                                                            )}
                                                        </div>
                                                        {isEditing ? (
                                                            <input
                                                                type="text"
                                                                value={val as string}
                                                                onChange={(e) => handleCustomFieldChange(key, e.target.value)}
                                                                className="w-full bg-transparent border-none text-[11px] font-bold text-foreground focus:ring-0 p-0"
                                                            />
                                                        ) : (
                                                            <p className="text-[11px] font-bold text-foreground/80 truncate" title={String(val)}>{val?.toString() || '-'}</p>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </Section>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ════ PRAVÁ ČÁST - SIDEBAR (Tech Spec) ════ */}
                    <aside className="w-full lg:w-[450px] xl:w-[550px] shrink-0 lg:sticky lg:top-8 self-start">
                        <div className="flex flex-col">
                            <TechSpecSection
                                project={project}
                                editedProject={editedProject!}
                                isEditing={isEditing}
                                onChange={handleChange}
                                handleCustomFieldChange={handleCustomFieldChange}
                                className="bg-card/40 backdrop-blur-sm border-primary/10 shadow-2xl shadow-primary/5 max-h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar"
                            />
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}
