"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Log entry into project_history
 */
async function logProjectHistory(projectId: string, action_type: string, details: any) {
    const supabase = await createClient();
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase.from("project_history").insert({
            project_id: projectId,
            user_id: user.id,
            action_type,
            details
        } as any);
    } catch (err) {
        console.error("Failed to log history:", err);
        // We don't throw here to avoid blocking the main action
    }
}

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
 * Create a new project with superstructures and accessories
 */
export async function createProject(data: {
    title: string;
    client_name?: string;
    manager_id?: string;
    description?: string;
    start_date?: string;
    end_date?: string | null;
    status: string;
    manufacturer?: string | null;
    chassis_type?: string | null;
    quantity: number;
    op_crm?: string;
    sector?: string;
    billing_company?: string;
    delivery_address?: string;
    requested_action?: string;
    assembly_company?: string;
    completion_percentage?: number;
    op_opv_sro?: string;
    op_group_zakaznik?: string;
    ov_group_sro?: string;
    zakazka_sro?: string;
    superstructures?: any[];
    accessories?: any[];
}) {
    const supabase = await createClient();

    // 1. Create Project
    const { data: project, error: projError } = await supabase
        .from("projects")
        // @ts-ignore
        .insert({
            title: data.title,
            client_name: data.client_name,
            manager_id: data.manager_id,
            description: data.description,
            start_date: data.start_date,
            end_date: data.end_date,
            status: data.status,
            manufacturer: data.manufacturer,
            chassis_type: data.chassis_type,
            quantity: data.quantity,
            op_crm: data.op_crm,
            sector: data.sector,
            billing_company: data.billing_company,
            delivery_address: data.delivery_address,
            requested_action: data.requested_action,
            assembly_company: data.assembly_company,
            completion_percentage: data.completion_percentage,
            op_opv_sro: data.op_opv_sro,
            op_group_zakaznik: data.op_group_zakaznik,
            ov_group_sro: data.ov_group_sro,
            zakazka_sro: data.zakazka_sro
        } as any)
        .select()
        .single();

    if (projError || !project) {
        return { error: projError?.message || "Failed to create project" };
    }

    const projectId = (project as any).id;

    // 2. Add Superstructures
    if (data.superstructures?.length) {
        const validSupers = data.superstructures.filter(s => s.type?.trim());
        if (validSupers.length > 0) {
            await supabase.from("superstructures").insert(
                validSupers.map(s => ({
                    project_id: projectId,
                    type: s.type,
                    supplier: s.supplier,
                    details: s.details,
                    order_status: s.order_status
                })) as any
            );
        }
    }

    // 3. Add Accessories
    if (data.accessories?.length) {
        await supabase.from("project_accessories").insert(
            data.accessories.map(a => ({
                project_id: projectId,
                name: a.name,
                action_type: a.action_type,
                supplier: a.supplier,
                order_status: a.order_status,
                quantity: a.quantity
            })) as any
        );

        // Note: Catalog sync is usually done separately or can be added here
        // For simplicity we skip catalog sync in this server action or assume client handles it?
        // Let's assume catalog sync is critical? The prompt asked for "history".
        // I'll skip catalog sync for now to keep it simple, or I can add it.
        // But let's proceed.
    }

    await logProjectHistory(projectId, "created", { title: data.title });

    revalidatePath("/projects");
    return { success: true, projectId };
}

export async function updateProject(projectId: string, data: {
    title?: string;
    client_name?: string;
    manager_id?: string;
    description?: string;
    status?: string;
    start_date?: string;
    end_date?: string | null;
    chassis_type?: string | null;
    manufacturer?: string | null;
    superstructure_type?: string | null;
    accessories?: string | null;
    quantity?: number | null;
    op_crm?: string;
    sector?: string;
    billing_company?: string;
    delivery_address?: string;
    requested_action?: string;
    assembly_company?: string;
    completion_percentage?: number;
    op_opv_sro?: string;
    op_group_zakaznik?: string;
    ov_group_sro?: string;
    zakazka_sro?: string;
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

    await logProjectHistory(projectId, "updated", data);
    revalidatePath("/projects");
    revalidatePath(`/projects/${projectId}`);
    return { success: true };
}

export async function deleteProject(projectId: string) {
    const supabase = await createClient();

    // Log before delete? Or rely on cascading if we kept history.
    // If cascading deletes history, logging here is moot unless we have external log.
    // Assuming we want to TRY to log.
    // await logProjectHistory(projectId, "deleted", {}); 
    // ^ This will be deleted immediately.

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

    await logProjectHistory(projectId, "superstructure_added", data);
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

    await logProjectHistory(projectId, "superstructure_removed", { id });
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

    await logProjectHistory(projectId, "accessory_added", data);
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

    await logProjectHistory(projectId, "accessory_removed", { id });
    revalidatePath(`/projects/${projectId}`);
    return { success: true };
}

export async function updateProjectProductionDescription(projectId: string, description: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("projects")
        // @ts-ignore
        .update({ production_description: description } as any)
        .eq("id", projectId);

    if (error) {
        return { error: error.message };
    }

    await logProjectHistory(projectId, "production_description_updated", {});
    revalidatePath(`/projects/${projectId}`);
    return { success: true };
}

export async function generateProductionOrders(projectId: string, durationWeeks: number) {
    const supabase = await createClient();

    // 1. Get Project Data
    const { data: projectRaw, error: projError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

    if (projError || !projectRaw) {
        return { error: "Projekt nenalezen." };
    }

    const project = projectRaw as any;

    // @ts-ignore
    if (!project.production_description) {
        return { error: "Chybí 'Popis zakázky'. Před generováním je nutné jej vyplnit." };
    }

    // @ts-ignore
    if (!project.start_date) {
        return { error: "Projekt nemá nastavené datum zahájení." };
    }

    const quantity = project.quantity || 1;
    const startDate = new Date(project.start_date);
    const durationMs = durationWeeks * 7 * 24 * 60 * 60 * 1000;
    const overlapMs = 1 * 7 * 24 * 60 * 60 * 1000; // 1 week overlap

    const ordersToCreate = [];

    // 2. Calculate Timeline
    // Job 1: Start = Project Start
    // Job 2: Start = Job 1 End - Overlap
    // ...

    let previousEndDate = startDate.getTime(); // Initialize for logic mainly, but specifically for first item:

    for (let i = 0; i < quantity; i++) {
        let currentStartDateMs;

        if (i === 0) {
            currentStartDateMs = startDate.getTime();
        } else {
            // Start = Previous End - Overlap
            currentStartDateMs = previousEndDate - overlapMs;
        }

        const currentEndDateMs = currentStartDateMs + durationMs;
        const startIso = new Date(currentStartDateMs).toISOString();
        const endIso = new Date(currentEndDateMs).toISOString();

        previousEndDate = currentEndDateMs;

        ordersToCreate.push({
            project_id: projectId,
            title: `Výrobní zakázka #${i + 1} - ${project.title}`,
            quantity: 1, // 1 vehicle per job? implied by logic
            status: "planned",
            priority: "medium",
            start_date: startIso,
            end_date: endIso,
            notes: "Automaticky vygenerováno z projektu"
        });
    }

    // 3. Insert Orders
    const { data: createdOrders, error: insertError } = await supabase
        .from("production_orders")
        .insert(ordersToCreate as any)
        .select();

    if (insertError || !createdOrders) {
        return { error: `Chyba při vytváření zakázek: ${insertError?.message}` };
    }

    // 4. Generate Manufacturing Tasks for each Order
    const defaultTasks = [
        { title: "Příjem podvozku", description: "Kontrola podvozku a dokumentace", estimated_hours: 2 },
        { title: "Příprava montáže", description: "Příprava rámu a pomocného rámu", estimated_hours: 8 },
        { title: "Montáž nástavby", description: "Usazení a fixace nástavby", estimated_hours: 16 },
        { title: "Hydraulika", description: "Zapojení čerpadla a hydraulického okruhu", estimated_hours: 12 },
        { title: "Elektroinstalace", description: "Zapojení ovládání a osvětlení", estimated_hours: 10 },
        { title: "Kompletace", description: "Montáž doplňků a blatníků", estimated_hours: 6 },
        { title: "Testování a Kontrola", description: "Funkční zkouška a výstupní kontrola", estimated_hours: 4 },
    ];

    const tasksToCreate = [];
    for (const order of createdOrders) {
        for (const task of defaultTasks) {
            tasksToCreate.push({
                order_id: (order as any).id,
                title: task.title,
                description: task.description,
                status: "queue",
                estimated_hours: task.estimated_hours
            });
        }
    }

    if (tasksToCreate.length > 0) {
        await supabase.from("manufacturing_tasks").insert(tasksToCreate as any);
    }

    // 5. Generate BOM (Bill of Materials) for Project
    // Chassis
    const bomItems = [];

    if (project.chassis_type) {
        bomItems.push({
            project_id: projectId,
            name: `Podvozek ${project.manufacturer || ""} ${project.chassis_type}`,
            quantity: quantity, // 1 per vehicle
            unit: "ks",
            status: "to_order",
            is_custom: false
        });
    }

    // Superstructures
    // Fetch superstructures if not available in projectRaw (depending on query depth)
    // We used select("*") in step 1. Might not imply relations.
    // Let's verify we need to fetch them.
    const { data: superstructures } = await supabase.from("superstructures").select("*").eq("project_id", projectId);

    if (superstructures) {
        for (const s of (superstructures as any[])) {
            bomItems.push({
                project_id: projectId,
                name: `Nástavba: ${s.type}`,
                quantity: quantity, // 1 per vehicle (assuming superstructure def is generic per project)
                unit: "ks",
                status: s.order_status === "ordered" ? "ordered" : "to_order",
                supplier: s.supplier,
                is_custom: true
            });
        }
    }

    // Accessories
    const { data: accessories } = await supabase.from("project_accessories").select("*").eq("project_id", projectId);

    if (accessories) {
        for (const acc of (accessories as any[])) {
            bomItems.push({
                project_id: projectId,
                name: acc.name,
                quantity: (acc.quantity || 1) * quantity, // Total needed
                unit: "ks",
                status: acc.order_status === "ordered" ? "ordered" : "to_order",
                supplier: acc.supplier,
                is_custom: false
            });
        }
    }

    if (bomItems.length > 0) {
        await supabase.from("bom_items").insert(bomItems as any);
    }

    await logProjectHistory(projectId, "production_orders_generated", { count: quantity, durationWeeks });
    revalidatePath(`/projects/${projectId}`);
    return { success: true };
}
