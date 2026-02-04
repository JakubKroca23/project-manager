"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
    ChevronLeft,
    Layout, Settings, Factory, CheckCircle2, Octagon,
    ExternalLink, Plus, Wrench, Trash2, Calendar, Truck, User, Briefcase
} from "lucide-react"

import { ProjectHistoryModal } from "@/components/projects/project-history-modal"
import { deleteProject } from "@/app/projects/actions"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Database } from "@/lib/database.types"

type Project = Database['public']['Tables']['projects']['Row'] & {
    manager?: { full_name: string | null } | null
    production_orders?: any[]
}

const statusMap: Record<string, { label: string; color: string; icon: any; bg: string }> = {
    planning: { label: "Plánování", color: "text-blue-500", icon: Layout, bg: "bg-blue-500/10" },
    development: { label: "Vývoj", color: "text-indigo-500", icon: Settings, bg: "bg-indigo-500/10" },
    production: { label: "Výroba", color: "text-orange-500", icon: Factory, bg: "bg-orange-500/10" },
    completed: { label: "Dokončeno", color: "text-green-500", icon: CheckCircle2, bg: "bg-green-500/10" },
    stopped: { label: "Zastaveno", color: "text-red-500", icon: Octagon, bg: "bg-red-500/10" },
}

export function ProjectDetailClient({ project }: { project: Project }) {
    const router = useRouter()
    const [isDeleting, setIsDeleting] = useState(false)
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

    const statusData = statusMap[project.status || 'planning'] || { label: project.status, color: "text-foreground", icon: Layout, bg: "bg-secondary" }

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
                    <Button variant="secondary" onClick={() => { }} className="opacity-50 cursor-not-allowed">
                        Upravit
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
                                        <span className="font-bold">{project.manufacturer || '-'} {project.chassis_type || ''}</span>
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

                        {/* Production Orders (Výrobní Zakázky) */}
                        <div className="space-y-4 pt-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <Wrench className="w-5 h-5 text-indigo-500" /> Výrobní Zakázky
                                </h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {project.production_orders && project.production_orders.length > 0 ? project.production_orders.map((order: any) => (
                                    <div
                                        key={order.id}
                                        onClick={() => router.push(`/production/${order.id}`)}
                                        className="cursor-pointer p-4 rounded-xl bg-background border border-border/50 flex justify-between items-center group hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all shadow-sm"
                                    >
                                        <div>
                                            <p className="font-bold text-sm flex items-center gap-2">
                                                {order.title}
                                                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Stav: <span className="uppercase text-[10px] font-bold tracking-wider">{order.status}</span>
                                            </p>
                                        </div>
                                        <div className="text-right text-xs text-muted-foreground">
                                            <div>Start: {order.start_date ? new Date(order.start_date).toLocaleDateString('cs-CZ') : '-'}</div>
                                            <div>Konec: {order.end_date ? new Date(order.end_date).toLocaleDateString('cs-CZ') : '-'}</div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-full p-6 border-2 border-dashed border-border/50 rounded-xl flex flex-col items-center justify-center text-muted-foreground gap-2 bg-secondary/10">
                                        <Wrench className="w-6 h-6 opacity-20" />
                                        <p className="text-sm">Žádné výrobní zakázky.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </motion.div>
                </div>

                {/* Right Column: Status & Notes */}
                <div className="space-y-8">
                    <div className="glass-panel p-6 space-y-6 sticky top-24">
                        <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Stav Výroby</h4>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm font-medium">
                                <span>Dokončeno</span>
                                <span>{project.progress || 0}%</span>
                            </div>
                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${project.progress || 0}%` }}
                                    className="h-full bg-primary rounded-full transition-all"
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-border/50">
                            <h4 className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Popis</h4>
                            <p className="text-sm text-foreground/80 leading-relaxed max-h-[300px] overflow-y-auto custom-scrollbar">
                                {project.description || "Žádný popis."}
                            </p>
                        </div>

                        <div className="pt-4 border-t border-border/50">
                            <button onClick={() => setIsHistoryOpen(true)} className="w-full flex items-center justify-center gap-2 p-2 rounded-lg hover:bg-secondary transition-colors text-xs font-semibold text-muted-foreground">
                                Historie projektu
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            <ProjectHistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} projectId={project.id} />
        </div>
    )
}
