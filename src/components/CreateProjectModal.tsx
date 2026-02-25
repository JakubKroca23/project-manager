'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { X, Loader2, Plus, Check, ChevronDown } from 'lucide-react';
import { Project } from '@/types/project';
import { cn } from '@/lib/utils';

interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    projectType: 'civil' | 'military' | 'service';
}

interface Client {
    id: string;
    name: string;
}

interface Manager {
    id: string;
    email: string;
}

/**
 * Komponenta pro vytvoření nové zakázky nebo servisu.
 */
export default function CreateProjectModal({ isOpen, onClose, onSuccess, projectType }: CreateProjectModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [clients, setClients] = useState<Client[]>([]);
    const [managers, setManagers] = useState<Manager[]>([]);

    // Combobox state for Clients
    const [clientQuery, setClientQuery] = useState('');
    const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
    const clientDropdownRef = useRef<HTMLDivElement>(null);

    const [formData, setFormData] = useState({
        id: '',
        name: '',
        customer: '',
        manager: '',
        status: 'Nová',
        category: '',
        serial_number: '',
        priority: 2 as 1 | 2 | 3,
    });

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (clientDropdownRef.current && !clientDropdownRef.current.contains(event.target as Node)) {
                setIsClientDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch clients and managers on open
    useEffect(() => {
        if (isOpen) {
            const fetchData = async () => {
                // Fetch Clients
                const { data: clientsData } = await supabase
                    .from('clients')
                    .select('id, name')
                    .order('name');
                if (clientsData) setClients(clientsData);

                // Fetch Managers (Profiles with email)
                const { data: profilesData } = await supabase
                    .from('profiles')
                    .select('id, email')
                    .order('email');
                if (profilesData) setManagers(profilesData);
            };
            fetchData();
        }
    }, [isOpen]);

    // Update local form data when client query changes (for manual input)
    const handleClientChange = (val: string) => {
        setClientQuery(val);
        setFormData(prev => ({ ...prev, customer: val }));
        setIsClientDropdownOpen(true);
    };

    const selectClient = (clientName: string) => {
        setClientQuery(clientName);
        setFormData(prev => ({ ...prev, customer: clientName }));
        setIsClientDropdownOpen(false);
    };

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // 1. Handle Client (Check existence, create if new)
            const trimmedCustomer = formData.customer.trim();
            if (trimmedCustomer) {
                const existingClient = clients.find(c => c.name.toLowerCase() === trimmedCustomer.toLowerCase());
                if (!existingClient) {
                    const { error: clientError } = await supabase
                        .from('clients')
                        .insert([{ name: trimmedCustomer }]);

                    if (clientError) {
                        // Ignore unique violation if parallel insert happened
                        if (clientError.code !== '23505') {
                            throw new Error(`Chyba vytvoření klienta: ${clientError.message}`);
                        }
                    }
                }
            }

            // 2. Create Project
            const newProject: Partial<Project> = {
                ...formData,
                project_type: projectType,
                quantity: 1,
                action_needed_by: 'internal',
                created_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from('projects')
                .insert([newProject]);

            if (error) throw error;

            onSuccess();
            onClose();
            // Reset form
            setFormData({
                id: '',
                name: '',
                customer: '',
                manager: '',
                status: 'Nová',
                category: '',
                serial_number: '',
                priority: 2,
            });
            setClientQuery('');

        } catch (error: any) {

            alert('Nepodařilo se vytvořit záznam: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const title = projectType === 'service' ? 'Nový servis' : 'Nová zakázka';

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(clientQuery.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-background border border-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Plus className="text-primary" size={18} />
                        </div>
                        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Kód / ID</label>
                            <input
                                required
                                value={formData.id}
                                onChange={e => setFormData({ ...formData, id: e.target.value })}
                                className="w-full bg-muted/50 border border-border/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all font-medium"
                                placeholder="např. Z2024001 nebo 'není'"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Název / Předmět</label>
                            <input
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-muted/50 border border-border/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all font-medium"
                                placeholder="..."
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5 relative" ref={clientDropdownRef}>
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Klient</label>
                        <div className="relative">
                            <input
                                required
                                type="text"
                                value={clientQuery}
                                onChange={(e) => handleClientChange(e.target.value)}
                                onClick={() => setIsClientDropdownOpen(true)}
                                className="w-full bg-muted/50 border border-border/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all font-medium"
                                placeholder="Vyberte nebo napište nového..."
                            />
                            {isClientDropdownOpen && filteredClients.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-popover border border-border rounded-lg shadow-lg z-50 animate-in fade-in zoom-in-95 duration-100">
                                    {filteredClients.map(client => (
                                        <button
                                            key={client.id}
                                            type="button"
                                            onClick={() => selectClient(client.name)}
                                            className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex items-center justify-between group"
                                        >
                                            <span>{client.name}</span>
                                            {client.name === clientQuery && <Check size={14} className="text-primary" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Vedoucí zakázky</label>
                            <div className="relative">
                                <select
                                    required
                                    value={formData.manager}
                                    onChange={e => setFormData({ ...formData, manager: e.target.value })}
                                    className="w-full bg-muted/50 border border-border/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all font-medium appearance-none cursor-pointer"
                                >
                                    <option value="" disabled>Vyberte vedoucího...</option>
                                    {managers.map(manager => (
                                        <option key={manager.id} value={manager.email}>
                                            {manager.email}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none" size={14} />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Kategorie</label>
                            <div className="relative">
                                <select
                                    required
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full bg-muted/50 border border-border/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all font-medium appearance-none cursor-pointer"
                                >
                                    <option value="" disabled>Vyberte...</option>
                                    {['HIAB', 'MULTILIFT', 'HIAB + MULTILIFT', 'LOGLIFT', 'MOFFETT', 'ZEPRO', 'CORTEX', 'JONSERED', 'COMET', 'JINÉ'].map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none" size={14} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Stav</label>
                            <div className="relative">
                                <select
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full bg-muted/50 border border-border/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all font-medium appearance-none cursor-pointer"
                                >
                                    <option value="Nová">Nová</option>
                                    <option value="Rozpracováno">Rozpracováno</option>
                                    <option value="Cenová nabídka">Cenová nabídka</option>
                                    <option value="Čeká na díly">Čeká na díly</option>
                                    <option value="Hotovo">Hotovo</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none" size={14} />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">VIN / Výrobní číslo</label>
                            <input
                                value={formData.serial_number}
                                onChange={e => setFormData({ ...formData, serial_number: e.target.value })}
                                className="w-full bg-muted/50 border border-border/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all font-medium"
                            />
                        </div>
                    </div>


                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">Priorita</label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { id: 1, label: 'Urgentní', color: 'bg-rose-500' },
                                { id: 2, label: 'Normální', color: 'bg-blue-500' },
                                { id: 3, label: 'Nízká', color: 'bg-slate-400' }
                            ].map(p => (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, priority: p.id as 1 | 2 | 3 })}
                                    className={cn(
                                        "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all",
                                        formData.priority === p.id
                                            ? "border-primary bg-primary/5 shadow-inner"
                                            : "border-border/40 bg-muted/10 hover:bg-muted/30"
                                    )}
                                >
                                    <div className={cn("w-2.5 h-2.5 rounded-full shadow-sm", p.color)} />
                                    <span className={cn("text-[9px] font-black uppercase tracking-tight", formData.priority === p.id ? "text-primary" : "text-muted-foreground")}>{p.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 bg-muted hover:bg-muted/80 text-foreground rounded-xl font-bold text-[11px] uppercase tracking-wider transition-all"
                        >
                            Zrušit
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-[11px] uppercase tracking-wider shadow-lg shadow-primary/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                            Vytvořit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

