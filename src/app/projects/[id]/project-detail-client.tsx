"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
    ChevronLeft,
    ChevronRight,
    Layout, Settings, Factory, CheckCircle2, Octagon,
    Edit2, Trash2, Calendar, User, Briefcase,
    MoreVertical, ExternalLink, Package, ShoppingCart, Plus, X, Truck, Building, MapPin,
    FileText, Zap, Wrench, History, Info
} from "lucide-react"

import { ProjectHistoryModal } from "@/components/projects/project-history-modal"
import { EditableField } from "@/components/projects/editable-field"
import { ProductionDescriptionModal } from "@/components/projects/production-description-modal"
import { GenerateJobsModal } from "@/components/projects/generate-jobs-modal"
import { deleteProject, deleteSuperstructure, deleteProjectAccessory, updateProject } from "@/app/projects/actions"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { StatusStepper } from "@/components/projects/status-stepper"
import { createClient } from "@/lib/supabase/client"
import { Database } from "@/lib/database.types"

type TabType = 'overview' | 'production' | 'services' | 'accessories' | 'history'

type Project = Database['public']['Tables']['projects']['Row'] & {
    manager?: { full_name: string | null } | null
    assigned_manager?: { full_name: string | null } | null
    production_orders?: any[]
    superstructures?: any[]
    project_accessories?: any[]
}

export function ProjectDetailClient({ project }: { project: Project }) {
    const router = useRouter()
    const supabase = createClient()
    const [activeTab, setActiveTab] = useState<TabType>('overview')
    const [userProfile, setUserProfile] = useState<{ id: string, role: string } | null>(null)

    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isAddSuperstructureOpen, setIsAddSuperstructureOpen] = useState(false)
    const [isAddAccessoryOpen, setIsAddAccessoryOpen] = useState(false)
    const [isHistoryOpen, setIsHistoryOpen] = useState(false)
    const [isDescriptionOpen, setIsDescriptionOpen] = useState(false)
    const [isGenerateOpen, setIsGenerateOpen] = useState(false)

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

    const handleDeleteSuperstructure = async (id: string) => {
        if (!confirm("Opravdu smazat tuto nástavbu?")) return
        await deleteSuperstructure(id, project.id)
    }

    const handleDeleteAccessory = async (id: string) => {
        if (!confirm("Opravdu smazat toto příslušenství?")) return
        await deleteProjectAccessory(id, project.id)
    }

    const handleStatusChange = async (newStatus: string) => {
        if (!canEdit) return
        const result = await updateProject(project.id, { status: newStatus })
        if (!result.success) alert(result.error)
    }

    const hasProductionDescription = !!project.production_description && project.production_description.trim().length > 0

    const tabs: { id: TabType, label: string, icon: any }[] = [
        { id: 'overview', label: 'Přehled', icon: Info },
        { id: 'production', label: 'Výroba', icon: Factory },
        { id: 'accessories', label: 'Příslušenství', icon: Package },
        { id: 'services', label: 'Služby', icon: Wrench },
        { id: 'history', label: 'Historie', icon: History },
    ]

    return (
        <div className="max-w-[1400px] mx-auto space-y-6 pb-20">
            {/* Header Area */}
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => router.push("/projects")}
                        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group px-2 py-1 -ml-2 rounded-lg hover:bg-muted"
                    >
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Zpět na seznam
                    </button>

                    <div className="flex items-center gap-2">
                        {canEdit && (
                            <>
                                <Button variant="secondary" size="sm" onClick={() => setIsEditOpen(true)}>
                                    <Edit2 className="w-3.5 h-3.5 mr-2" /> Upravit
                                </Button>
                                <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
                                    <Trash2 className="w-3.5 h-3.5 mr-2" /> Smazat
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                <div className="glass-panel p-8 space-y-6 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Layout className="w-32 h-32" />
                    </div>

                    <div className="space-y-2 relative">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-black uppercase tracking-[0.2em] text-primary/70">{project.client_name || "Bez klienta"}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-border" />
                            <span className="text-sm font-bold text-muted-foreground">{project.zakazka_sro || "SRO-XXX"}</span>
                        </div>
                        <h1 className="text-5xl font-black tracking-tight leading-tight bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
                            {project.title}
                        </h1>
                    </div>

                    <StatusStepper
                        currentStatus={project.status}
                        readOnly={!canEdit}
                        onStatusChange={handleStatusChange}
                    />
                </div>
            </div>

            {/* Sticky Tabs Navigation */}
            <div className="sticky top-2 z-30 bg-background/80 backdrop-blur-md border border-border/50 rounded-2xl p-1.5 flex items-center gap-1 shadow-xl shadow-black/5">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all
                            ${activeTab === tab.id ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'}
                        `}
                    >
                        <tab.icon className="w-4 h-4" />
                        <span className="hidden md:inline">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                            <div className="xl:col-span-2 space-y-6">
                                <section className="glass-panel p-6 space-y-6">
                                    <h3 className="text-lg font-black flex items-center gap-2">
                                        <Info className="w-5 h-5 text-primary" /> Základní informace
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <EditableField
                                                label="Podvozek"
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
                                                label="Sektor"
                                                value={project.sector}
                                                canEdit={canEdit}
                                                onSave={async (v) => { await updateProject(project.id, { sector: v }) }}
                                            />
                                            <EditableField
                                                label="Termín dokončení"
                                                value={project.end_date}
                                                type="date"
                                                canEdit={canEdit}
                                                onSave={async (v) => { await updateProject(project.id, { end_date: v }) }}
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <div className="group border-b border-border/10 pb-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Projektový Vedoucí</label>
                                                <div className="flex items-center gap-2 pt-1">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                                        <User className="w-4 h-4 text-indigo-500" />
                                                    </div>
                                                    <span className="font-bold text-lg">{project.assigned_manager?.full_name || project.manager?.full_name || "Nepřiřazeno"}</span>
                                                </div>
                                            </div>
                                            <EditableField
                                                label="Počet vozidel"
                                                value={project.quantity}
                                                type="number"
                                                canEdit={canEdit}
                                                onSave={async (v) => { await updateProject(project.id, { quantity: parseInt(v) }) }}
                                            />
                                            <EditableField
                                                label="OP CRM"
                                                value={project.op_crm}
                                                canEdit={canEdit}
                                                onSave={async (v) => { await updateProject(project.id, { op_crm: v }) }}
                                            />
                                        </div>
                                    </div>
                                </section>

                                <section className="glass-panel p-6 space-y-4">
                                    <h3 className="text-lg font-black flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-amber-500" /> Poznámky a popis
                                    </h3>
                                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                        {project.description || "Žádné interní poznámky k projektu."}
                                    </p>
                                </section>
                            </div>

                            <div className="space-y-6">
                                <div className="glass-panel p-6 space-y-6">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Rychlé akce</h4>
                                    <div className="grid grid-cols-1 gap-3">
                                        <Button
                                            variant="outline"
                                            className={hasProductionDescription ? "w-full border-green-500/50 text-green-600 bg-green-500/5 hover:bg-green-500/10" : "w-full border-amber-500/50 text-amber-600 bg-amber-500/5 hover:bg-amber-500/10"}
                                            onClick={() => setIsDescriptionOpen(true)}
                                        >
                                            <FileText className="w-4 h-4 mr-2" />
                                            Popis zakázky
                                            {hasProductionDescription && <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-green-500" />}
                                        </Button>
                                        <Button
                                            variant="premium"
                                            className="w-full shadow-indigo-500/20"
                                            onClick={() => {
                                                if (!hasProductionDescription) {
                                                    alert("Nejdříve musíte vyplnit Popis zakázky.")
                                                    return
                                                }
                                                setIsGenerateOpen(true)
                                            }}
                                        >
                                            <Zap className="w-4 h-4 mr-2" />
                                            Generovat zakázky
                                        </Button>
                                    </div>
                                </div>

                                <div className="glass-panel p-6 space-y-4">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Progres projektu</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm font-bold">
                                            <span>Dokončeno</span>
                                            <span className="text-primary">{project.completion_percentage || project.progress || 0}%</span>
                                        </div>
                                        <div className="h-3 w-full bg-secondary rounded-full overflow-hidden border border-border/50 p-0.5">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${project.completion_percentage || project.progress || 0}%` }}
                                                className="h-full bg-primary rounded-full shadow-[0_0_12px_rgba(59,130,246,0.5)]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'production' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Factory className="w-6 h-6 text-orange-500" /> Přehled výroby
                                </h3>
                                <Button variant="ghost" size="sm" onClick={() => setIsAddSuperstructureOpen(true)}>
                                    <Plus className="w-4 h-4 mr-1" /> Přidat nástavbu
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {project.superstructures && project.superstructures.length > 0 ? project.superstructures.map((s: any, i: number) => (
                                    <motion.div
                                        key={s.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="p-5 rounded-2xl bg-background border border-border/50 flex justify-between items-start group hover:border-primary/30 transition-all shadow-sm"
                                    >
                                        <div className="space-y-1">
                                            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">{s.supplier || "Vlastní výroba"}</p>
                                            <p className="font-bold text-xl">{s.type}</p>
                                            <div className="pt-2">
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{s.order_status || "plánováno"}</span>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDeleteSuperstructure(s.id)}>
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </motion.div>
                                )) : (
                                    <div className="col-span-full py-12 glass-panel border-dashed flex flex-col items-center justify-center text-muted-foreground gap-3">
                                        <Factory className="w-12 h-12 opacity-10" />
                                        <p className="font-medium">Žádné definované nástavby pro tento projekt.</p>
                                    </div>
                                )}
                            </div>

                            <h3 className="text-xl font-bold pt-6 border-t border-border/10 flex items-center gap-2">
                                <Wrench className="w-5 h-5 text-indigo-500" /> Výrobní zakázky
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {project.production_orders && project.production_orders.length > 0 ? project.production_orders.map((order: any) => (
                                    <div
                                        key={order.id}
                                        onClick={() => router.push(`/production/${order.id}`)}
                                        className="cursor-pointer p-6 rounded-2xl bg-secondary/10 border border-border/50 flex justify-between items-center group hover:bg-background hover:border-indigo-500/30 transition-all shadow-sm"
                                    >
                                        <div className="space-y-2">
                                            <p className="font-black text-sm group-hover:text-primary transition-colors flex items-center gap-2">
                                                {order.title}
                                                <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50 transition-opacity" />
                                            </p>
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground bg-background px-2 py-0.5 rounded border">
                                                {order.status}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] font-black uppercase text-muted-foreground">Termín</div>
                                            <div className="text-xs font-bold">{order.end_date ? new Date(order.end_date).toLocaleDateString('cs-CZ') : '-'}</div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-full py-10 rounded-2xl border-2 border-dashed border-border/50 flex flex-col items-center justify-center text-muted-foreground gap-3">
                                        <p className="text-sm font-medium">Zatím nebyly vygenerovány žádné výrobní zakázky.</p>
                                        <Button variant="link" size="sm" onClick={() => setIsGenerateOpen(true)} className="text-indigo-500 font-bold">
                                            Vygenerovat nyní
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'accessories' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Package className="w-6 h-6 text-blue-500" /> Katalog příslušenství
                                </h3>
                                <Button variant="secondary" size="sm" onClick={() => setIsAddAccessoryOpen(true)}>
                                    <Plus className="w-4 h-4 mr-1" /> Přidat položku
                                </Button>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                {project.project_accessories && project.project_accessories.length > 0 ? project.project_accessories.map((acc: any, i: number) => (
                                    <motion.div
                                        key={acc.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex items-center gap-4 pl-4 pr-2 py-2.5 bg-background border border-border shadow-sm rounded-2xl group hover:border-primary/40 transition-all"
                                    >
                                        <div className="space-y-0.5">
                                            <span className="block text-sm font-bold leading-none">{acc.name}</span>
                                            <span className="block text-[10px] text-muted-foreground uppercase font-black">{acc.action_type || "Skladem"}</span>
                                        </div>
                                        <div className="flex items-center gap-3 ml-4">
                                            {acc.quantity > 1 && <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-lg text-xs font-black">x{acc.quantity}</span>}
                                            <button onClick={() => handleDeleteAccessory(acc.id)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-all">
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </motion.div>
                                )) : (
                                    <div className="w-full py-20 glass-panel border-dashed flex flex-col items-center justify-center text-muted-foreground gap-3">
                                        <Package className="w-12 h-12 opacity-10" />
                                        <p className="font-medium text-center">Tento projekt zatím nemá přiřazené žádné příslušenství.</p>
                                        <Button variant="outline" size="sm" onClick={() => setIsAddAccessoryOpen(true)}>Přiřadit z katalogu</Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'services' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Wrench className="w-6 h-6 text-indigo-500" /> Servisní modul
                                </h3>
                                <Button variant="outline" size="sm">
                                    <Plus className="w-4 h-4 mr-1" /> Naplánovat servis
                                </Button>
                            </div>

                            <div className="py-20 glass-panel border-dashed flex flex-col items-center justify-center text-muted-foreground gap-3">
                                <Settings className="w-12 h-12 opacity-10" />
                                <p className="font-medium text-center">Historie servisů je prázdná.</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <History className="w-6 h-6 text-muted-foreground" /> Historie změn
                                </h3>
                                <Button variant="ghost" size="sm" onClick={() => setIsHistoryOpen(true)}>Zobrazit vše</Button>
                            </div>

                            <div className="glass-panel p-6">
                                <p className="text-sm text-muted-foreground italic">Detailní auditní log změn se připravuje...</p>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Modals */}
            <UpdateProjectModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} project={project} />
            <AddSuperstructureModal isOpen={isAddSuperstructureOpen} onClose={() => setIsAddSuperstructureOpen(false)} projectId={project.id} />
            <AddAccessoryModal isOpen={isAddAccessoryOpen} onClose={() => setIsAddAccessoryOpen(false)} projectId={project.id} />
            <ProductionDescriptionModal
                isOpen={isDescriptionOpen}
                onClose={() => setIsDescriptionOpen(false)}
                projectId={project.id}
                initialDescription={project.production_description || ""}
            />
            <GenerateJobsModal
                isOpen={isGenerateOpen}
                onClose={() => setIsGenerateOpen(false)}
                projectId={project.id}
                quantity={project.quantity || 1}
            />
            <ProjectHistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} projectId={project.id} />
        </div>
    )
}
