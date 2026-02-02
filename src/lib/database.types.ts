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
            profiles: {
                Row: {
                    id: string
                    email: string | null
                    full_name: string | null
                    avatar_url: string | null
                    role: string
                    is_approved: boolean | null
                    created_at: string
                }
                Insert: {
                    id: string
                    email?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    role?: string
                    is_approved?: boolean | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    email?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    role?: string
                    is_approved?: boolean | null
                    created_at?: string
                }
            }
            projects: {
                Row: {
                    id: string
                    title: string
                    description: string | null
                    status: string
                    start_date: string | null
                    end_date: string | null
                    client_name: string | null
                    created_by: string | null
                    created_at: string
                    updated_at: string
                    chassis_type: string | null
                    manufacturer: string | null
                    superstructure_type: string | null
                    accessories: string | null
                    quantity: number | null
                }
                Insert: {
                    id?: string
                    title: string
                    description?: string | null
                    status?: string
                    start_date?: string | null
                    end_date?: string | null
                    client_name?: string | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                    chassis_type?: string | null
                    manufacturer?: string | null
                    superstructure_type?: string | null
                    accessories?: string | null
                    quantity?: number | null
                }
                Update: {
                    id?: string
                    title?: string
                    description?: string | null
                    status?: string
                    start_date?: string | null
                    end_date?: string | null
                    client_name?: string | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                    chassis_type?: string | null
                    manufacturer?: string | null
                    superstructure_type?: string | null
                    accessories?: string | null
                    quantity?: number | null
                }
            }
            superstructures: {
                Row: {
                    id: string
                    project_id: string | null
                    type: string
                    details: string | null
                    supplier: string | null
                    order_status: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    project_id?: string | null
                    type: string
                    details?: string | null
                    supplier?: string | null
                    order_status?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    project_id?: string | null
                    type?: string
                    details?: string | null
                    supplier?: string | null
                    order_status?: string | null
                    created_at?: string
                }
            }
            accessory_catalog: {
                Row: {
                    id: string
                    name: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    created_at?: string
                }
            }
            project_accessories: {
                Row: {
                    id: string
                    project_id: string | null
                    name: string
                    action_type: "manufacture" | "purchase" | "stock" | null
                    supplier: string | null
                    order_status: string | null
                    quantity: number | null
                    notes: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    project_id?: string | null
                    name: string
                    action_type?: "manufacture" | "purchase" | "stock" | null
                    supplier?: string | null
                    order_status?: string | null
                    quantity?: number | null
                    notes?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    project_id?: string | null
                    name?: string
                    action_type?: "manufacture" | "purchase" | "stock" | null
                    supplier?: string | null
                    order_status?: string | null
                    quantity?: number | null
                    notes?: string | null
                    created_at?: string
                }
            }
            production_orders: {
                Row: {
                    id: string
                    project_id: string | null
                    title: string
                    quantity: number
                    status: string
                    priority: string
                    start_date: string | null
                    end_date: string | null
                    assigned_to: string | null
                    notes: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    project_id?: string | null
                    title: string
                    quantity?: number
                    status?: string
                    priority?: string
                    start_date?: string | null
                    end_date?: string | null
                    assigned_to?: string | null
                    notes?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    project_id?: string | null
                    title?: string
                    quantity?: number
                    status?: string
                    priority?: string
                    start_date?: string | null
                    end_date?: string | null
                    assigned_to?: string | null
                    notes?: string | null
                    created_at?: string
                }
            }
            services: {
                Row: {
                    id: string
                    title: string
                    client_name: string | null
                    location: string | null
                    status: string
                    service_date: string | null
                    duration_hours: number | null
                    assigned_to: string | null
                    description: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    client_name?: string | null
                    location?: string | null
                    status?: string
                    service_date?: string | null
                    duration_hours?: number | null
                    assigned_to?: string | null
                    description?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    client_name?: string | null
                    location?: string | null
                    status?: string
                    service_date?: string | null
                    duration_hours?: number | null
                    assigned_to?: string | null
                    description?: string | null
                    created_at?: string
                }
            }
            clients: {
                Row: {
                    id: string
                    name: string
                    billing_address: string | null
                    delivery_address: string | null
                    ico: string | null
                    dic: string | null
                    contact_person: string | null
                    email: string | null
                    phone: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    billing_address?: string | null
                    delivery_address?: string | null
                    ico?: string | null
                    dic?: string | null
                    contact_person?: string | null
                    email?: string | null
                    phone?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    billing_address?: string | null
                    delivery_address?: string | null
                    ico?: string | null
                    dic?: string | null
                    contact_person?: string | null
                    email?: string | null
                    phone?: string | null
                    created_at?: string
                }
            }
            accessories_catalog: {
                Row: {
                    id: string
                    name: string
                    category: string | null
                    part_number: string | null
                    price: number | null
                    description: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    category?: string | null
                    part_number?: string | null
                    price?: number | null
                    description?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    category?: string | null
                    part_number?: string | null
                    price?: number | null
                    description?: string | null
                    created_at?: string
                }
            }
            manufacturing_tasks: {
                Row: {
                    id: string
                    order_id: string | null
                    title: string
                    description: string | null
                    status: string | null
                    assigned_to: string | null
                    estimated_hours: number | null
                    created_at: string
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    order_id?: string | null
                    title: string
                    description?: string | null
                    status?: string | null
                    assigned_to?: string | null
                    estimated_hours?: number | null
                    created_at?: string
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    order_id?: string | null
                    title?: string
                    description?: string | null
                    status?: string | null
                    assigned_to?: string | null
                    estimated_hours?: number | null
                    created_at?: string
                    updated_at?: string | null
                }
            }
            bom_items: {
                Row: {
                    id: string
                    project_id: string | null
                    name: string
                    quantity: number | null
                    unit: string | null
                    status: string | null
                    supplier: string | null
                    order_reference: string | null
                    is_custom: boolean | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    project_id?: string | null
                    name: string
                    quantity?: number | null
                    unit?: string | null
                    status?: string | null
                    supplier?: string | null
                    order_reference?: string | null
                    is_custom?: boolean | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    project_id?: string | null
                    name?: string
                    quantity?: number | null
                    unit?: string | null
                    status?: string | null
                    supplier?: string | null
                    order_reference?: string | null
                    is_custom?: boolean | null
                    created_at?: string
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
