export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            project_history: {
                Row: {
                    id: string
                    project_id: string | null
                    user_id: string | null
                    action_type: string
                    details: Json | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    project_id?: string | null
                    user_id?: string | null
                    action_type: string
                    details?: Json | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    project_id?: string | null
                    user_id?: string | null
                    action_type?: string
                    details?: Json | null
                    created_at?: string
                }
            }
            profiles: {
                Row: {
                    id: string
                    email: string | null
                    full_name: string | null
                    avatar_url: string | null
                    role: string
                    created_at: string
                }
                Insert: {
                    id: string
                    email?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    role?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    email?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    role?: string
                    created_at?: string
                }
            }
            projects: {
                Row: {
                    id: string
                    title: string
                    description: string | null
                    client_name: string | null
                    zakazka_sro: string | null
                    op_crm: string | null
                    manufacturer: string | null
                    chassis_type: string | null
                    sector: string | null
                    assembly_company: string | null
                    quantity: number
                    status: "planning" | "development" | "production" | "completed" | "stopped"
                    progress: number
                    start_date: string | null
                    end_date: string | null
                    manager_id: string | null
                    created_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    description?: string | null
                    client_name?: string | null
                    zakazka_sro?: string | null
                    op_crm?: string | null
                    manufacturer?: string | null
                    chassis_type?: string | null
                    sector?: string | null
                    assembly_company?: string | null
                    quantity?: number
                    status?: "planning" | "development" | "production" | "completed" | "stopped"
                    progress?: number
                    start_date?: string | null
                    end_date?: string | null
                    manager_id?: string | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    description?: string | null
                    client_name?: string | null
                    zakazka_sro?: string | null
                    op_crm?: string | null
                    manufacturer?: string | null
                    chassis_type?: string | null
                    sector?: string | null
                    assembly_company?: string | null
                    quantity?: number
                    status?: "planning" | "development" | "production" | "completed" | "stopped"
                    progress?: number
                    start_date?: string | null
                    end_date?: string | null
                    manager_id?: string | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            production_orders: {
                Row: {
                    id: string
                    project_id: string
                    title: string
                    quantity: number
                    status: "new" | "fabrication" | "assembly" | "testing" | "done" | "planned"
                    priority: "low" | "medium" | "high" | "critical"
                    start_date: string | null
                    end_date: string | null
                    assigned_to: string | null
                    notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    project_id: string
                    title: string
                    quantity?: number
                    status?: "new" | "fabrication" | "assembly" | "testing" | "done" | "planned"
                    priority?: "low" | "medium" | "high" | "critical"
                    start_date?: string | null
                    end_date?: string | null
                    assigned_to?: string | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    project_id?: string
                    title?: string
                    quantity?: number
                    status?: "new" | "fabrication" | "assembly" | "testing" | "done" | "planned"
                    priority?: "low" | "medium" | "high" | "critical"
                    start_date?: string | null
                    end_date?: string | null
                    assigned_to?: string | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            services: {
                Row: {
                    id: string
                    title: string
                    client_name: string | null
                    location: string | null
                    status: "scheduled" | "in_progress" | "waiting_parts" | "done" | "cancelled"
                    service_date: string | null
                    duration_hours: number | null
                    assigned_to: string | null
                    description: string | null
                    is_recurring: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    client_name?: string | null
                    location?: string | null
                    status?: "scheduled" | "in_progress" | "waiting_parts" | "done" | "cancelled"
                    service_date?: string | null
                    duration_hours?: number | null
                    assigned_to?: string | null
                    description?: string | null
                    is_recurring?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    client_name?: string | null
                    location?: string | null
                    status?: "scheduled" | "in_progress" | "waiting_parts" | "done" | "cancelled"
                    service_date?: string | null
                    duration_hours?: number | null
                    assigned_to?: string | null
                    description?: string | null
                    is_recurring?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
        }
        Views: {
            timeline_items: {
                Row: {
                    id: string
                    title: string
                    type: "project" | "production" | "service"
                    status: string
                    start_date: string | null
                    end_date: string | null
                    owner_id: string | null
                    parent_id: string | null
                }
            }
        }
    }
}
