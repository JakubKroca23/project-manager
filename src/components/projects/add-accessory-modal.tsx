"use client"

import { useState } from "react"
import { Modal } from "@/components/ui/modal"
import { createProjectAccessory } from "@/app/projects/actions"
import { Loader2, Package, User, ShoppingCart, Settings, Hash } from "lucide-react"

interface AddAccessoryModalProps {
    isOpen: boolean
    onClose: () => void
    projectId: string
}

export function AddAccessoryModal({ isOpen, onClose, projectId }: AddAccessoryModalProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        name: "",
        action_type: "purchase",
        supplier: "",
        quantity: 1,
        order_status: "pending",
        notes: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        const result = await createProjectAccessory(projectId, {
            name: formData.name,
            action_type: formData.action_type,
            supplier: formData.supplier || undefined,
            quantity: Number(formData.quantity),
            order_status: formData.order_status,
            notes: formData.notes || undefined
        })

        if (result.success) {
            setFormData({
                name: "",
                action_type: "purchase",
                supplier: "",
                quantity: 1,
                order_status: "pending",
                notes: ""
            })
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
        <Modal title="Přidat příslušenství" isOpen={isOpen} onClose={onClose} className="max-w-md">
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 text-xs font-bold">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Název položky</label>
                        <div className="relative">
                            <Package className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="např. Naviják, Maják..."
                                className="w-full pl-9 pr-4 py-2 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-primary/50 focus:bg-background outline-none transition-all text-sm font-semibold"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Typ akce</label>
                            <div className="relative">
                                <div className="absolute left-3 top-2.5 w-4 h-4 pointer-events-none text-muted-foreground">
                                    {formData.action_type === 'manufacture' ? <Settings className="w-4 h-4" /> :
                                        formData.action_type === 'purchase' ? <ShoppingCart className="w-4 h-4" /> :
                                            <Package className="w-4 h-4" />}
                                </div>
                                <select
                                    name="action_type"
                                    value={formData.action_type}
                                    onChange={handleChange}
                                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-primary/50 focus:bg-background outline-none transition-all text-sm appearance-none"
                                >
                                    <option value="purchase">Nákup</option>
                                    <option value="manufacture">Výroba</option>
                                    <option value="stock">Sklad</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Počet kusů</label>
                            <div className="relative">
                                <Hash className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="number"
                                    name="quantity"
                                    min="1"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-primary/50 focus:bg-background outline-none transition-all text-sm"
                                />
                            </div>
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
                                placeholder="Název dodavatele (volitelné)"
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
                            <option value="pending">K objednání / výrobě</option>
                            <option value="ordered">Objednáno / Ve výrobě</option>
                            <option value="delivered">Skladem / Hotovo</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Poznámka</label>
                        <textarea
                            name="notes"
                            rows={2}
                            value={formData.notes}
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
                        {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Přidat položku"}
                    </button>
                </div>
            </form>
        </Modal>
    )
}
