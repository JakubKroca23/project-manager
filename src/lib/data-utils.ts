import { Project } from '@/types/project';
import raynetData from '../../data/raynet_data_3.json';

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

/**
 * Mapování dat z Raynet JSON na náš interní formát Project
 */
export const getMappedProjects = (): Project[] => {
    return (raynetData as any[]).map((item: any) => ({
        id: getVal(item, "Kód"),
        name: getVal(item, "Předmět"),
        customer: getVal(item, "Klient") || "-",
        manager: getVal(item, "Vlastník") || "-",
        status: "Aktivní",
        deadline: "-",

        // Rozšířená pole (termíny)
        closed_at: cleanNaN(getVal(item, "Uzavřeno")),
        category: cleanNaN(getVal(item, "Kategorie")),
        abra_order: cleanNaN(getVal(item, "Abra Objednávka")),
        abra_project: cleanNaN(getVal(item, "Abra Zakázka")),
        body_delivery: cleanNaN(getVal(item, "Dodání nástavby")),
        customer_handover: cleanNaN(getVal(item, "Předání zákazníkovi")),
        chassis_delivery: cleanNaN(getVal(item, "Dodání podvozku")),
        production_status: cleanNaN(getVal(item, "Status Výroby")),
        mounting_company: cleanNaN(getVal(item, "Montážní společnost")),
        body_setup: cleanNaN(getVal(item, "Nástavba nastavení")),
        serial_number: cleanNaN(getVal(item, "Výrobní číslo")),

        quantity: 1,
        action_needed_by: 'internal' as const,
        note: "",
        created_at: new Date().toISOString()
    })).filter(p => p.name);
};
