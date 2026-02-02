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
