"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { updateProjectProductionDescription } from "@/app/projects/actions"

interface ProductionDescriptionModalProps {
    isOpen: boolean
    onClose: () => void
    projectId: string
    initialDescription?: string
}

export function ProductionDescriptionModal({
    isOpen,
    onClose,
    projectId,
    initialDescription = ""
}: ProductionDescriptionModalProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [description, setDescription] = useState(initialDescription)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        const result = await updateProjectProductionDescription(projectId, description)

        if (result.success) {
            router.refresh()
            onClose()
        } else {
            alert(result.error || "Chyba při ukládání")
        }
        setIsLoading(false)
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Popis zakázky">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Technická specifikace a popis výroby</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="flex min-h-[200px] w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Zadejte detailní popis zakázky..."
                    />
                    <p className="text-xs text-muted-foreground">
                        Tento dokument je podmínkou pro vygenerování výrobních zakázek.
                    </p>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                        Zrušit
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Ukládání..." : "Uložit popis"}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}
