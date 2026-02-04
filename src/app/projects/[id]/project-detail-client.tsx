"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
    ChevronLeft,
    Layout, Factory, CheckCircle2,
    Trash2, User,
    ExternalLink, Package, History, Info, FileText, Calendar, Building, Hash
} from "lucide-react"

import { ProjectHistoryModal } from "@/components/projects/project-history-modal"
import { EditableField } from "@/components/projects/editable-field"
import { deleteProject, updateProject } from "@/app/projects/actions"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { StatusStepper } from "@/components/projects/status-stepper"
import { createClient } from "@/lib/supabase/client"
import { Database } from "@/lib/database.types"

type Project = Database['public']['Tables']['projects']['Row'] & {
    manager?: { full_name: string | null } | null
    assigned_manager?: { full_name: string | null } | null
    production_orders?: any[]
}

export function ProjectDetailClient({ project }: { project: Project }) {
    const router = useRouter()
    const supabase = createClient()
    const [userProfile, setUserProfile] = useState<{ id: string, role: string } | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isHistoryOpen, setIsHistoryOpen] = useState(false)

    useEffect(() => {
        async function getAuth() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('id, role')
                    .eq('id', user.id)
                    .single()
                setUserProfile(profile as any)
            }
        }
        getAuth()
    }, [])

    const canEdit = userProfile?.role === 'admin' || userProfile?.id === project.manager_id

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

    const handleStatusChange = async (newStatus: string) => {
        if (!canEdit) return
        const result = await updateProject(project.id, { status: newStatus as any })
        if (!result.success) alert(result.error)
    }

    return (
        <div className="w-full px-4 md:px-8 lg:px-12 py-6 space-y-8 pb-32">
            {/* Top Navigation Bar */}
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <button
                    onClick={() => router.push("/projects")}
                    className="group flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-all pr-4"
                >
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    ZPĚT NA SEZNAM PROJEKTŮ
                </button>

                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={() => setIsHistoryOpen(true)} className="font-bold text-xs uppercase tracking-wider">
                        <History className="w-4 h-4 mr-2" /> Historie
                    </Button>
                    {canEdit && (
                        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting} className="font-bold text-xs uppercase tracking-wider">
                            <Trash2 className="w-4 h-4 mr-2" /> Smazat Projekt
                        </Button>
                    )}
                </div>
            </div>

            {/* Hero Section - Full Width */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-8 md:p-12 relative overflow-hidden flex flex-col gap-8 border-none shadow-2xl shadow-black/10"
            >
                {/* Decorative Icon */}
                <div className="absolute -top-12 -right-12 opacity-[0.03] rotate-12">
                    <Layout className="w-96 h-96" />
                </div>

                <div className="relative space-y-4">
                    <div className="flex items-center gap-4 text-primary font-black uppercase tracking-[0.3em] text-xs">
                        <span>{project.client_name || "INTERNÍ PROJEKT"}</span>
                        <span className="w-2 h-2 rounded-full bg-border" />
                        <span className="text-muted-foreground">{project.zakazka_sro || "BEZ ČÍSLA ZAKÁZKY"}</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none max-w-5xl">
                        {project.title}
                    </h1>
                </div>

                {/* Status Stepper - Wide */}
                <div className="relative pt-4">
                    <StatusStepper
                        currentStatus={project.status}
                        readOnly={!canEdit}
                        onStatusChange={handleStatusChange}
                    />
                </div>
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

                {/* Left Column: Details & Orders (8/12) */}
                <div className="xl:col-span-8 space-y-8">

                    {/* Basic Info Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <section className="glass-panel p-6 space-y-4 hover:border-primary/30 transition-colors group">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 group-hover:text-primary transition-colors">
                                <Building className="w-3 h-3" /> Základní specifikace
                            </h3>
                            <div className="space-y-4">
                                <EditableField
                                    label="Podvozek / Výrobce"
                                    value={`${project.manufacturer || ""} ${project.chassis_type || ""}`.trim() || "–"}
                                    canEdit={canEdit}
                                    onSave={async (v) => {
                                        const parts = v.split(' ')
                                        const manufacturer = parts[0] || ""
                                        const chassis_type = parts.slice(1).join(' ')
                                        await updateProject(project.id, { manufacturer, chassis_type })
                                    }}
                                />
                                <EditableField
                                    label="Sektor zákazníka"
                                    value={project.sector || "Neuvedeno"}
                                    canEdit={canEdit}
                                    onSave={async (v) => { await updateProject(project.id, { sector: v }) }}
                                />
                            </div>
                        </section>

                        <section className="glass-panel p-6 space-y-4 hover:border-primary/30 transition-colors group">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 group-hover:text-primary transition-colors">
                                <Calendar className="w-3 h-3" /> Časový harmonogram
                            </h3>
                            <div className="space-y-4">
                                <EditableField
                                    label="Zahájení projektu"
                                    value={project.start_date || ""}
                                    type="date"
                                    canEdit={canEdit}
                                    onSave={async (v) => { await updateProject(project.id, { start_date: v }) }}
                                />
                                <EditableField
                                    label="Termín dokončení"
                                    value={project.end_date || ""}
                                    type="date"
                                    canEdit={canEdit}
                                    onSave={async (v) => { await updateProject(project.id, { end_date: v }) }}
                                />
                            </div>
                        </section>

                        <section className="glass-panel p-6 space-y-4 hover:border-primary/30 transition-colors group">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 group-hover:text-primary transition-colors">
                                <Hash className="w-3 h-3" /> Obchodní údaje
                            </h3>
                            <div className="space-y-4">
                                <EditableField
                                    label="Počet vozidel (ks)"
                                    value={project.quantity || 1}
                                    type="number"
                                    canEdit={canEdit}
                                    onSave={async (v) => { await updateProject(project.id, { quantity: parseInt(v) }) }}
                                />
                                <EditableField
                                    label="OP CRM"
                                    value={project.op_crm || "–"}
                                    canEdit={canEdit}
                                    onSave={async (v) => { await updateProject(project.id, { op_crm: v }) }}
                                />
                            </div>
                        </section>
                    </div>

                    {/* Production Orders Section */}
                    <section className="glass-panel p-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black flex items-center gap-3 italic uppercase tracking-tighter">
                                <Factory className="w-7 h-7 text-orange-500" /> Výrobní zakázky
                            </h3>
                            <span className="text-xs font-bold bg-secondary px-3 py-1 rounded-full text-muted-foreground border">
                                CELKEM: {project.production_orders?.length || 0}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {project.production_orders && project.production_orders.length > 0 ? project.production_orders.map((order: any) => (
                                <motion.div
                                    key={order.id}
                                    whileHover={{ scale: 1.01 }}
                                    onClick={() => router.push(`/production/${order.id}`)}
                                    className="cursor-pointer p-5 rounded-2xl bg-secondary/10 border border-border/50 flex justify-between items-center group hover:bg-background hover:border-primary/50 transition-all shadow-sm"
                                >
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <p className="font-black text-sm group-hover:text-primary transition-colors">
                                                {order.title}
                                            </p>
                                            <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all text-primary" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 tracking-wider">
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right border-l border-border/50 pl-4">
                                        <div className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1 justify-end">
                                            <Calendar className="w-3 h-3" /> Termín
                                        </div>
                                        <div className="text-sm font-bold">{order.end_date ? new Date(order.end_date).toLocaleDateString('cs-CZ') : '-'}</div>
                                    </div>
                                </motion.div>
                            )) : (
                                <div className="col-span-full py-16 rounded-2xl border-2 border-dashed border-border/50 flex flex-col items-center justify-center text-muted-foreground gap-3">
                                    <Package className="w-10 h-10 opacity-20" />
                                    <p className="text-sm font-bold uppercase tracking-widest opacity-50">Žádné výrobní zakázky</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Notes Section - Wide */}
                    <section className="glass-panel p-8 space-y-6">
                        <h3 className="text-xl font-black flex items-center gap-3 italic uppercase tracking-tighter">
                            <FileText className="w-7 h-7 text-indigo-500" /> Detailní popis projektu
                        </h3>
                        <div className="bg-secondary/20 p-6 rounded-2xl border border-border/50">
                            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap font-medium">
                                {project.description || "K tomuto projektu nejsou evidovány žádné detailní poznámky."}
                            </p>
                            {canEdit && (
                                <div className="mt-4 pt-4 border-t border-border/50 flex justify-end">
                                    <button
                                        onClick={() => setIsEditOpen(true)} // Tady už nemáme modál, ale necháme to pro budoucí inline editaci popisu
                                        className="text-xs font-bold text-primary hover:underline"
                                    >
                                        UPRAVIT POPIS
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Right Column: Sidebar (4/12) */}
                <div className="xl:col-span-4 space-y-8">

                    {/* Progress Panel */}
                    <div className="glass-panel p-8 space-y-8 relative overflow-hidden bg-primary/5 border-primary/20">
                        <div className="absolute top-0 right-0 p-4 opacity-[0.1] text-primary">
                            <CheckCircle2 className="w-24 h-24" />
                        </div>

                        <div className="space-y-4 relative">
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Celkový progres</h4>
                            <div className="flex items-end gap-2 text-6xl font-black tracking-tighter">
                                <span>{project.progress || 0}</span>
                                <span className="text-2xl mb-2 text-muted-foreground">%</span>
                            </div>
                            <div className="h-4 w-full bg-secondary rounded-full overflow-hidden border border-border/50 p-1">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${project.progress || 0}%` }}
                                    className="h-full bg-primary rounded-full shadow-[0_0_20px_rgba(59,130,246,0.6)]"
                                />
                            </div>
                        </div>

                        <div className="pt-4 space-y-4 border-t border-border/50">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Odpovědný manažer</span>
                                <div className="flex items-center gap-3 pt-1">
                                    <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-inner">
                                        <User className="w-5 h-5 text-indigo-500" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-black text-base leading-none">
                                            {project.assigned_manager?.full_name || project.manager?.full_name || "Nepřiřazeno"}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">Project Manager</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats / Info */}
                    <div className="glass-panel p-6 space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground font-bold">Vytvořeno:</span>
                                <span className="font-bold">{new Date(project.created_at).toLocaleDateString('cs-CZ')}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground font-bold">Změněno:</span>
                                <span className="font-bold">{new Date(project.updated_at).toLocaleDateString('cs-CZ')}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground font-bold">ID Projektu:</span>
                                <code className="bg-secondary px-2 py-0.5 rounded text-[10px] font-black">{project.id.slice(0, 8)}...</code>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 rounded-3xl bg-secondary/20 border-2 border-dashed border-border/50 flex flex-col items-center justify-center text-center gap-4 group hover:bg-secondary/30 transition-all cursor-help">
                        <Info className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                        <div className="space-y-1">
                            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Potřebujete pomoc?</p>
                            <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">Všechny změny jsou automaticky ukládány a logovány do historie projektu pro pozdější audit.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* History Modal */}
            <ProjectHistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} projectId={project.id} />
        </div>
    )
}
