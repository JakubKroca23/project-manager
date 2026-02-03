"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Database } from "@/lib/database.types"
import { useRouter } from "next/navigation"

type ServiceUpdate = Database['public']['Tables']['services']['Update']

export function useUpdateService() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const updateService = async (id: string, data: ServiceUpdate) => {
        setIsLoading(true)
        setError(null)

        try {
            const { error: updateError } = await supabase
                .from("services")
                // @ts-ignore
                .update(data as any)
                .eq('id', id)

            if (updateError) throw updateError

            router.refresh()
            return true
        } catch (err: any) {
            setError(err.message || "Failed to update service")
            return false
        } finally {
            setIsLoading(false)
        }
    }

    return { updateService, isLoading, error }
}
