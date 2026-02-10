'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Project } from '@/types/project';
import {
    ArrowLeft,
    Calendar,
    User,
    Building2,
    Tag,
    ClipboardList,
    Truck,
    CheckCircle2,
    Clock,
    Shield,
    Globe,
    FileText,
    Hash
} from 'lucide-react';

export default function ProjectDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProject() {
            setLoading(true);
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error('Error fetching project:', error);
            } else {
                setProject(data);
            }
            setLoading(false);
        }

        if (id) fetchProject();
    }, [id]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background/50 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Načítám detail projektu...</p>
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-6 p-4">
                <div className="p-6 bg-red-500/10 rounded-3xl border border-red-500/20 text-red-500 flex flex-col items-center gap-2">
                    <Shield size={48} />
                    <h2 className="text-xl font-bold">Projekt nenalezen</h2>
                    <p className="text-sm opacity-80">Zkontrolujte prosím kód projektu nebo zkuste jiný.</p>
                </div>
                <button
                    onClick={() => router.push('/projekty')}
                    className="px-6 py-2.5 bg-primary text-primary-foreground rounded-2xl font-bold text-sm uppercase tracking-wider flex items-center gap-2 hover:opacity-90 transition-all"
                >
                    <ArrowLeft size={16} />
                    Zpět na přehled
                </button>
            </div>
        );
    }

    const isMilitary = project.project_type === 'military';

    return (
        <div className="min-h-screen bg-background text-foreground p-6 sm:p-10 space-y-10 animate-in fade-in duration-500">
            {/* Header / Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 max-w-7xl mx-auto">
                <div className="space-y-4">
                    <button
                        onClick={() => router.push('/projekty')}
                        className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        Zpět na přehled
                    </button>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${isMilitary
                                    ? 'bg-indigo-600/10 text-indigo-600 border-indigo-600/20 shadow-lg shadow-indigo-600/5'
                                    : 'bg-green-600/10 text-green-600 border-green-600/20 shadow-lg shadow-green-600/5'
                                }`}>
                                {isMilitary ? 'Armádní Projekt' : 'Civilní Projekt'}
                            </span>
                            <span className="text-xs font-bold text-muted-foreground/60 tracking-widest uppercase">#{project.id}</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight max-w-3xl">
                            {project.name}
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-muted/30 border border-border/50 rounded-3xl p-6 flex items-center gap-4 shadow-xl shadow-black/5">
                        <div className="p-3 bg-primary/10 text-primary rounded-2xl shadow-inner">
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Status Projektu</p>
                            <p className="text-lg font-black uppercase tracking-wider">{project.status}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {/* Main Content Areas */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Basic Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InfoCard icon={<Building2 size={18} />} label="Klient" value={project.customer} />
                        <InfoCard icon={<User size={18} />} label="Manažer Projektu" value={project.manager} />
                        <InfoCard icon={<Tag size={18} />} label="Kategorie" value={project.category} />
                        <InfoCard icon={<Hash size={18} />} label="ABRA Zakázka" value={project.abra_project} />
                        <InfoCard icon={<FileText size={18} />} label="ABRA Objednávka" value={project.abra_order} />
                        <InfoCard icon={<Shield size={18} />} label="Výrobní číslo / VIN" value={project.serial_number} />
                    </div>

                    {/* Termíny / Milníky Section */}
                    <div className="bg-card/50 rounded-3xl border border-border/60 p-8 space-y-6 shadow-2xl shadow-black/5 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-10 opacity-[0.03] rotate-12 pointer-events-none">
                            <Clock size={180} />
                        </div>
                        <h3 className="text-lg font-bold uppercase tracking-widest flex items-center gap-2 text-foreground/80">
                            <Calendar size={20} className="text-primary" />
                            Důležité termíny
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
                            <TimelineItem label="Dodání podvozku" value={project.chassis_delivery} />
                            <TimelineItem label="Dodání nástavby" value={project.body_delivery} />
                            <TimelineItem label="Předání zákazníkovi" value={project.customer_handover} />
                            <TimelineItem label="Datum uzavření" value={project.closed_at} />
                        </div>
                    </div>
                </div>

                {/* Sidebar Areas */}
                <div className="space-y-8">
                    {/* Production Info */}
                    <div className="bg-muted/20 rounded-3xl border border-border/80 p-8 space-y-6 shadow-xl shadow-black/5">
                        <h3 className="text-lg font-bold uppercase tracking-widest flex items-center gap-2">
                            <Truck size={20} className="text-primary" />
                            Výroba
                        </h3>
                        <div className="space-y-6">
                            <SidebarInfoItem label="Status výroby" value={project.production_status} />
                            <SidebarInfoItem label="Montážní společnost" value={project.mounting_company} />
                            <SidebarInfoItem label="Konfigurace" value={project.body_setup} />
                        </div>
                    </div>

                    {/* Custom Fields - Dynamically rendered */}
                    {project.custom_fields && Object.keys(project.custom_fields).length > 0 && (
                        <div className="bg-primary/5 rounded-3xl border border-primary/20 p-8 space-y-6 shadow-xl shadow-primary/5">
                            <h3 className="text-lg font-bold uppercase tracking-widest flex items-center gap-2 text-primary">
                                <Globe size={20} />
                                Doplňující data
                            </h3>
                            <div className="space-y-4">
                                {Object.entries(project.custom_fields).map(([key, val]) => (
                                    <div key={key} className="flex flex-col gap-1 border-b border-primary/10 pb-3 last:border-0 last:pb-0">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60">{key}</p>
                                        <p className="font-bold text-foreground">{val?.toString() || '-'}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Note */}
                    <div className="bg-card rounded-3xl border border-border p-8 space-y-4 shadow-xl shadow-black/5">
                        <h3 className="text-lg font-bold uppercase tracking-widest flex items-center gap-2">
                            <ClipboardList size={20} className="text-muted-foreground" />
                            Poznámka
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed italic">
                            {project.note || 'K tomuto projektu nebyla přidána žádná poznámka.'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode, label: string, value?: string }) {
    return (
        <div className="bg-card border border-border/80 rounded-2xl p-6 flex flex-col gap-3 group hover:border-primary/40 hover:bg-primary/[0.02] hover:shadow-xl hover:shadow-black/5 transition-all duration-300">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-muted/40 text-muted-foreground rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    {icon}
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 group-hover:text-primary/80 transition-colors">{label}</p>
            </div>
            <p className="text-lg font-bold text-foreground truncate">{value || '-'}</p>
        </div>
    );
}

function TimelineItem({ label, value }: { label: string, value?: string }) {
    return (
        <div className="flex flex-col gap-2 group">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary/40 group-hover:bg-primary transition-colors shadow-lg shadow-primary/20" />
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
            </div>
            <p className="text-xl font-black ml-4 tracking-tight">{value || '-'}</p>
        </div>
    );
}

function SidebarInfoItem({ label, value }: { label: string, value?: string }) {
    return (
        <div className="space-y-1 group">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">{label}</p>
            <p className="font-bold text-foreground text-md leading-tight group-hover:translate-x-1 transition-transform">{value || '-'}</p>
        </div>
    );
}
