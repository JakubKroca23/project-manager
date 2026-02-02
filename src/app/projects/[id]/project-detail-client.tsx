"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
    Edit2, Trash2, Calendar, User, Briefcase, ChevronLeft,
    Layout, Settings, Factory, CheckCircle2, Octagon,
    MoreVertical, ExternalLink, Package, ShoppingCart, Plus, X, Truck, Building, MapPin
} from "lucide-react"
import { UpdateProjectModal } from "@/components/projects/update-project-modal"
import { AddSuperstructureModal } from "@/components/projects/add-superstructure-modal"
import { AddAccessoryModal } from "@/components/projects/add-accessory-modal"
import { ProjectHistoryModal } from "@/components/projects/project-history-modal"
import { deleteProject, deleteSuperstructure, deleteProjectAccessory } from "@/app/projects/actions"
import { motion } from "framer-motion"

const statusMap: Record<string, { label: string; color: string; icon: any; bg: string }> = {
    planning: { label: "Plánování", color: "text-blue-500", icon: Layout, bg: "bg-blue-500/10" },
    development: { label: "Vývoj", color: "text-indigo-500", icon: Settings, bg: "bg-indigo-500/10" },
    production: { label: "Výroba", color: "text-orange-500", icon: Factory, bg: "bg-orange-500/10" },
    completed: { label: "Dokončeno", color: "text-green-500", icon: CheckCircle2, bg: "bg-green-500/10" },
    stopped: { label: "Zastaveno", color: "text-red-500", icon: Octagon, bg: "bg-red-500/10" },
}

const statusOrder = ["planning", "development", "production", "completed"]

export function ProjectDetailClient({ project }: { project: any }) {
    const router = useRouter()
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isAddSuperstructureOpen, setIsAddSuperstructureOpen] = useState(false)
    const [isAddAccessoryOpen, setIsAddAccessoryOpen] = useState(false)
    const [isHistoryOpen, setIsHistoryOpen] = useState(false)

    const handleDelete = async () => {
        if (!confirm("Opravdu chcete tento projekt smazat?")) return
        setIsDeleting(true)
        const result = await deleteProject(project.id)
        if (result.success) {
            router.push("/projects")
        } else {
            alert(result.error || "Chyba při mazání")
            setIsDeleting(false)
        }
    }

    const handleDeleteSuperstructure = async (id: string) => {
        if (!confirm("Opravdu smazat tuto nástavbu?")) return
        await deleteSuperstructure(id, project.id)
    }

    const handleDeleteAccessory = async (id: string) => {
        if (!confirm("Opravdu smazat toto příslušenství?")) return
        await deleteProjectAccessory(id, project.id)
    }

    const currentStatusIdx = statusOrder.indexOf(project.status)
    const statusData = statusMap[project.status] || { label: project.status, color: "text-foreground", icon: Layout, bg: "bg-secondary" }

    return (
        <div className="max-w-[1200px] mx-auto space-y-6">
            {/* Action Bar */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => router.push("/projects")}
                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
                >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Seznam projektů
                </button>
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsEditOpen(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-secondary hover:bg-secondary/80 transition-colors border border-border/50">
                        <Edit2 className="w-3.5 h-3.5" /> Upravit
                    </button>
                    <button onClick={handleDelete} disabled={isDeleting} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors border border-red-500/20">
                        <Trash2 className="w-3.5 h-3.5" /> {isDeleting ? "Mazání..." : "Smazat"}
                    </button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: CRM & Technical Details */}
                <div className="lg:col-span-2 space-y-6">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-8 space-y-6">

                        {/* HEADER */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusData.color} ${statusData.bg} border-current/20`}>
                                    <statusData.icon className="w-3.5 h-3.5" /> {statusData.label}
                                </span>
                                {project.client_name && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-orange-500/10 text-orange-500 border-orange-500/20">
                                        <Briefcase className="w-3.5 h-3.5" /> {project.client_name}
                                    </span>
                                )}
                                {project.sector && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-blue-500/10 text-blue-500 border-blue-500/20">
                                        <Building className="w-3.5 h-3.5" /> {project.sector}
                                    </span>
                                )}
                            </div>
                            <h1 className="text-4xl font-black tracking-tight leading-none">{project.title}</h1>
                        </div>

                        {/* CRM CARD */}
                        <div className="glass-panel p-6 bg-secondary/10 border-indigo-500/10 space-y-4 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <Briefcase className="w-24 h-24" />
                            </div>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-500 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-current" /> CRM & Obchodní Údaje
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm relative z-10">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold uppercase text-muted-foreground">Zakázka SRO</p>
                                    <p className="font-semibold">{project.zakazka_sro || "–"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold uppercase text-muted-foreground">OP CRM</p>
                                    <p className="font-semibold">{project.op_crm || "–"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold uppercase text-muted-foreground">Fakturační firma</p>
                                    <p className="font-semibold">{project.billing_company || "–"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold uppercase text-muted-foreground">Dodací adresa</p>
                                    <p className="font-semibold flex items-center gap-1.5">
                                        {project.delivery_address && <MapPin className="w-3.5 h-3.5 text-muted-foreground" />}
                                        {project.delivery_address || "–"}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold uppercase text-muted-foreground">Montážní firma</p>
                                    <p className="font-semibold">{project.assembly_company || "–"}</p>
                                </div>
                            </div>
                        </div>

                        {/* 1. Podvozek a Základ */}
                        <div className="glass-panel p-6 space-y-4">
                            <div className="flex items-center gap-3 pb-2 border-b border-border/50">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <Truck className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold tracking-tight">Podvozek a Základ</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 space-y-1">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase leading-none mb-1">Výrobce</p>
                                    <p className="font-bold text-lg">{project.manufacturer || "Neuvedeno"}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 space-y-1">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase leading-none mb-1">Typ Podvozku</p>
                                    <p className="font-bold text-lg">{project.chassis_type || "Neuvedeno"}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 space-y-1">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase leading-none mb-1">Počet Kusů</p>
                                    <p className="font-bold text-lg text-primary">{project.quantity || "1"} ks</p>
                                </div>
                            </div>
                        </div>

                        {/* 2. Nástavby */}
                        <div className="glass-panel p-6 space-y-6">
                            <div className="flex items-center justify-between pb-2 border-b border-border/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                                        <Factory className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-bold tracking-tight">Nástavby</h3>
                                </div>
                                <button onClick={() => setIsAddSuperstructureOpen(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors shadow-sm">
                                    <Plus className="w-3.5 h-3.5" /> Přidat
                                </button>
                            </div>
                            <div className="space-y-3">
                                {project.superstructures?.length > 0 ? project.superstructures.map((s: any, i: number) => (
                                    <div key={i} className="p-4 rounded-xl bg-secondary/20 border border-border/50 flex justify-between items-center group hover:bg-secondary/40 transition-colors">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-base">{s.type}</span>
                                            {s.supplier && <span className="text-xs text-muted-foreground">({s.supplier})</span>}
                                        </div>
                                        <button onClick={() => handleDeleteSuperstructure(s.id)} className="p-2 rounded-lg bg-background/50 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )) : (
                                    <div className="text-center py-8 border-2 border-dashed border-border/50 rounded-xl bg-secondary/10">
                                        <p className="text-sm font-medium text-muted-foreground">Zatím žádná nástavba</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 3. Příslušenství */}
                        <div className="glass-panel p-6 space-y-6">
                            <div className="flex items-center justify-between pb-2 border-b border-border/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                                        <Package className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-bold tracking-tight">Příslušenství</h3>
                                </div>
                                <button onClick={() => setIsAddAccessoryOpen(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors shadow-sm">
                                    <Plus className="w-3.5 h-3.5" /> Přidat
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {project.project_accessories?.map((acc: any, i: number) => (
                                    <div key={i} className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg shadow-sm group">
                                        <span className="text-sm font-semibold">{acc.name}</span>
                                        {acc.quantity > 1 && <span className="font-bold text-xs bg-secondary px-1.5 py-0.5 rounded text-foreground">x{acc.quantity}</span>}
                                        <button onClick={() => handleDeleteAccessory(acc.id)} className="ml-1 text-muted-foreground hover:text-red-500 opacity-50 group-hover:opacity-100">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="pt-4 border-t border-border/50">
                                <h4 className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Poznámky k zakázce</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed italic">{project.description || "Žádné další poznámky."}</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Right Column: Key Details Sidebar */}
                <div className="space-y-6">
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel p-6 space-y-8">
                        <div className="space-y-6">
                            <h4 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                Klíčové Informace
                            </h4>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4 p-3 rounded-xl bg-secondary/30 border border-border/50">
                                    <div className="p-2.5 rounded-lg bg-background border border-border/50 text-blue-500"><User className="w-4 h-4" /></div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-muted-foreground leading-none">Vedoucí projektu</p>
                                        <p className="font-bold text-sm">{project.manager?.full_name || "Nepřiřazeno"}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-3 rounded-xl bg-secondary/30 border border-border/50">
                                    <div className="p-2.5 rounded-lg bg-background border border-border/50 text-green-500"><Calendar className="w-4 h-4" /></div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-muted-foreground leading-none">Termín dokončení</p>
                                        <p className="font-bold text-sm">{project.end_date ? new Date(project.end_date).toLocaleDateString('cs-CZ') : 'Neomezeno'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-border/50 space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Rychlé Odkazy</h4>
                            <div className="flex flex-col gap-2">
                                <button onClick={() => setIsHistoryOpen(true)} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 transition-colors text-xs font-semibold text-muted-foreground group">
                                    Historie změn <MoreVertical className="w-3.5 h-3.5 group-hover:text-foreground transition-colors" />
                                </button>
                                <button className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 transition-colors text-xs font-semibold text-muted-foreground group">
                                    Exportovat Report (PDF) <ExternalLink className="w-3.5 h-3.5 group-hover:text-foreground transition-colors" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <UpdateProjectModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} project={project} />
            <AddSuperstructureModal isOpen={isAddSuperstructureOpen} onClose={() => setIsAddSuperstructureOpen(false)} projectId={project.id} />
            <AddAccessoryModal isOpen={isAddAccessoryOpen} onClose={() => setIsAddAccessoryOpen(false)} projectId={project.id} />
            <ProjectHistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} projectId={project.id} />
        </div>
    )
}
