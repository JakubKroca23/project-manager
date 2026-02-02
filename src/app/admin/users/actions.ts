"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleApproval(userId: string, isApproved: boolean) {
    const supabase = await createClient();

    // Authorization check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { data: adminProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

    if (!adminProfile || (adminProfile as any).role !== "admin") return { error: "Prohibited" };

    const { error } = await supabase
        .from("profiles")
        // @ts-ignore
        .update({ is_approved: isApproved } as any)
        .eq("id", userId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/admin/users");
    return { success: true };
}

export async function updateRole(userId: string, newRole: string) {
    const supabase = await createClient();

    // Authorization check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { data: adminProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

    if (!adminProfile || (adminProfile as any).role !== "admin") return { error: "Prohibited" };

    const { error } = await supabase
        .from("profiles")
        // @ts-ignore
        .update({ role: newRole } as any)
        .eq("id", userId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/admin/users");
    return { success: true };
}
