import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Building2, Home, FolderKanban, Calendar, LogOut, LayoutDashboard } from "lucide-react"

export async function Navbar() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container max-w-screen-2xl flex h-14 items-center gap-4 px-4 mx-auto">
                <div className="flex items-center gap-2 font-bold text-lg mr-4">
                    <div className="p-1.5 rounded-md bg-primary text-primary-foreground">
                        <Building2 className="h-5 w-5" />
                    </div>
                    <span className="hidden md:inline-block">Contsystem PM</span>
                </div>

                <div className="flex items-center gap-1 md:gap-2 text-sm font-medium text-muted-foreground">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <LayoutDashboard className="h-4 w-4" />
                            <span className="hidden sm:inline">Přehled</span>
                        </Button>
                    </Link>
                    <Link href="/dashboard/projects">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <FolderKanban className="h-4 w-4" />
                            <span className="hidden sm:inline">Projekty</span>
                        </Button>
                    </Link>
                    <Link href="/dashboard/tasks">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <Home className="h-4 w-4" />
                            <span className="hidden sm:inline">Moje Úkoly</span>
                        </Button>
                    </Link>
                    <Link href="/dashboard/timeline">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <Calendar className="h-4 w-4" />
                            <span className="hidden sm:inline">Časová osa</span>
                        </Button>
                    </Link>
                </div>

                <div className="ml-auto flex items-center gap-2">
                    <ModeToggle />
                    {user && (
                        <form action="/auth/signout" method="post">
                            <Button variant="ghost" size="icon" title="Odhlásit se">
                                <LogOut className="h-4 w-4" />
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </nav>
    )
}
