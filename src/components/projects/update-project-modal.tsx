"use client"

import { useState } from "react"
import { Modal } from "@/components/ui/modal"
import { updateProject } from "@/app/projects/actions"
import { Loader2, Layout, Settings, Factory, CheckCircle2, Octagon } from "lucide-react"
import { motion } from "framer-motion"

interface UpdateProjectModalProps {
    isOpen: boolean
    onClose: () => void
    project: any
}

const statusOptions = [
    { value: "planning", label: "Plánování", icon: Layout, color: "text-blue-500", bg: "bg-blue-500/10" },
    { value: "development", label: "Vývoj", icon: Settings, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { value: "production", label: "Výroba", icon: Factory, color: "text-orange-500", bg: "bg-orange-500/10" },
    { value: "completed", label: "Dokončeno", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
    { value: "stopped", label: "Zastaveno", icon: Octagon, color: "text-red-500", bg: "bg-red-500/10" },
]

export function UpdateProjectModal({ isOpen, onClose, project }: UpdateProjectModalProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        title: project.title,
        client_name: project.client_name || "",
        description: project.description || "",
        start_date: project.start_date ? new Date(project.start_date).toISOString().split('T')[0] : "",
        end_date: project.end_date ? new Date(project.end_date).toISOString().split('T')[0] : "",
        status: project.status
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        const result = await updateProject(project.id, {
            ...formData,
            end_date: formData.end_date || null
        })

        if (result.success) {
            onClose()
        } else {
            setError(result.error || "Chyba při ukládání")
        }
        setIsLoading(false)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    return (
        <Modal title="Upravit projekt" isOpen={isOpen} onClose={onClose} className="max-w-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 text-sm font-medium"
                    >
                        {error}
                    </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="group space-y-2">
                            <label htmlFor="title" className="text-sm font-semibold text-muted-foreground group-focus-within:text-primary transition-colors">Název Projektu</label>
                            <input
                                type="text"
                                name="title"
                                required
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-primary/50 focus:bg-background outline-none transition-all font-semibold text-lg"
                            />
                        </div>

                        <div className="group space-y-2">
                            <label htmlFor="client_name" className="text-sm font-semibold text-muted-foreground group-focus-within:text-primary transition-colors">Klient</label>
                            <input
                                type="text"
                                name="client_name"
                                value={formData.client_name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-primary/50 focus:bg-background outline-none transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="group space-y-2">
                                <label className="text-sm font-semibold text-muted-foreground group-focus-within:text-primary transition-colors">Zahájení</label>
                                <input
                                    type="date"
                                    name="start_date"
                                    required
                                    value={formData.start_date}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2.5 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-primary/50 focus:bg-background outline-none transition-all text-sm"
                                />
                            </div>
                            <div className="group space-y-2">
                                <label className="text-sm font-semibold text-muted-foreground group-focus-within:text-primary transition-colors">Dokončení</label>
                                <input
                                    type="date"
                                    name="end_date"
                                    value={formData.end_date}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2.5 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-primary/50 focus:bg-background outline-none transition-all text-sm font-medium"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-sm font-semibold text-muted-foreground">Aktuální stav projektu</label>
                        <div className="grid grid-cols-1 gap-2">
                            {statusOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, status: opt.value }))}
                                    className={`relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${formData.status === opt.value
                                        ? `border-primary bg-primary/5 shadow-sm`
                                        : "border-transparent bg-secondary/30 hover:bg-secondary/50 text-muted-foreground"
                                        }`}
                                >
                                    <div className={`p-2 rounded-lg ${opt.bg} ${opt.color}`}>
                                        <opt.icon className="w-5 h-5" />
                                    </div>
                                    <span className="font-semibold">{opt.label}</span>
                                    {formData.status === opt.value && (
                                        <motion.div
                                            layoutId="update-status-active"
                                            className="ml-auto w-2 h-2 rounded-full bg-primary"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="group space-y-2">
                    <label htmlFor="description" className="text-sm font-semibold text-muted-foreground group-focus-within:text-primary transition-colors">Popis projektu</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-primary/50 focus:bg-background outline-none transition-all resize-none"
                    />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-secondary transition-colors"
                    >
                        Zrušit
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-8 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 disabled:opacity-50 flex items-center gap-2"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Uložit změny"}
                    </button>
                </div>
            </form>
        </Modal>
    )
}
