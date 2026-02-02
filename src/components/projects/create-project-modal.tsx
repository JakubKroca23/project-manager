"use client"

import { useState } from "react"
import { Modal } from "@/components/ui/modal"
import { useCreateProject } from "@/hooks/use-create-project"
import { Loader2, Layout, Settings, Factory, CheckCircle2, Octagon } from "lucide-react"
import { motion } from "framer-motion"

interface CreateProjectModalProps {
    isOpen: boolean
    onClose: () => void
}

const statusOptions = [
    { value: "planning", label: "Plánování", icon: Layout, color: "text-blue-500", bg: "bg-blue-500/10" },
    { value: "development", label: "Vývoj", icon: Settings, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { value: "production", label: "Výroba", icon: Factory, color: "text-orange-500", bg: "bg-orange-500/10" },
    { value: "completed", label: "Dokončeno", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
    { value: "stopped", label: "Zastaveno", icon: Octagon, color: "text-red-500", bg: "bg-red-500/10" },
]

export function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
    const { createProject, isLoading, error } = useCreateProject()

    const [formData, setFormData] = useState({
        title: "",
        client_name: "",
        description: "",
        start_date: new Date().toISOString().split('T')[0],
        end_date: "",
        status: "planning",
        manufacturer: "",
        chassis_type: "",
        superstructure_type: "",
        accessories: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const success = await createProject({
            title: formData.title,
            client_name: formData.client_name,
            description: formData.description,
            start_date: formData.start_date,
            end_date: formData.end_date || null,
            status: formData.status,
            manufacturer: formData.manufacturer || null,
            chassis_type: formData.chassis_type || null,
            superstructure_type: formData.superstructure_type || null,
            accessories: formData.accessories || null,
        })

        if (success) {
            onClose()
            setFormData({
                title: "",
                client_name: "",
                description: "",
                start_date: new Date().toISOString().split('T')[0],
                end_date: "",
                status: "planning",
                manufacturer: "",
                chassis_type: "",
                superstructure_type: "",
                accessories: ""
            })
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    return (
        <Modal title="Vytvořit nový projekt" isOpen={isOpen} onClose={onClose} className="max-w-3xl">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Základní informace */}
                    <div className="space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-widest text-primary/70">Základní info</h3>

                        <div className="space-y-4">
                            <div className="group space-y-1">
                                <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Název Projektu</label>
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-primary/50 focus:bg-background outline-none transition-all font-semibold"
                                    placeholder="např. Cisterna pro SDH"
                                />
                            </div>

                            <div className="group space-y-1">
                                <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Klient</label>
                                <input
                                    type="text"
                                    name="client_name"
                                    value={formData.client_name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-primary/50 focus:bg-background outline-none transition-all text-sm"
                                    placeholder="Obec / Firma"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="group space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Zahájení</label>
                                    <input
                                        type="date"
                                        name="start_date"
                                        required
                                        value={formData.start_date}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-primary/50 focus:bg-background outline-none transition-all text-sm"
                                    />
                                </div>
                                <div className="group space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Dokončení</label>
                                    <input
                                        type="date"
                                        name="end_date"
                                        value={formData.end_date}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-primary/50 focus:bg-background outline-none transition-all text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Aktuální stav</label>
                            <div className="grid grid-cols-2 gap-2">
                                {statusOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, status: opt.value }))}
                                        className={`flex items-center gap-2 p-2 rounded-lg border-2 transition-all ${formData.status === opt.value
                                                ? `border-primary bg-primary/5 shadow-sm`
                                                : "border-transparent bg-secondary/30 hover:bg-secondary/50 text-muted-foreground"
                                            }`}
                                    >
                                        <opt.icon className={`w-3.5 h-3.5 ${formData.status === opt.value ? opt.color : "text-current"}`} />
                                        <span className="text-[11px] font-bold">{opt.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Technické specifikace */}
                    <div className="space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-widest text-primary/70">Technické specifikace</h3>

                        <div className="space-y-4">
                            <div className="group space-y-1">
                                <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Výrobce / Podvozek</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        name="manufacturer"
                                        value={formData.manufacturer}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-primary/50 focus:bg-background outline-none transition-all text-sm"
                                        placeholder="Výrobce"
                                    />
                                    <input
                                        type="text"
                                        name="chassis_type"
                                        value={formData.chassis_type}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-primary/50 focus:bg-background outline-none transition-all text-sm"
                                        placeholder="Typ podvozku"
                                    />
                                </div>
                            </div>

                            <div className="group space-y-1">
                                <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Typ nástavby</label>
                                <input
                                    type="text"
                                    name="superstructure_type"
                                    value={formData.superstructure_type}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-primary/50 focus:bg-background outline-none transition-all text-sm"
                                    placeholder="např. CAS 20"
                                />
                            </div>

                            <div className="group space-y-1">
                                <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Příslušenství / Výbava</label>
                                <textarea
                                    name="accessories"
                                    value={formData.accessories}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full px-4 py-2.5 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-primary/50 focus:bg-background outline-none transition-all resize-none text-sm"
                                    placeholder="Vyjmenujte hlavní prvky výbavy..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="group space-y-1">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Interní poznámky / Popis</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={2}
                        className="w-full px-4 py-2.5 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-primary/50 focus:bg-background outline-none transition-all resize-none text-sm"
                        placeholder="Další detaily k projektu..."
                    />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 rounded-xl text-sm font-semibold hover:bg-secondary transition-colors"
                    >
                        Zrušit
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-8 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 disabled:opacity-50 flex items-center gap-2"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Uložit Projekt"}
                    </button>
                </div>
            </form>
        </Modal>
    )
}
