import React from 'react';
import { Flag, X, PlusCircle, CheckCircle2, Circle, Calendar, Trash2 } from 'lucide-react';
import { Milestone } from '@/types/project';
import { Milestone as FlagIcon } from 'lucide-react';
import { Section } from './DetailComponents';
import { supabase } from '@/lib/supabase/client';


interface MilestoneSectionProps {
    milestones: Milestone[];
    loadingMilestones: boolean;
    isAddingMilestone: boolean;
    newMilestone: { name: string; date: string; icon: string };
    canEdit: boolean;
    isEditing: boolean;
    iconOptions: Record<string, any>;
    onAddToggle: (adding: boolean) => void;
    onNewMilestoneChange: (milestone: any) => void;
    onAddMilestone: () => void;
    onToggleStatus: (milestone: Milestone) => void;
    onDeleteMilestone: (id: string) => void;
    onMilestoneUpdate: (milestones: Milestone[]) => void;
}

export function MilestoneSection({
    milestones,
    loadingMilestones,
    isAddingMilestone,
    newMilestone,
    canEdit,
    isEditing,
    iconOptions,
    onAddToggle,
    onNewMilestoneChange,
    onAddMilestone,
    onToggleStatus,
    onDeleteMilestone,
    onMilestoneUpdate
}: MilestoneSectionProps) {
    return (
        <Section
            icon={<Flag size={15} />}
            title="Milníky zakázky"
            color="emerald"
            fullWidth
            action={
                <button
                    onClick={() => onAddToggle(!isAddingMilestone)}
                    className="text-[10px] font-black uppercase bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
                >
                    {isAddingMilestone ? <X size={12} /> : <PlusCircle size={12} />}
                    {isAddingMilestone ? 'Zrušit' : 'Nový milník'}
                </button>
            }
        >
            <div className="space-y-4">
                {isAddingMilestone && (
                    <div className="bg-background/80 backdrop-blur-sm p-5 rounded-2xl border border-primary/20 shadow-lg flex flex-col gap-5 animate-in slide-in-from-top-4 duration-300">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">Název milníku</label>
                                <input
                                    type="text"
                                    placeholder="Např. Kontrola kvality"
                                    value={newMilestone.name}
                                    onChange={(e) => onNewMilestoneChange({ ...newMilestone, name: e.target.value })}
                                    className="w-full bg-muted/30 border border-border/50 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">Datum</label>
                                <input
                                    type="date"
                                    value={newMilestone.date}
                                    onChange={(e) => onNewMilestoneChange({ ...newMilestone, date: e.target.value })}
                                    className="w-full bg-muted/30 border border-border/50 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">Vyberte ikonku</label>
                            <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-14 gap-2 border border-border/40 p-3 rounded-2xl bg-muted/20">
                                {Object.entries(iconOptions).map(([key, IconComponent]: [string, any]) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => onNewMilestoneChange({ ...newMilestone, icon: key })}
                                        className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${newMilestone.icon === key ? 'bg-primary text-primary-foreground shadow-lg scale-110' : 'hover:bg-background/50 text-muted-foreground/60'}`}
                                        title={key}
                                    >
                                        <IconComponent size={18} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                onClick={() => onAddToggle(false)}
                                className="px-5 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors active:scale-95"
                            >
                                Zrušit
                            </button>
                            <button
                                onClick={onAddMilestone}
                                className="px-8 py-2 bg-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-95 transition-all shadow-xl shadow-primary/20 active:scale-95"
                            >
                                Přidat milník
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {loadingMilestones ? (
                        <div className="col-span-full py-8 text-center text-xs font-black uppercase tracking-widest text-muted-foreground animate-pulse">Načítám milníky...</div>
                    ) : milestones.length === 0 ? (
                        <div className="col-span-full py-8 text-center text-xs font-bold text-muted-foreground/60 italic bg-muted/5 rounded-2xl border-2 border-dashed border-border/40">
                            Žádné vlastní milníky nebyly přidány.
                        </div>
                    ) : (
                        milestones.map((m) => (
                            <div key={m.id} className={`group relative p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between gap-4 hover:shadow-md ${m.status === 'completed' ? 'bg-emerald-500/[0.03] border-emerald-500/10 hover:border-emerald-500/20' : 'bg-rose-500/[0.03] border-rose-500/10 hover:border-rose-500/20'}`}>
                                <div className="flex items-center gap-3.5 min-w-0">
                                    <div className="flex flex-col items-center gap-1.5 shrink-0">
                                        <button
                                            onClick={() => onToggleStatus(m)}
                                            className={`p-1.5 rounded-full transition-all active:scale-90 ${m.status === 'completed' ? 'text-emerald-600 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'}`}
                                        >
                                            {m.status === 'completed' ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                                        </button>
                                        {(() => {
                                            const MIcon = iconOptions[m.icon as keyof typeof iconOptions] || iconOptions['Milestone'];
                                            return <MIcon size={12} className="text-muted-foreground/40" />;
                                        })()}
                                    </div>
                                    <div className="min-w-0 flex-1 space-y-0.5">
                                        <input
                                            type="text"
                                            value={m.name}
                                            onChange={async (e) => {
                                                const newName = e.target.value;
                                                const updatedMilestones = milestones.map(ms => ms.id === m.id ? { ...ms, name: newName } : ms);
                                                onMilestoneUpdate(updatedMilestones);
                                            }}
                                            onBlur={async (e) => {
                                                const newName = e.target.value;
                                                if (!newName) return;
                                                try {
                                                    await supabase
                                                        .from('project_milestones')
                                                        .update({ name: newName })
                                                        .eq('id', m.id);
                                                } catch (err) {
                                                    console.error('Error updating milestone name:', err);
                                                }
                                            }}
                                            className={`w-full bg-transparent border-none p-0 text-[13px] font-black focus:ring-0 outline-none transition-all ${m.status === 'completed' ? 'text-emerald-700/60 line-through' : 'text-foreground'}`}
                                        />
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-muted-foreground/60 transition-colors group-hover:text-muted-foreground">
                                            <Calendar size={11} />
                                            {new Date(m.date).toLocaleDateString('cs-CZ')}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => onDeleteMilestone(m.id)}
                                    className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all shrink-0 active:scale-90"
                                >
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </Section>
    );
}

// Sub-component for vehicle generation if needed later
