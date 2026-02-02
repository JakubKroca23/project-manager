"use client"

import { useState } from "react"
import { Modal } from "@/components/ui/modal"
import { createSuperstructure } from "@/app/projects/actions"
import { Loader2, Truck, User } from "lucide-react"

interface AddSuperstructureModalProps {
    isOpen: boolean
    onClose: () => void
    projectId: string
}

export function AddSuperstructureModal({ isOpen, onClose, projectId }: AddSuperstructureModalProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        type: "",
        supplier: "",
        order_status: "pending",
        details: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        const result = await createSuperstructure(projectId, {
            type: formData.type,
            supplier: formData.supplier || undefined,
            description: formData.details || undefined,
            order_status: formData.order_status
        })

        if (result.success) {
            setFormData({ type: "", supplier: "", order_status: "pending", details: "" })
            onClose()
        } else {
            setError(result.error || "Chyba při ukládání")
        }
        setIsLoading(false)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    return (
        <Modal title="Přidat nástavbu" isOpen={isOpen} onClose={onClose} className="max-w-md">
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 text-xs font-bold">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Typ nástavby</label>
                        <div className="relative">
                            <Truck className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                name="type"
                                required
                                value={formData.type}
                                onChange={handleChange}
                                placeholder="např. CAS 20, Cisterna..."
                                className="w-full pl-9 pr-4 py-2 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-primary/50 focus:bg-background outline-none transition-all text-sm font-semibold"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Dodavatel</label>
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                name="supplier"
                                value={formData.supplier}
                                onChange={handleChange}
                                placeholder="Název dodavatele"
                                className="w-full pl-9 pr-4 py-2 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-primary/50 focus:bg-background outline-none transition-all text-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Stav</label>
                        <select
                            name="order_status"
                            value={formData.order_status}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-primary/50 focus:bg-background outline-none transition-all text-sm"
                        >
                            <option value="pending">Čeká na objednání</option>
                            <option value="ordered">Objednáno</option>
                            <option value="delivered">Dodáno</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Detaily / Poznámka</label>
                        <textarea
                            name="details"
                            rows={3}
                            value={formData.details}
                            onChange={handleChange}
                            placeholder="Doplňující informace..."
                            className="w-full px-4 py-2 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-primary/50 focus:bg-background outline-none transition-all resize-none text-sm"
                        />
                    </div>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-xs font-bold hover:bg-secondary transition-colors"
                    >
                        Zrušit
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-2"
                    >
                        {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Přidat nástavbu"}
                    </button>
                </div>
            </form>
        </Modal>
    )
}
