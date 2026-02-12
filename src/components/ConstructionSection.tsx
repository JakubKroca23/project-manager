'use client';

import React from 'react';
import { Hammer, Wrench, Construction, Pickaxe, HardHat, Drill } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IConstructionSectionProps {
    title: string;
    description?: string;
}

/**
 * Component for displaying an 'Under Construction' state with animations.
 */
export const ConstructionSection: React.FC<IConstructionSectionProps> = ({ title, description }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] w-full px-4 text-center">
            {/* Animation Container */}
            <div className="relative w-64 h-64 mb-12">
                {/* Background pulsing ring */}
                <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse scale-110" />
                <div className="absolute inset-0 bg-primary/5 rounded-full animate-pulse delay-700 scale-150" />

                {/* Floating Icons */}
                <div className="absolute top-0 left-1/4 animate-construction-float">
                    <Hammer className="text-primary w-12 h-12 opacity-80" />
                </div>
                <div className="absolute bottom-10 right-1/4 animate-construction-float delay-1000">
                    <Wrench className="text-indigo-500 w-10 h-10 opacity-70" />
                </div>
                <div className="absolute top-1/2 -left-4 animate-construction-swing">
                    <Drill className="text-slate-400 w-8 h-8 opacity-60" />
                </div>
                <div className="absolute top-1/3 -right-4 animate-construction-lift">
                    <Pickaxe className="text-slate-500 w-10 h-10 opacity-70" />
                </div>

                {/* Central Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl border-2 border-primary/20 animate-bounce group">
                        <Construction size={80} className="text-primary group-hover:rotate-12 transition-transform duration-500" />
                    </div>
                </div>

                {/* Hard Hat Icon */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-400 p-3 rounded-xl shadow-lg border-2 border-black/10 transition-transform hover:scale-110 cursor-default">
                    <HardHat size={32} className="text-slate-900" />
                </div>
            </div>

            {/* Text Content */}
            <div className="space-y-6 max-w-2xl">
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground uppercase italic underline decoration-primary decoration-4 underline-offset-8">
                    {title}
                </h1>

                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
                    <p className="text-xl font-bold text-primary mb-2 uppercase tracking-widest">Sekce je ve vývoji</p>
                    <p className="text-muted-foreground leading-relaxed">
                        {description || 'Na této části aplikace usilovně pracujeme. Brzy zde najdete plnohodnotné nástroje pro správu vašich procesů.'}
                    </p>
                </div>

                {/* Progress Bar Mockup */}
                <div className="w-full max-w-md mx-auto space-y-2 pt-4">
                    <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        <span>Stav výstavby</span>
                        <span>70%</span>
                    </div>
                    <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-300 dark:border-slate-700">
                        <div className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full animate-construction-progress" style={{ width: '70%' }} />
                    </div>
                    <p className="text-[11px] text-muted-foreground italic">Probíhá pokládka základů a instalace modulů...</p>
                </div>
            </div>
        </div>
    );
};
