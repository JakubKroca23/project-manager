"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
    Edit2, Trash2, Calendar, User, Briefcase, ChevronLeft,
    Layout, Settings, Factory, CheckCircle2, Octagon,
    MoreVertical, ExternalLink, Package, ShoppingCart
} from "lucide-react"
import { UpdateProjectModal } from "@/components/projects/update-project-modal"
import { deleteProject } from "@/app/projects/actions"
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
                    <button
                        onClick={() => setIsEditOpen(true)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-secondary hover:bg-secondary/80 transition-colors border border-border/50"
                    >
                        <Edit2 className="w-3.5 h-3.5" />
                        Upravit
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors border border-red-500/20"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        {isDeleting ? "Mazání..." : "Smazat"}
                    </button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Project Overview */}
                <div className="lg:col-span-2 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-panel p-8 space-y-6"
                    >
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusData.color} ${statusData.bg} border-current/20`}>
                                    <statusData.icon className="w-3.5 h-3.5" />
                                    {statusData.label}
                                </span>
                                {project.client_name && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-orange-500/10 text-orange-500 border-orange-500/20">
                                        <Briefcase className="w-3.5 h-3.5" />
                                        {project.client_name}
                                    </span>
                                )}
                            </div>
                            <div className="space-y-1">
                                <h1 className="text-4xl font-black tracking-tight leading-none">{project.title}</h1>
                                {project.quantity > 1 && (
                                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                                        Zakázka na {project.quantity} {project.quantity < 5 ? 'kusy' : 'kusů'}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Popis Zakázky Card */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 rounded-[2rem] bg-secondary/20 border border-border/50 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-12 opacity-[0.02] -mr-8 -mt-8 group-hover:scale-110 transition-transform duration-1000">
                                <Briefcase className="w-48 h-48" />
                            </div>

                            <div className="space-y-6 relative z-10">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary/70">Technická Specifikace</h3>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 p-3 rounded-2xl bg-background/50 border border-border/50">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <Factory className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase leading-none mb-1">Výrobce</p>
                                            <p className="text-sm font-bold">{project.manufacturer || "Neuvedeno"}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 p-3 rounded-2xl bg-background/50 border border-border/50">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <Settings className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase leading-none mb-1">Typ Podvozku</p>
                                            <p className="text-sm font-bold">{project.chassis_type || "Neuvedeno"}</p>
                                        </div>
                                    </div>

                                    {/* Multiple Superstructures */}
                                    <div className="space-y-3 pt-2">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase px-1">Nástavby</p>
                                        <div className="space-y-2">
                                            {project.superstructures?.length > 0 ? project.superstructures.map((s: any, i: number) => (
                                                <div key={i} className="p-3 rounded-xl bg-background/50 border border-border/50 flex justify-between items-center">
                                                    <div>
                                                        <p className="text-sm font-bold">{s.type}</p>
                                                        {s.supplier && <p className="text-[10px] text-muted-foreground italic">{s.supplier}</p>}
                                                    </div>
                                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${s.order_status === 'delivered' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                            s.order_status === 'ordered' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                                'bg-orange-500/10 text-orange-500 border-orange-500/20'
                                                        }`}>
                                                        {s.order_status === 'delivered' ? 'Dodáno' : s.order_status === 'ordered' ? 'Objednáno' : 'Čeká'}
                                                    </span>
                                                </div>
                                            )) : (
                                                <p className="text-xs text-muted-foreground px-1 italic">Žádná nástavba není definována.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6 relative z-10 font-medium">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary/70">Příslušenství a Výbava</h3>
                                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                    {project.project_accessories?.length > 0 ? project.project_accessories.map((acc: any, i: number) => (
                                        <div key={i} className="p-3 rounded-xl bg-background/50 border border-border/50 group/item">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className={`p-1.5 rounded-lg ${acc.action_type === 'manufacture' ? 'bg-orange-500/10 text-orange-500' :
                                                            acc.action_type === 'purchase' ? 'bg-blue-500/10 text-blue-500' :
                                                                'bg-green-500/10 text-green-500'
                                                        }`}>
                                                        {acc.action_type === 'manufacture' ? <Settings className="w-3 h-3" /> :
                                                            acc.action_type === 'purchase' ? <ShoppingCart className="w-3 h-3" /> :
                                                                <Package className="w-3 h-3" />}
                                                    </div>
                                                    <span className="text-sm font-bold">{acc.name}</span>
                                                </div>
                                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${acc.order_status === 'delivered' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                        acc.order_status === 'ordered' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                            'bg-secondary text-muted-foreground border-border'
                                                    }`}>
                                                    {acc.order_status === 'delivered' ? 'Skladem' : acc.order_status === 'ordered' ? 'Cestě' : 'K objednání'}
                                                </span>
                                            </div>
                                            {(acc.supplier || acc.notes) && (
                                                <div className="pl-8 text-[10px] text-muted-foreground flex justify-between">
                                                    <span className="italic">{acc.supplier || "Interní"}</span>
                                                    {acc.quantity > 1 && <span className="font-bold">x{acc.quantity}</span>}
                                                </div>
                                            )}
                                        </div>
                                    )) : (
                                        <div className="text-center py-8 bg-background/20 rounded-2xl border border-dashed border-border">
                                            <p className="text-xs text-muted-foreground italic">Zatím nebylo přidáno žádné příslušenství.</p>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4 border-t border-border/50">
                                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Poznámky k zakázce</h4>
                                    <p className="text-sm text-muted-foreground leading-relaxed italic">
                                        {project.description || "Žádné další poznámky."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Status Timeline Indicator */}
                        <div className="relative pt-4">
                            <div className="flex items-center justify-between">
                                {statusOrder.map((s, idx) => {
                                    const isActive = idx <= currentStatusIdx
                                    const isCurrent = project.status === s
                                    const meta = statusMap[s]
                                    return (
                                        <div key={s} className="flex flex-col items-center gap-2 relative z-10 group">
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border-2 transition-all ${isActive ? `bg-primary border-primary text-primary-foreground` : "bg-background border-border text-muted-foreground"
                                                } ${isCurrent ? "ring-4 ring-primary/20 scale-110" : ""}`}>
                                                <meta.icon className="w-4 h-4" />
                                            </div>
                                            <span className={`text-[10px] font-bold uppercase tracking-tighter ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                                                {meta.label}
                                            </span>
                                        </div>
                                    )
                                })}
                                {/* Progress Line */}
                                <div className="absolute top-[20px] left-4 right-4 h-0.5 bg-border -z-0">
                                    <div
                                        className="h-full bg-primary transition-all duration-1000"
                                        style={{ width: `${Math.max(0, (currentStatusIdx / (statusOrder.length - 1)) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Placeholder for Activities / Gantt */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-panel p-1 rounded-[2rem] bg-gradient-to-br from-primary/5 to-transparent"
                    >
                        <div className="bg-background/40 backdrop-blur-xl rounded-[1.8rem] border border-white/5 p-8 min-h-[300px] flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
                                <Settings className="w-8 h-8 text-muted-foreground animate-spin-slow" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold italic">Modul správy zakázek</h3>
                                <p className="text-muted-foreground max-w-sm text-sm">
                                    Zde brzy uvidíte interaktivní časovou osu všech výrobních zakázek a servisních výjezdů spojených s tímto projektem.
                                </p>
                            </div>
                            <button className="px-6 py-2 bg-foreground text-background rounded-full text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform">
                                Připravujeme
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Right Column: Key Details Sidebar */}
                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-panel p-6 space-y-8"
                    >
                        <div className="space-y-6">
                            <h4 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                Klíčové Informace
                            </h4>

                            <div className="space-y-4">
                                <div className="flex items-start gap-4 p-3 rounded-xl bg-secondary/30 border border-border/50">
                                    <div className="p-2.5 rounded-lg bg-background border border-border/50 text-blue-500">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-muted-foreground leading-none">Vedoucí projektu</p>
                                        <p className="font-bold text-sm">{project.manager?.full_name || "Nepřiřazeno"}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-3 rounded-xl bg-secondary/30 border border-border/50">
                                    <div className="p-2.5 rounded-lg bg-background border border-border/50 text-green-500">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-muted-foreground leading-none">Termín dokončení</p>
                                        <p className="font-bold text-sm">
                                            {project.end_date ? new Date(project.end_date).toLocaleDateString('cs-CZ', { dateStyle: 'long' }) : 'Neomezeno'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-3 rounded-xl bg-secondary/30 border border-border/50">
                                    <div className="p-2.5 rounded-lg bg-background border border-border/50 text-orange-500">
                                        <Factory className="w-4 h-4" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-muted-foreground leading-none">Začátek prací</p>
                                        <p className="font-bold text-sm">
                                            {project.start_date ? new Date(project.start_date).toLocaleDateString('cs-CZ') : 'Neuvedeno'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Technická specifikace Sidebar */}
                        <div className="space-y-6 pt-6 border-t border-border/50">
                            <h4 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                Technická Specifikace
                            </h4>
                            <div className="space-y-3">
                                {[
                                    { label: "Výrobce", value: project.manufacturer },
                                    { label: "Podvozek", value: project.chassis_type },
                                    { label: "Nástavba", value: project.superstructure_type },
                                ].map((spec, i) => spec.value && (
                                    <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-secondary/20 border border-border/10">
                                        <span className="text-[10px] uppercase font-bold text-muted-foreground">{spec.label}</span>
                                        <span className="text-sm font-bold">{spec.value}</span>
                                    </div>
                                ))}

                                {project.accessories && (
                                    <div className="space-y-2 p-3 rounded-xl bg-secondary/30 border border-border/50">
                                        <p className="text-[10px] font-black uppercase text-muted-foreground leading-none">Příslušenství a výbava</p>
                                        <p className="text-xs leading-relaxed text-foreground/80 whitespace-pre-wrap">
                                            {project.accessories}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-border/50 space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Rychlé Odkazy</h4>
                            <div className="flex flex-col gap-2">
                                <button className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 transition-colors text-xs font-semibold text-muted-foreground group">
                                    Historie změn
                                    <MoreVertical className="w-3.5 h-3.5 group-hover:text-foreground transition-colors" />
                                </button>
                                <button className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 transition-colors text-xs font-semibold text-muted-foreground group">
                                    Exportovat Report (PDF)
                                    <ExternalLink className="w-3.5 h-3.5 group-hover:text-foreground transition-colors" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <UpdateProjectModal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                project={project}
            />
        </div>
    )
}
