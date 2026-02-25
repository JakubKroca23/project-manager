import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatManager(manager: string | null | undefined): string {
    if (!manager || manager === '—') return '—';
    const raw = manager.split('(')[0].split('<')[0].split('@')[0].trim();
    if (raw.includes('.')) {
        return raw
            .split('.')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
    return raw.charAt(0).toUpperCase() + raw.slice(1);
}
