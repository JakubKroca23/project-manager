export type ProjectStatus = string; // Dynamické stavy z CRM
export type ActionNeededBy = 'internal' | 'external';

export interface Project {
    // Základní pole
    id: string;             // Kód
    name: string;           // Předmět
    customer: string;       // Klient
    manager: string;        // Vlastník
    status: ProjectStatus;  // Stav
    deadline?: string;      // Otevřeno od

    // CRM Rozšířená pole
    closed_at?: string;             // Uzavřeno
    category?: string;              // Kategorie
    abra_order?: string;            // Abra Objednávka
    abra_project?: string;          // Abra Zakázka
    body_delivery?: string;         // Dodání nástavby
    customer_handover?: string;     // Předání zákazníkovi
    chassis_delivery?: string;      // Dodání podvozku
    production_status?: string;     // Status Výroby
    mounting_company?: string;      // Montážní společnost
    body_setup?: string;            // Nástavba nastavení
    serial_number?: string;         // Výrobní číslo

    // Interní pole systému
    quantity: number;
    action_needed_by: ActionNeededBy;
    project_type: 'civil' | 'military';
    custom_fields?: Record<string, any>;
    note?: string;
    created_at: string;
}
