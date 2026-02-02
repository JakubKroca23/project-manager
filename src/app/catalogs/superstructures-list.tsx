"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Database } from "@/lib/database.types"
import { DataTable, Column } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2 } from "lucide-react"

// Types fix - casting or defining locally if needed
interface SuperstructureCatalogItem {
    id: string
    type: string
    manufacturer: string | null
    description: string | null
    created_at: string
}

export function SuperstructuresList() {
    const [items, setItems] = useState<SuperstructureCatalogItem[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        fetchItems()
    }, [])

    const fetchItems = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from("superstructure_catalog")
            .select("*")
            .order("type")

        if (data) {
            setItems(data as unknown as SuperstructureCatalogItem[])
        }
        setLoading(false)
    }

    const columns: Column<SuperstructureCatalogItem>[] = [
        {
            accessorKey: "type",
            header: "Typ Nástavby",
            cell: (item) => <div className="font-medium">{item.type}</div>
        },
        {
            accessorKey: "manufacturer",
            header: "Výrobce",
        },
        {
            accessorKey: "description",
            header: "Popis",
            cell: (item) => <span className="text-muted-foreground">{item.description || "-"}</span>
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
                <h3 className="text-lg font-medium">Katalog Nástaveb ({items.length})</h3>
                <Button onClick={() => console.log("New Item")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nová Nástavba
                </Button>
            </div>

            {loading ? (
                <div className="py-10 text-center text-muted-foreground">Načítám katalog...</div>
            ) : (
                <DataTable
                    data={items}
                    columns={columns}
                    searchKey="type"
                    searchPlaceholder="Hledat typ..."
                />
            )}
        </div>
    )
}
