"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Database } from "@/lib/database.types"
import { useRouter } from "next/navigation"

type ProjectInsert = Database['public']['Tables']['projects']['Insert']

export function useCreateProject() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const createProject = async (data: ProjectInsert) => {
        setIsLoading(true)
        setError(null)

        try {
            // Cast to any to avoid "Type instantiation is excessively deep and possibly infinite" or "never" errors
            const { error: insertError } = await supabase
                .from("projects")
                .insert(data as any)

            if (insertError) throw insertError

            router.refresh() // Refresh server data
            return true // Success
        } catch (err: any) {
            setError(err.message || "Failed to create project")
            return false
        } finally {
            setIsLoading(false)
        }
    }

    return { createProject, isLoading, error }
}
