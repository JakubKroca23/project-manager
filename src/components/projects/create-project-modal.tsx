"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createProject, getProfiles } from "@/app/projects/actions";
import { useRouter } from "next/navigation";
import { Loader2, Plus, AlertCircle } from "lucide-react";

interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [profiles, setProfiles] = React.useState<any[]>([]);
    const router = useRouter();

    const [formData, setFormData] = React.useState({
        title: "",
        client_name: "",
        manager_id: "",
        description: "",
        start_date: "",
        end_date: "",
        status: "planning" as const,
        manufacturer: "",
        chassis_type: "",
        sector: "",
        assembly_company: "",
        zakazka_sro: "",
        op_crm: "",
        quantity: 1,
        progress: 0,
    });

    React.useEffect(() => {
        if (isOpen) {
            getProfiles().then(setProfiles);
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const result = await createProject(formData as any);
            if (result.error) {
                setError(result.error);
            } else {
                router.refresh();
                onClose();
                // Reset form
                setFormData({
                    title: "",
                    client_name: "",
                    manager_id: "",
                    description: "",
                    start_date: "",
                    end_date: "",
                    status: "planning",
                    manufacturer: "",
                    chassis_type: "",
                    sector: "",
                    assembly_company: "",
                    zakazka_sro: "",
                    op_crm: "",
                    quantity: 1,
                    progress: 0,
                });
            }
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Nový Projekt"
        >
            <form onSubmit={handleSubmit} className="space-y-4 py-2">
                {error && (
                    <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-900/50">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-2">
                        <label className="text-sm font-medium">Název projektu *</label>
                        <Input
                            required
                            placeholder="Zadejte název..."
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Zákazník</label>
                        <Input
                            placeholder="Jméno zákazníka..."
                            value={formData.client_name}
                            onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Vedoucí projektu</label>
                        <select
                            className="w-full h-10 px-3 rounded-md border border-input bg-background/50 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            value={formData.manager_id}
                            onChange={(e) => setFormData({ ...formData, manager_id: e.target.value })}
                        >
                            <option value="">Vyberte vedoucího...</option>
                            {profiles.map((p) => (
                                <option key={p.id} value={p.id}>{p.full_name || p.email}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Výrobce podvozku</label>
                        <Input
                            placeholder="Např. Scania, Volvo..."
                            value={formData.manufacturer}
                            onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Typ podvozku</label>
                        <Input
                            placeholder="Zadejte model..."
                            value={formData.chassis_type}
                            onChange={(e) => setFormData({ ...formData, chassis_type: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Datum zahájení</label>
                        <Input
                            type="date"
                            className="block"
                            value={formData.start_date}
                            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Předpokládaný konec</label>
                        <Input
                            type="date"
                            className="block"
                            value={formData.end_date}
                            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Počet vozidel</label>
                        <Input
                            type="number"
                            min="1"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Stav</label>
                        <select
                            className="w-full h-10 px-3 rounded-md border border-input bg-background/50 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        >
                            <option value="planning">Plánování</option>
                            <option value="development">Vývoj</option>
                            <option value="production">Výroba</option>
                            <option value="completed">Dokončeno</option>
                            <option value="stopped">Zastaveno</option>
                        </select>
                    </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                    <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                        Zrušit
                    </Button>
                    <Button type="submit" disabled={loading} className="gap-2">
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        <Plus className="w-4 h-4" />
                        Vytvořit Projekt
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
