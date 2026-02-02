"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Edit2, Trash2, Calendar, User, Briefcase, ChevronLeft } from "lucide-react"
import { UpdateProjectModal } from "@/components/projects/update-project-modal"
import { deleteProject } from "@/app/projects/actions"

const statusMap: Record<string, { label: string; color: string }> = {
    planning: { label: "Plánování", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
    in_progress: { label: "V řešení", color: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20" },
    completed: { label: "Dokončeno", color: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20" },
    paused: { label: "Pozastaveno", color: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20" },
}

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

    const status = statusMap[project.status] || { label: project.status, color: "bg-secondary text-secondary-foreground" }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Back Button & Actions */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => router.push("/projects")}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
                >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Zpět na Projekty
                </button>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsEditOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium hover:bg-secondary transition-colors"
                    >
                        <Edit2 className="w-4 h-4" />
                        Upravit
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                        {isDeleting ? "Mažu..." : "Smazat"}
                    </button>
                </div>
            </div>

            {/* Header Content */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${status.color}`}>
                        {status.label}
                    </span>
                    <h1 className="text-4xl font-bold tracking-tight">{project.title}</h1>
                </div>
                <p className="text-xl text-muted-foreground max-w-3xl">
                    {project.description || "Tento projekt nemá žádný popis."}
                </p>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-6 space-y-4">
                    <div className="flex items-center gap-3 text-primary">
                        <User className="w-5 h-5" />
                        <span className="font-semibold text-foreground">Vedoucí Projektu</span>
                    </div>
                    <p className="text-2xl font-bold">{project.manager?.full_name || "Neznámý"}</p>
                </div>

                <div className="glass-panel p-6 space-y-4">
                    <div className="flex items-center gap-3 text-orange-500">
                        <Briefcase className="w-5 h-5" />
                        <span className="font-semibold text-foreground">Klient</span>
                    </div>
                    <p className="text-2xl font-bold">{project.client_name || "Interní projekt"}</p>
                </div>

                <div className="glass-panel p-6 space-y-4">
                    <div className="flex items-center gap-3 text-green-500">
                        <Calendar className="w-5 h-5" />
                        <span className="font-semibold text-foreground">Termíny</span>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Termín: {project.end_date ? new Date(project.end_date).toLocaleDateString('cs-CZ') : 'Neuvedeno'}</p>
                        <p className="text-sm text-muted-foreground">Začátek: {project.start_date ? new Date(project.start_date).toLocaleDateString('cs-CZ') : 'Neuvedeno'}</p>
                    </div>
                </div>
            </div>

            {/* Detail Tabs/Content placeholder */}
            <div className="glass-panel p-8 min-h-[400px] flex items-center justify-center border-dashed">
                <div className="text-center space-y-2">
                    <h3 className="text-lg font-medium">Správa aktivit projektu</h3>
                    <p className="text-muted-foreground max-w-xs">Zde bude brzy možné přiřazovat výrobní zakázky a servisní výjezdy k tomuto projektu.</p>
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
