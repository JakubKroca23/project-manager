"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export function useProjectOptions() {
    const [projects, setProjects] = useState<{ id: string, title: string }[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function fetchProjects() {
            const { data } = await supabase
                .from("projects")
                .select("id, title")
                .neq("status", "completed") // Only active projects
                .order("title")

            if (data) {
                setProjects(data)
            }
            setIsLoading(false)
        }

        fetchProjects()
    }, [])

    return { projects, isLoading }
}
