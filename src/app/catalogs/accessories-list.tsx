"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Database } from "@/lib/database.types"
import { DataTable, Column } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2 } from "lucide-react"

type Accessory = Database["public"]["Tables"]["accessories_catalog"]["Row"]

export function AccessoriesList() {
    const [items, setItems] = useState<Accessory[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        fetchItems()
    }, [])

    const fetchItems = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from("accessories_catalog")
            .select("*")
            .order("category")
            .order("name")

        if (data) {
            setItems(data)
        }
        setLoading(false)
    }

    const columns: Column<Accessory>[] = [
        {
            accessorKey: "category",
            header: "Kategorie",
            cell: (item) => <div className="font-medium text-primary">{item.category || "Ostatní"}</div>
        },
        {
            accessorKey: "name",
            header: "Název",
            cell: (item) => (
                <div>
                    <div>{item.name}</div>
                    <div className="text-xs text-muted-foreground">{item.description}</div>
                </div>
            )
        },
        {
            accessorKey: "part_number",
            header: "Číslo dílu",
            cell: (item) => <span className="font-mono text-xs">{item.part_number || "-"}</span>
        },
        {
            accessorKey: "price",
            header: "Cena",
            cell: (item) => <span className="font-medium">{item.price ? `${item.price} Kč` : "-"}</span>
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
                <h3 className="text-lg font-medium">Katalog Příslušenství ({items.length})</h3>
                <Button onClick={() => console.log("New Item")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nové Příslušenství
                </Button>
            </div>

            {loading ? (
                <div className="py-10 text-center text-muted-foreground">Načítám katalog...</div>
            ) : (
                <DataTable
                    data={items}
                    columns={columns}
                    searchKey="name"
                    searchPlaceholder="Hledat..."
                />
            )}
        </div>
    )
}
