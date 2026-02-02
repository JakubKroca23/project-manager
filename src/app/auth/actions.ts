"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(prevState: any, formData: FormData) {
    const supabase = await createClient();

    // Type casting for FormData entries
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return { error: "Vyplňte prosím email a heslo." };
    }

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { error: "Neplatné přihlašovací údaje." };
    }

    revalidatePath("/", "layout");
    redirect("/");
}

export async function signup(prevState: any, formData: FormData) {
    const supabase = await createClient();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;

    if (!email || !password || !fullName) {
        return { error: "Vyplňte prosím všechna pole." };
    }

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
            },
        },
    });

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/", "layout");

    // If email confirmation is disabled/auto-confirm, they might be logged in.
    // If enabled, they need to check email.
    // We'll redirect to a generic page or show a message.
    if (data.session) {
        redirect("/");
    }

    // If no session, it likely means email verification is required or manual approval (though approval is our custom logic)
    // For now, redirect to a check-email page or return success state
    return { success: true, message: "Registrace proběhla úspěšně. Zkontrolujte svůj email." };
}

export async function logout(_formData: FormData) {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath("/", "layout");
    redirect("/login");
}
