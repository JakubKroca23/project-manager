"use client"

import { useState, useRef } from "react"
import { Modal } from "@/components/ui/modal"
import { useCreateProject } from "@/hooks/use-create-project"
import { createProject } from "@/app/projects/actions"
import { useAccessoryCatalog } from "@/hooks/use-accessory-catalog"
import {
    Loader2, Layout, Settings, Factory, CheckCircle2,
    Octagon, Plus, Trash2, Package, ShoppingCart,
    Truck, Search, Info, ChevronDown
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/lib/supabase/client"

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
    const { isLoading: isCreating, error: createError } = useCreateProject()
    const { catalog, addToCatalog } = useAccessoryCatalog()
    const supabase = createClient()
    const [isLoading, setIsLoading] = useState(false)

    const [formData, setFormData] = useState({
        title: "",
        client_name: "",
        description: "",
        start_date: new Date().toISOString().split('T')[0],
        end_date: "",
        status: "planning",
        manufacturer: "",
        chassis_type: "",
        quantity: 1
    })

    const [superstructures, setSuperstructures] = useState<{ type: string, details: string, supplier: string, order_status: string }[]>([
        { type: "", details: "", supplier: "", order_status: "pending" }
    ])

    const [projectAccessories, setProjectAccessories] = useState<{
        name: string,
        action_type: 'manufacture' | 'purchase' | 'stock',
        supplier: string,
        order_status: string,
        quantity: number
    }[]>([])

    const [accSearch, setAccSearch] = useState("")
    const [showCatalog, setShowCatalog] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        // 1. Create Project via Server Action
        const result = await createProject({
            title: formData.title,
            client_name: formData.client_name,
            description: formData.description,
            start_date: formData.start_date,
            end_date: formData.end_date || null,
            status: formData.status,
            manufacturer: formData.manufacturer || null,
            chassis_type: formData.chassis_type || null,
            quantity: Number(formData.quantity),
            superstructures: superstructures,
            accessories: projectAccessories
        })

        if (result.error) {
            console.error(result.error)
            setIsLoading(false)
            return
        }

        // 3. Sync Catalog (Client Side for now)
        if (projectAccessories.length > 0) {
            for (const acc of projectAccessories) {
                if (!catalog.find(c => c.name.toLowerCase() === acc.name.toLowerCase())) {
                    await addToCatalog(acc.name)
                }
            }
        }

        setIsLoading(false)
        onClose()
        // Reset state
        setFormData({
            title: "", client_name: "", description: "",
            start_date: new Date().toISOString().split('T')[0],
            end_date: "", status: "planning", manufacturer: "",
            chassis_type: "", quantity: 1
        })
        setSuperstructures([{ type: "", details: "", supplier: "", order_status: "pending" }])
        setProjectAccessories([])
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    return (
        <Modal title="Vytvořit nový projekt" isOpen={isOpen} onClose={onClose} className="max-w-3xl">
            <form onSubmit={handleSubmit} className="space-y-6">
                {createError && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 text-sm font-medium"
                    >
                        {createError}
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
                                <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Výrobce / Podvozek / Počet</label>
                                <div className="grid grid-cols-3 gap-3">
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
                                    <input
                                        type="number"
                                        name="quantity"
                                        value={formData.quantity}
                                        onChange={handleChange}
                                        min="1"
                                        className="w-full px-4 py-2.5 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-primary/50 focus:bg-background outline-none transition-all text-sm"
                                        placeholder="Počet"
                                    />
                                </div>
                            </div>

                            {/* Nástavby Section */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Typy Nástaveb</label>
                                    <button
                                        type="button"
                                        onClick={() => setSuperstructures([...superstructures, { type: "", details: "", supplier: "", order_status: "pending" }])}
                                        className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
                                    >
                                        <Plus className="w-3 h-3" /> Přidat nástavbu
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {superstructures.map((s, i) => (
                                        <div key={i} className="p-3 rounded-xl bg-secondary/20 border border-border/50 space-y-3">
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={s.type}
                                                    onChange={(e) => {
                                                        const newS = [...superstructures];
                                                        newS[i].type = e.target.value;
                                                        setSuperstructures(newS);
                                                    }}
                                                    className="flex-1 px-3 py-1.5 rounded-lg bg-background border border-border outline-none text-sm font-bold"
                                                    placeholder="Typ nástavby (např. CAS 20)"
                                                />
                                                {superstructures.length > 1 && (
                                                    <button type="button" onClick={() => setSuperstructures(superstructures.filter((_, idx) => idx !== i))} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Dodavatel"
                                                    value={s.supplier}
                                                    onChange={(e) => {
                                                        const newS = [...superstructures];
                                                        newS[i].supplier = e.target.value;
                                                        setSuperstructures(newS);
                                                    }}
                                                    className="px-3 py-1.5 rounded-lg bg-background border border-border outline-none text-[11px]"
                                                />
                                                <select
                                                    value={s.order_status}
                                                    onChange={(e) => {
                                                        const newS = [...superstructures];
                                                        newS[i].order_status = e.target.value;
                                                        setSuperstructures(newS);
                                                    }}
                                                    className="px-3 py-1.5 rounded-lg bg-background border border-border outline-none text-[11px]"
                                                >
                                                    <option value="pending">Čeká na objednání</option>
                                                    <option value="ordered">Objednáno</option>
                                                    <option value="delivered">Dodáno</option>
                                                </select>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Příslušenství Section */}
                            <div className="space-y-3 pt-2">
                                <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Příslušenství & Výbava</label>

                                <div className="relative">
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <input
                                                type="text"
                                                value={accSearch}
                                                onChange={(e) => {
                                                    setAccSearch(e.target.value);
                                                    setShowCatalog(true);
                                                }}
                                                onFocus={() => setShowCatalog(true)}
                                                placeholder="Hledat nebo přidat nové příslušenství..."
                                                className="w-full pl-10 pr-4 py-2 rounded-xl bg-background border-2 border-border focus:border-primary/50 outline-none text-sm transition-all"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (accSearch.trim()) {
                                                    setProjectAccessories([...projectAccessories, {
                                                        name: accSearch,
                                                        action_type: 'purchase',
                                                        supplier: "",
                                                        order_status: "pending",
                                                        quantity: 1
                                                    }]);
                                                    setAccSearch("");
                                                    setShowCatalog(false);
                                                }
                                            }}
                                            className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-xl text-xs font-bold transition-colors"
                                        >
                                            Přidat
                                        </button>
                                    </div>

                                    <AnimatePresence>
                                        {showCatalog && accSearch && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 5 }}
                                                className="absolute z-50 top-full left-0 right-0 mt-2 p-1 bg-background border border-border rounded-xl shadow-2xl max-h-48 overflow-y-auto"
                                            >
                                                {catalog
                                                    .filter(item => item.name.toLowerCase().includes(accSearch.toLowerCase()))
                                                    .map(item => (
                                                        <button
                                                            key={item.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setProjectAccessories([...projectAccessories, {
                                                                    name: item.name,
                                                                    action_type: 'purchase',
                                                                    supplier: "",
                                                                    order_status: "pending",
                                                                    quantity: 1
                                                                }]);
                                                                setAccSearch("");
                                                                setShowCatalog(false);
                                                            }}
                                                            className="w-full text-left px-3 py-2 hover:bg-secondary rounded-lg text-sm transition-colors"
                                                        >
                                                            {item.name}
                                                        </button>
                                                    ))
                                                }
                                                {accSearch && !catalog.find(c => c.name.toLowerCase() === accSearch.toLowerCase()) && (
                                                    <div className="px-3 py-2 text-xs text-muted-foreground italic border-t border-border mt-1">
                                                        Zatím neznámé - bude uloženo do katalogu
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                                    {projectAccessories.map((acc, i) => (
                                        <div key={i} className="flex flex-col gap-2 p-3 rounded-xl bg-primary/5 border border-primary/20">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-bold">{acc.name}</span>
                                                <button type="button" onClick={() => setProjectAccessories(projectAccessories.filter((_, idx) => idx !== i))} className="p-1 hover:text-red-500 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2">
                                                <select
                                                    value={acc.action_type}
                                                    onChange={(e) => {
                                                        const newA = [...projectAccessories];
                                                        newA[i].action_type = e.target.value as any;
                                                        setProjectAccessories(newA);
                                                    }}
                                                    className="px-2 py-1 rounded-lg bg-background border border-border outline-none text-[10px]"
                                                >
                                                    <option value="manufacture">Vyrobit</option>
                                                    <option value="purchase">Nakoupit</option>
                                                    <option value="stock">Skladem</option>
                                                </select>
                                                <input
                                                    type="text"
                                                    placeholder="Dodavatel"
                                                    value={acc.supplier}
                                                    onChange={(e) => {
                                                        const newA = [...projectAccessories];
                                                        newA[i].supplier = e.target.value;
                                                        setProjectAccessories(newA);
                                                    }}
                                                    className="px-2 py-1 rounded-lg bg-background border border-border outline-none text-[10px]"
                                                />
                                                <select
                                                    value={acc.order_status}
                                                    onChange={(e) => {
                                                        const newA = [...projectAccessories];
                                                        newA[i].order_status = e.target.value;
                                                        setProjectAccessories(newA);
                                                    }}
                                                    className="px-2 py-1 rounded-lg bg-background border border-border outline-none text-[10px]"
                                                >
                                                    <option value="pending">Čeká</option>
                                                    <option value="ordered">Objednáno</option>
                                                    <option value="delivered">Dodáno</option>
                                                </select>
                                            </div>
                                        </div>
                                    ))}
                                </div>
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
