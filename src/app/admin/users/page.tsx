import { createClient } from "@/lib/supabase/server";
import { UserTable } from "@/components/admin/user-table";

export default async function AdminUsersPage() {
    const supabase = await createClient();

    // Fetch all profiles
    const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        return <div className="p-6 text-red-500">Chyba při načítání uživatelů: {error.message}</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Správa uživatelů</h1>
                    <p className="text-muted-foreground">Přehled a správa všech registrovaných uživatelů.</p>
                </div>
            </div>

            <UserTable profiles={profiles || []} />
        </div>
    );
}
