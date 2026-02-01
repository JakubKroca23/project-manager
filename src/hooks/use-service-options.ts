"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export interface ProfileOption {
    id: string
    full_name: string | null
    email: string | null
}

export function useServiceOptions() {
    const [profiles, setProfiles] = useState<ProfileOption[]>([])
    const [clients, setClients] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function fetchData() {
            const results = await Promise.all([
                supabase.from("profiles").select("id, full_name, email"),
                supabase.from("services").select("client_name").not("client_name", "is", null)
            ])

            const [profilesResult, clientsResult] = results

            if (profilesResult.data) {
                setProfiles(profilesResult.data)
            }

            if (clientsResult.data) {
                // Extract unique client names
                const uniqueClients = Array.from(new Set(
                    (clientsResult.data as any[]).map(i => i.client_name).filter(Boolean) as string[]
                ))
                setClients(uniqueClients)
            }

            setIsLoading(false)
        }

        fetchData()
    }, [])

    return { profiles, clients, isLoading }
}
