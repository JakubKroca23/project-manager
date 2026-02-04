"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createOrder } from "@/app/production/actions";
import { getProjects, getProfiles } from "@/app/projects/actions";
import { useRouter } from "next/navigation";
import { Loader2, Plus, AlertCircle } from "lucide-react";

interface CreateProductionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateProductionModal({ isOpen, onClose }: CreateProductionModalProps) {
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [projects, setProjects] = React.useState<any[]>([]);
    const [profiles, setProfiles] = React.useState<any[]>([]);
    const router = useRouter();

    const [formData, setFormData] = React.useState({
        title: "",
        project_id: "",
        quantity: 1,
        status: "new" as any,
        priority: "medium" as any,
        start_date: "",
        end_date: "",
        assigned_to: "",
        notes: "",
    });

    React.useEffect(() => {
        if (isOpen) {
            getProjects().then(setProjects);
            getProfiles().then(setProfiles);
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!formData.project_id) {
            setError("Musíte vybrat projekt.");
            setLoading(false);
            return;
        }

        try {
            const result = await createOrder(formData as any);
            if (result.error) {
                setError(result.error);
            } else {
                router.refresh();
                onClose();
                setFormData({
                    title: "",
                    project_id: "",
                    quantity: 1,
                    status: "new",
                    priority: "medium",
                    start_date: "",
                    end_date: "",
                    assigned_to: "",
                    notes: "",
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
            title="Nová Výrobní Zakázka"
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
                        <label className="text-sm font-medium">Název zakázky *</label>
                        <Input
                            required
                            placeholder="Zadejte název..."
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div className="col-span-2 space-y-2">
                        <label className="text-sm font-medium">Projekt *</label>
                        <select
                            className="w-full h-10 px-3 rounded-md border border-input bg-background/50 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            value={formData.project_id}
                            required
                            onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                        >
                            <option value="">Vyberte projekt...</option>
                            {projects.map((p) => (
                                <option key={p.id} value={p.id}>{p.title}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Množství</label>
                        <Input
                            type="number"
                            min="1"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Priorita</label>
                        <select
                            className="w-full h-10 px-3 rounded-md border border-input bg-background/50 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                        >
                            <option value="low">Nízká</option>
                            <option value="medium">Střední</option>
                            <option value="high">Vysoká</option>
                            <option value="critical">Kritická</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Datum zahájení</label>
                        <Input
                            type="date"
                            value={formData.start_date}
                            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Termín dokončení</label>
                        <Input
                            type="date"
                            value={formData.end_date}
                            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                        />
                    </div>

                    <div className="col-span-2 space-y-2">
                        <label className="text-sm font-medium">Přiřazeno komu</label>
                        <select
                            className="w-full h-10 px-3 rounded-md border border-input bg-background/50 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            value={formData.assigned_to}
                            onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                        >
                            <option value="">Vyberte osobu...</option>
                            {profiles.map((p) => (
                                <option key={p.id} value={p.id}>{p.full_name || p.email}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-span-2 space-y-2">
                        <label className="text-sm font-medium">Poznámky</label>
                        <textarea
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Zadejte poznámky..."
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                    <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                        Zrušit
                    </Button>
                    <Button type="submit" disabled={loading} className="gap-2">
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        <Plus className="w-4 h-4" />
                        Vytvořit Zakázku
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
