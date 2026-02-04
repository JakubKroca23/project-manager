"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createService } from "@/app/services/actions";
import { getProfiles } from "@/app/projects/actions";
import { useRouter } from "next/navigation";
import { Loader2, Plus, AlertCircle } from "lucide-react";

interface CreateServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateServiceModal({ isOpen, onClose }: CreateServiceModalProps) {
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [profiles, setProfiles] = React.useState<any[]>([]);
    const router = useRouter();

    const [formData, setFormData] = React.useState({
        title: "",
        client_name: "",
        location: "",
        status: "scheduled" as any,
        service_date: "",
        duration_hours: 1,
        assigned_to: "",
        description: "",
        is_recurring: false,
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
            const result = await createService({
                ...formData,
                duration_hours: Number(formData.duration_hours)
            } as any);

            if (result.error) {
                setError(result.error);
            } else {
                router.refresh();
                onClose();
                setFormData({
                    title: "",
                    client_name: "",
                    location: "",
                    status: "scheduled",
                    service_date: "",
                    duration_hours: 1,
                    assigned_to: "",
                    description: "",
                    is_recurring: false,
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
            title="Naplánovat Servis"
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
                        <label className="text-sm font-medium">Název úkonu *</label>
                        <Input
                            required
                            placeholder="Např. Roční prohlídka, Oprava hydrauliky..."
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Klient</label>
                        <Input
                            placeholder="Jméno klienta..."
                            value={formData.client_name}
                            onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Lokalita</label>
                        <Input
                            placeholder="Místo servisu..."
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Datum a čas</label>
                        <Input
                            type="datetime-local"
                            value={formData.service_date}
                            onChange={(e) => setFormData({ ...formData, service_date: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Odhadované trvání (h)</label>
                        <Input
                            type="number"
                            min="0.5"
                            step="0.5"
                            value={formData.duration_hours}
                            onChange={(e) => setFormData({ ...formData, duration_hours: parseFloat(e.target.value) || 1 })}
                        />
                    </div>

                    <div className="col-span-2 space-y-2">
                        <label className="text-sm font-medium">Technik</label>
                        <select
                            className="w-full h-10 px-3 rounded-md border border-input bg-background/50 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            value={formData.assigned_to}
                            onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                        >
                            <option value="">Vyberte technika...</option>
                            {profiles.map((p) => (
                                <option key={p.id} value={p.id}>{p.full_name || p.email}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-span-2 flex items-center gap-2 py-2">
                        <input
                            type="checkbox"
                            id="is_recurring"
                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                            checked={formData.is_recurring}
                            onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
                        />
                        <label htmlFor="is_recurring" className="text-sm font-medium cursor-pointer">
                            Opakovaný servis
                        </label>
                    </div>

                    <div className="col-span-2 space-y-2">
                        <label className="text-sm font-medium">Popis práce</label>
                        <textarea
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Popište co je potřeba udělat..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                        Naplánovat
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
