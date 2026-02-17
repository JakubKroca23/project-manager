import { cn } from '@/lib/utils';
import React from 'react';

export const getCategoryStyle = (category: string | undefined | null) => {
    if (!category || category === '-') return null;

    // Normalize for comparison
    const normalized = category.trim().toUpperCase();

    // Mapping based on user screenshot colors
    // Pink: Multilift, Jiné
    // Yellow/Olive: Hiab
    // Green: Loglift, Comet
    // Orange/Brown: Moffett

    if (normalized.includes('MULTILIFT') || normalized.includes('JINÉ')) {
        return { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200' };
    }

    if (normalized.includes('HIAB')) {
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' };
    }

    if (normalized.includes('LOGLIFT') || normalized.includes('COMET') || normalized.includes('JONSERED')) {
        return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' };
    }

    if (normalized.includes('MOFFETT')) {
        return { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' };
    }

    if (normalized.includes('ZEPRO')) {
        return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' };
    }

    if (normalized.includes('CORTEX')) {
        return { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' };
    }

    // Default fallback
    return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };
};

export const CategoryChip: React.FC<{ value: string | undefined | null, className?: string }> = ({ value, className }) => {
    const style = getCategoryStyle(value);

    if (!style || !value) return <span>-</span>;

    return (
        <span className={cn(
            "px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wide border whitespace-nowrap inline-flex items-center justify-center",
            style.bg, style.text, style.border,
            className
        )}>
            {value}
        </span>
    );
};
