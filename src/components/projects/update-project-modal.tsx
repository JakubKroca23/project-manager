"use client"

import { useState } from "react"
import { Modal } from "@/components/ui/modal"
import { updateProject } from "@/app/projects/actions"
import { Loader2 } from "lucide-react"

interface UpdateProjectModalProps {
    isOpen: boolean
    onClose: () => void
    project: any // Use appropriate type
}

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    return (
        <Modal title="Upravit Projekt" isOpen={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 text-sm">
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium">Název Projektu</label>
                    <input
                        type="text"
                        name="title"
                        required
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-transparent focus:border-primary focus:ring-0 transition-all font-medium"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="client_name" className="text-sm font-medium">Klient</label>
                    <input
                        type="text"
                        name="client_name"
                        value={formData.client_name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-transparent focus:border-primary focus:ring-0 transition-all"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label htmlFor="start_date" className="text-sm font-medium">Začátek</label>
                        <input
                            type="date"
                            name="start_date"
                            required
                            value={formData.start_date}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-transparent focus:border-primary focus:ring-0 transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="end_date" className="text-sm font-medium">Konec (Termín)</label>
                        <input
                            type="date"
                            name="end_date"
                            value={formData.end_date}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-transparent focus:border-primary focus:ring-0 transition-all"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="status" className="text-sm font-medium">Stav</label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-transparent focus:border-primary focus:ring-0 transition-all appearance-none"
                    >
                        <option value="planning">Plánování</option>
                        <option value="in_progress">V řešení</option>
                        <option value="completed">Dokončeno</option>
                        <option value="paused">Pozastaveno</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-medium">Popis</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-transparent focus:border-primary focus:ring-0 transition-all resize-none"
                    />
                </div>

                <div className="pt-4 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-secondary transition-colors"
                    >
                        Zrušit
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex items-center min-w-[100px] justify-center"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Uložit změny"}
                    </button>
                </div>
            </form>
        </Modal>
    )
}
