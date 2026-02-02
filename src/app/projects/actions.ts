"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProject(projectId: string, data: {
    title?: string;
    client_name?: string;
    description?: string;
    status?: string;
    start_date?: string;
    end_date?: string | null;
    chassis_type?: string | null;
    manufacturer?: string | null;
    superstructure_type?: string | null;
    accessories?: string | null;
    quantity?: number | null;
}) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("projects")
        // @ts-ignore
        .update(data as any)
        .eq("id", projectId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/projects");
    revalidatePath(`/projects/${projectId}`);
    return { success: true };
}

export async function deleteProject(projectId: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/projects");
    return { success: true };
}

export async function createSuperstructure(projectId: string, data: {
    type: string;
    supplier?: string;
    description?: string;
    order_status?: string;
}) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("superstructures")
        // @ts-ignore
        .insert({
            project_id: projectId,
            ...data
        } as any);

    if (error) {
        return { error: error.message };
    }

    revalidatePath(`/projects/${projectId}`);
    return { success: true };
}

export async function deleteSuperstructure(id: string, projectId: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("superstructures")
        .delete()
        .eq("id", id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath(`/projects/${projectId}`);
    return { success: true };
}

export async function createProjectAccessory(projectId: string, data: {
    name: string;
    action_type: string;
    supplier?: string;
    quantity?: number;
    order_status?: string;
    notes?: string;
}) {
    const supabase = await createClient();

    // Check if it exists in catalog, if not add it (simple version)
    // For now we just insert into project_accessories
    const { error } = await supabase
        .from("project_accessories")
        // @ts-ignore
        .insert({
            project_id: projectId,
            ...data
        } as any);

    if (error) {
        return { error: error.message };
    }

    revalidatePath(`/projects/${projectId}`);
    return { success: true };
}

export async function deleteProjectAccessory(id: string, projectId: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("project_accessories")
        .delete()
        .eq("id", id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath(`/projects/${projectId}`);
    return { success: true };
}
