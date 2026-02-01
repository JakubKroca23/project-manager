import { createClient } from "@/lib/supabase/server"
import { TimelineProvider } from "@/components/timeline/timeline-context"
import { TimelineLayout } from "@/components/timeline/timeline-layout"
import { Plus } from "lucide-react"

export default async function TimelinePage() {
    const supabase = await createClient()
    const { data: items } = await supabase.from("timeline_items").select("*")

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Timeline</h1>
                    <p className="text-muted-foreground">Interaktivní plánování projektů a kapacity.</p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="bg-background/50 p-1 rounded-lg border border-border/50 flex text-sm">
                        <button className="px-3 py-1 bg-primary text-primary-foreground rounded-md shadow-sm">Den</button>
                        <button className="px-3 py-1 text-muted-foreground hover:text-foreground">Týden</button>
                        <button className="px-3 py-1 text-muted-foreground hover:text-foreground">Měsíc</button>
                    </div>
                    <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                        <Plus className="w-4 h-4" />
                        Naplánovat
                    </button>
                </div>
            </div>

            <TimelineProvider>
                <TimelineLayout items={items || []} />
            </TimelineProvider>
        </div>
    )
}
