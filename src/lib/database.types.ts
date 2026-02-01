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
                    status: string
                    start_date: string | null
                    end_date: string | null
                    client_name: string | null
                    created_by: string | null
                    created_at: string
                    updated_at: string
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
