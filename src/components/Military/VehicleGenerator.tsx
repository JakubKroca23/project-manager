'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Truck, Copy, Loader2, AlertCircle } from 'lucide-react';
import { Project } from '@/types/project';

interface VehicleGeneratorProps {
    project: Project;
    existingCount?: number;
    onSuccess: () => void;
}

export function VehicleGenerator({ project, existingCount = 0, onSuccess }: VehicleGeneratorProps) {
    const [count, setCount] = useState<number>(Math.max(1, (project.quantity || 1) - existingCount));
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        setIsGenerating(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            const userName = user?.email?.split('@')[0] || 'System';

            const newVehicles: any[] = []; // Explicit any to avoid partial type errors during construction

            // Start from existingCount + 1
            for (let i = 1; i <= count; i++) {
                const vehicleIndex = existingCount + i;
                // Generate sub-project ID
                // Format: {ParentID}-V{i} (e.g., 2024-001-V1)
                const subId = `${project.id}-V${vehicleIndex}`;
                const subName = `${project.name} - Vůz ${vehicleIndex}`;

                newVehicles.push({
                    id: subId,
                    parent_id: project.id,
                    name: subName,
                    project_type: 'military',
                    customer: project.customer,
                    manager: project.manager,
                    status: 'Aktivní',
                    // Dates are intentionally left empty/independent as per user request
                    deadline: null,
                    chassis_delivery: null,
                    body_delivery: null,
                    customer_handover: null,
                    // Copy other relevant fields
                    category: project.category,
                    production_status: 'Příprava',
                    mounting_company: project.mounting_company,
                    // Technical fields
                    start_at: null,
                    quantity: 1, // Sub-project is always 1 unit
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(), // Use same time for creation
                    last_modified_by: userName
                });
            }

            // Insert into DB
            const { error: insertError } = await supabase
                .from('projects')
                .insert(newVehicles);

            if (insertError) throw insertError;

            onSuccess();

        } catch (err: any) {

            setError(err.message || 'Nepodařilo se vygenerovat vozidla.');
        } finally {
            setIsGenerating(false);
        }
    };

    if (project.project_type !== 'military') return null;

    return (
        <div className="bg-muted/30 border border-border rounded-xl p-4 mt-4">
            <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
                    <Truck size={18} />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-foreground">Generátor vozidel</h3>
                    <p className="text-xs text-muted-foreground">Vytvořit podzakázky pro jednotlivá vozidla v sadě.</p>
                </div>
            </div>

            <div className="flex items-end gap-3">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Počet vozidel</label>
                    <input
                        type="number"
                        min={1}
                        max={100}
                        value={count}
                        onChange={(e) => setCount(parseInt(e.target.value) || 0)}
                        className="w-24 h-9 px-3 bg-background border border-border rounded-lg text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 outline-none"
                    />
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={isGenerating || count < 1}
                    className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Copy size={14} />}
                    <span>Generovat {count} {count === 1 ? 'vůz' : count < 5 ? 'vozy' : 'vozů'}</span>
                </button>
            </div>

            {error && (
                <div className="flex items-center gap-2 mt-3 text-xs text-destructive font-medium bg-destructive/10 p-2 rounded-lg">
                    <AlertCircle size={14} />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
}
