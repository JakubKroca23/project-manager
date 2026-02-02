"use client"

import { useState, useEffect } from "react"
import { Modal } from "@/components/ui/modal"
import { updateProject, getProfiles } from "@/app/projects/actions"
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
    const [profiles, setProfiles] = useState<{ id: string, full_name: string | null }[]>([])

    const [formData, setFormData] = useState({
        title: project.title,
        client_name: project.client_name || "",
        manager_id: project.manager_id || "",
        description: project.description || "",
        start_date: project.start_date ? new Date(project.start_date).toISOString().split('T')[0] : "",
        end_date: project.end_date ? new Date(project.end_date).toISOString().split('T')[0] : "",
        status: project.status,
        manufacturer: project.manufacturer || "",
        chassis_type: project.chassis_type || "",
        quantity: project.quantity || 1,
        op_crm: project.op_crm || "",
        sector: project.sector || "",
        billing_company: project.billing_company || "",
        delivery_address: project.delivery_address || "",
        requested_action: project.requested_action || "",
        assembly_company: project.assembly_company || "",
        op_opv_sro: project.op_opv_sro || "",
        zakazka_sro: project.zakazka_sro || ""
    })

    useEffect(() => {
        if (isOpen) {
            getProfiles().then(setProfiles)
        }
    }, [isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        const result = await updateProject(project.id, {
            ...formData,
            end_date: formData.end_date || null,
            quantity: Number(formData.quantity)
        })

        if (result.success) {
            onClose()
        } else {
            setError(result.error || "Chyba při ukládání")
        }
        setIsLoading(false)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    return (
        <Modal title="Upravit projekt" isOpen={isOpen} onClose={onClose} className="max-w-3xl max-h-[90vh] flex flex-col">
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar p-1">
                <form id="update-project-form" onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    {/* SECTION 1: CRM & BASIC INFO */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-6 w-1 bg-primary rounded-full" />
                            <h4 className="text-sm font-bold tracking-tight uppercase text-primary/70">Základní a CRM data</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Col */}
                            <div className="space-y-4">
                                <div className="group space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Název Projektu</label>
                                    <input required type="text" name="title" value={formData.title} onChange={handleChange}
                                        className="w-full px-4 py-2.5 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-primary/50 outline-none font-semibold" />
                                </div>
                                <div className="group space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Zákazník</label>
                                    <input type="text" name="client_name" value={formData.client_name} onChange={handleChange}
                                        className="w-full px-4 py-2.5 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-primary/50 outline-none text-sm" />
                                </div>

                                <div className="group space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Vedoucí projektu</label>
                                    <select name="manager_id" value={formData.manager_id} onChange={handleChange}
                                        className="w-full px-3 py-2.5 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-primary/50 outline-none text-sm font-medium">
                                        <option value="">Vyberte vedoucího...</option>
                                        {profiles.map(p => (
                                            <option key={p.id} value={p.id}>{p.full_name || p.id}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="group space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">OP CRM</label>
                                        <input type="text" name="op_crm" value={formData.op_crm} onChange={handleChange}
                                            className="w-full px-3 py-2 rounded-xl bg-secondary/30 border border-transparent focus:border-primary/50 outline-none text-sm" />
                                    </div>
                                    <div className="group space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Zakázka SRO</label>
                                        <input type="text" name="zakazka_sro" value={formData.zakazka_sro} onChange={handleChange}
                                            className="w-full px-3 py-2 rounded-xl bg-secondary/30 border border-transparent focus:border-primary/50 outline-none text-sm" />
                                    </div>
                                </div>
                            </div>

                            {/* Right Col */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="group space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Zahájení</label>
                                        <input type="date" name="start_date" value={formData.start_date} onChange={handleChange}
                                            className="w-full px-3 py-2 rounded-xl bg-secondary/30 border border-transparent focus:border-primary/50 outline-none text-sm" />
                                    </div>
                                    <div className="group space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Dokončení</label>
                                        <input type="date" name="end_date" value={formData.end_date} onChange={handleChange}
                                            className="w-full px-3 py-2 rounded-xl bg-secondary/30 border border-transparent focus:border-primary/50 outline-none text-sm" />
                                    </div>
                                </div>
                                <div className="group space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Sektor</label>
                                    <select name="sector" value={formData.sector} onChange={handleChange}
                                        className="w-full px-3 py-2.5 rounded-xl bg-secondary/30 border border-transparent focus:border-primary/50 outline-none text-sm">
                                        <option value="">Vyberte...</option>
                                        <option value="Hasiči">Hasiči</option>
                                        <option value="Technické služby">Technické služby</option>
                                        <option value="Armáda">Armáda</option>
                                        <option value="Soukromý">Soukromý</option>
                                    </select>
                                </div>
                                <div className="group space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Aktuální stav</label>
                                    <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 rounded-xl bg-secondary/30 border border-transparent focus:border-primary/50 outline-none text-sm">
                                        {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-secondary/10 rounded-xl border border-border/50">
                            <div className="group space-y-1">
                                <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Fakturační firma</label>
                                <input type="text" name="billing_company" value={formData.billing_company} onChange={handleChange}
                                    className="w-full px-3 py-2 rounded-lg bg-background border border-border/50 text-sm" />
                            </div>
                            <div className="group space-y-1">
                                <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Montážní firma</label>
                                <input type="text" name="assembly_company" value={formData.assembly_company} onChange={handleChange}
                                    className="w-full px-3 py-2 rounded-lg bg-background border border-border/50 text-sm" />
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-px bg-border/50" />

                    {/* SECTION 2: CHASSIS & TECHNICAL */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-6 w-1 bg-orange-500 rounded-full" />
                            <h4 className="text-sm font-bold tracking-tight uppercase text-orange-600/70">Podvozek</h4>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="group space-y-1">
                                <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Výrobce</label>
                                <input type="text" name="manufacturer" value={formData.manufacturer} onChange={handleChange} placeholder="Výrobce"
                                    className="w-full px-4 py-2.5 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-primary/50 outline-none text-sm" />
                            </div>
                            <div className="group space-y-1">
                                <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Typ podvozku</label>
                                <input type="text" name="chassis_type" value={formData.chassis_type} onChange={handleChange} placeholder="Typ podvozku"
                                    className="w-full px-4 py-2.5 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-primary/50 outline-none text-sm" />
                            </div>
                            <div className="group space-y-1">
                                <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Počet Kusů</label>
                                <input type="number" name="quantity" min="1" value={formData.quantity} onChange={handleChange} placeholder="Počet"
                                    className="w-full px-4 py-2.5 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-primary/50 outline-none text-sm" />
                            </div>
                        </div>
                    </div>

                    <div className="group space-y-1">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Popis / Poznámky</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows={3}
                            className="w-full px-4 py-2.5 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-primary/50 outline-none resize-none text-sm" />
                    </div>

                </form>
            </div>

            <div className="pt-4 border-t border-border mt-2 flex justify-end gap-3">
                <button type="button" onClick={onClose} className="px-6 py-2 rounded-xl text-sm font-semibold hover:bg-secondary transition-colors">
                    Zrušit
                </button>
                <button type="submit" form="update-project-form" disabled={isLoading}
                    className="px-8 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg flex items-center gap-2">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Uložit změny"}
                </button>
            </div>
        </Modal>
    )
}
