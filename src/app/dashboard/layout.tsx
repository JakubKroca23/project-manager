import { Navbar } from "@/components/navbar"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        // redirect("/login") // Commented out for dev preview if needed, or uncomment in prod
    }

    return (
        <div className="flex min-h-screen flex-col bg-muted/40">
            <Navbar />
            <main className="flex-1 p-4 lg:p-6">
                <div className="container max-w-screen-2xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
