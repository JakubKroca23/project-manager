"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Database } from "@/lib/database.types"
import { useRouter } from "next/navigation"

type ProductionInsert = Database['public']['Tables']['production_orders']['Insert']

export function useCreateProduction() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const createProduction = async (data: ProductionInsert) => {
        setIsLoading(true)
        setError(null)

        try {
            const { error: insertError } = await supabase
                .from("production_orders")
                .insert(data as any)

            if (insertError) throw insertError

            router.refresh()
            return true
        } catch (err: any) {
            setError(err.message || "Failed to create order")
            return false
        } finally {
            setIsLoading(false)
        }
    }

    return { createProduction, isLoading, error }
}
