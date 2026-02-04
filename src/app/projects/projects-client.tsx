"use client"

import { useState } from "react"
import { Plus, Layout, Settings, Factory, CheckCircle2, Octagon, Grid, List, User, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"
import { DataTable } from "@/components/ui/data-table"
import { Database } from "@/lib/database.types"
import { CreateProjectModal } from "@/components/projects/create-project-modal"
import { ProjectCard } from "@/components/projects/project-card"
import { motion, AnimatePresence } from "framer-motion"

type Project = Database['public']['Tables']['projects']['Row'] & {
    progress?: number
    manager_name?: string
    completion_percentage?: number | null
}

const statusMap: Record<string, { label: string; color: string; icon: any }> = {
    planning: { label: "Nový projekt", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20", icon: Layout },
    development: { label: "Vývoj", color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20", icon: Settings },
    production: { label: "Výroba", color: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20", icon: Factory },
    completed: { label: "Dokončeno", color: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20", icon: CheckCircle2 },
    stopped: { label: "Zastaveno", color: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20", icon: Octagon },
}

export function ProjectsClient({ initialData }: { initialData: Project[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [view, setView] = useState<'table' | 'grid'>('grid')
    const [search, setSearch] = useState('')
    const router = useRouter()

    const filteredProjects = initialData.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.client_name?.toLowerCase().includes(search.toLowerCase()) ||
        p.manager_name?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black tracking-tight bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
                        Projekty
                    </h1>
                    <p className="text-sm text-muted-foreground font-medium">Správa a přehled všech aktivních i dokončených projektů.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-secondary/30 p-1 rounded-xl border border-border/50">
                        <button
                            onClick={() => setView('grid')}
                            className={`p-2 rounded-lg transition-all ${view === 'grid' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <Grid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setView('table')}
                            className={`p-2 rounded-lg transition-all ${view === 'table' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        Nový Projekt
                    </button>
                </div>
            </div>

            <CreateProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />

            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                    type="text"
                    placeholder="Hledat v projektech..."
                    className="w-full bg-secondary/20 border border-border/50 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all text-sm font-medium"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <AnimatePresence mode="wait">
                {view === 'grid' ? (
                    <motion.div
                        key="grid"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                    >
                        {filteredProjects.map((project) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                onClick={() => router.push(`/projects/${project.id}`)}
                            />
                        ))}
                        {filteredProjects.length === 0 && (
                            <div className="col-span-full py-20 text-center glass-panel border-dashed">
                                <p className="text-muted-foreground font-medium">Nenalezeny žádné projekty odpovídající hledání.</p>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="table"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <DataTable<Project>
                            data={filteredProjects}
                            onRowClick={(p: Project) => router.push(`/projects/${p.id}`)}
                            storageKey="projects-list-columns"
                            searchPlaceholder="Hledat projekty..."
                            columns={[
                                {
                                    id: "title",
                                    header: "Název Projektu",
                                    accessorKey: "title",
                                    cell: (p: Project) => <span className="font-bold text-foreground">{p.title}</span>,
                                    enableHiding: false
                                },
                                {
                                    id: "client",
                                    header: "Klient",
                                    accessorKey: "client_name",
                                    cell: (p: Project) => <span className="font-medium text-muted-foreground">{p.client_name || '-'}</span>
                                },
                                {
                                    id: "manager",
                                    header: "Vedoucí",
                                    accessorKey: "manager_name",
                                    cell: (p: Project) => (
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
                                                <User className="w-3 h-3 text-muted-foreground" />
                                            </div>
                                            <span className="text-sm font-medium">{p.manager_name}</span>
                                        </div>
                                    )
                                },
                                {
                                    id: "status",
                                    header: "Stav",
                                    accessorKey: "status",
                                    cell: (p: Project) => {
                                        const status = statusMap[p.status] || { label: p.status, color: "bg-secondary text-secondary-foreground", icon: Layout }
                                        const Icon = status.icon
                                        return (
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border tracking-wide uppercase ${status.color}`}>
                                                <Icon className="w-3.5 h-3.5" />
                                                {status.label}
                                            </span>
                                        )
                                    }
                                },
                                {
                                    id: "end_date",
                                    header: "Termín",
                                    accessorKey: "end_date",
                                    cell: (p: Project) => (
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span className="text-sm">{p.end_date ? new Date(p.end_date).toLocaleDateString('cs-CZ') : '-'}</span>
                                        </div>
                                    )
                                },
                                {
                                    id: "quantity",
                                    header: "Počet",
                                    accessorKey: "quantity",
                                    cell: (p: Project) => <span className="font-bold text-sm">{p.quantity ? `${p.quantity} ks` : '1 ks'}</span>
                                },
                            ]}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
