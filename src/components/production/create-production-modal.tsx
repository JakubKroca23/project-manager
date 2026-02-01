"use client"

import { useState } from "react"
import { Modal } from "@/components/ui/modal"
import { useCreateProduction } from "@/hooks/use-create-production"
import { useProjectOptions } from "@/hooks/use-project-options"
import { Loader2 } from "lucide-react"

interface CreateProductionModalProps {
    isOpen: boolean
    onClose: () => void
}

export function CreateProductionModal({ isOpen, onClose }: CreateProductionModalProps) {
    const { createProduction, isLoading, error } = useCreateProduction()
    const { projects, isLoading: isLoadingProjects } = useProjectOptions()

    const [formData, setFormData] = useState({
        title: "",
        project_id: "",
        quantity: 1,
        priority: "medium",
        status: "new",
        start_date: "",
        end_date: "", // deadline
        notes: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const success = await createProduction({
            title: formData.title,
            project_id: formData.project_id || null, // Convert empty string to null
            quantity: Number(formData.quantity),
            priority: formData.priority,
            status: formData.status,
            start_date: formData.start_date || null,
            end_date: formData.end_date || null,
            notes: formData.notes
        })

        if (success) {
            onClose()
            setFormData({
                title: "",
                project_id: "",
                quantity: 1,
                priority: "medium",
                status: "new",
                start_date: "",
                end_date: "",
                notes: ""
            })
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    return (
        <Modal title="Nová Výrobní Zakázka" isOpen={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 text-sm">
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium">Název Zakázky</label>
                    <input
                        type="text"
                        name="title"
                        required
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-transparent focus:border-primary focus:ring-0 transition-all font-medium"
                        placeholder="např. Výroba komponent A"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="project_id" className="text-sm font-medium">Projekt (Volitelné)</label>
                    <select
                        name="project_id"
                        value={formData.project_id}
                        onChange={handleChange}
                        disabled={isLoadingProjects}
                        className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-transparent focus:border-primary focus:ring-0 transition-all appearance-none"
                    >
                        <option value="">-- Žádný projekt --</option>
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label htmlFor="quantity" className="text-sm font-medium">Množství (ks)</label>
                        <input
                            type="number"
                            name="quantity"
                            min="1"
                            required
                            value={formData.quantity}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-transparent focus:border-primary focus:ring-0 transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="priority" className="text-sm font-medium">Priorita</label>
                        <select
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-transparent focus:border-primary focus:ring-0 transition-all appearance-none"
                        >
                            <option value="low">Nízká</option>
                            <option value="medium">Střední</option>
                            <option value="high">Vysoká</option>
                            <option value="critical">Kritická</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label htmlFor="start_date" className="text-sm font-medium">Začátek</label>
                        <input
                            type="date"
                            name="start_date"
                            value={formData.start_date}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-transparent focus:border-primary focus:ring-0 transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="end_date" className="text-sm font-medium">Deadline</label>
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
                    <label htmlFor="notes" className="text-sm font-medium">Poznámky</label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={2}
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
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Vytvořit"}
                    </button>
                </div>
            </form>
        </Modal>
    )
}
