"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { IService } from '@/types/service';
import { Plus, X, Edit2, Trash2, AlertCircle } from 'lucide-react';

export default function ServicesPage() {
    const [services, setServices] = useState<IService[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState<Partial<IService>>({
        date: new Date().toISOString().split('T')[0],
        duration: '',
        customer: '',
        description: '',
        order_number: ''
    });

    // Fetch services from projects table
    const fetchServices = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('project_type', 'service')
            .order('deadline', { ascending: false });

        if (error) {
            console.error('Error loading services:', error);
        } else {
            const transformed = (data || []).map((p: any) => ({
                id: p.id,
                date: p.deadline || p.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
                order_number: p.abra_order || '',
                customer: p.customer || '',
                description: p.note || p.name,
                duration: '' // Records don't have this explicitly in 'projects' yet
            }));
            setServices(transformed as any);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const resetForm = () => {
        setFormData({
            date: new Date().toISOString().split('T')[0],
            duration: '',
            customer: '',
            description: '',
            order_number: ''
        });
        setEditingServiceId(null);
    };

    const handleEdit = (service: IService) => {
        setFormData({
            date: service.date?.split('T')[0],
            order_number: service.order_number,
            customer: service.customer,
            description: service.description,
            duration: service.duration
        });
        setEditingServiceId(service.id);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Opravdu chcete tento servisní záznam smazat?')) return;

        try {
            const { error } = await supabase
                .from('projects')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchServices();
        } catch (error: any) {
            alert('Chyba při mazání: ' + (error.message || 'Neznámá chyba'));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const projectData = {
                name: formData.description?.substring(0, 50) || 'Servisní výjezd',
                customer: formData.customer,
                deadline: formData.date,
                project_type: 'service',
                status: 'Aktívny',
                abra_order: formData.order_number,
                note: formData.description,
                manager: 'Servisní tým',
                quantity: 1,
                action_needed_by: 'internal'
            };

            if (editingServiceId) {
                const { error } = await supabase
                    .from('projects')
                    .update(projectData)
                    .eq('id', editingServiceId);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('projects')
                    .insert([projectData]);
                if (error) throw error;
            }

            setIsModalOpen(false);
            resetForm();
            fetchServices();
        } catch (error: any) {
            alert('Chyba při ukládání: ' + (error.message || 'Neznámá chyba'));
        }
    };

    return (
        <div className="flex flex-col h-full space-y-6">
            <header className="flex justify-between items-center px-2">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Servis</h1>
                    <p className="text-muted-foreground">Evidence servisních zakázek a výjezdů</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 transition-all font-medium shadow-sm hover:shadow-md active:scale-95"
                >
                    <Plus size={18} />
                    Nový servis
                </button>
            </header>

            {/* List */}
            <div className="border border-border rounded-xl bg-card/50 backdrop-blur-sm overflow-hidden flex-1 relative shadow-sm mx-2">
                <div className="overflow-auto absolute inset-0 custom-scrollbar">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-muted/50 sticky top-0 z-10 backdrop-blur-md border-b border-border">
                            <tr>
                                <th className="px-6 py-4 font-semibold w-32">Datum</th>
                                <th className="px-6 py-4 font-semibold w-32">Číslo zak.</th>
                                <th className="px-6 py-4 font-semibold w-48">Zákazník</th>
                                <th className="px-6 py-4 font-semibold">Popis práce</th>
                                <th className="px-6 py-4 font-semibold w-24 text-right">Akce</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {isLoading ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground animate-pulse">Načítání dat...</td></tr>
                            ) : services.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                                                <AlertCircle className="text-muted-foreground/30" size={32} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-base font-medium text-foreground">Zatím žádné servisní záznamy</p>
                                                <p className="text-sm">Vytvořte svůj první záznam tlačítkem vpravo nahoře.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                services.map((service) => (
                                    <tr key={service.id} className="hover:bg-primary/[0.02] transition-colors group border-transparent">
                                        <td className="px-6 py-4 font-medium text-foreground whitespace-nowrap">
                                            {service.date ? new Date(service.date).toLocaleDateString('cs-CZ') : '-'}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-muted-foreground group-hover:text-primary transition-colors">{service.order_number}</td>
                                        <td className="px-6 py-4 font-medium">{service.customer}</td>
                                        <td className="px-6 py-4 text-muted-foreground max-w-md truncate" title={service.description}>
                                            {service.description}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEdit(service)}
                                                    className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-all"
                                                    title="Upravit"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(service.id)}
                                                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all"
                                                    title="Smazat"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-border bg-muted/30">
                            <div>
                                <h2 className="text-xl font-bold text-foreground">
                                    {editingServiceId ? 'Upravit servisní záznam' : 'Nový servisní záznam'}
                                </h2>
                                <p className="text-sm text-muted-foreground mt-1">Zadejte detaily servisního výjezdu</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground p-2 transition-colors rounded-full hover:bg-muted">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Datum</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full bg-secondary/20 border border-input rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Číslo zakázky</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="např. 20240123"
                                        value={formData.order_number}
                                        onChange={e => setFormData({ ...formData, order_number: e.target.value })}
                                        className="w-full bg-secondary/20 border border-input rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Zákazník</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Jméno klienta nebo firmy"
                                    value={formData.customer}
                                    onChange={e => setFormData({ ...formData, customer: e.target.value })}
                                    className="w-full bg-secondary/20 border border-input rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Popis práce</label>
                                <textarea
                                    required
                                    rows={5}
                                    placeholder="Detailní popis provedených úkonů..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-secondary/20 border border-input rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-border mt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-all"
                                >
                                    Zrušit
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-all shadow-md hover:shadow-lg active:scale-95"
                                >
                                    {editingServiceId ? 'Uložit změny' : 'Vytvořit záznam'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
