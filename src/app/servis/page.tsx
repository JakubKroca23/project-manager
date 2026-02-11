"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { IService } from '@/types/service';
import { Plus, X } from 'lucide-react';

export default function ServicesPage() {
    const [services, setServices] = useState<IService[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form state
    const [newService, setNewService] = useState<Partial<IService>>({
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
            // Transform data if needed to match IService interface if it differs significantly
            const transformed = (data || []).map((p: any) => ({
                id: p.id,
                date: p.deadline || p.created_at,
                order_number: p.abra_order || '',
                customer: p.customer || '',
                description: p.note || p.name,
                duration: '' // Tuto informaci projects defaultně nemá, lze přidat do custom_fields
            }));
            setServices(transformed as any);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // Mapování polí ze servisního formuláře na tabulku projects
            const projectData = {
                name: newService.description?.substring(0, 50) || 'Servisní výjezd',
                customer: newService.customer,
                deadline: newService.date, // Datum zahájení servisu
                project_type: 'service',
                status: 'Aktívny',
                abra_order: newService.order_number,
                note: newService.description,
                manager: 'Servisní tým',
                quantity: 1,
                action_needed_by: 'internal'
            };

            const { error } = await supabase
                .from('projects')
                .insert([projectData]);

            if (error) throw error;

            setIsModalOpen(false);
            setNewService({
                date: new Date().toISOString().split('T')[0],
                duration: '',
                customer: '',
                description: '',
                order_number: ''
            });
            fetchServices();
        } catch (error: any) {
            alert('Chyba při ukládání: ' + (error.message || 'Neznámá chyba'));
        }
    };

    return (
        <div className="flex flex-col h-full space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Servis</h1>
                    <p className="text-muted-foreground">Evidence servisních zakázek</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium shadow-sm active:scale-95"
                >
                    <Plus size={18} />
                    Nový servis
                </button>
            </header>

            {/* List */}
            <div className="border border-border rounded-lg bg-card/50 backdrop-blur-sm overflow-hidden flex-1 relative shadow-sm">
                <div className="overflow-auto absolute inset-0">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-muted/50 sticky top-0 z-10 backdrop-blur-md border-b border-border">
                            <tr>
                                <th className="px-6 py-3 font-medium w-32">Datum</th>
                                <th className="px-6 py-3 font-medium w-32">Číslo zak.</th>
                                <th className="px-6 py-3 font-medium w-48">Zákazník</th>
                                <th className="px-6 py-3 font-medium">Popis práce</th>
                                <th className="px-6 py-3 font-medium w-32 text-right">Trvání</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {isLoading ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">Načítání dat...</td></tr>
                            ) : services.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground flex flex-col items-center gap-2">
                                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-2">
                                            <Plus className="text-muted-foreground/50" />
                                        </div>
                                        <span>Zatím žádné servisní záznamy</span>
                                        <button onClick={() => setIsModalOpen(true)} className="text-primary hover:underline text-xs">Vytvořit první záznam</button>
                                    </td>
                                </tr>
                            ) : (
                                services.map((service) => (
                                    <tr key={service.id} className="hover:bg-muted/30 transition-colors group">
                                        <td className="px-6 py-4 font-medium text-foreground whitespace-nowrap">
                                            {new Date(service.date).toLocaleDateString('cs-CZ')}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-muted-foreground group-hover:text-foreground transition-colors">{service.order_number}</td>
                                        <td className="px-6 py-4 font-medium">{service.customer}</td>
                                        <td className="px-6 py-4 text-muted-foreground max-w-md truncate" title={service.description}>
                                            {service.description}
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono text-muted-foreground">{service.duration}</td>
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
                    <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold">Nový servisní záznam</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground p-1 transition-colors rounded-full hover:bg-muted">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium uppercase text-muted-foreground">Datum</label>
                                    <input
                                        type="date"
                                        required
                                        value={newService.date}
                                        onChange={e => setNewService({ ...newService, date: e.target.value })}
                                        className="w-full bg-secondary/30 border border-input rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium uppercase text-muted-foreground">Číslo zakázky</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="2024..."
                                        value={newService.order_number}
                                        onChange={e => setNewService({ ...newService, order_number: e.target.value })}
                                        className="w-full bg-secondary/30 border border-input rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/50"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium uppercase text-muted-foreground">Zákazník</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Jméno klienta nebo firmy"
                                    value={newService.customer}
                                    onChange={e => setNewService({ ...newService, customer: e.target.value })}
                                    className="w-full bg-secondary/30 border border-input rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium uppercase text-muted-foreground">Délka trvání</label>
                                <input
                                    type="text"
                                    placeholder="např. 2.5h"
                                    value={newService.duration}
                                    onChange={e => setNewService({ ...newService, duration: e.target.value })}
                                    className="w-full bg-secondary/30 border border-input rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium uppercase text-muted-foreground">Popis práce</label>
                                <textarea
                                    required
                                    rows={4}
                                    placeholder="Detailní popis provedených úkonů..."
                                    value={newService.description}
                                    onChange={e => setNewService({ ...newService, description: e.target.value })}
                                    className="w-full bg-secondary/30 border border-input rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none placeholder:text-muted-foreground/50"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-md transition-colors"
                                >
                                    Zrušit
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors shadow-sm active:scale-95"
                                >
                                    Uložit záznam
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
