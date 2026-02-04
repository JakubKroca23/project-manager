export type ProjectStatus = 'pending' | 'in_progress' | 'completed' | 'on_hold';

export interface Project {
    id: string;
    name: string;
    manager: string;
    customer: string;
    quantity: number;
    status: ProjectStatus;
    created_at: string;
}
