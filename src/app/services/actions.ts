"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Database } from "@/lib/database.types";

type ServiceInsert = Database['public']['Tables']['services']['Insert'];
type ServiceUpdate = Database['public']['Tables']['services']['Update'];

export async function createService(data: ServiceInsert) {
    const supabase = await createClient();

    // Use any on the table selector to bypass strict type inference issues during build
    const { data: service, error } = await (supabase.from("services") as any)
        .insert(data)
        .select()
        .single();

    if (error || !service) return { error: error?.message || "Failed to create service" };

    revalidatePath("/services");
    return { success: true, serviceId: service.id };
}

export async function updateService(serviceId: string, data: ServiceUpdate) {
    const supabase = await createClient();

    const { error } = await (supabase.from("services") as any)
        .update(data)
        .eq("id", serviceId);

    if (error) return { error: error.message };

    revalidatePath("/services");
    return { success: true };
}

export async function deleteService(serviceId: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", serviceId);

    if (error) return { error: error.message };

    revalidatePath("/services");
    return { success: true };
}
