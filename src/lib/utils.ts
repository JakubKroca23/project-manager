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

export function formatDate(date: any): string {
    if (!date || date === '-' || date === '—') return '—';
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return String(date);

        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();

        return `${day}.${month}.${year}`;
    } catch (e) {
        return String(date);
    }
}

export function extractModelDesignation(name: string, category: string): string | null {
    if (!name) return null;
    const cleanName = name.toUpperCase();
    const cat = category?.toUpperCase() || '';

    // Definice vzorů pro jednotlivé značky
    const patterns = {
        // MULTILIFT: ULTIMA 21S, XR21SL51, atd.
        MULTILIFT: /\b(ULTIMA|OPTIMA|ECOLOGIC|XR|XP|SLT|QUEST)\s*(\d{1,2}[A-Z]\d{2}|\d{1,2}[A-Z]|\d{1,2})[-\s]*([A-Z0-9]+)?\b/i,
        // HIAB: iX 188 E6 HiDuo, iX.188 E-6 HIDUO, X-HIPRO 192 atd.
        HIAB: /\b(iX|X|Z|K|S|J|L)[-.\s]?(\d{2,4})[-\s]*(E[-\s]?\d)?([-\s]*(?:HIPRO|HIDUO|CLX|PRO|DUO|XSD|VISION))?\b/i,
        LOGLIFT: /\b([F|S|Z]\d{2,4}[A-Z]?|[F|S|Z]?\d{2,3}[A-Z]?)\b/i,
        MOFFETT: /\b(M|E)\d+(\s*[.\d]+)?(\s*NX|PRO|M5|M4|M8)?\b/i,
        ZEPRO: /\b(ZHD|ZHL|ZH|Z|ZL|ZN|ZT|ZU|BZ|RD)\s*(\d{3,4})[-\s]?([A-Z]{0,2})\b/i,
        COMET: /\b(XUR|EUROSKY|COMET)\s*\d{2,3}\b/i
    };

    let foundModel: string | null = null;

    // 1. Pokud máme specifickou kategorii, zkusíme nejdřív její vzor
    if (cat.includes('MULTILIFT')) {
        const match = cleanName.match(patterns.MULTILIFT);
        if (match) foundModel = match[0];
    } else if (cat.includes('HIAB')) {
        const match = cleanName.match(patterns.HIAB);
        if (match) foundModel = match[0];
    } else if (cat.includes('LOGLIFT') || cat.includes('JONSERED')) {
        const match = cleanName.match(patterns.LOGLIFT);
        if (match) foundModel = match[0];
    } else if (cat.includes('MOFFETT')) {
        const match = cleanName.match(patterns.MOFFETT);
        if (match) foundModel = match[0];
    } else if (cat.includes('ZEPRO')) {
        const match = cleanName.match(patterns.ZEPRO);
        if (match) foundModel = match[0];
    } else if (cat.includes('COMET')) {
        const match = cleanName.match(patterns.COMET);
        if (match) foundModel = match[0];
    }

    // 2. Pokud jsme nic nenašli přes kategorii, projdeme vše
    if (!foundModel) {
        for (const [key, pattern] of Object.entries(patterns)) {
            const match = cleanName.match(pattern);
            if (match) {
                foundModel = match[0];
                break;
            }
        }
    }

    // Pokud jsme našli model, provedeme normalizaci (odstranění teček a přebytečných mezer)
    if (foundModel) {
        return foundModel.replace(/\./g, ' ').replace(/\s+/g, ' ').trim();
    }

    return null;
}
