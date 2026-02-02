"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Database } from "@/lib/database.types"
import { DataTable, Column } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2 } from "lucide-react"

type Client = Database["public"]["Tables"]["clients"]["Row"]

export function ClientsList() {
    const [clients, setClients] = useState<Client[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        fetchClients()
    }, [])

    const fetchClients = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from("clients")
            .select("*")
            .order("name")

        if (data) {
            setClients(data)
        }
        setLoading(false)
    }

    const columns: Column<Client>[] = [
        {
            accessorKey: "name",
            header: "Název / Jméno",
            cell: (item) => <div className="font-medium">{item.name}</div>
        },
        {
            accessorKey: "contact_person",
            header: "Kontaktní osoba",
        },
        {
            accessorKey: "email",
            header: "Email",
            cell: (item) => (
                <div>
                    <div>{item.email}</div>
                    <div className="text-xs text-muted-foreground">{item.phone}</div>
                </div>
            )
        },
        {
            accessorKey: "billing_address",
            header: "Adresa",
            cell: (item) => <span>{item.billing_address || "-"}</span>
        },
        {
            id: "actions",
            header: "Akce",
            cell: (item) => {
                return (
                    <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => console.log("Edit", item.id)}>
                            <Pencil className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => console.log("Delete", item.id)}>
                            <Trash2 className="w-4 h-4 text-destructive/70" />
                        </Button>
                    </div>
                )
            }
        }
    ]

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Databáze Klientů ({clients.length})</h3>
                <Button onClick={() => console.log("New Client")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nový Klient
                </Button>
            </div>

            {loading ? (
                <div className="py-10 text-center text-muted-foreground">Načítám klienty...</div>
            ) : (
                <DataTable
                    data={clients}
                    columns={columns}
                    searchKey="name"
                    searchPlaceholder="Hledat klienta..."
                />
            )}
        </div>
    )
}
