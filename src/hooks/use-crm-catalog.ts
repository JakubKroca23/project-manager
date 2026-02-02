"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export type ClientItem = {
    id: string
    name: string
}

export type SuperstructureItem = {
    id: string
    type: string
    manufacturer?: string
}

export function useCRMCatalog() {
    const [clients, setClients] = useState<ClientItem[]>([])
    const [superstructures, setSuperstructures] = useState<SuperstructureItem[]>([])
    const supabase = createClient()

    useEffect(() => {
        fetchClients()
        fetchSuperstructures()
    }, [])

    const fetchClients = async () => {
        const { data } = await supabase.from("clients").select("id, name").order("name")
        if (data) setClients(data)
    }

    const fetchSuperstructures = async () => {
        const { data } = await supabase.from("superstructure_catalog").select("id, type, manufacturer").order("type")
        if (data) setSuperstructures(data)
    }

    const addClient = async (name: string) => {
        const { data, error } = await supabase
            .from("clients")
            .insert({ name } as any)
            .select()
            .single()

        if (data) {
            setClients(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
            return data
        }
        return null
    }

    const addSuperstructureType = async (type: string) => {
        const { data, error } = await supabase
            .from("superstructure_catalog")
            .insert({ type } as any)
            .select()
            .single()

        if (data) {
            setSuperstructures(prev => [...prev, data].sort((a, b) => a.type.localeCompare(b.type)))
            return data
        }
        return null
    }

    return {
        clients,
        superstructures,
        addClient,
        addSuperstructureType,
        refresh: () => { fetchClients(); fetchSuperstructures(); }
    }
}
