"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logProjectChange } from "@/lib/history";
import { Database } from "@/lib/database.types";

type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

/**
 * Get all profiles for manager selection
 */
export async function getProfiles() {
    const supabase = await createClient();
    const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .order("full_name");

    if (error) return [];
    return profiles;
}

/**
 * Get all projects for selection
 */
export async function getProjects() {
    const supabase = await createClient();
    const { data: projects, error } = await supabase
        .from("projects")
        .select("id, title")
        .order("title");

    if (error) return [];
    return projects;
}

/**
 * Create a new project
 */
export async function createProject(data: ProjectInsert) {
    const supabase = await createClient();

    // Sanitize all string fields - convert empty strings to null
    const safeData: any = {};
    Object.keys(data).forEach(key => {
        const val = (data as any)[key];
        safeData[key] = (typeof val === 'string' && val.trim() === '') ? null : val;
    });

    const { data: project, error } = await (supabase
        .from("projects")
        .insert(safeData)
        .select()
        .single() as any);

    if (error || !project) {
        return { error: error?.message || "Failed to create project" };
    }

    await logProjectChange(project.id, "created", project);

    revalidatePath("/projects");
    return { success: true, projectId: project.id };
}

/**
 * Update project
 */
export async function updateProject(projectId: string, data: ProjectUpdate) {
    const supabase = await createClient();

    // Sanitize data - empty strings to null
    const safeData: any = {};
    Object.keys(data).forEach(key => {
        const val = (data as any)[key];
        safeData[key] = (typeof val === 'string' && val.trim() === '') ? null : val;
    });

    const { data: updated, error } = await (supabase
        .from("projects")
        .update(safeData)
        .eq("id", projectId)
        .select()
        .single() as any);

    if (error) {
        return { error: error.message };
    }

    await logProjectChange(projectId, "updated", updated);

    revalidatePath("/projects");
    revalidatePath(`/projects/${projectId}`);
    return { success: true };
}

/**
 * Delete project
 */
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
