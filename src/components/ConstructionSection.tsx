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
export const ConstructionSection: React.FC<IConstructionSectionProps> = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] w-full px-4 text-center">
            {/* Animation Container */}
            <div className="relative w-64 h-64 mb-16">
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
            <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground uppercase italic underline decoration-primary decoration-8 underline-offset-8">
                    Stránka ve výstavbě
                </h1>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-50">
                    Hard work in progress
                </p>
            </div>
        </div>
    );
};
