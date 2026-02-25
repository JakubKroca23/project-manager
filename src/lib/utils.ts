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

export function extractModelDesignation(name: string, category: string): string | null {
    if (!name) return null;
    const cleanName = name.toUpperCase();
    const cat = category?.toUpperCase() || '';

    if (cat.includes('MULTILIFT')) {
        // Hledá vzory jako ULTIMA 21Z59, OPTIMA 20, XR21S59 atd. (včetně variant bez mezer)
        const multiMatch = cleanName.match(/(ULTIMA|OPTIMA|ECOLOGIC|XR|XP|SLT|QUEST)\s*([0-9]{1,2}[A-Z][0-9]{2}|[0-9]{1,2}[A-Z]|[0-9]{1,2})/i);
        return multiMatch ? multiMatch[0] : null;
    }

    if (cat.includes('HIAB')) {
        // Hledá vzory jako X-HIPRO 192, X-HIDUO 188, Z-HIPRO 191 atd.
        const hiabMatch = cleanName.match(/(X|Z|K|S|J)-(HIPRO|HIDUO|CLX|PRO|DUO)\s*([0-9]{3}|[0-9]{2})/i);
        return hiabMatch ? hiabMatch[0] : null;
    }

    if (cat.includes('LOGLIFT') || cat.includes('JONSERED')) {
        // Např. F125S, 1250S, 1080 atd.
        const logliftMatch = cleanName.match(/([F|S|Z]?\d{3,4}[A-Z]?|[F|S|Z]?\d{2,3}[A-Z]?)/i);
        return logliftMatch ? logliftMatch[0] : null;
    }

    if (cat.includes('MOFFETT')) {
        // Např. M4, M5, M7, M8, E2, E4 atd.
        const moffettMatch = cleanName.match(/(M|E)\d+(\s*[.\d]+)?(\s*NX|PRO)?/i);
        return moffettMatch ? moffettMatch[0] : null;
    }

    return null;
}
