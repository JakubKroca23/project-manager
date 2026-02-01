"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Database } from "@/lib/database.types"
import { useRouter } from "next/navigation"

type ServiceInsert = Database['public']['Tables']['services']['Insert']

export function useCreateService() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const createService = async (data: ServiceInsert) => {
        setIsLoading(true)
        setError(null)

        try {
            const { error: insertError } = await supabase
                .from("services")
                .insert(data as any)

            if (insertError) throw insertError

            router.refresh()
            return true
        } catch (err: any) {
            setError(err.message || "Failed to create service")
            return false
        } finally {
            setIsLoading(false)
        }
    }

    return { createService, isLoading, error }
}
