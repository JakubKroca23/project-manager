// Helper functions for data processing

/**
 * Pomocná funkce pro bezpečné získání hodnoty z objektu s potenciálně rozbitým kódováním klíčů (pro Raynet exporty)
 */
export const getVal = (obj: any, searchKey: string) => {
    // Zkusíme najít přesnou shodu
    if (obj[searchKey] !== undefined) return obj[searchKey];

    // Zkusíme najít klíč, který obsahuje hledaný řetězec bez diakritiky nebo s otazníky
    const normalizedSearch = searchKey.toLowerCase().replace(/[^\w\s]/gi, '');
    const key = Object.keys(obj).find(k => {
        const normalizedK = k.toLowerCase().replace(/[^\w\s]/gi, '');
        return normalizedK === normalizedSearch;
    });

    return key ? obj[key] : undefined;
};

/**
 * Ošetření "NaN" řetězců nebo prázdných hodnot
 */
export const cleanNaN = (val: any) => val === "NaN" || val === null || val === undefined ? undefined : val;

