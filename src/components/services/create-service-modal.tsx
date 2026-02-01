"use client"

import { useState } from "react"
import { Modal } from "@/components/ui/modal"
import { useCreateService } from "@/hooks/use-create-service"
import { useServiceOptions } from "@/hooks/use-service-options"
import { Loader2 } from "lucide-react"

interface CreateServiceModalProps {
    isOpen: boolean
    onClose: () => void
}

export function CreateServiceModal({ isOpen, onClose }: CreateServiceModalProps) {
    const { createService, isLoading, error } = useCreateService()
    const { profiles, clients, isLoading: isLoadingOptions } = useServiceOptions()

    const [formData, setFormData] = useState({
        title: "",
        client_name: "",
        location: "",
        status: "scheduled",
        service_date: "",
        duration_hours: "",
        assigned_to: "", // ID of profile
        description: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Construct datetime from string if needed, or just save provided string
        // Assuming Supabase expects ISO timestamp for timestamptz
        const serviceDate = formData.service_date ? new Date(formData.service_date).toISOString() : null

        const success = await createService({
            title: formData.title,
            client_name: formData.client_name,
            location: formData.location || null,
            status: formData.status,
            service_date: serviceDate,
            duration_hours: formData.duration_hours ? Number(formData.duration_hours) : null,
            assigned_to: formData.assigned_to || null,
            description: formData.description || null
        })

        if (success) {
            onClose()
            setFormData({
                title: "",
                client_name: "",
                location: "",
                status: "scheduled",
                service_date: "",
                duration_hours: "",
                assigned_to: "",
                description: ""
            })
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    return (
        <Modal title="Naplánovat Servis" isOpen={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 text-sm">
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium">Servisní úkon</label>
                    <input
                        type="text"
                        name="title"
                        required
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-transparent focus:border-primary focus:ring-0 transition-all font-medium"
                        placeholder="např. Pravidelná kontrola"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label htmlFor="client_name" className="text-sm font-medium">Klient</label>
                        <input
                            type="text"
                            name="client_name"
                            list="clients-list"
                            required
                            value={formData.client_name}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-transparent focus:border-primary focus:ring-0 transition-all"
                            placeholder="Vyberte nebo zadejte nového"
                            autoComplete="off"
                        />
                        <datalist id="clients-list">
                            {clients.map((client, i) => (
                                <option key={i} value={client} />
                            ))}
                        </datalist>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="location" className="text-sm font-medium">Místo</label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-transparent focus:border-primary focus:ring-0 transition-all"
                            placeholder="např. Praha"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label htmlFor="service_date" className="text-sm font-medium">Datum a Čas</label>
                        <input
                            type="datetime-local"
                            name="service_date"
                            required
                            value={formData.service_date}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-transparent focus:border-primary focus:ring-0 transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="duration_hours" className="text-sm font-medium">Trvání (hodiny)</label>
                        <input
                            type="number"
                            name="duration_hours"
                            min="0.5"
                            step="0.5"
                            value={formData.duration_hours}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-transparent focus:border-primary focus:ring-0 transition-all"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label htmlFor="assigned_to" className="text-sm font-medium">Přidělit technikovi</label>
                        <select
                            name="assigned_to"
                            value={formData.assigned_to}
                            onChange={handleChange}
                            disabled={isLoadingOptions}
                            className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-transparent focus:border-primary focus:ring-0 transition-all appearance-none"
                        >
                            <option value="">-- Nepřiřazeno --</option>
                            {profiles.map(p => (
                                <option key={p.id} value={p.id}>{p.full_name || p.email}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="status" className="text-sm font-medium">Stav</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-transparent focus:border-primary focus:ring-0 transition-all appearance-none"
                        >
                            <option value="scheduled">Naplánováno</option>
                            <option value="waiting_parts">Čeká na díly</option>
                            <option value="in_progress">Probíhá</option>
                            <option value="done">Hotovo</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-medium">Poznámky</label>
                    <textarea
                        name="description"
                        value={formData.description}
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
