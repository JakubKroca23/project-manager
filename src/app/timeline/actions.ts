"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { format } from "date-fns"
import { Database } from "@/lib/database.types"

type UpdateTimelineType = 'project' | 'production' | 'service';

export async function updateTimelineItemDate(
    id: string,
    type: UpdateTimelineType,
    newStart: string,
    newEnd: string
) {
    const supabase = await createClient()

    try {
        const start = new Date(newStart)
        const end = new Date(newEnd)
        const formattedStart = format(start, 'yyyy-MM-dd')
        const formattedEnd = format(end, 'yyyy-MM-dd')

        if (type === 'project') {
            const { error } = await (supabase
                .from('projects') as any)
                .update({
                    start_date: formattedStart,
                    end_date: formattedEnd
                } as any)
                .eq('id', id)

            if (error) throw error
        }
        else if (type === 'production') {
            const { error } = await (supabase
                .from('production_orders') as any)
                .update({
                    start_date: formattedStart,
                    end_date: formattedEnd
                } as any)
                .eq('id', id)

            if (error) throw error
        }
        else if (type === 'service') {
            const { error } = await (supabase
                .from('services') as any)
                .update({
                    service_date: formattedStart
                } as any)
                .eq('id', id)

            if (error) throw error
        }

        revalidatePath('/timeline')
        return { success: true }
    } catch (error: any) {
        console.error("Failed to update timeline item:", error)
        return {
            success: false,
            error: error?.message || (typeof error === 'string' ? error : 'Neznámá chyba')
        }
    }
}
