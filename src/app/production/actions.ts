"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Database } from "@/lib/database.types";

type OrderInsert = Database['public']['Tables']['production_orders']['Insert'];
type OrderUpdate = Database['public']['Tables']['production_orders']['Update'];

export async function createOrder(data: OrderInsert) {
    const supabase = await createClient();

    // Use any to bypass strict type inference issues during the build
    const { data: order, error } = await (supabase
        .from("production_orders")
        .insert(data as any)
        .select()
        .single() as any);

    if (error || !order) return { error: error?.message || "Failed to create order" };

    revalidatePath("/production");
    revalidatePath(`/projects/${data.project_id}`);
    return { success: true, orderId: order.id };
}

export async function updateOrder(orderId: string, data: OrderUpdate) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("production_orders")
        .update(data as any)
        .eq("id", orderId);

    if (error) return { error: error.message };

    revalidatePath("/production");
    revalidatePath(`/production/${orderId}`);
    return { success: true };
}

export async function deleteOrder(orderId: string, projectId?: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("production_orders")
        .delete()
        .eq("id", orderId);

    if (error) return { error: error.message };

    revalidatePath("/production");
    if (projectId) revalidatePath(`/projects/${projectId}`);
    return { success: true };
}
