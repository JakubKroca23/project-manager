"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export function useAccessoryCatalog() {
    const [catalog, setCatalog] = useState<{ id: string, name: string }[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchCatalog = async () => {
            const { data } = await supabase
                .from("accessory_catalog")
                .select("id, name")
                .order("name")

            if (data) setCatalog(data)
            setIsLoading(false)
        }
        fetchCatalog()
    }, [])

    const addToCatalog = async (name: string) => {
        if (!name.trim()) return

        // Try to insert (will fail if exists due to UNIQUE constraint)
        const { data, error } = await supabase
            .from("accessory_catalog")
            .insert({ name: name.trim() })
            .select()
            .single()

        if (!error && data) {
            setCatalog(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
        }
    }

    return { catalog, isLoading, addToCatalog }
}
