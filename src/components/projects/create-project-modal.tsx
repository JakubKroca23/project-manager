"use client"

import { useState, useRef, useEffect } from "react"
import { Modal } from "@/components/ui/modal"
import { useCreateProject } from "@/hooks/use-create-project"
import { createProject } from "@/app/projects/actions"
import { useAccessoryCatalog } from "@/hooks/use-accessory-catalog"
import { useCRMCatalog } from "@/hooks/use-crm-catalog"
import {
    Loader2, Layout, Settings, Factory, CheckCircle2, Octagon,
    Plus, Trash2, Search, User, Truck, MapPin, Building
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

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
    const [isLoading, setIsLoading] = useState(false)
    const [step, setStep] = useState(1) // 1: General+CRM, 2: Technical (Chassis+Super)
    // We can keep it single page or tabs. Let's do Scroll sections or Tabs.
    // User asked for logic similar to accessories for Clients/Superstructures.

    const { catalog: accessoryCatalog, addToCatalog } = useAccessoryCatalog()
    const { clients: clientCatalog, superstructures: superstructureCatalog, addClient, addSuperstructureType } = useCRMCatalog()

    const [formData, setFormData] = useState({
        title: "",
        client_name: "",
        op_crm: "",
        sector: "",
        billing_company: "",
        delivery_address: "",
        description: "",
        start_date: "",
        end_date: "",
        status: "planning",
        manufacturer: "",
        chassis_type: "",
        quantity: 1, // Global quantity
        requested_action: "",
        assembly_company: "",
        op_opv_sro: "",
        op_group_zakaznik: "",
        ov_group_sro: "",
        zakazka_sro: ""
    })

    // --- Complex States ---
    const [superstructures, setSuperstructures] = useState<{ type: string, supplier: string, order_status: string }[]>([])
    const [projectAccessories, setProjectAccessories] = useState<{
        name: string,
        action_type: "manufacture" | "purchase" | "stock",
        supplier: string,
        order_status: string,
        quantity: number
    }[]>([])

    // --- Search States ---
    const [clientSearch, setClientSearch] = useState("")
    const [showClientSuggestions, setShowClientSuggestions] = useState(false)

    // Superstructure add Logic
    const [newSuperstructure, setNewSuperstructure] = useState({ type: "", supplier: "", order_status: "pending" })
    const [superSearch, setSuperSearch] = useState("")
    const [showSuperSuggestions, setShowSuperSuggestions] = useState(false)

    // Accessory add Logic
    const [newAccessory, setNewAccessory] = useState({ name: "", action_type: "purchase", supplier: "", quantity: 1 })
    const [accSearch, setAccSearch] = useState("")
    const [showAccSuggestions, setShowAccSuggestions] = useState(false)

    useEffect(() => {
        if (!isOpen) resetForm()
    }, [isOpen])

    const resetForm = () => {
        setFormData({
            title: "", client_name: "", op_crm: "", sector: "", billing_company: "", delivery_address: "",
            description: "", start_date: "", end_date: "", status: "planning",
            manufacturer: "", chassis_type: "", quantity: 1, requested_action: "", assembly_company: "",
            op_opv_sro: "", op_group_zakaznik: "", ov_group_sro: "", zakazka_sro: ""
        })
        setSuperstructures([])
        setProjectAccessories([])
        setClientSearch("")
        setStep(1)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    // --- Client Logic ---
    const filteredClients = clientCatalog.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase()))

    const handleSelectClient = (name: string) => {
        setFormData(prev => ({ ...prev, client_name: name }))
        setClientSearch(name)
        setShowClientSuggestions(false)
    }

    const handleAddClient = async () => {
        if (!clientSearch.trim()) return
        const newC = await addClient(clientSearch)
        if (newC) handleSelectClient((newC as any).name)
        else handleSelectClient(clientSearch) // Fallback if insert fails or just local
    }

    // --- Superstructure Logic ---
    const filteredSupers = superstructureCatalog.filter(s => s.type.toLowerCase().includes(superSearch.toLowerCase()))

    const handleAddSuperstructure = async () => {
        const type = superSearch.trim() || newSuperstructure.type
        if (!type) return

        // Check if exists in catalog, if not add
        if (!superstructureCatalog.find(s => s.type.toLowerCase() === type.toLowerCase())) {
            await addSuperstructureType(type)
        }

        setSuperstructures([...superstructures, { ...newSuperstructure, type }])
        setNewSuperstructure({ type: "", supplier: "", order_status: "pending" })
        setSuperSearch("")
    }

    // --- Accessory Logic ---
    const filteredAcc = accessoryCatalog.filter(a => a.name.toLowerCase().includes(accSearch.toLowerCase()))

    const handleAddAccessory = async () => {
        const name = accSearch.trim()
        if (!name) return

        setProjectAccessories([...projectAccessories, { ...newAccessory, name, action_type: newAccessory.action_type as any, order_status: "pending" }])
        setNewAccessory({ name: "", action_type: "purchase", supplier: "", quantity: 1 })
        setAccSearch("")
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        const result = await createProject({
            ...formData,
            quantity: Number(formData.quantity),
            superstructures,
            accessories: projectAccessories
        })

        if (result.error) {
            console.error(result.error)
            alert("Chyba při vytváření: " + result.error) // Simple alert for now
            setIsLoading(false)
            return
        }

        // Sync Catalog
        if (projectAccessories.length > 0) {
            for (const acc of projectAccessories) {
                if (!accessoryCatalog.find(c => c.name.toLowerCase() === acc.name.toLowerCase())) {
                    await addToCatalog(acc.name)
                }
            }
        }

        setIsLoading(false)
        onClose()
    }

    return (
        <Modal title="Nový Projekt" isOpen={isOpen} onClose={onClose} className="max-w-4xl h-[90vh] flex flex-col">
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar p-1">
                <form id="create-project-form" onSubmit={handleSubmit} className="space-y-8">

                    {/* SECTION 1: CRM & BASIC INFO */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-8 w-1 bg-primary rounded-full" />
                            <h3 className="text-lg font-bold tracking-tight">Základní a CRM Údaje</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left: Identifiers */}
                            <div className="space-y-4">
                                <div className="group space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Název Projektu *</label>
                                    <input required type="text" name="title" value={formData.title} onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-xl bg-secondary/30 border border-border focus:border-primary/50 outline-none font-bold text-lg" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="group space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">OP CRM</label>
                                        <input type="text" name="op_crm" value={formData.op_crm} onChange={handleChange}
                                            className="w-full px-3 py-2 rounded-xl bg-secondary/30 border border-border focus:border-primary/50 outline-none text-sm" />
                                    </div>
                                    <div className="group space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Zakázka SRO</label>
                                        <input type="text" name="zakazka_sro" value={formData.zakazka_sro} onChange={handleChange}
                                            className="w-full px-3 py-2 rounded-xl bg-secondary/30 border border-border focus:border-primary/50 outline-none text-sm" />
                                    </div>
                                </div>
                                <div className="group space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Sektor</label>
                                    <select name="sector" value={formData.sector} onChange={handleChange}
                                        className="w-full px-3 py-2 rounded-xl bg-secondary/30 border border-border focus:border-primary/50 outline-none text-sm">
                                        <option value="">Vyberte...</option>
                                        <option value="Hasiči">Hasiči</option>
                                        <option value="Technické služby">Technické služby</option>
                                        <option value="Armáda">Armáda</option>
                                        <option value="Soukromý">Soukromý</option>
                                    </select>
                                </div>
                            </div>

                            {/* Right: Client & Dates */}
                            <div className="space-y-4">
                                {/* CLIENT AUTOCOMPLETE */}
                                <div className="group space-y-1 relative">
                                    <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Zákazník *</label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                            <input
                                                type="text"
                                                required
                                                value={clientSearch}
                                                onChange={(e) => { setClientSearch(e.target.value); setShowClientSuggestions(true) }}
                                                onFocus={() => setShowClientSuggestions(true)}
                                                placeholder="Vyhledat nebo přidat klienta..."
                                                className="w-full pl-9 pr-4 py-2 rounded-xl bg-secondary/30 border border-border focus:border-primary/50 outline-none text-sm font-semibold"
                                            />
                                            {showClientSuggestions && clientSearch && (
                                                <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-xl shadow-xl z-50 max-h-40 overflow-y-auto">
                                                    {filteredClients.map(c => (
                                                        <button key={c.id} type="button" onClick={() => handleSelectClient(c.name)}
                                                            className="w-full text-left px-4 py-2 hover:bg-secondary text-sm">
                                                            {c.name}
                                                        </button>
                                                    ))}
                                                    {filteredClients.length === 0 && (
                                                        <button type="button" onClick={handleAddClient}
                                                            className="w-full text-left px-4 py-2 hover:bg-secondary text-sm text-primary font-bold">
                                                            + Přidat nový: "{clientSearch}"
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="group space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Zahájení</label>
                                        <input type="date" name="start_date" value={formData.start_date} onChange={handleChange}
                                            className="w-full px-3 py-2 rounded-xl bg-secondary/30 border border-border focus:border-primary/50 outline-none text-sm" />
                                    </div>
                                    <div className="group space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Termín</label>
                                        <input type="date" name="end_date" value={formData.end_date} onChange={handleChange}
                                            className="w-full px-3 py-2 rounded-xl bg-secondary/30 border border-border focus:border-primary/50 outline-none text-sm" />
                                    </div>
                                </div>

                                <div className="group space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Status</label>
                                    <div className="flex gap-1 bg-secondary/20 p-1 rounded-xl">
                                        {statusOptions.slice(0, 3).map(opt => (
                                            <button key={opt.value} type="button" onClick={() => setFormData(prev => ({ ...prev, status: opt.value }))}
                                                className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all ${formData.status === opt.value ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:bg-secondary/50'}`}>
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CRM Extra Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-secondary/10 rounded-xl border border-border/50">
                            <div className="group space-y-1">
                                <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Fakturační firma</label>
                                <input type="text" name="billing_company" value={formData.billing_company} onChange={handleChange}
                                    className="w-full px-3 py-2 rounded-lg bg-background border border-border/50 text-sm" />
                            </div>
                            <div className="group space-y-1">
                                <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Dodací adresa</label>
                                <input type="text" name="delivery_address" value={formData.delivery_address} onChange={handleChange}
                                    className="w-full px-3 py-2 rounded-lg bg-background border border-border/50 text-sm" />
                            </div>
                            <div className="group space-y-1">
                                <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Montážní firma</label>
                                <input type="text" name="assembly_company" value={formData.assembly_company} onChange={handleChange}
                                    className="w-full px-3 py-2 rounded-lg bg-background border border-border/50 text-sm" />
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-px bg-border/50 my-6" />

                    {/* SECTION 2: TECHNICAL (CHASSIS & SUPERSTRUCTURE) */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-8 w-1 bg-orange-500 rounded-full" />
                            <h3 className="text-lg font-bold tracking-tight">Podvozek a Nástavba</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* CHASSIS */}
                            <div className="space-y-4">
                                <h4 className="flex items-center gap-2 text-sm font-bold uppercase text-muted-foreground">
                                    <Truck className="w-4 h-4" /> Podvozek
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="group space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Výrobce</label>
                                        <input type="text" name="manufacturer" value={formData.manufacturer} onChange={handleChange}
                                            placeholder="např. Tatra"
                                            className="w-full px-3 py-2 rounded-xl bg-secondary/30 border border-border focus:border-primary/50 outline-none text-sm" />
                                    </div>
                                    <div className="group space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Typ</label>
                                        <input type="text" name="chassis_type" value={formData.chassis_type} onChange={handleChange}
                                            placeholder="např. 815-7"
                                            className="w-full px-3 py-2 rounded-xl bg-secondary/30 border border-border focus:border-primary/50 outline-none text-sm" />
                                    </div>
                                </div>
                                <div className="group space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Celkový Počet Kusů</label>
                                    <input type="number" name="quantity" min="1" value={formData.quantity} onChange={handleChange}
                                        className="w-full px-3 py-2 rounded-xl bg-secondary/30 border border-border focus:border-primary/50 outline-none text-sm font-bold" />
                                </div>
                            </div>

                            {/* SUPERSTRUCTURE */}
                            <div className="space-y-4">
                                <h4 className="flex items-center gap-2 text-sm font-bold uppercase text-muted-foreground">
                                    <Factory className="w-4 h-4" /> Nástavba
                                </h4>

                                {/* List of added superstructures */}
                                {superstructures.length > 0 && (
                                    <div className="space-y-2 mb-4">
                                        {superstructures.map((s, i) => (
                                            <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                                                <span className="text-sm font-bold">{s.type}</span>
                                                <button type="button" onClick={() => setSuperstructures(prev => prev.filter((_, idx) => idx !== i))}>
                                                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Add New Superstructure Form */}
                                <div className="bg-secondary/20 p-3 rounded-xl space-y-3">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
                                        <input
                                            type="text"
                                            value={superSearch}
                                            onChange={(e) => { setSuperSearch(e.target.value); setShowSuperSuggestions(true) }}
                                            onFocus={() => setShowSuperSuggestions(true)}
                                            placeholder="Typ nástavby (např. CAS 20)..."
                                            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-background border border-border text-sm"
                                        />
                                        {showSuperSuggestions && superSearch && (
                                            <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-xl z-50 max-h-40 overflow-y-auto">
                                                {filteredSupers.map(s => (
                                                    <button key={s.id} type="button" onClick={() => { setSuperSearch(s.type); setShowSuperSuggestions(false); }}
                                                        className="w-full text-left px-3 py-1.5 hover:bg-secondary text-xs">
                                                        {s.type}
                                                    </button>
                                                ))}
                                                {filteredSupers.length === 0 && (
                                                    <div className="px-3 py-1.5 text-xs text-muted-foreground italic">
                                                        Nebude nalezeno - bude vytvořeno nové
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <input type="text" placeholder="Dodavatel (volitelné)" value={newSuperstructure.supplier}
                                        onChange={e => setNewSuperstructure(prev => ({ ...prev, supplier: e.target.value }))}
                                        className="w-full px-3 py-1.5 rounded-lg bg-background border border-border text-sm" />

                                    <button type="button" onClick={handleAddSuperstructure}
                                        className="w-full py-1.5 bg-foreground text-background rounded-lg text-xs font-bold uppercase tracking-wide hover:opacity-90">
                                        Přidat Nástavbu
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-px bg-border/50 my-6" />

                    {/* SECTION 3: ACCESSORIES & NOTES */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-8 w-1 bg-blue-500 rounded-full" />
                            <h3 className="text-lg font-bold tracking-tight">Příslušenství</h3>
                        </div>

                        {/* Similar Accessory Logic as before but simplified for brevity of file */}
                        <div className="bg-secondary/10 p-4 rounded-xl space-y-4">
                            {/* Added Accessories List */}
                            <div className="flex flex-wrap gap-2">
                                {projectAccessories.map((acc, i) => (
                                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-background border border-border rounded-lg shadow-sm">
                                        <span className="text-sm font-semibold">{acc.name}</span>
                                        <span className="text-xs text-muted-foreground">x{acc.quantity}</span>
                                        <button type="button" onClick={() => setProjectAccessories(prev => prev.filter((_, idx) => idx !== i))}>
                                            <Trash2 className="w-3 h-3 text-red-500" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        value={accSearch}
                                        onChange={(e) => { setAccSearch(e.target.value); setShowAccSuggestions(true) }}
                                        onFocus={() => setShowAccSuggestions(true)}
                                        placeholder="Přidat příslušenství..."
                                        className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm"
                                    />
                                    {showAccSuggestions && accSearch && (
                                        <div className="absolute bottom-full left-0 right-0 mb-1 bg-popover border border-border rounded-lg shadow-xl z-50 max-h-40 overflow-y-auto">
                                            {filteredAcc.map(a => (
                                                <button key={a.id} type="button" onClick={() => { setAccSearch(a.name); setShowAccSuggestions(false); }}
                                                    className="w-full text-left px-3 py-1.5 hover:bg-secondary text-xs">
                                                    {a.name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <input type="number" min="1" value={newAccessory.quantity}
                                    onChange={e => setNewAccessory(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                                    className="w-16 px-2 py-2 rounded-lg bg-background border border-border text-center text-sm" />
                                <button type="button" onClick={handleAddAccessory} className="px-4 bg-primary text-primary-foreground rounded-lg font-bold">
                                    +
                                </button>
                            </div>
                        </div>

                        <div className="group space-y-1 mt-4">
                            <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Detailní popis / Poznámky</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows={3}
                                className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border focus:border-primary/50 outline-none text-sm resize-none" />
                        </div>
                    </div>
                </form>
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-border mt-2 flex justify-end gap-3">
                <button type="button" onClick={onClose} className="px-6 py-2 rounded-xl text-sm font-semibold hover:bg-secondary transition-colors">
                    Zrušit
                </button>
                <button type="submit" form="create-project-form" disabled={isLoading}
                    className="px-8 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg flex items-center gap-2">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Vytvořit Projekt"}
                </button>
            </div>
        </Modal>
    )
}
