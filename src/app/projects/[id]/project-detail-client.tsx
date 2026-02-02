"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
    Edit2, Trash2, Calendar, User, Briefcase, ChevronLeft,
    Layout, Settings, Factory, CheckCircle2, Octagon,
    MoreVertical, ExternalLink, Package, ShoppingCart, Plus, X, Truck, Building, MapPin,
    FileText, Zap
} from "lucide-react"
import { UpdateProjectModal } from "@/components/projects/update-project-modal"
import { AddSuperstructureModal } from "@/components/projects/add-superstructure-modal"
import { AddAccessoryModal } from "@/components/projects/add-accessory-modal"
import { ProjectHistoryModal } from "@/components/projects/project-history-modal"
import { ProductionDescriptionModal } from "@/components/projects/production-description-modal"
import { GenerateJobsModal } from "@/components/projects/generate-jobs-modal"
import { deleteProject, deleteSuperstructure, deleteProjectAccessory } from "@/app/projects/actions"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

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
    const [isDescriptionOpen, setIsDescriptionOpen] = useState(false)
    const [isGenerateOpen, setIsGenerateOpen] = useState(false)

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

    const hasProductionDescription = !!project.production_description && project.production_description.trim().length > 0

    return (
        <div className="max-w-[1400px] mx-auto space-y-8">
            {/* Navigation & Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <button
                    onClick={() => router.push("/projects")}
                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group px-2 py-1 -ml-2 rounded-lg hover:bg-muted"
                >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Zpět na seznam
                </button>

                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setIsDescriptionOpen(true)}
                        className={hasProductionDescription ? "border-green-500/50 text-green-600 hover:bg-green-500/10" : "border-amber-500/50 text-amber-600 hover:bg-amber-500/10"}
                    >
                        <FileText className="w-4 h-4 mr-2" />
                        Popis zakázky
                        {hasProductionDescription && <CheckCircle2 className="w-3.5 h-3.5 ml-1.5" />}
                    </Button>

                    <Button
                        variant="premium"
                        onClick={() => {
                            if (!hasProductionDescription) {
                                alert("Nejdříve musíte vyplnit Popis zakázky.")
                                return
                            }
                            setIsGenerateOpen(true)
                        }}
                        className="relative overflow-hidden"
                    >
                        <Zap className="w-4 h-4 mr-2" />
                        Vygenerovat zakázky
                    </Button>

                    <div className="w-px h-6 bg-border mx-2 hidden md:block" />

                    <Button variant="secondary" onClick={() => setIsEditOpen(true)}>
                        <Edit2 className="w-3.5 h-3.5 mr-2" /> Upravit
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                        <Trash2 className="w-3.5 h-3.5 mr-2" /> Smazat
                    </Button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">

                {/* Left Column: Project Overview & Identity */}
                <div className="xl:col-span-3 space-y-8">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-8 space-y-8">

                        {/* Title Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 flex-wrap">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${statusData.color} ${statusData.bg} border-current/20`}>
                                    <statusData.icon className="w-4 h-4" /> {statusData.label}
                                </span>
                                {project.client_name && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border bg-indigo-500/10 text-indigo-500 border-indigo-500/20">
                                        <Briefcase className="w-4 h-4" /> {project.client_name}
                                    </span>
                                )}
                            </div>
                            <h1 className="text-5xl font-black tracking-tight leading-tight bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
                                {project.title}
                            </h1>
                            <div className="flex items-center gap-6 text-sm text-muted-foreground font-medium">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-primary" />
                                    <span>Zahájení: {project.start_date ? new Date(project.start_date).toLocaleDateString('cs-CZ') : 'Neuvedeno'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Truck className="w-4 h-4 text-orange-500" />
                                    <span>{project.quantity || 1} vozidel</span>
                                </div>
                            </div>
                        </div>

                        {/* CRM & Technical Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* CRM Card */}
                            <div className="p-6 rounded-2xl bg-secondary/20 border border-border/50 space-y-4 hover:bg-secondary/30 transition-colors">
                                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <User className="w-4 h-4" /> Obchod & CRM
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between border-b border-border/10 pb-2">
                                        <span className="text-sm text-muted-foreground">Zakázka SRO</span>
                                        <span className="font-bold">{project.zakazka_sro || "–"}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-border/10 pb-2">
                                        <span className="text-sm text-muted-foreground">OP CRM</span>
                                        <span className="font-bold">{project.op_crm || "–"}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-border/10 pb-2">
                                        <span className="text-sm text-muted-foreground">Vedoucí</span>
                                        <span className="font-bold">{project.manager?.full_name || "Nepřiřazeno"}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Technical Card */}
                            <div className="p-6 rounded-2xl bg-secondary/20 border border-border/50 space-y-4 hover:bg-secondary/30 transition-colors">
                                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <Settings className="w-4 h-4" /> Technická Specifikace
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between border-b border-border/10 pb-2">
                                        <span className="text-sm text-muted-foreground">Podvozek</span>
                                        <span className="font-bold">{project.manufacturer} {project.chassis_type}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-border/10 pb-2">
                                        <span className="text-sm text-muted-foreground">Sektor</span>
                                        <span className="font-bold">{project.sector || "–"}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-border/10 pb-2">
                                        <span className="text-sm text-muted-foreground">Montáž</span>
                                        <span className="font-bold">{project.assembly_company || "–"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Superstructures (Nástavby) */}
                        <div className="space-y-4 pt-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <Factory className="w-5 h-5 text-orange-500" /> Nástavby
                                </h3>
                                <Button variant="ghost" size="sm" onClick={() => setIsAddSuperstructureOpen(true)}>
                                    <Plus className="w-4 h-4 mr-1" /> Přidat
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {project.superstructures?.length > 0 ? project.superstructures.map((s: any, i: number) => (
                                    <div key={i} className="p-4 rounded-xl bg-background border border-border/50 flex justify-between items-start group hover:border-primary/30 transition-all shadow-sm">
                                        <div>
                                            <p className="font-bold text-lg">{s.type}</p>
                                            <p className="text-sm text-muted-foreground">{s.supplier || "Dodavatel neuveden"}</p>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDeleteSuperstructure(s.id)}>
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )) : (
                                    <div className="col-span-full p-8 border-2 border-dashed border-border/50 rounded-xl flex flex-col items-center justify-center text-muted-foreground gap-2">
                                        <Factory className="w-8 h-8 opacity-20" />
                                        <p>Žádné nástavby</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Accessories (Příslušenství) */}
                        <div className="space-y-4 pt-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <Package className="w-5 h-5 text-blue-500" /> Příslušenství
                                </h3>
                                <Button variant="ghost" size="sm" onClick={() => setIsAddAccessoryOpen(true)}>
                                    <Plus className="w-4 h-4 mr-1" /> Přidat
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {project.project_accessories?.length > 0 ? project.project_accessories.map((acc: any, i: number) => (
                                    <div key={i} className="flex items-center gap-3 px-4 py-2 bg-background border border-border shadow-sm rounded-lg group hover:border-primary/30 transition-colors">
                                        <span className="font-medium">{acc.name}</span>
                                        {acc.quantity > 1 && <span className="bg-secondary px-2 py-0.5 rounded text-xs font-bold">x{acc.quantity}</span>}
                                        <button onClick={() => handleDeleteAccessory(acc.id)} className="text-muted-foreground hover:text-red-500 opacity-20 group-hover:opacity-100 transition-opacity ml-1">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                )) : (
                                    <p className="text-sm text-muted-foreground italic pl-2">Zatím žádné příslušenství.</p>
                                )}
                            </div>
                        </div>

                    </motion.div>
                </div>

                {/* Right Column: Status & Notes */}
                <div className="space-y-8">
                    {/* Production Status Card */}
                    <div className="glass-panel p-6 space-y-6 sticky top-24">
                        <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Stav Výroby</h4>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm font-medium">
                                <span>Dokončeno</span>
                                <span>{project.progress || 0}%</span>
                            </div>
                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${project.progress || 0}%` }}
                                    className="h-full bg-primary rounded-full"
                                />
                            </div>
                        </div>

                        {/* Description Status */}
                        <div className={`p-4 rounded-xl border ${hasProductionDescription ? "bg-green-500/5 border-green-500/20" : "bg-amber-500/5 border-amber-500/20"}`}>
                            <div className="flex items-start gap-3">
                                <FileText className={`w-5 h-5 mt-0.5 ${hasProductionDescription ? "text-green-500" : "text-amber-500"}`} />
                                <div className="space-y-1">
                                    <p className={`text-sm font-bold ${hasProductionDescription ? "text-green-700 dark:text-green-400" : "text-amber-700 dark:text-amber-400"}`}>
                                        Popis zakázky
                                    </p>
                                    <p className="text-xs text-muted-foreground leading-tight">
                                        {hasProductionDescription
                                            ? "Dokument je vyplněn a připraven pro výrobu."
                                            : "Nutné vyplnit před generováním zakázek."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-border/50">
                            <h4 className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Interní Poznámky</h4>
                            <p className="text-sm text-foreground/80 leading-relaxed max-h-[200px] overflow-y-auto custom-scrollbar">
                                {project.description || "Žádné poznámky."}
                            </p>
                        </div>

                        <div className="pt-4 border-t border-border/50">
                            <button onClick={() => setIsHistoryOpen(true)} className="w-full flex items-center justify-center gap-2 p-2 rounded-lg hover:bg-secondary transition-colors text-xs font-semibold text-muted-foreground">
                                Historie projektu <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            <UpdateProjectModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} project={project} />
            <AddSuperstructureModal isOpen={isAddSuperstructureOpen} onClose={() => setIsAddSuperstructureOpen(false)} projectId={project.id} />
            <AddAccessoryModal isOpen={isAddAccessoryOpen} onClose={() => setIsAddAccessoryOpen(false)} projectId={project.id} />
            <ProjectHistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} projectId={project.id} />

            <ProductionDescriptionModal
                isOpen={isDescriptionOpen}
                onClose={() => setIsDescriptionOpen(false)}
                projectId={project.id}
                initialDescription={project.production_description}
            />

            <GenerateJobsModal
                isOpen={isGenerateOpen}
                onClose={() => setIsGenerateOpen(false)}
                projectId={project.id}
                quantity={project.quantity || 1}
            />
        </div>
    )
}
