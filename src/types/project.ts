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
    body_type?: string;             // Typ nástavby
    serial_number?: string;         // Výrobní číslo
    // service_duration removed

    // Interní pole systému
    quantity: number;
    action_needed_by: ActionNeededBy;
    project_type: 'civil' | 'military';
    custom_fields?: Record<string, any>;
    note?: string;
    created_at: string;
}

export interface Milestone {
    id: string;
    project_id: string;
    name: string;
    date: string;
    status: string;
    description?: string;
    created_at: string;
    updated_at: string;
}
