"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { addDays, format } from "date-fns"

export async function updateTimelineItemDate(
    id: string,
    type: 'project' | 'production' | 'service',
    newStart: string,
    newEnd: string
) {
    const supabase = await createClient()

    try {
        const start = new Date(newStart)
        const end = new Date(newEnd)

        if (type === 'project') {
            const { error } = await supabase
                .from('projects')
                // @ts-ignore
                .update({
                    start_date: format(start, 'yyyy-MM-dd'),
                    end_date: format(end, 'yyyy-MM-dd')
                })
                .eq('id', id)

            if (error) throw error
        }
        else if (type === 'production') {
            const { error } = await supabase
                .from('production_orders')
                // @ts-ignore
                .update({
                    start_date: format(start, 'yyyy-MM-dd'),
                    end_date: format(end, 'yyyy-MM-dd')
                })
                .eq('id', id)

            if (error) throw error
        }
        else if (type === 'service') {
            // Services might have specific logic (duration vs end_date), 
            // but for now we assume we just update the start_date. 
            // Note: The view calculates end_date based on duration.
            // Changing duration via drag is harder, so dragging usually implies moving the WHOLE block (start date change).
            // For simplicity in this iteration: dragging service changes start_date only.

            const { error } = await supabase
                .from('services')
                // @ts-ignore
                .update({
                    service_date: format(start, 'yyyy-MM-dd') // Services table uses service_date
                } as any)
                .eq('id', id)

            if (error) throw error
        }

        revalidatePath('/timeline')
        return { success: true }
    } catch (error) {
        console.error("Failed to update timeline item:", error)
        return { success: false, error }
    }
}
