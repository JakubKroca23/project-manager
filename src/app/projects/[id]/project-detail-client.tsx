"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
    ChevronLeft,
    ChevronRight,
    Layout, Settings, Factory, CheckCircle2, Octagon,
    ExternalLink, Plus, Wrench, Trash2, Calendar, Truck, User, Briefcase
} from "lucide-react"

import { ProjectHistoryModal } from "@/components/projects/project-history-modal"
import { deleteProject } from "@/app/projects/actions"
import { Badge } from "@/components/ui/badge"
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
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">

                {/* Left Column: Project Overview & Identity */}
                <div className="xl:col-span-3 space-y-8">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-8 space-y-8 relative overflow-hidden">

                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

                        {/* Title & Actions Section */}
                        <div className="flex flex-col md:flex-row justify-between gap-6 relative">
                            <div className="space-y-4 flex-1">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${statusData.color} ${statusData.bg} border-current/20 shadow-sm`}>
                                        <statusData.icon className="w-4 h-4" /> {statusData.label}
                                    </span>
                                    {project.client_name && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border bg-indigo-500/10 text-indigo-500 border-indigo-500/20 shadow-sm">
                                            <Briefcase className="w-4 h-4" /> {project.client_name}
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-none bg-gradient-to-br from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
                                    {project.title}
                                </h1>
                                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground font-medium">
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/30">
                                        <Calendar className="w-4 h-4 text-primary" />
                                        <span>Zahájení: {project.start_date ? new Date(project.start_date).toLocaleDateString('cs-CZ') : 'Neuvedeno'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/30">
                                        <Truck className="w-4 h-4 text-orange-500" />
                                        <span>{project.quantity || 1} vozidel</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-2 pt-2">
                                <Button
                                    variant="secondary"
                                    onClick={() => { }}
                                    className="bg-secondary/50 hover:bg-secondary/80 border-border/50 shadow-sm px-6 h-11 text-sm font-bold opacity-50 cursor-not-allowed"
                                >
                                    Upravit
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="shadow-lg shadow-destructive/20 h-11 px-6 text-sm font-bold"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" /> Smazat
                                </Button>
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
                        <div className="space-y-6 pt-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Wrench className="w-6 h-6 text-indigo-500" /> Výrobní Zakázky
                                </h3>
                                <Badge variant="outline" className="bg-indigo-500/5 text-indigo-500 border-indigo-500/20 px-3 py-1">
                                    {project.production_orders?.length || 0} celkem
                                </Badge>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {project.production_orders && project.production_orders.length > 0 ? project.production_orders.map((order: any) => (
                                    <div
                                        key={order.id}
                                        onClick={() => router.push(`/production/${order.id}`)}
                                        className="group cursor-pointer p-5 rounded-2xl bg-secondary/20 border border-border/50 hover:border-indigo-500/30 hover:bg-secondary/40 transition-all shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                                                <Factory className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-lg flex items-center gap-2">
                                                    {order.title}
                                                    <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity" />
                                                </p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">ID: {order.id.slice(0, 8)}</span>
                                                    <span className="w-1 h-1 rounded-full bg-border" />
                                                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                                        <Truck className="w-3 h-3" /> {order.quantity || 1} ks
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4 md:text-right">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase">Termín</p>
                                                <div className="flex items-center gap-1.5 text-xs font-bold">
                                                    <Calendar className="w-3.5 h-3.5 text-orange-500" />
                                                    {order.end_date ? new Date(order.end_date).toLocaleDateString('cs-CZ') : '-'}
                                                </div>
                                            </div>

                                            <div className="space-y-1 min-w-[100px]">
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase">Stav</p>
                                                <Badge className="bg-indigo-500 text-white border-0 text-[10px] h-5 uppercase tracking-tighter">
                                                    {order.status}
                                                </Badge>
                                            </div>

                                            <div className="space-y-1 min-w-[80px]">
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase">Priorita</p>
                                                <span className={`text-xs font-black uppercase ${order.priority === 'high' ? 'text-red-500' : 'text-blue-500'}`}>
                                                    {order.priority}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-12 border-2 border-dashed border-border/50 rounded-3xl flex flex-col items-center justify-center text-muted-foreground gap-4 bg-secondary/5">
                                        <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center">
                                            <Wrench className="w-8 h-8 opacity-20" />
                                        </div>
                                        <div className="text-center">
                                            <p className="font-bold text-lg text-foreground/50">Žádné výrobní zakázky</p>
                                            <p className="text-sm">K tomuto projektu zatím nebyly přiřazeny žádné zakázky.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                    </motion.div>
                </div>

                {/* Right Column: Status & Notes */}
                <div className="space-y-8">
                    <div className="glass-panel p-8 space-y-8 sticky top-24 overflow-hidden">
                        {/* Decorative sidebar element */}
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -ml-16 -mb-16 pointer-events-none" />

                        <div className="relative space-y-6">
                            <div>
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-4 flex items-center gap-2">
                                    <Factory className="w-3.5 h-3.5" /> Stav Výroby
                                </h4>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <span className="text-sm font-bold">Celkový pokrok</span>
                                        <span className="text-2xl font-black text-primary">{project.progress || 0}%</span>
                                    </div>
                                    <div className="h-3 w-full bg-secondary/50 rounded-full overflow-hidden p-0.5 border border-border/50 shadow-inner">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${project.progress || 0}%` }}
                                            className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.5)]"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-border/50">
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-3">Popis projektu</h4>
                                <div className="p-4 rounded-xl bg-secondary/20 border border-border/50">
                                    <p className="text-sm text-foreground/80 leading-relaxed max-h-[400px] overflow-y-auto custom-scrollbar">
                                        {project.description || "Žádný doplňující popis k tomuto projektu."}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-border/50">
                                <button
                                    onClick={() => setIsHistoryOpen(true)}
                                    className="w-full group flex items-center justify-between p-4 rounded-xl bg-primary/5 hover:bg-primary/10 border border-primary/10 transition-all text-sm font-bold text-primary shadow-sm"
                                >
                                    <span className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" /> Historie změn
                                    </span>
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <ProjectHistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} projectId={project.id} />
        </div>
    )
}
