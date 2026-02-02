"use client"

import { useEffect, useState } from "react"
import { Modal } from "@/components/ui/modal"
import { createClient } from "@/lib/supabase/client"
import { Loader2, History, User, FileEdit, Plus, Trash2, CheckCircle2 } from "lucide-react"

interface ProjectHistoryModalProps {
    isOpen: boolean
    onClose: () => void
    projectId: string
}

type HistoryItem = {
    id: string
    action_type: string
    details: any
    created_at: string
    user_id: string
    // We might want user details if we join, but for now we rely on user_id or fetch
}

export function ProjectHistoryModal({ isOpen, onClose, projectId }: ProjectHistoryModalProps) {
    const [history, setHistory] = useState<HistoryItem[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        if (isOpen) {
            fetchHistory()
        }
    }, [isOpen, projectId])

    const fetchHistory = async () => {
        setIsLoading(true)
        const { data, error } = await supabase
            .from("project_history")
            .select("*")
            .eq("project_id", projectId)
            .order("created_at", { ascending: false })

        if (!error && data) {
            setHistory(data)
        }
        setIsLoading(false)
    }

    const getIcon = (action: string) => {
        if (action.includes("created")) return <Plus className="w-4 h-4 text-green-500" />
        if (action.includes("updated")) return <FileEdit className="w-4 h-4 text-orange-500" />
        if (action.includes("deleted") || action.includes("removed")) return <Trash2 className="w-4 h-4 text-red-500" />
        if (action.includes("added")) return <Plus className="w-4 h-4 text-blue-500" />
        return <History className="w-4 h-4 text-muted-foreground" />
    }

    const formatAction = (action: string) => {
        const map: Record<string, string> = {
            created: "Vytvoření projektu",
            updated: "Úprava projektu",
            superstructure_added: "Přidána nástavba",
            superstructure_removed: "Odebrána nástavba",
            accessory_added: "Přidáno příslušenství",
            accessory_removed: "Odebráno příslušenství",
            deleted: "Smazání projektu"
        }
        return map[action] || action
    }

    const formatDetails = (details: any) => {
        if (!details) return null
        // Simple render of JSON
        return (
            <div className="text-xs text-muted-foreground mt-1 font-mono bg-secondary/30 p-2 rounded">
                {JSON.stringify(details, null, 2)}
            </div>
        )
    }

    return (
        <Modal title="Historie změn" isOpen={isOpen} onClose={onClose} className="max-w-2xl">
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {isLoading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : history.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Žádná historie nebyla nalezena.</p>
                ) : (
                    <div className="relative border-l-2 border-border/50 ml-4 space-y-8 py-2">
                        {history.map((item) => (
                            <div key={item.id} className="relative pl-6">
                                <div className="absolute -left-[9px] top-1 p-1 rounded-full bg-background border border-border">
                                    {getIcon(item.action_type)}
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-bold">{formatAction(item.action_type)}</p>
                                        <span className="text-[10px] text-muted-foreground">
                                            {new Date(item.created_at).toLocaleString('cs-CZ')}
                                        </span>
                                    </div>
                                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                                        <User className="w-3 h-3" />
                                        <span>Uživatel {item.user_id.slice(0, 8)}...</span>
                                    </div>
                                    {formatDetails(item.details)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Modal>
    )
}
