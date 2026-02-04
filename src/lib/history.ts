import { createClient } from "@/lib/supabase/server"
import { Database } from "@/lib/database.types"

type ProjectHistoryInsert = Database['public']['Tables']['project_history']['Insert']

/**
 * Porovná dva objekty a vrátí pouze změněné hodnoty.
 */
function getDiff(oldData: any, newData: any) {
    const diff: any = {
        before: {},
        after: {}
    }

    let hasChanges = false

    for (const key in newData) {
        if (newData[key] !== oldData[key]) {
            diff.before[key] = oldData[key]
            diff.after[key] = newData[key]
            hasChanges = true
        }
    }

    return hasChanges ? diff : null
}

/**
 * Centrální logger pro historii projektů.
 */
export async function logProjectChange(
    projectId: string,
    actionType: string,
    newData: any,
    oldData?: any
) {
    const supabase = await createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        let details = newData

        // Pokud máme stará data, provedeme diff
        if (oldData) {
            const diff = getDiff(oldData, newData)
            if (!diff) return // Žádná změna, nelogujeme
            details = diff
        }

        const logEntry: ProjectHistoryInsert = {
            project_id: projectId,
            user_id: user.id,
            action_type: actionType,
            details: details as any
        }

        const { error } = await supabase
            .from('project_history')
            .insert(logEntry as any)

        if (error) {
            console.error("Failed to insert history log:", error)
        }
    } catch (err) {
        console.error("Logger error:", err)
    }
}
